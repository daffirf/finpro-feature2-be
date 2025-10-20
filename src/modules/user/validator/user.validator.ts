import { z } from 'zod';

// Update User Schema
export const updateUserSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .optional(),
  email: z.string()
    .email("Invalid email format")
    .optional(),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().url("Invalid URL format").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().or(z.date()).optional(),
});

// Export types
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

