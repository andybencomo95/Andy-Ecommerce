import crypto from 'crypto';

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config';
import { AppError } from '../errors/AppError';

/**
 * Express Request con metadatos de autenticación y rastreo.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    isAdmin: boolean;
  };
  correlationId?: string;
}

/**
 * Middleware que asigna un correlationId a cada request.
 * Útil para rastrear logs a través de microservicios.
 */
export function attachCorrelationId(req: AuthRequest, _res: Response, next: NextFunction): void {
  req.correlationId =
    (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  next();
}

/**
 * Protege rutas — requiere token JWT válido.
 */
export const protect = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  if (!token) {
    throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      isAdmin: boolean;
    };
    req.user = { id: decoded.id, isAdmin: decoded.isAdmin };
    next();
  } catch {
    throw new AppError('UNAUTHORIZED', 401, 'Invalid or expired token');
  }
};

/**
 * Requiere rol de administrador después de `protect`.
 */
export const admin = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (req.user?.isAdmin) {
    next();
    return;
  }
  throw new AppError('FORBIDDEN', 403, 'Admin access required');
};
