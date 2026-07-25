import { NextFunction, Request, Response } from 'express';
import AppError from '../types/error.js';


export default function ErrorMiddleware(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}
