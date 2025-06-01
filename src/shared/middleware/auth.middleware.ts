import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AppError } from '../errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../errors/errorTypes';
import { UserService } from '../../modules/users/services/user.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1) Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(
        ErrorType.AUTHENTICATION,
        ErrorModule.AUTH,
        ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_TOKEN,
        401,
        { module: ErrorModule.AUTH, method: 'authMiddleware' }
      );
    }

    const token = authHeader.split(' ')[1];

    // 2) Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
    };

    // 3) Check if user still exists
    const userService = new UserService();
    await userService.findUserById(decoded.id);

    // 4) Grant access to protected route
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(
        new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_TOKEN,
          401,
          { module: ErrorModule.AUTH, method: 'authMiddleware' }
        )
      );
    } else if (error instanceof jwt.TokenExpiredError) {
      next(
        new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.TOKEN_EXPIRED,
          401,
          { module: ErrorModule.AUTH, method: 'authMiddleware' }
        )
      );
    } else {
      next(error);
    }
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
          401,
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
          403,
          { module: ErrorModule.AUTH, method: 'restrictTo' }
        )
      );
    }

    next();
  };
};
