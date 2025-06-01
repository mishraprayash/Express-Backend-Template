// AppError.ts - boilerplate code

import { ErrorType, ErrorModule, ErrorResponse, ErrorSource } from './errorTypes';

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly module: ErrorModule;
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;
  public readonly source?: ErrorSource;
  public readonly details?: Record<string, unknown>;

  constructor(
    type: ErrorType,
    module: ErrorModule,
    message: string,
    statusCode: number,
    source?: ErrorSource,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.type = type;
    this.module = module;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.source = source;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON(): ErrorResponse {
    return {
      type: this.type,
      module: this.module,
      message: this.message,
      statusCode: this.statusCode,
      source: this.source,
      details: this.details,
    };
  }
}
