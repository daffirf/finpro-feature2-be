import { NextFunction, Request, Response } from "express";
export declare class JwtMiddleware {
    verifyToken: (secretKey?: string) => (req: Request, res: Response, next: NextFunction) => void;
}
