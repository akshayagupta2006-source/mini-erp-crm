import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/errorResponse';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }

  // Validation Error
  if (err.name === 'ZodError') {
    const message = err.errors.map((e: any) => e.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};
