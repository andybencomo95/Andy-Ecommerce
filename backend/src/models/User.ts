import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { generateVerificationToken, getVerificationExpiry } from '../utils/emailService';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
}

export const UserModel = {
  async create(data: { name: string; email: string; password: string; isAdmin?: boolean }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Generar token de verificación
    const verificationToken = generateVerificationToken();
    const verificationExpires = getVerificationExpiry();
    
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        isAdmin: data.isAdmin || false,
        isEmailVerified: false,
        emailVerifyToken: verificationToken,
        emailVerifyExpires: verificationExpires,
      }
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  },

  async comparePassword(user: User, candidatePassword: string) {
    return bcrypt.compare(candidatePassword, user.password);
  },

  async update(id: string, data: { name?: string; email?: string; password?: string }) {
    const updateData: Record<string, string | boolean> = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.password) updateData.password = await bcrypt.hash(data.password, 12);
    
    return prisma.user.update({
      where: { id },
      data: updateData
    });
  },

  // ============================================
  // Verificación de email
  // ============================================
  async verifyEmail(token: string) {
    // Buscar usuario con ese token
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: {
          gt: new Date() // No ha expirado
        }
      }
    });

    if (!user) {
      return null; // Token inválido o expirado
    }

    // Actualizar usuario
    return prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerifyToken: null, // Limpiar token
        emailVerifyExpires: null,
      }
    });
  },

  async findByVerificationToken(token: string) {
    return prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: {
          gt: new Date()
        }
      }
    });
  },

  async resendVerificationToken(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.isEmailVerified) {
      return null;
    }

    // Generar nuevo token
    const newToken = generateVerificationToken();
    const newExpires = getVerificationExpiry();

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: newToken,
        emailVerifyExpires: newExpires,
      }
    });

    return {
      token: newToken,
      email: user.email,
      name: user.name,
    };
  }
};
