import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AppError } from '../errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../errors/errorTypes';
import { UserService } from '../../modules/users/services/user.service';
import { HTTP_STATUS } from '../constants/httpStatus';
import { AuthenticatedRequest } from '../types/express';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
        ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_TOKEN,
        HTTP_STATUS.UNAUTHORIZED,
        { module: ErrorModule.AUTH, method: 'authenticate' }
      );
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        role: string;
      };

      const userService = new UserService();
      const user = await userService.findUserById(decoded.id);
      
      if (!user) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
          { module: ErrorModule.AUTH, method: 'authenticate' }
        );
      }

      (req as AuthenticatedRequest).user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
          { module: ErrorModule.AUTH, method: 'authenticate' }
        );
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return next(
        new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
          { module: ErrorModule.AUTH, method: 'restrictTo' }
        )
      );
    }

    if (!roles.includes(user.role)) {
      return next(
        new AppError(
          ErrorType.AUTHORIZATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHORIZATION]!.UNAUTHORIZED,
          HTTP_STATUS.FORBIDDEN,
          { module: ErrorModule.AUTH, method: 'restrictTo' }
        )
      );
    }

    next();
  };
};
