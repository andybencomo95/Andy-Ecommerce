import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import config from './config';
import { attachCorrelationId } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import productRoutes from './routes/products';

export function createApp(): express.Express {
  const app = express();

  /* ── Security ── */
  app.use(helmet());

  /* ── Correlation ID ── */
  app.use(attachCorrelationId);

  /* ── Rate limiting ── */
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.nodeEnv === 'test' ? 1000 : 100,
    message: { error: { code: 'RATE_LIMIT', message: 'Too many requests, try again later' } },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', globalLimiter);

  const authRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: config.nodeEnv === 'test' ? 1000 : 10,
    message: { error: { code: 'AUTH_RATE_LIMIT', message: 'Too many attempts, try again in 5 minutes' } },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth/login', authRateLimit);
  app.use('/api/auth/register', authRateLimit);

  /* ── CORS ── */
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
    }),
  );

  /* ── Body parser ── */
  app.use(express.json());

  /* ── Routes ── */
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/products', productRoutes);

  /* ── Health check ── */
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      message: 'Andy Ecommerce API running with Prisma + SQLite',
      timestamp: new Date().toISOString(),
    });
  });

  /* ── Error handler (last) ── */
  app.use(errorHandler);

  return app;
}
