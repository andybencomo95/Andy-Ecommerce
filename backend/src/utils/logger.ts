import pino from 'pino';
import config from '../config';

// ============================================
// LOGGING ESTRUCTURADO CON PINO - Why?
// En producción necesitas un logger estructurado porque:
// 1. Los console.log no son buscables
// 2. No tienen niveles (info, warn, error)
// 3. No tienen timestamps consistentes
// 4. No se pueden enviar a servicios como Datadog/Sentry
// 
// Pino es el logger más rápido de Node.js y produce JSON estructurado.
// ============================================

const loggerConfig = {
  // Nivel según el entorno
  // Development = info, Production = warn
  level: config.nodeEnv === 'production' ? 'warn' : 'info',
  
  // Formato de salida
  // Development: pretty (color), Production: JSON
  transport: config.nodeEnv === 'production' 
    ? undefined 
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
};

// Crear instancia del logger
export const logger = pino(loggerConfig);

// ============================================
// LOGGERS ESPECÍFICOS PARA DIFERENTES CONTEXTOS
// Esto permite filtrar logs por componente
// ============================================

export const authLogger = logger.child({ component: 'auth' });
export const productLogger = logger.child({ component: 'products' });
export const orderLogger = logger.child({ component: 'orders' });
export const apiLogger = logger.child({ component: 'api' });

// ============================================
// MIDDLEWARE DE LOGGING DE REQUEST
// Why? Es importante saber:
// - Cuánto tiempo tarda cada request
// - Qué endpoints son más lentos
// - Cuáles fallan más
// ============================================

export const requestLogger = (req: { method: string; url: string }, res: { statusCode: number }, done: () => void) => {
  const start = Date.now();
  
  // Cuando termine la response, loguear
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (res as any).once('finish', () => {
    const duration = Date.now() - start;
    
    apiLogger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    }, 'API Request');
  });
  
  done();
};

// ============================================
// FUNCIONES DE HELPERS PARA ERRORES
// ============================================

export const logError = (error: Error, context?: string) => {
  logger.error({
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  }, 'Error occurred');
};

export const logWarn = (message: string, data?: unknown) => {
  logger.warn({ message, data, timestamp: new Date().toISOString() });
};

export const logInfo = (message: string, data?: unknown) => {
  logger.info({ message, data, timestamp: new Date().toISOString() });
};