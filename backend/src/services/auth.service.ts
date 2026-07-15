import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import config from '../config';
import { AppError, unauthorized, conflict, badRequest } from '../errors/AppError';
import { UserModel } from '../models/User';
import type { ActorContext } from '../types';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/emailService';
import { authLogger } from '../utils/logger';


export interface AuthTokens {
  accessToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface RegisterResult {
  id: string;
  name: string;
  email: string;
  isEmailVerified: false;
  message: string;
}

/* ── Helpers ── */

function generateToken(id: string, isAdmin: boolean): string {
  const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days
  return jwt.sign({ id, isAdmin }, config.jwtSecret, { expiresIn: expiresInSeconds });
}

/* ── Service ── */

export const AuthService = {
  async register(input: RegisterInput): Promise<RegisterResult> {
    const { name, email, password } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await UserModel.findByEmail(normalizedEmail);
    if (existing) {
      throw conflict('A user with this email already exists');
    }

    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    /* ── Send verification email (best-effort) ── */
    const userWithToken = await UserModel.findById(user.id);
    if (userWithToken?.emailVerifyToken) {
      try {
        await sendVerificationEmail(user.email, user.name, userWithToken.emailVerifyToken);
        authLogger.info({ userId: user.id }, 'Verification email sent');
      } catch (err) {
        authLogger.warn({ err, userId: user.id }, 'Failed to send verification email');
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: false,
      message: 'Account created. Please verify your email before logging in.',
    };
  },

  async login(
    input: LoginInput,
  ): Promise<{ id: string; name: string; email: string; isAdmin: boolean; isEmailVerified: boolean; token: string }> {
    const { email, password } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await UserModel.findByEmail(normalizedEmail);
    if (!user) {
      throw unauthorized('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw unauthorized('Invalid email or password');
    }

    /* ── Garantizamos que email no verificado no ingrese (salvo admin) ── */
    if (!user.isEmailVerified && !user.isAdmin) {
      throw new AppError('EMAIL_NOT_VERIFIED', 403, 'Please verify your email before logging in', {
        email: user.email,
      });
    }

    const token = generateToken(user.id, user.isAdmin);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isEmailVerified: user.isEmailVerified,
      token,
    };
  },

  async verifyEmail(token: string): Promise<{ verified: boolean; message: string }> {
    const user = await UserModel.verifyEmail(token);
    if (!user) {
      throw badRequest('Invalid or expired verification token');
    }

    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (err) {
      authLogger.warn({ err, userId: user.id }, 'Failed to send welcome email');
    }

    return { verified: true, message: 'Email verified successfully. You can now log in.' };
  },

  async resendVerification(email: string): Promise<void> {
    const user = await UserModel.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw badRequest('User not found');
    }

    if ((user as Record<string, unknown>).isEmailVerified as boolean) {
      throw conflict('Email is already verified');
    }

    const result = await UserModel.resendVerificationToken(user.id);
    if (!result) {
      throw badRequest('Could not resend verification token');
    }

    try {
      await sendVerificationEmail(result.email, result.name, result.token);
    } catch (err) {
      authLogger.warn({ err, userId: user.id }, 'Failed to resend verification email');
    }
  },

  async getProfile(actor: ActorContext): Promise<UserProfile> {
    const user = await UserModel.findById(actor.userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isEmailVerified: (user as Record<string, unknown>).isEmailVerified as boolean,
      createdAt: user.createdAt,
    };
  },

  async updateProfile(
    actor: ActorContext,
    updates: { name?: string; email?: string; password?: string; currentPassword?: string },
  ): Promise<{
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
  }> {
    const user = await UserModel.findById(actor.userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User not found');
    }

    if (updates.password) {
      if (!updates.currentPassword) {
        throw badRequest('Current password is required to set a new password');
      }
      const valid = await bcrypt.compare(updates.currentPassword, user.password);
      if (!valid) {
        throw badRequest('Current password is incorrect');
      }
    }

    const updated = await UserModel.update(actor.userId, {
      name: updates.name?.trim(),
      email: updates.email?.toLowerCase().trim(),
      password: updates.password,
    });

    const token = generateToken(updated.id, updated.isAdmin);

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      isAdmin: updated.isAdmin,
      token,
    };
  },
};
