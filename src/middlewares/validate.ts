import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '@utils/error';

type RequestSource = 'body' | 'query' | 'params';
type ZodSchema = z.ZodTypeAny;

export const validate = (schema: ZodSchema, source: RequestSource = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join(', ');
      return next(new BadRequestError(message));
    }

    if (source === 'body') req.body = result.data;
    else if (source === 'query')
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
      });
    else if (source === 'params')
      req.params = result.data as Record<string, string>;

    next();
  };
};
