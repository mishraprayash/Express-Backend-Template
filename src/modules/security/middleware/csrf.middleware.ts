import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule } from '../../../shared/errors/errorTypes';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import crypto from 'crypto';

// Store for CSRF tokens (in production, use Redis or similar)
const tokenStore = new Map<string, { token: string; expires: number }>();

// Cleanup interval reference
let cleanupInterval: NodeJS.Timeout | null = null;

export const csrfProtection = {
  // Generate CSRF token
  generateToken: (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = Date.now() + 3600000; // 1 hour

      // Store token with session ID
      if (req.session?.id) {
        tokenStore.set(req.session.id, { token, expires });
      }

      // Set token in response header
      res.setHeader('X-CSRF-Token', token);
      next();
    } catch (error) {
      next(error);
    }
  },

  // Verify CSRF token
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip CSRF check for GET, HEAD, OPTIONS requests
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      const sessionId = req.session?.id;
      if (!sessionId) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          'No session found',
          HTTP_STATUS.UNAUTHORIZED
        );
      }

      const storedToken = tokenStore.get(sessionId);
      if (!storedToken) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          'No CSRF token found',
          HTTP_STATUS.FORBIDDEN
        );
      }

      // Check if token has expired
      if (Date.now() > storedToken.expires) {
        tokenStore.delete(sessionId);
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          'CSRF token expired',
          HTTP_STATUS.FORBIDDEN
        );
      }

      // Get token from request
      const token = req.headers['x-csrf-token'] || req.body._csrf;
      if (!token || token !== storedToken.token) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          'Invalid CSRF token',
          HTTP_STATUS.FORBIDDEN
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  // Clean up expired tokens
  cleanup: () => {
    const now = Date.now();
    for (const [sessionId, data] of tokenStore.entries()) {
      if (now > data.expires) {
        tokenStore.delete(sessionId);
      }
    }
  },

  // Start cleanup interval
  startCleanup: () => {
    if (!cleanupInterval) {
      cleanupInterval = setInterval(csrfProtection.cleanup, 3600000);
    }
  },

  // Stop cleanup interval
  stopCleanup: () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  },
};

// Start cleanup on module load
csrfProtection.startCleanup();
