"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = exports.validateChangePassword = exports.validateUpdateUser = exports.validateSendEmail = exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
const errors_1 = require("@/lib/errors");
exports.validateRegister = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("email").notEmpty().withMessage("Email is Required").isEmail().withMessage("Invalid email"),
    (0, express_validator_1.body)("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    (0, express_validator_1.body)("role").optional().isIn(['USER', 'TENANT', 'ADMIN']).withMessage("Role must be USER, TENANT, or ADMIN"),
    (0, express_validator_1.body)("phone").optional().isString().withMessage("Phone must be a string"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errors_1.ApiError(400, errors.array()[0].msg);
        }
        next();
    },
];
exports.validateLogin = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Valid email is required"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is Required").isString(),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errors_1.ApiError(400, errors.array()[0].msg);
        }
        next();
    },
];
exports.validateSendEmail = [
    (0, express_validator_1.body)("email").notEmpty().withMessage("Email is Required").isEmail(),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errors_1.ApiError(400, errors.array()[0].msg);
        }
        next();
    }
];
exports.validateUpdateUser = [
    (0, express_validator_1.body)("name").optional().isString().withMessage("Name must be a string"),
    (0, express_validator_1.body)("email").optional().isEmail().withMessage("Invalid email"),
    (0, express_validator_1.body)("password").optional().isString().withMessage("Password must be a string"),
    (0, express_validator_1.body)("role").optional().isIn(['USER', 'TENANT', 'ADMIN']).withMessage("Role must be USER, TENANT, or ADMIN"),
    (0, express_validator_1.body)("phone").optional().isString().withMessage("Phone must be a string"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errors_1.ApiError(400, errors.array()[0].msg);
        }
        next();
    },
];
exports.validateChangePassword = [
    (0, express_validator_1.body)("oldPassword").notEmpty().withMessage("Old password is required"),
    (0, express_validator_1.body)("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errors_1.ApiError(400, errors.array()[0].msg);
        }
        next();
    },
];
exports.validateResetPassword = [
    (0, express_validator_1.body)("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errors_1.ApiError(400, errors.array()[0].msg);
        }
        next();
    },
];
