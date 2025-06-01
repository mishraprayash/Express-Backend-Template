import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../../shared/errors/errorTypes';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';

interface QueryObject {
  [key: string]: string | string[] | undefined | QueryObject;
}

export const prototypePollutionProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const checkForPrototypePollution = (value: string): boolean => {
      const prototypePatterns = [/__proto__/i, /constructor/i, /prototype/i];

      return prototypePatterns.some((pattern) => pattern.test(value));
    };

    const sanitizeObject = (obj: QueryObject): void => {
      Object.entries(obj).forEach(([key, value]) => {
        if (checkForPrototypePollution(key)) {
          throw new AppError(
            ErrorType.INJECTION,
            ErrorModule.SECURITY,
            ErrorMessages[ErrorModule.SECURITY][ErrorType.INJECTION]!.PROTOTYPE_POLLUTION,
            HTTP_STATUS.BAD_REQUEST,
            { module: ErrorModule.SECURITY, method: 'prototypePollutionProtection' }
          );
        }

        if (typeof value === 'string' && checkForPrototypePollution(value)) {
          throw new AppError(
            ErrorType.INJECTION,
            ErrorModule.SECURITY,
            ErrorMessages[ErrorModule.SECURITY][ErrorType.INJECTION]!.PROTOTYPE_POLLUTION,
            HTTP_STATUS.BAD_REQUEST,
            { module: ErrorModule.SECURITY, method: 'prototypePollutionProtection' }
          );
        } else if (typeof value === 'object' && value !== null) {
          sanitizeObject(value as QueryObject);
        }
      });
    };

    // Check query parameters
    if (req.query) {
      sanitizeObject(req.query as QueryObject);
    }

    // Check request body
    if (req.body) {
      sanitizeObject(req.body as QueryObject);
    }

    // Check URL parameters
    if (req.params) {
      sanitizeObject(req.params as QueryObject);
    }

    next();
  } catch (error) {
    next(error);
  }
};
