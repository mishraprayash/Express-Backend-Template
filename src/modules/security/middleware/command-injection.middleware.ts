import { Request, Response, NextFunction } from 'express';
import { InputSanitizer } from '../utils/input-sanitizer';
import { ParsedQs } from 'qs';

export const commandInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Sanitize URL parameters
    if (req.params) {
      req.params = InputSanitizer.sanitizeObject(req.params);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = InputSanitizer.sanitizeQuery(req.query as ParsedQs) as ParsedQs;
    }

    // Sanitize request body
    if (req.body) {
      req.body = InputSanitizer.sanitizeObject(req.body);
    }

    // Sanitize headers
    if (req.headers) {
      const sanitizedHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') {
          sanitizedHeaders[key] = InputSanitizer.sanitizeString(value);
        }
      }
      req.headers = sanitizedHeaders;
    }

    next();
  } catch (error) {
    next(error);
  }
};
