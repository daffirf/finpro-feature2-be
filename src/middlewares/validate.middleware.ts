import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '@/lib/errors';

export const validateAuth = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Ambil error pertama untuk consistency dengan validator lama
        const firstError = error.errors[0];
        const message = firstError.message;
        next(new ApiError(400, message));
      } else {
        next(error);
      }
    }
  };
};