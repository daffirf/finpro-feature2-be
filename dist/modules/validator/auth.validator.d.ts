import { NextFunction, Request, Response } from "express";
export declare const validateRegister: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
export declare const validateLogin: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
export declare const validateSendEmail: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
export declare const validateUpdateUser: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
export declare const validateChangePassword: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
export declare const validateResetPassword: (import("express-validator").ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
