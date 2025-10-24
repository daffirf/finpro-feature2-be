import { NextFunction, Request, Response } from "express";
import { verifyToken as verifyJwt } from "@/utils/auth.utils";
import { ApiError } from "@/utils/api-error";

export class JwtMiddleware {
  verifyToken = (secretKey?: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
          throw new ApiError(401, "Unauthorized");
        }

        // Use centralized verifyToken
        const payload = verifyJwt(token);
        
        if (!payload) {
          throw new ApiError(401, "Token expired or invalid");
        }

        (req as any).user = payload;
        next();
      } catch (error) {
        next(error);
      }
    };
  };
}
