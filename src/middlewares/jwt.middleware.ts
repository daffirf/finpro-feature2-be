import { NextFunction, Request, Response } from "express";
import { verifyToken as verifyJwt } from "@/lib/auth";
import { ApiError } from "@/lib/errors";

export class JwtMiddleware {
  verifyToken = (secretKey?: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) throw new ApiError(401, "Unauthorized");

      // Use centralized verifyToken function from auth.ts
      const payload = verifyJwt(token);
      
      if (!payload) {
        throw new ApiError(401, "Token expired or invalid");
      }

      (req as any).user = payload;
      next();
    };
  };
}
