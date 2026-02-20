import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
type SchemaKey = 'body' | 'query' | 'params' | 'headers';
interface ValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
    headers?: ZodSchema;
}
type ValidateInput = ValidationSchemas | {
    shape: Partial<Record<SchemaKey, ZodSchema>>;
};
export declare function validate(schemas: ValidateInput): (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.d.ts.map