"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.ApiError = void 0;
exports.handlePrismaError = handlePrismaError;
exports.handleZodError = handleZodError;
const prisma_1 = require("../generated/prisma");
class ApiError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
class ValidationError extends ApiError {
    constructor(message, details) {
        super(400, message, details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(401, message);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(403, message);
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(404, message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Handle Prisma errors and convert to ApiError
 */
function handlePrismaError(error) {
    if (error instanceof prisma_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return new ValidationError('Data sudah exists', {
                    field: error.meta?.target
                });
            case 'P2025':
                return new NotFoundError('Data tidak ditemukan');
            case 'P2003':
                return new ValidationError('Relasi data tidak valid');
            default:
                return new ApiError(500, 'Database error');
        }
    }
    if (error instanceof prisma_1.Prisma.PrismaClientValidationError) {
        return new ValidationError('Data tidak valid');
    }
    return new ApiError(500, 'Internal server error');
}
/**
 * Handle Zod validation errors
 */
function handleZodError(error) {
    const details = error.errors?.map((e) => ({
        field: e.path.join('.'),
        message: e.message
    }));
    return new ValidationError('Data tidak valid', details);
}
