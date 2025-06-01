import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../../shared/errors/errorTypes';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';

interface QueryObject {
  [key: string]: string | string[] | undefined;
}

export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const checkForSqlInjection = (value: string): boolean => {
      const sqlPatterns = [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
        /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
        /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
        /((\%27)|(\'))union/i,
        /exec(\s|\+)+(s|x)p\w+/i,
        /insert\s+into/i,
        /select\s+from/i,
        /delete\s+from/i,
        /update\s+set/i,
        /drop\s+table/i,
        /truncate\s+table/i,
        /alter\s+table/i,
        /create\s+table/i,
        /create\s+database/i,
        /drop\s+database/i,
      ];

      return sqlPatterns.some((pattern) => pattern.test(value));
    };

    const sanitizeObject = (obj: QueryObject): void => {
      Object.entries(obj).forEach(([_, value]) => {
        if (typeof value === 'string' && checkForSqlInjection(value)) {
          throw new AppError(
            ErrorType.INJECTION,
            ErrorModule.SECURITY,
            ErrorMessages[ErrorModule.SECURITY][ErrorType.INJECTION]!.SQL_INJECTION,
            HTTP_STATUS.BAD_REQUEST,
            { module: ErrorModule.SECURITY, method: 'sqlInjectionProtection' }
          );
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
