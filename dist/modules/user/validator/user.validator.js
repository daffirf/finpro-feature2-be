"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = void 0;
const zod_1 = require("zod");
// Update User Schema
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be at most 50 characters")
        .optional(),
    email: zod_1.z.string()
        .email("Invalid email format")
        .optional(),
    phoneNumber: zod_1.z.string().optional(),
    avatarUrl: zod_1.z.string().url("Invalid URL format").optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().or(zod_1.z.date()).optional(),
});
