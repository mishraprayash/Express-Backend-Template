// error.middleware.ts - boilerplate code

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../errors/errorTypes';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import * as jwt from 'jsonwebtoken';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
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

  // Sanitize error details for production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const sanitizedError = {
    status: error.status,
    type: error.type,
    module: isDevelopment && error.module,
    message: error.message,
    ...(isDevelopment && { source: error.source }),
    ...(error.details && { details: error.details }),
    ...(isDevelopment && { stack: err.stack }),
  };

  // Remove sensitive information in production
  if (!isDevelopment) {
    // Mask internal paths in error messages
    if (sanitizedError.message) {
      sanitizedError.message = sanitizedError.message.replace(/\/[^:]+:\d+:\d+/g, '');
    }
    // Remove source information in production
    delete sanitizedError.source;
  }

  // Mongoose bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    error = new AppError(
      ErrorType.NOT_FOUND,
      ErrorModule.DATABASE,
      ErrorMessages[ErrorModule.DATABASE][ErrorType.NOT_FOUND]!.RESOURCE_NOT_FOUND,
      404,
      { module: ErrorModule.DATABASE, method: 'findById' },
      { id: err.value }
    );
  }

  // Mongoose duplicate key
  if ((err as { code?: number }).code === 11000) {
    const field = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue || {})[0];
    error = new AppError(
      ErrorType.CONFLICT,
      ErrorModule.DATABASE,
      ErrorMessages[ErrorModule.DATABASE][ErrorType.CONFLICT]!.DUPLICATE_EMAIL,
      400,
      { module: ErrorModule.DATABASE, method: 'create' },
      { field }
    );
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map(val => val.message);
    error = new AppError(
      ErrorType.VALIDATION,
      ErrorModule.DATABASE,
      ErrorMessages[ErrorModule.DATABASE][ErrorType.VALIDATION]!.INVALID_DATA,
      400,
      { module: ErrorModule.DATABASE, method: 'validate' },
      { details: messages }
    );
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const messages = err.errors.map(e => e.message);
    error = new AppError(
      ErrorType.VALIDATION,
      ErrorModule.VALIDATION,
      ErrorMessages[ErrorModule.VALIDATION][ErrorType.VALIDATION]!.INVALID_INPUT,
      400,
      { module: ErrorModule.VALIDATION, method: 'validate' },
      { details: messages }
    );
  }

  // JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    error = new AppError(
      ErrorType.AUTHENTICATION,
      ErrorModule.AUTH,
      ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_TOKEN,
      401,
      { module: ErrorModule.AUTH, method: 'verify' }
    );
  }

  if (err instanceof jwt.TokenExpiredError) {
    error = new AppError(
      ErrorType.AUTHENTICATION,
      ErrorModule.AUTH,
      ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.TOKEN_EXPIRED,
      401,
      { module: ErrorModule.AUTH, method: 'verify' }
    );
  }

  // Default error
  if (!(error instanceof AppError)) {
    error = new AppError(
      ErrorType.INTERNAL,
      ErrorModule.SYSTEM,
      ErrorMessages[ErrorModule.SYSTEM][ErrorType.INTERNAL]!.SERVER_ERROR,
      500,
      { module: ErrorModule.SYSTEM }
    );
  }

  res.status(error.statusCode).json(sanitizedError);
};
