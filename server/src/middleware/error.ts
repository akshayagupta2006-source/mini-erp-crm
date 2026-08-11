import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../utils/errorResponse';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the actual error in Render logs
  console.error('SERVER ERROR:', err);
  console.error('ERROR MESSAGE:', err?.message);
  console.error('ERROR CODE:', err?.code);
  console.error('ERROR STACK:', err?.stack);

  let error = { ...err };

  error.message = err.message;

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    const message = 'Requested record was not found';
    error = new ErrorResponse(message, 404);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    const message = err.errors
      .map((e: any) => e.message)
      .join(', ');

    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};