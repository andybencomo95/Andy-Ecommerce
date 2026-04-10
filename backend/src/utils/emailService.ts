import crypto from 'crypto';
import config from '../config';
import { authLogger } from './logger';

// ============================================
// SERVICIO DE EMAIL - Why?
// Para verificar emails，我们需要 enviar un correo con un token.
// En desarrollo, simulamos el envío (solo logueamos).
// En producción, aqui se integraria SendGrid, Resend, etc.
// ============================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Simular envio de email (en desarrollo)
const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  authLogger.info({
    to: options.to,
    subject: options.subject,
  }, 'Email enviado (simulado)');
  
  // En desarrollo, siempre succeeds
  // En produccion, aqui llamarías a SendGrid/Resend/AWS SES
  return true;
};

// ============================================
// GENERAR TOKEN DE VERIFICACIÓN
// Why? Un token aleatorio seguro que expira en 24 horas
// ============================================
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const getVerificationExpiry = (): Date => {
  // 24 horas de validez
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
};

// ============================================
// ENVIAR EMAIL DE VERIFICACIÓN
// ============================================
export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<boolean> => {
  const verifyUrl = `${config.frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { background: #1e293b; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verifica tu correo electrónico</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          <p>Gracias por registrarte en Andy Ecommerce. Para completar tu registro, por favor verifica tu correo electrónico.</p>
          <p style="text-align: center;">
            <a href="${verifyUrl}" class="button">Verificar mi correo</a>
          </p>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; font-size: 12px; color: #64748b;">${verifyUrl}</p>
          <p><strong>Nota:</strong> Este enlace expira en 24 horas.</p>
        </div>
        <div class="footer">
          <p>© 2026 Andy Ecommerce. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verifica tu correo electrónico - Andy Ecommerce',
    html,
  });
};

// ============================================
// ENVIAR EMAIL DE BIENVENIDA (ya verificado)
// ============================================
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
        .footer { background: #1e293b; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a Andy Ecommerce!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          <p>Tu cuenta ha sido verificada exitosamente. Ahora puedes:</p>
          <ul>
            <li>Explorar nuestro catálogo de productos</li>
            <li>Agregar productos a tu carrito</li>
            <li>Completar tus compras</li>
            <li>Ver el historial de tus pedidos</li>
          </ul>
          <p>¡Gracias por confiar en nosotros!</p>
        </div>
        <div class="footer">
          <p>© 2026 Andy Ecommerce. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '¡Bienvenido a Andy Ecommerce!',
    html,
  });
};

// ============================================
// VALIDAR EMAIL - Why?
// Regex más estricto que el basico.
// Valida: usuario@dominio.extension
// ============================================
export const isValidEmail = (email: string): boolean => {
  // Regex mas estricto que acepta solo emails reales
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Validar longitud maxima
  if (email.length > 254) {
    return false;
  }
  
  // Validar que el dominio tenga al menos 2 caracteres despues del punto
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }
  
  const domain = parts[1];
  if (!domain.includes('.') || domain.split('.')[1].length < 2) {
    return false;
  }
  
  return true;
};

// ============================================
// VALIDAR PASSWORD - Why?
// Requisitos de seguridad para passwords
// ============================================
interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (password.length > 100) {
    errors.push('La contraseña no puede exceder 100 caracteres');
  }
  
  // Al menos una mayúscula O un símbolo
  if (!/[A-Z]/.test(password) && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe tener al menos una mayúscula o símbolo');
  }
  
  // Al menos una minúscula O un número
  if (!/[a-z]/.test(password) && !/[0-9]/.test(password)) {
    errors.push('La contraseña debe tener al menos una minúscula o número');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};