export declare class ApiError extends Error {
    statusCode: number;
    details?: any | undefined;
    constructor(statusCode: number, message: string, details?: any | undefined);
}
export declare class ValidationError extends ApiError {
    constructor(message: string, details?: any);
}
export declare class UnauthorizedError extends ApiError {
    constructor(message?: string);
}
export declare class ForbiddenError extends ApiError {
    constructor(message?: string);
}
export declare class NotFoundError extends ApiError {
    constructor(message?: string);
}
/**
 * Handle Prisma errors and convert to ApiError
 */
export declare function handlePrismaError(error: any): ApiError;
/**
 * Handle Zod validation errors
 */
export declare function handleZodError(error: any): ValidationError;
