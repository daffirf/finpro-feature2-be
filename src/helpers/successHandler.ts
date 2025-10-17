import { Response } from "express";

export function successHandler(
    res: Response,
    data: unknown = null,
    message: string,
    statusCode: number = 200
) {
    return res.status(statusCode).json(({
        status: true,
        message,
        data
    }))
}