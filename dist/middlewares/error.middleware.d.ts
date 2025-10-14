import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error";
export declare const errorMiddleware: (err: ApiError, req: Request, res: Response, next: NextFunction) => void;
