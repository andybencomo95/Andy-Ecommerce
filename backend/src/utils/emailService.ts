import crypto from 'crypto';

import config from '../config';

import { authLogger } from './logger';

/* ── Types ── */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/* ── Simulated email sending (dev only) ── */

function sendEmail(options: EmailOptions): Promise<boolean> {
  authLogger.info(
    { to: options.to, subject: options.subject },
    'Email sent (simulated)',
  );
  return Promise.resolve(true);
}

/* ── Token generation ── */

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getVerificationExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

/* ── Email templates ── */

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<boolean> {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .button { display: inline-block; background: #3b82f6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { background: #1e293b; color: #fff; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Verify your email address</h1></div>
    <div class="content">
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thanks for registering at Andy Ecommerce. Please verify your email to complete registration.</p>
      <p style="text-align:center"><a href="${verifyUrl}" class="button">Verify my email</a></p>
      <p style="font-size:12px;color:#64748b;word-break:break-all">${verifyUrl}</p>
      <p><strong>Note:</strong> This link expires in 24 hours.</p>
    </div>
    <div class="footer"><p>&copy; 2026 Andy Ecommerce. All rights reserved.</p></div>
  </div>
</body>
</html>`;

  return sendEmail({ to: email, subject: 'Verify your email - Andy Ecommerce', html });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #22c55e; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .footer { background: #1e293b; color: #fff; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Welcome to Andy Ecommerce!</h1></div>
    <div class="content">
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your account has been verified. You can now explore our catalog and shop!</p>
    </div>
    <div class="footer"><p>&copy; 2026 Andy Ecommerce. All rights reserved.</p></div>
  </div>
</body>
</html>`;

  return sendEmail({ to: email, subject: 'Welcome to Andy Ecommerce!', html });
}

/* ── Validation helpers ── */

export function isValidEmail(email: string): boolean {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  if (email.length > 254) {
    return false;
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const domain = parts[1];
  if (!domain.includes('.') || domain.split('.')[1].length < 2) {
    return false;
  }

  return true;
}

export function validatePassword(
  password: string,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (password.length > 100) {
    errors.push('Password must not exceed 100 characters');
  }

  if (!/[A-Z]/.test(password) && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter or symbol');
  }

  if (!/[a-z]/.test(password) && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter or number');
  }

  return { isValid: errors.length === 0, errors };
}
