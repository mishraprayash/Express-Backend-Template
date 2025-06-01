import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../shared/errors/errorTypes';
import { HTTP_STATUS } from '../shared/constants/httpStatus';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(
        ErrorType.AUTHENTICATION,
        ErrorModule.AUTH,
        ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.NO_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
        { module: ErrorModule.AUTH, method: 'authenticate' }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(
        ErrorType.AUTHENTICATION,
        ErrorModule.AUTH,
        ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.NO_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
        { module: ErrorModule.AUTH, method: 'authenticate' }
      );
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      throw new AppError(
        ErrorType.AUTHENTICATION,
        ErrorModule.AUTH,
        ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
        { module: ErrorModule.AUTH, method: 'authenticate' }
      );
    }
  } catch (error) {
    next(error);
  }
}; 