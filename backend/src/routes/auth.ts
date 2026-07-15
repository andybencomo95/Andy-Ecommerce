import { Router } from 'express';
import { z } from 'zod';

import { AppError, validationError } from '../errors/AppError';
import { AuthRequest, protect } from '../middleware/auth';
import { AuthService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';
import { isValidEmail, validatePassword } from '../utils/emailService';

const router = Router();

/* ── Schemas ── */

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/* ── Helpers ── */

function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw validationError(
      result.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    );
  }
  return result.data;
}

/* ── POST /api/auth/register ── */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = parseOrThrow(registerSchema, req.body);

    if (!isValidEmail(email)) {
      throw new AppError('INVALID_EMAIL', 400, 'Please enter a valid email address');
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      throw new AppError('WEAK_PASSWORD', 400, passwordCheck.errors[0] ?? 'Weak password');
    }

    const result = await AuthService.register({ name, email, password });
    res.status(201).json(result);
  }),
);

/* ── POST /api/auth/login ── */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = parseOrThrow(loginSchema, req.body);

    if (!isValidEmail(email)) {
      throw new AppError('INVALID_EMAIL', 400, 'Invalid email format');
    }

    const result = await AuthService.login({ email, password });
    res.json(result);
  }),
);

/* ── POST /api/auth/verify-email ── */
router.post(
  '/verify-email',
  asyncHandler(async (req, res) => {
    const { token } = req.body as { token?: string };
    if (!token) {
      throw new AppError('MISSING_TOKEN', 400, 'Verification token required');
    }

    const result = await AuthService.verifyEmail(token);
    res.json(result);
  }),
);

/* ── POST /api/auth/resend-verification ── */
router.post(
  '/resend-verification',
  asyncHandler(async (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email) {
      throw new AppError('MISSING_EMAIL', 400, 'Email is required');
    }

    await AuthService.resendVerification(email);
    res.json({ message: 'Verification email sent' });
  }),
);

/* ── GET /api/auth/profile ── */
router.get(
  '/profile',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const actor = {
      userId: req.user!.id,
      isAdmin: req.user!.isAdmin,
      correlationId: req.correlationId ?? 'unknown',
    };
    const profile = await AuthService.getProfile(actor);
    res.json(profile);
  }),
);

/* ── PUT /api/auth/profile ── */
router.put(
  '/profile',
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const actor = {
      userId: req.user!.id,
      isAdmin: req.user!.isAdmin,
      correlationId: req.correlationId ?? 'unknown',
    };
    const result = await AuthService.updateProfile(actor, req.body);
    res.json(result);
  }),
);

export default router;
