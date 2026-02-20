export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code?: string | undefined;
    constructor(statusCode: number, message: string, code?: string | undefined);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string, code?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map