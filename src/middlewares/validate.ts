import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

type SchemaKey = 'body' | 'query' | 'params' | 'headers';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

// Accept either { body?, query?, params?, headers? } or a ZodObject with .shape containing those keys
type ValidateInput = ValidationSchemas | { shape: Partial<Record<SchemaKey, ZodSchema>> };

function getSchemas(schemas: ValidateInput): ValidationSchemas {
  const s = schemas as { shape?: Partial<Record<SchemaKey, ZodSchema>> };
  if (s.shape && typeof s.shape === 'object') {
    return {
      body: s.shape.body,
      query: s.shape.query,
      params: s.shape.params,
      headers: s.shape.headers,
    };
  }
  return schemas as ValidationSchemas;
}

export function validate(schemas: ValidateInput) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const normalized = getSchemas(schemas);
    const keys: SchemaKey[] = ['body', 'query', 'params', 'headers'];
    try {
      for (const key of keys) {
        const schema = normalized[key as keyof ValidationSchemas];
        if (schema) {
          const value = req[key as keyof Request];
          const result = schema.safeParse(value);
          if (!result.success) {
            const err = result.error as ZodError;
            const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
            throw new BadRequestError(messages.join('; '));
          }
          switch (key) {
            case 'body': req.body = result.data; break;
            case 'query': req.query = result.data; break;
            case 'params': req.params = result.data; break;
            case 'headers': (req as any).headers = result.data; break;
          }
        }
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}
