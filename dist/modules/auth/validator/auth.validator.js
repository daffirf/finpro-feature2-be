"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.changePasswordSchema = exports.updateUserSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Register Schema
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 16 characters"),
    email: zod_1.z.string()
        .email("Invalid email format"),
    password: zod_1.z.string()
        .min(6, "Password must be at least 6 characters"),
    role: zod_1.z.enum(['user', 'tenant'])
        .optional()
        .default('user'),
    phoneNumber: zod_1.z.string().optional(),
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
