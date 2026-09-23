import { Response } from 'express';

export function sendSuccess<T = any>(res: Response, message: string, data: T = {} as T, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function sendError(res: Response, message: string, error: any = null, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? (error.message || String(error)) : message
  });
}
