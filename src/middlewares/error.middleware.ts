import { NextFunction, Request, Response } from "express";
import { ApiError, ValidationError } from "../utils/api-error";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error caught by middleware:', err);
  
  // Check if it's our custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ 
      message: err.message,
      ...(err.details && { details: err.details })
    });
  }
  
  // Handle standard errors
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Something went wrong!";
  
  res.status(status).json({ message });
};
