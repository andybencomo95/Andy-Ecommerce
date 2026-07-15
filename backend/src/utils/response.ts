import type { Response } from 'express';

/**
 * Sends a standardized success response.
 */
export function sendSuccess<T>(res: Response, data: T, status: number = 200): void {
  res.status(status).json({ success: true, data });
}

/**
 * Sends a standardized error response.
 */
export function sendError(
  res: Response,
  message: string,
  status: number = 500,
  details?: unknown,
): void {
  const body: Record<string, unknown> = { success: false, error: message };
  if (details !== undefined) {
    body.details = details;
  }
  res.status(status).json(body);
}
