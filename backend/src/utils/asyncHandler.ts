import type { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler so thrown errors are forwarded to
 * the global `errorHandler` middleware instead of causing an
 * unhandled promise rejection.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
