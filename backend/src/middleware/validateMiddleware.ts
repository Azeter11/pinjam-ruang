import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response';

/**
 * Factory function: validate(schema) — validate req.body against a Zod schema.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const fieldErrors = zodError.flatten().fieldErrors;

      errorResponse(res, 'Validasi gagal', 400, {
        code: 'VALIDATION_ERROR',
        details: fieldErrors,
      });
      return;
    }

    // Replace body with parsed (and potentially coerced) data
    req.body = result.data;
    next();
  };
}
