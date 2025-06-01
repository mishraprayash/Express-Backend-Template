// AppError.ts - boilerplate code

import { ErrorType, ErrorModule } from './errorTypes';
import { HTTP_STATUS, HttpStatus } from '../constants/httpStatus';

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly module: ErrorModule;
  public readonly statusCode: HttpStatus;
  public readonly details?: Record<string, unknown>;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    type: ErrorType,
    module: ErrorModule,
    message: string,
    statusCode: HttpStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    source?: Record<string, unknown>,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.type = type;
    this.module = module;
    this.statusCode = statusCode;
    this.details = details;
    this.metadata = source;
    this.name = 'AppError';

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
