import type { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  logger.error(err.message || 'Unhandled error', {
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
}
