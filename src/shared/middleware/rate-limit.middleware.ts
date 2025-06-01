import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AppError } from '../errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../errors/errorTypes';
import { HTTP_STATUS } from '../constants/httpStatus';

export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  const { windowMs = 15 * 60 * 1000, max = 100, message } = options;

  return rateLimit({
    windowMs,
    max,
    handler: (req: Request, res: Response, next: NextFunction) => {
      try {
        throw new AppError(
          ErrorType.TOO_MANY_REQUESTS,
          ErrorModule.SYSTEM,
          message ||
            ErrorMessages[ErrorModule.SYSTEM][ErrorType.TOO_MANY_REQUESTS]!.RATE_LIMIT_EXCEEDED,
          HTTP_STATUS.TOO_MANY_REQUESTS,
          { module: ErrorModule.SYSTEM, method: 'rateLimit' },
          {
            retryAfter: Math.ceil(windowMs / 1000),
            limit: max,
            windowMs,
          }
        );
      } catch (error) {
        next(error);
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Default rate limiter
export const defaultRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});
