import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { Express } from 'express';
import request from 'supertest';

/* Configura DATABASE_URL antes de cualquier import de la app */
vi.hoisted(() => {
  process.env.DATABASE_URL = 'file:./prisma/integration-test.db';
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-for-tests-only';
});

import { createApp } from '../app';
import prisma from '../config/prisma';
import { createTestUser, createTestAdmin, createTestProduct, authHeader } from './helpers/factories';

let app: Express;
let jwtToken: string;
let adminToken: string;

beforeAll(async () => {
  app = createApp();

  /* Pushear schema y limpiar datos */
  const { execSync } = await import('child_process');
  execSync('npx prisma db push --skip-generate --force-reset --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: 'file:./prisma/integration-test.db' },
    cwd: process.cwd(),
    stdio: 'pipe',
  });
});

afterAll(async () => {
  await prisma.$disconnect();

  const fs = await import('fs');
  const path = await import('path');
  try {
    fs.unlinkSync(path.resolve(__dirname, '../../prisma/integration-test.db'));
  } catch {
    /* ignore */
  }
});

/* ── Health check ── */

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

/* ── Auth ── */

describe('POST /api/auth/register', () => {
  it('registers a new user and requires email verification', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New User', email: 'newuser@example.com', password: 'StrongPass1!' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.isEmailVerified).toBe(false);
    expect(res.body.token).toBeUndefined();
    expect(res.body.message).toContain('verify');
  });

  it('rejects duplicate email', async () => {
    await createTestUser({ email: 'dup@example.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup User', email: 'dup@example.com', password: 'StrongPass1!' });

    expect(res.status).toBe(409);
  });

  it('rejects weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Weak', email: 'weak@example.com', password: '123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('rejects login when email not verified (non-admin)', async () => {
    await createTestUser({
      email: 'unverified@example.com',
      password: 'Password123!',
      isEmailVerified: false,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unverified@example.com', password: 'Password123!' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('allows login with verified email', async () => {
    const user = await createTestUser({
      email: 'verified@example.com',
      password: 'Password123!',
      isEmailVerified: true,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'verified@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.id).toBe(user.id);

    jwtToken = res.body.token;
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'verified@example.com', password: 'WrongPass1!' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/profile', () => {
  it('returns profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set(authHeader(jwtToken));

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('verified@example.com');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });
});

/* ── Products ── */

describe('GET /api/products', () => {
  beforeAll(async () => {
    await createTestProduct({ name: 'Product A', price: 10, category: 'Cat1' });
    await createTestProduct({ name: 'Product B', price: 20, category: 'Cat2' });
    await createTestProduct({ name: 'Product C', price: 30, category: 'Cat1' });
  });

  it('lists all products with pagination', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThanOrEqual(3);
    expect(res.body.total).toBeGreaterThanOrEqual(3);
    expect(res.body.page).toBe(1);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/products?category=Cat2');
    expect(res.status).toBe(200);
    expect(res.body.products.every((p: { category: string }) => p.category === 'Cat2')).toBe(true);
  });
});

describe('POST /api/products (admin)', () => {
  beforeAll(async () => {
    await createTestAdmin({ email: 'admin-products@example.com' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin-products@example.com', password: 'Admin123!' });

    adminToken = loginRes.body.token;
  });

  it('allows admin to create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set(authHeader(adminToken))
      .send({
        name: 'New Admin Product',
        description: 'A brand new product created by admin with sufficient length.',
        price: 49.99,
        image: 'https://example.com/new.jpg',
        category: 'AdminStuff',
        stock: 5,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Admin Product');
  });

  it('rejects non-admin from creating products', async () => {
    const res = await request(app)
      .post('/api/products')
      .set(authHeader(jwtToken))
      .send({
        name: 'Hacked Product',
        description: 'This should not be created because it has a long enough description.',
        price: 1.99,
        image: 'https://example.com/hack.jpg',
        category: 'Hacking',
        stock: 1,
      });

    expect(res.status).toBe(403);
  });
});

/* ── Orders ── */

describe('POST /api/orders', () => {
  let productId: string;

  beforeAll(async () => {
    const product = await createTestProduct({
      name: 'Orderable Product',
      price: 15.50,
      stock: 100,
    });
    productId = product.id;
  });

  it('creates an order for authenticated user', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set(authHeader(jwtToken))
      .send({
        orderItems: [
          {
            productId,
            name: 'Orderable Product',
            quantity: 2,
            price: 15.50,
            image: 'https://example.com/orderable.jpg',
          },
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Testville',
          postalCode: '12345',
          country: 'Testland',
        },
        paymentMethod: 'stripe',
        totalPrice: 31.00,
      });

    expect(res.status).toBe(201);
    expect(res.body.orderItems.length).toBe(1);
    expect(res.body.isPaid).toBe(false);
  });

  it('rejects order with manipulated price', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set(authHeader(jwtToken))
      .send({
        orderItems: [
          {
            productId,
            name: 'Orderable Product',
            quantity: 1,
            price: 15.50,
            image: 'https://example.com/orderable.jpg',
          },
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Testville',
          postalCode: '12345',
          country: 'Testland',
        },
        paymentMethod: 'stripe',
        totalPrice: 1.00,
      });

    expect(res.status).toBe(400);
  });

  it('rejects order without auth', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ orderItems: [], shippingAddress: {}, paymentMethod: 'stripe', totalPrice: 0 });

    expect(res.status).toBe(401);
  });
});

describe('Order lifecycle (pay + deliver)', () => {
  let orderId: string;

  it('completes full lifecycle', async () => {
    /* 1. Create a product */
    const product = await createTestProduct({
      name: 'Lifecycle Product',
      price: 100,
      stock: 5,
    });

    /* 2. Create order */
    const orderRes = await request(app)
      .post('/api/orders')
      .set(authHeader(jwtToken))
      .send({
        orderItems: [{
          productId: product.id,
          name: 'Lifecycle Product',
          quantity: 1,
          price: 100,
          image: 'https://example.com/lifecycle.jpg',
        }],
        shippingAddress: {
          address: '456 Lifecycle Ave',
          city: 'Testopolis',
          postalCode: '54321',
          country: 'Testland',
        },
        paymentMethod: 'paypal',
        totalPrice: 100,
      });

    expect(orderRes.status).toBe(201);
    orderId = orderRes.body.id;

    /* 3. Pay (simulated) */
    const payRes = await request(app)
      .put(`/api/orders/${orderId}/pay`)
      .set(authHeader(jwtToken))
      .send({ paymentIntentId: 'pi_sim_test' });

    expect(payRes.status).toBe(200);
    expect(payRes.body.isPaid).toBe(true);

    /* 4. Admin marks delivered */
    const deliverRes = await request(app)
      .put(`/api/orders/${orderId}/deliver`)
      .set(authHeader(adminToken));

    expect(deliverRes.status).toBe(200);
    expect(deliverRes.body.isDelivered).toBe(true);
  });
});
