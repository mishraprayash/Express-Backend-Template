import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../../shared/errors/errorTypes';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';

interface QueryObject {
  [key: string]: string | string[] | undefined | QueryObject;
}

// Common NoSQL injection patterns
const NOSQL_INJECTION_PATTERNS = [
  /\$ne/i, // Not equal
  /\$gt/i, // Greater than
  /\$lt/i, // Less than
  /\$regex/i, // Regular expression
  /\$where/i, // Where clause
  /\$exists/i, // Exists
  /\$in/i, // In array
  /\$nin/i, // Not in array
  /\$or/i, // Or condition
  /\$and/i, // And condition
  /\$not/i, // Not condition
  /\$nor/i, // Nor condition
  /\$expr/i, // Expression
  /\$text/i, // Text search
  /\$search/i, // Search
  /\$language/i, // Language
  /\$caseSensitive/i, // Case sensitive
  /\$diacriticSensitive/i, // Diacritic sensitive
];

export const nosqlInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const checkForNoSQLInjection = (value: string): boolean => {
      return NOSQL_INJECTION_PATTERNS.some((pattern) => pattern.test(value));
    };

    const sanitizeObject = (obj: QueryObject): void => {
      for (const [key, value] of Object.entries(obj)) {
        // Check for MongoDB operators in keys
        if (checkForNoSQLInjection(key)) {
          throw new AppError(
            ErrorType.INJECTION,
            ErrorModule.SECURITY,
            ErrorMessages[ErrorModule.SECURITY][ErrorType.INJECTION]!.NOSQL,
            HTTP_STATUS.BAD_REQUEST,
            { module: ErrorModule.SECURITY, method: 'nosqlInjectionProtection' }
          );
        }

        // Check for MongoDB operators in string values
        if (typeof value === 'string' && checkForNoSQLInjection(value)) {
          throw new AppError(
            ErrorType.INJECTION,
            ErrorModule.SECURITY,
            ErrorMessages[ErrorModule.SECURITY][ErrorType.INJECTION]!.NOSQL,
            HTTP_STATUS.BAD_REQUEST,
            { module: ErrorModule.SECURITY, method: 'nosqlInjectionProtection' }
          );
        } else if (typeof value === 'object' && value !== null) {
          sanitizeObject(value as QueryObject);
        }
      }
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
