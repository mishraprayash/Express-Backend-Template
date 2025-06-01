import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../../shared/errors/errorTypes';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import dns from 'dns';
import { promisify } from 'util';

interface QueryObject {
  [key: string]: string | string[] | undefined | QueryObject;
}

const resolveDNS = promisify(dns.resolve);

export const ssrfProtection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const checkForSSRF = async (value: string): Promise<boolean> => {
      // Try to parse as URL and extract hostname
      let toCheck = value;
      try {
        const url = new URL(value);
        toCheck = url.hostname;
      } catch {
        // Not a valid URL, use the value as is
      }
      // Check for private IP addresses
      const privateIPPatterns = [
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^169\.254\./,
        /^fc00::/,
        /^fe80::/,
        /^::1/,
        /^0\.0\.0\.0/,
        /^localhost$/i,
      ];

      if (privateIPPatterns.some((pattern) => pattern.test(toCheck))) {
        return true;
      }

      try {
        // Resolve hostname to IP
        const addresses = await resolveDNS(toCheck);
        return addresses.some((ip: string) =>
          privateIPPatterns.some((pattern) => pattern.test(ip))
        );
      } catch (error) {
        // If DNS resolution fails, assume it's not a valid hostname
        return false;
      }
    };

    const sanitizeObject = async (obj: QueryObject): Promise<void> => {
      for (const [, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          const isSSRF = await checkForSSRF(value);
          if (isSSRF) {
            throw new AppError(
              ErrorType.INJECTION,
              ErrorModule.SECURITY,
              ErrorMessages[ErrorModule.SECURITY][ErrorType.INJECTION]!.SSRF_DETECTED || 'SSRF attempt detected',
              HTTP_STATUS.BAD_REQUEST,
              { module: ErrorModule.SECURITY, method: 'ssrfProtection' }
            );
          }
        } else if (typeof value === 'object' && value !== null) {
          await sanitizeObject(value as QueryObject);
        }
      }
    };

    // Check query parameters
    if (req.query) {
      await sanitizeObject(req.query as QueryObject);
    }

    // Check request body
    if (req.body) {
      await sanitizeObject(req.body as QueryObject);
    }

    // Check URL parameters
    if (req.params) {
      await sanitizeObject(req.params as QueryObject);
    }

    next();
  } catch (error) {
    next(error);
  }
};
