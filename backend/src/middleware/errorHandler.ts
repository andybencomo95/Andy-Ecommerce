import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

/**
 * Middleware global de manejo de errores.
 *
 * - Captura AppError y devuelve el httpStatus + código + mensaje.
 * - Captura errores genéricos y devuelve 500.
 * - Nunca expone stack traces al cliente.
 * - Envía stack al logger en desarrollo para debug.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn({ code: err.code, message: err.message, details: err.details }, 'AppError');
    res.status(err.httpStatus).json(err.toJSON());
    return;
  }

  logger.error({ err, message: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
