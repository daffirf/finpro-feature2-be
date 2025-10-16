import { Response } from "express";

export function errorHandler(
    res: Response,
    message: string,
    statusCode: number = 500,
    data: unknown = null
) {
    return res.status(statusCode).json({
        status: false,
        message,
        data
      });
}