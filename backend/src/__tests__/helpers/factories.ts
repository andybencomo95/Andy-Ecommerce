/**
 * Helpers de factories para crear datos de prueba en el test DB.
 */

import bcrypt from 'bcryptjs';

import prisma from '../../config/prisma';

export async function createTestUser(overrides?: Partial<{
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
}>) {
  const hashedPassword = await bcrypt.hash(overrides?.password ?? 'Password123!', 4);

  return prisma.user.create({
    data: {
      name: overrides?.name ?? 'Test User',
      email: overrides?.email ?? 'test@example.com',
      password: hashedPassword,
      isAdmin: overrides?.isAdmin ?? false,
      isEmailVerified: overrides?.isEmailVerified ?? false,
    },
  });
}

export async function createTestAdmin(overrides?: Partial<{
  name: string;
  email: string;
  password: string;
}>) {
  return createTestUser({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    isAdmin: true,
    isEmailVerified: true,
    ...overrides,
  });
}

export async function createTestProduct(overrides?: Partial<{
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}>) {
  return prisma.product.create({
    data: {
      name: overrides?.name ?? 'Test Product',
      description: overrides?.description ?? 'A test product with a long enough description.',
      price: overrides?.price ?? 29.99,
      image: overrides?.image ?? 'https://example.com/product.jpg',
      category: overrides?.category ?? 'Testing',
      stock: overrides?.stock ?? 10,
    },
  });
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
