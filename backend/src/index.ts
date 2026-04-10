import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';

const app = express();

// ============================================
// SEGURIDAD - Why? Porque en producción es vital
// proteger la API de ataques comunes como DDoS
// y vulnerabilidades HTTP básicas
// ============================================

// Helmet: Añade headers de seguridad HTTP
// Protege contra XSS, clickjacking, etc.
app.use(helmet());

// Rate Limiting: Limita requests por IP
// Why? Previene ataques de fuerza bruta y DDoS básico
// 100 requests cada 15 minutos es suficiente para uso normal
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: { message: 'Demasiadas solicitudes, intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Rate Limiting más estricto para auth - previene fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // solo 5 intentos por 15 min
  message: { message: 'Demasiados intentos. Intenta de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});
// Rutas que necesitan protección extra contra brute force
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS - Why? Permite controlar qué dominios pueden acceder a la API
// En desarrollo permite el frontend, en producción debería restringirse
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Parser de JSON - Why? Necesario para leer request bodies
app.use(express.json());

// ============================================
// RUTAS DE LA API
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Ruta de prueba / health check
// Why? Útil para verificar que el servidor está funcionando
// y para monitereo en producción
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Andy Ecommerce API running with Prisma + SQLite',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// MANEJO DE ERRORES
// Why? Uncaught errors pueden crashear el servidor
// Este middleware captura cualquier error no manejado
// Usamos el logger estructurado para mejor trazabilidad
// ============================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // En producción, no exponemos detalles del error
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Loguear el error completo solo en desarrollo
  if (isDevelopment) {
    console.error('💥 Error capturado:', err.message);
    console.error('Stack:', err.stack);
  } else {
    // En producción solo logueamos sin detalles sensibles
    console.error('💥 Error del servidor:', err.name);
  }
  
  res.status(500).json({ 
    message: 'Algo salió mal!', 
    // Solo mostrar detalles en desarrollo
    error: isDevelopment ? err.message : 'Error interno del servidor'
  });
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================

app.listen(config.port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${config.port}`);
  console.log(`📦 Base de datos: SQLite (Prisma)`);
  console.log(`🔒 Modo: ${config.nodeEnv}`);
});
