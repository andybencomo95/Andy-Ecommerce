import type { IncomingMessage, ServerResponse } from 'http';

import pino from 'pino';

import config from '../config';

/* ── Core logger instance ── */

export const logger = pino({
  level: config.nodeEnv === 'production' ? 'warn' : 'info',
  transport:
    config.nodeEnv === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
});

/* ── Child loggers per domain ── */

export const authLogger = logger.child({ component: 'auth' });
export const productLogger = logger.child({ component: 'products' });
export const orderLogger = logger.child({ component: 'orders' });
export const apiLogger = logger.child({ component: 'api' });

/* ── Request latency logger ── */

export const requestLogger = (
  req: IncomingMessage & { method: string; url: string },
  res: ServerResponse,
  done: () => void,
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    apiLogger.info(
      {
        method: req.method,
        url: req.url,
        status: (res as unknown as { statusCode: number }).statusCode,
        duration: `${duration}ms`,
      },
      'API Request',
    );
  });

  done();
};

/* ── Convenience helpers ── */

export function logError(error: Error, context?: string): void {
  logger.error(
    { error: error.message, stack: error.stack, context },
    'Error occurred',
  );
}

export function logWarn(message: string, data?: unknown): void {
  logger.warn({ message, data }, message);
}

export function logInfo(message: string, data?: unknown): void {
  logger.info({ message, data }, message);
}
