import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './shared/middleware/error/error.middleware';
import { AppError } from './shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from './shared/errors/errorTypes';
import { defaultRateLimiter } from './shared/middleware/rate-limit.middleware';
import userRoutes from './modules/users/routes/user.routes';

const app: Application = express();

// Connect to MongoDB
mongoose
  .connect(config.database.url)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    throw new AppError(
      ErrorType.INTERNAL,
      ErrorModule.DATABASE,
      ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.CONNECTION_ERROR,
      500,
      { module: ErrorModule.DATABASE, method: 'connect' },
      { error: err.message }
    );
  });

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(defaultRateLimiter);

// Routes
app.use('/api/users', userRoutes);

// Health check route
app.get('/health', (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.DATABASE,
        ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.CONNECTION_ERROR,
        503,
        { module: ErrorModule.DATABASE, method: 'healthCheck' }
      );
    }

    res.status(200).json({
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
  res.status(404).json({
    status: 'error',
    type: ErrorType.NOT_FOUND,
    message: 'Route not found',
    ...(process.env.NODE_ENV === "development" && { "module": ErrorModule.SYSTEM }),
    source: { 
      ...(process.env.NODE_ENV === "development" && { "module": ErrorModule.SYSTEM }), 
      method: req.method 
    },
    details: { path: req.path },
  });
});

// Error handling
app.use(errorHandler);

export default app;
