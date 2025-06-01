import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../errors/errorTypes';

export interface ValidatedRequest extends Request {
  validatedData?: Record<string, unknown>;
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
        const messages = error.errors.map(e => e.message);
        next(new AppError(
          ErrorType.VALIDATION,
          ErrorModule.VALIDATION,
          ErrorMessages[ErrorModule.VALIDATION][ErrorType.VALIDATION]!.INVALID_INPUT,
          400,
          { module: ErrorModule.VALIDATION, method: 'validateRequest' },
          { details: messages }
        ));
      } else {
        next(error);
      }
    }
  };
};
