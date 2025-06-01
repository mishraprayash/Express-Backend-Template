import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../errors/errorTypes';
import { HTTP_STATUS } from '../constants/httpStatus';

export interface ValidatedRequest extends Request {
  validatedData?: unknown;
}

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Attach validated data to request for use in controllers
      (req as ValidatedRequest).validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => e.message);
        next(
          new AppError(
            ErrorType.VALIDATION,
            ErrorModule.SYSTEM,
            ErrorMessages[ErrorModule.SYSTEM][ErrorType.VALIDATION]!.INVALID_INPUT,
            HTTP_STATUS.BAD_REQUEST,
            { module: ErrorModule.SYSTEM, method: 'validateRequest' },
            { details: messages }
          )
        );
      } else {
        next(error);
      }
    }
  };
};
