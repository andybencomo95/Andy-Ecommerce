import { Response } from 'express';

// ============================================
// ESTANDARIZACIÓN DE RESPUESTAS API - Why?
// Un formato consistente ayuda al frontend a manejar
// los datos de forma predecible y reduce errores.
// ============================================

/**
 * Envía una respuesta de éxito estandarizada
 * Format: { success: true, data: ... }
 */
export const sendSuccess = (res: Response, data: any, status: number = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

/**
 * Envía una respuesta de error estandarizada
 * Format: { success: false, error: "message", details: [...] }
 */
export const sendError = (
  res: Response, 
  message: string, 
  status: number = 500, 
  details: any = null
) => {
  return res.status(status).json({
    success: false,
    error: message,
    ...(details && { details }),
  });
};
