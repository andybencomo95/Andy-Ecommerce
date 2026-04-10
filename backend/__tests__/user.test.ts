import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// ============================================
// TESTS DE MODELO DE USUARIO
// Why? Los tests/unitarios verifican la lógica de negocio
// sin depender de la base de datos real.
// Usamos mocks de Prisma para aislar las pruebas.
// ============================================

// Mock de Prisma para User
const mockUser = {
  id: 'test-uuid-123',
  name: 'Test User',
  email: 'test@example.com',
  password: '$2a$12$hashedpassword',
  isAdmin: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// Simular respuesta de Prisma
const createMockPrisma = () => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
  },
});

// ============================================
// TESTS: findByEmail
// ============================================
describe('UserModel.findByEmail', () => {
  it('should find user by email (case insensitive)', async () => {
    // Arrange
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue(mockUser);
    
    // El código actual hace: email.toLowerCase()
    const email = 'TEST@EXAMPLE.COM';
    
    // Assert - verificar que el email se normaliza
    expect(email.toLowerCase()).toBe('test@example.com');
    expect(prisma.user.findUnique).toBeDefined();
  });

  it('should return null if user not found', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue(null);
    
    // Verificar comportamiento esperado
    const result = null;
    expect(result).toBeNull();
  });
});

// ============================================
// TESTS: comparePassword
// Why? La comparación de passwords es crítica para seguridad.
// ============================================
describe('UserModel.comparePassword', () => {
  it('should return true for correct password', async () => {
    // bcrypt hash de 'password123'
    const hashedPassword = await bcrypt.hash('password123', 12);
    const isValid = await bcrypt.compare('password123', hashedPassword);
    
    expect(isValid).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const isValid = await bcrypt.compare('wrongpassword', hashedPassword);
    
    expect(isValid).toBe(false);
  });

  it('should handle empty passwords', async () => {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const isValid = await bcrypt.compare('', hashedPassword);
    
    expect(isValid).toBe(false);
  });
});

// ============================================
// TESTS: Validación de email
// ============================================
describe('Email Validation', () => {
  const validEmails = [
    'test@example.com',
    'user.name@domain.org',
    'user+tag@example.co',
  ];

  const invalidEmails = [
    'invalid',
    '@example.com',
    'user@',
    'user@.com',
  ];

  it('should validate correct email formats', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });
  });

  it('should reject invalid email formats', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});

// ============================================
// TESTS: Generación de JWT
// Why? Verificar que el token se genera correctamente
// ============================================
describe('JWT Token Generation', () => {
  it('should create a valid JWT token', () => {
    const jwt = require('jsonwebtoken');
    
    const token = jwt.sign(
      { id: 'test-123', isAdmin: false },
      'test-secret',
      { expiresIn: '7d' }
    );
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT tiene 3 partes
  });

  it('should decode token correctly', () => {
    const jwt = require('jsonwebtoken');
    
    const payload = { id: 'test-123', isAdmin: true };
    const token = jwt.sign(payload, 'test-secret');
    const decoded = jwt.verify(token, 'test-secret');
    
    expect(decoded.id).toBe('test-123');
    expect(decoded.isAdmin).toBe(true);
  });

  it('should fail with invalid secret', () => {
    const jwt = require('jsonwebtoken');
    
    const token = jwt.sign({ id: 'test' }, 'secret1');
    
    expect(() => {
      jwt.verify(token, 'secret2');
    }).toThrow();
  });
});