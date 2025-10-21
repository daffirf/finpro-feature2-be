"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.changePasswordSchema = exports.updateUserSchema = exports.loginSchema = exports.setPasswordSchema = exports.verifyEmailTokenSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Register Schema (tanpa password - email verification flow)
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters"),
    email: zod_1.z.string()
        .email("Invalid email format"),
    role: zod_1.z.enum(['user', 'tenant'])
        .optional()
        .default('user'),
});
// Verify Email Token Schema (query parameter)
exports.verifyEmailTokenSchema = zod_1.z.object({
    token: zod_1.z.string()
        .min(1, "Token is required")
        .length(64, "Invalid token format"),
});
// Set Password Schema
exports.setPasswordSchema = zod_1.z.object({
    token: zod_1.z.string()
        .min(1, "Token is required")
        .length(64, "Invalid token format"),
    password: zod_1.z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be at most 100 characters"),
});
// Login Schema
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Valid email is required"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// Update User Schema
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50).optional(),
    password: zod_1.z.string().min(6).optional(),
    role: zod_1.z.enum(['user', 'tenant']).optional(),
    phoneNumber: zod_1.z.string().optional(),
});
// Change Password Schema
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, "Old password is required"),
    newPassword: zod_1.z.string().min(6, "New password must be at least 6 characters"),
});
// Reset Password Schema
exports.resetPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
