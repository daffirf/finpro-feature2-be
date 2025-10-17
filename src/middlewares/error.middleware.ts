import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";

export const errorMiddleware = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  const details = err.details;
  
  res.status(status).send({ 
    message,
    ...(details && { details })
  });
};
