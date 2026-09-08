import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Error Handler]', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    sendError(res, 'Database validation error', 400, messages);
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    sendError(res, `A record with this ${field} already exists.`, 409);
    return;
  }

  if (err.name === 'CastError') {
    sendError(res, `Invalid resource ID format: ${err.value}`, 400);
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid authorization token', 401);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, message, statusCode);
};
