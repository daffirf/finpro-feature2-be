import { z } from 'zod';

export const googleLoginSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
  role: z.enum(['user', 'tenant']).optional(),
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;

