/**
 * AppError — error tipado con código, httpStatus y detalles opcionales.
 */
export class AppError extends Error {
  public readonly name = 'AppError';

  constructor(
    public readonly code: string,
    public readonly httpStatus: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON(): { error: { code: string; message: string } } {
    return {
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

/* ── Helpers ── */

export const notFound = (resource: string, id: string): AppError =>
  new AppError(
    `${resource.toUpperCase()}_NOT_FOUND`,
    404,
    `${resource} with id "${id}" not found`,
  );

export const conflict = (message: string, details?: unknown): AppError =>
  new AppError('CONFLICT', 409, message, details);

export const unauthorized = (message = 'Authentication required'): AppError =>
  new AppError('UNAUTHORIZED', 401, message);

export const forbidden = (message = 'Forbidden'): AppError =>
  new AppError('FORBIDDEN', 403, message);

export const badRequest = (message: string, details?: unknown): AppError =>
  new AppError('BAD_REQUEST', 400, message, details);

export const validationError = (
  errors: { field: string; message: string }[],
): AppError => new AppError('VALIDATION_ERROR', 400, 'Validation failed', errors);
