import { Prisma } from '../generated/prisma'

export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message); 
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';

    // This is important for restoring the prototype chain
    // It ensures 'instanceof ApiError' works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message)
    this.name = 'UnauthorizedError'
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message)
    this.name = 'ForbiddenError'
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Handle Prisma errors and convert to ApiError
 */
export function handlePrismaError(error: any): ApiError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new ValidationError('Data sudah exists', {
          field: error.meta?.target
        })
      case 'P2025':
        return new NotFoundError('Data tidak ditemukan')
      case 'P2003':
        return new ValidationError('Relasi data tidak valid')
      default:
        return new ApiError(500, 'Database error')
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Data tidak valid')
  }

  return new ApiError(500, 'Internal server error')
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: any): ValidationError {
  const details = error.errors?.map((e: any) => ({
    field: e.path.join('.'),
    message: e.message
  }))

  return new ValidationError('Data tidak valid', details)
}
