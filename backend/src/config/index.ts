import dotenv from 'dotenv';
dotenv.config();

// ============================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO
// Why? Las variables de entorno permiten cambiar el comportamiento
// de la aplicación sin modificar el código. Esencial para desplegar
// en diferentes entornos (desarrollo, producción).
// ============================================

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  frontendUrl: string;
  databaseUrl: string;
  stripeSecretKey: string;
}

// Validación de variables requeridas
const requiredVars = ['DATABASE_URL'];
const missingVars = requiredVars.filter((v) => !process.env[v]);

if (missingVars.length > 0 && process.env.NODE_ENV !== 'production') {
  console.warn(`⚠️ Variables faltantes (usando valores por defecto): ${missingVars.join(', ')}`);
}

const config: Config = {
  // Puerto del servidor
  // Why? El puerto debe ser configurable para evitar conflictos
  // en diferentes entornos
  port: parseInt(process.env.PORT || '5000', 10),

  // Entorno de ejecución
  // Why? Determina si mostrar errores detallados o no
  // Development = errores visibles, Production = errores ocultos
  nodeEnv: process.env.NODE_ENV || 'development',

  // Secret para JWT
  // Why? Debe ser único y seguro. En producción es obligatorio
  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        // LANZAR ERROR en producción - no permitir ejecución sin secret
        throw new Error('FATAL: JWT_SECRET es requerido en producción. Configúralo en .env');
      }
      // En desarrollo, usar valor por defecto pero advertiendo
      console.warn('⚠️ ADVERTENCIA: JWT_SECRET no configurada en desarrollo. Use .env para configurar.');
      return 'dev-secret-for-local-testing-only';
    }
    return secret;
  })(),

  // Tiempo de expiración del token
  // Why? Tokens muy largos son insegs tokens muy cortos irritan al usuario
  // 7 días es un balance razonable para una tienda
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // URL del frontend
  // Why? Necesaria para CORS y para que el backend sepa dónde está el frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // URL de la base de datos
  // Why? Prisma la usa para conectar a la DB. Configurada en .env
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',

  // Clave de Stripe (para pagos futuros)
  // Why? Necesaria cuando se implemente el sistema de pagos
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
};

export default config;