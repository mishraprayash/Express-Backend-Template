// error.middleware.ts - boilerplate code

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../errors/errorTypes';
import { HTTP_STATUS } from '../../constants/httpStatus';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import * as jwt from 'jsonwebtoken';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    type: error.type || 'UNKNOWN',
    module: error.module || 'UNKNOWN',
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    error = new AppError(
      ErrorType.AUTHENTICATION,
      ErrorModule.AUTH,
      ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_TOKEN,
      HTTP_STATUS.UNAUTHORIZED,
      { module: ErrorModule.AUTH, method: 'verify' }
    );
  }

  if (err instanceof jwt.TokenExpiredError) {
    error = new AppError(
      ErrorType.AUTHENTICATION,
      ErrorModule.AUTH,
      ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.TOKEN_EXPIRED,
      HTTP_STATUS.UNAUTHORIZED,
      { module: ErrorModule.AUTH, method: 'verify' }
    );
  }

  // Send error response
  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    type: error.type,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: error.details,
    }),
  });
};
