import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { ApiError } from "@/lib/errors";

export const validateRegister = [
    body("name").notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    body("email").notEmpty().withMessage("Email is Required").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(['user', 'tenant']).withMessage("Role must be 'user' or 'tenant'"),
    body("phone").optional().isString().withMessage("Phone must be a string"),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            throw new ApiError(400, errors.array()[0].msg)
        }
        next();
    },
];

export const validateLogin = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is Required").isString(),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            throw new ApiError(400, errors.array()[0].msg)
        }
        next();
    },
];

export const validateSendEmail = [
    body("email").notEmpty().withMessage("Email is Required").isEmail(),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            throw new ApiError(400, errors.array()[0].msg)
        }
        next()
    }
];

export const validateUpdateUser = [
    body("name").optional().isString().withMessage("Name must be a string"),
    body("email").optional().isEmail().withMessage("Invalid email"),
    body("password").optional().isString().withMessage("Password must be a string"),
    body("role").optional().isIn(['user', 'tenant']).withMessage("Role must be 'user' or 'tenant'"),
    body("phone").optional().isString().withMessage("Phone must be a string"),
    
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }
      next();
    },
  ];

export const validateChangePassword = [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
    
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }
      next();
    },
  ];

export const validateResetPassword = [
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            throw new ApiError(400, errors.array()[0].msg)
        }
        next();
    },
];