import { Prisma } from '../generated/prisma'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(403, message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message)
    this.name = 'NotFoundError'
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
