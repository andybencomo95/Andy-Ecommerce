import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { UserModel } from '../models/User';
import config from '../config';
import { AuthRequest, protect } from '../middleware/auth';
import { authLogger } from '../utils/logger';
import { 
  isValidEmail, 
  validatePassword, 
  sendVerificationEmail,
  sendWelcomeEmail 
} from '../utils/emailService';

const router = Router();

// ============================================
// RATE LIMITING - Why?
// Previene ataques de fuerza bruta
// ============================================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: { message: 'Demasiados intentos de login. Espera 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 reenvíos
  message: { message: 'Demasiados reenvíos. Espera 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 registros
  message: { message: 'Demasiados registros. Espera 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// GENERACIÓN DE TOKEN JWT
// ============================================
const generateToken = (id: string, isAdmin: boolean) => {
  return jwt.sign({ id, isAdmin }, config.jwtSecret, {
    expiresIn: '7d',
  });
};

// ============================================
// ESQUEMAS DE VALIDACIÓN - Updated con validaciones más estrictas
// ============================================

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// POST /api/auth/register - Registro de usuario
router.post(
  '/register',
  registerLimiter,  // ✅ Rate limiting
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, password } = req.body;

      // ============================================
      // VALIDACIONES PERSONALIZADAS
      // Why? Zod valida el formato, pero aquivalidamos
      // la semántica (email real, password segura)
      // ============================================
      
      // Validar formato de email
      if (!isValidEmail(email)) {
        authLogger.warn({ email }, 'Registration failed: invalid email format');
        return res.status(400).json({ 
          message: 'Por favor ingresa un correo electrónico válido',
          field: 'email'
        });
      }

      // Validar requisitos de password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        authLogger.warn({}, 'Registration failed: weak password');
        return res.status(400).json({ 
          message: passwordValidation.errors[0],
          field: 'password'
        });
      }

      authLogger.info({ email }, 'Attempting user registration');

      // Verificar si el usuario ya existe
      const userExists = await UserModel.findByEmail(email);
      if (userExists) {
        authLogger.warn({ email }, 'Registration failed: user already exists');
        return res.status(400).json({ message: 'El usuario ya existe' });
      }

      // Crear usuario (ya incluye generación de token de verificación)
      const user = await UserModel.create({ name, email, password });

      // ============================================
      // ENVIAR EMAIL DE VERIFICACIÓN
      // Why? El usuario debe verificar su email antes de poder usar la cuenta
      // En desarrollo, solo se loguea
      // ============================================
      try {
        // Buscar el token que se generó en create()
        const userWithToken = await UserModel.findById(user.id);
        if (userWithToken?.emailVerifyToken) {
          await sendVerificationEmail(
            user.email, 
            user.name, 
            userWithToken.emailVerifyToken
          );
          authLogger.info({ userId: user.id }, 'Verification email sent');
        }
      } catch (emailError) {
        // Si falla el email, no fallamos el registro
        authLogger.error({ error: emailError }, 'Failed to send verification email');
      }

      authLogger.info({ userId: user.id }, 'User registered successfully');

      // Respuesta - usuario no verificado hasta que confirme email
      // NO retornamos token - debe verificar su email primero
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: false,
        requiresEmailVerification: true,
        message: 'Usuario registrado. Por favor verifica tu correo electrónico.',
      });
    } catch (error) {
      authLogger.error({ error }, 'Registration failed');
      res.status(500).json({ message: 'Error al registrar usuario' });
    }
  }
);

// POST /api/auth/login - Inicio de sesión
router.post(
  '/login',
  loginLimiter,  // ✅ Rate limiting
  async (req: AuthRequest, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validar formato de email
      if (!isValidEmail(email)) {
        return res.status(400).json({ 
          message: 'Correo electrónico inválido',
          field: 'email'
        });
      }

      authLogger.info({ email }, 'Attempting user login');

      const user = await UserModel.findByEmail(email);
      
      if (!user || !(await UserModel.comparePassword(user as any, password))) {
        authLogger.warn({ email }, 'Login failed: invalid credentials');
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
      }

      // ============================================
      // VERIFICAR SI EL EMAIL ESTÁ VERIFICADO
      // Why? Si el email no está verificado, no permitimos login
      // (a menos que sea admin, para que pueda acceder al panel)
      // ============================================
      const userData = user as any;
      if (!userData.isEmailVerified && !userData.isAdmin) {
        authLogger.warn({ email }, 'Login failed: email not verified');
        return res.status(403).json({ 
          message: 'Debes verificar tu correo electrónico antes de iniciar sesión',
          requiresVerification: true,
          email: user.email
        });
      }

      authLogger.info({ userId: user.id }, 'User logged in successfully');

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isEmailVerified: userData.isEmailVerified,
        token: generateToken(user.id, user.isAdmin),
      });
    } catch (error) {
      authLogger.error({ error }, 'Login failed');
      res.status(500).json({ message: 'Error al iniciar sesión' });
    }
  }
);

