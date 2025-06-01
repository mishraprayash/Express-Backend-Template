import express, { Application, NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { errorHandler } from './shared/middleware/error/error.middleware';
import { AppError } from './shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from './shared/errors/errorTypes';
import { HTTP_STATUS } from './shared/constants/httpStatus';
import { configureSecurityMiddleware } from './shared/middleware/security';


const app: Application = express();

// Security middleware
configureSecurityMiddleware(app);

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.DATABASE,
        ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.CONNECTION_ERROR,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        { module: ErrorModule.DATABASE, method: 'healthCheck' }
      );
    }

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: {
        uptime: process.uptime(),
        timestamp: Date.now(),
        database: {
          status: 'connected',
          readyState: mongoose.connection.readyState,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'error',
    type: ErrorType.NOT_FOUND,
    message: 'Route not found',
    ...(process.env.NODE_ENV === 'development' && { module: ErrorModule.SYSTEM }),
    source: {
      ...(process.env.NODE_ENV === 'development' && { module: ErrorModule.SYSTEM }),
      method: req.method,
    },
    details: { path: req.path },
  });
});

// Error handling
app.use(errorHandler);

export default app;
