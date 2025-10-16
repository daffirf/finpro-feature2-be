import { z } from 'zod';

// Register Schema
export const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 16 characters"),
  email: z.string()
    .email("Invalid email format"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(['user', 'tenant'])
    .optional()
    .default('user'),
  phoneNumber: z.string().optional(),
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

// Update User Schema
export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['user', 'tenant']).optional(),
  phoneNumber: z.string().optional(),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Export types yang di-infer dari schema (bonus: auto type-safety!)
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;