// ============================================
// VERIFICACIÓN DE EMAIL
// ============================================

// POST /api/auth/verify-email - Verificar email con token
router.post(
  '/verify-email',
  async (req: AuthRequest, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Token de verificación requerido' });
      }

      const user = await UserModel.verifyEmail(token);

      if (!user) {
        authLogger.warn({}, 'Email verification failed: invalid or expired token');
        return res.status(400).json({ 
          message: 'El token de verificación es inválido o ha expirado. Solicita uno nuevo.' 
        });
      }

      // Enviar email de bienvenida
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (e) {
        authLogger.error({ error: e }, 'Failed to send welcome email');
      }

      authLogger.info({ userId: user.id }, 'Email verified successfully');

      res.json({
        message: '¡Correo electrónico verificado exitosamente! Ya puedes usar tu cuenta.',
        verified: true,
      });
    } catch (error) {
      authLogger.error({ error }, 'Email verification failed');
      res.status(500).json({ message: 'Error al verificar correo electrónico' });
    }
  }
);

// POST /api/auth/resend-verification - Reenviar token de verificación
router.post(
  '/resend-verification',
  resendLimiter,  // ✅ Rate limiting
  async (req: AuthRequest, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email requerido' });
      }

      const user = await UserModel.findByEmail(email);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const userData = user as any;
      if (userData.isEmailVerified) {
        return res.status(400).json({ message: 'El correo ya está verificado' });
      }

      // Generar nuevo token
      const result = await UserModel.resendVerificationToken(user.id);

      if (!result) {
        return res.status(400).json({ message: 'No se pudo reenviar el token' });
      }

      // Enviar email
      await sendVerificationEmail(result.email, result.name, result.token);

      authLogger.info({ userId: user.id }, 'Verification email resent');

      res.json({
        message: 'Se ha enviado un nuevo correo de verificación',
      });
    } catch (error) {
      authLogger.error({ error }, 'Failed to resend verification email');
      res.status(500).json({ message: 'Error al reenviar correo de verificación' });
    }
  }
);

// GET /api/auth/profile - Obtener perfil del usuario actual
router.get(
  '/profile',
  protect,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await UserModel.findById(req.user!.id);
      
      if (!user) {
        authLogger.warn({ userId: req.user!.id }, 'Profile not found');
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const userData = user as any;
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isEmailVerified: userData.isEmailVerified || false,
        createdAt: user.createdAt,
      });
    } catch (error) {
      authLogger.error({ error }, 'Failed to fetch profile');
      res.status(500).json({ message: 'Error al obtener perfil' });
    }
  }
);

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put(
  '/profile',
  protect,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, email, password, currentPassword } = req.body;
      
      const user = await UserModel.findById(req.user!.id);
      
      if (!user) {
        authLogger.warn({ userId: req.user!.id }, 'Profile update failed: user not found');
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Si se va a cambiar la contraseña, verificar la contraseña actual
      if (password) {
        if (!currentPassword) {
          return res.status(400).json({ 
            message: 'Ingresa tu contraseña actual para cambiarla' 
          });
        }
        
        const isPasswordValid = await UserModel.comparePassword(user as any, currentPassword);
        if (!isPasswordValid) {
          authLogger.warn({ userId: req.user!.id }, 'Profile update failed: wrong current password');
          return res.status(400).json({ 
            message: 'Contraseña actual incorrecta' 
          });
        }
        
        // Validar nueva contraseña
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          return res.status(400).json({ 
            message: passwordValidation.errors[0],
            field: 'password'
          });
        }
      }

      // Validar nuevo email si se proporciona
      if (email && !isValidEmail(email)) {
        return res.status(400).json({ 
          message: 'Correo electrónico inválido',
          field: 'email'
        });
      }

      const updatedUser = await UserModel.update(req.user!.id, {
        name,
        email,
        password,
      });

      authLogger.info({ userId: user.id }, 'Profile updated successfully');

      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser.id, updatedUser.isAdmin),
      });
    } catch (error) {
      authLogger.error({ error }, 'Profile update failed');
      res.status(500).json({ message: 'Error al actualizar perfil' });
    }
  }
);

export default router;