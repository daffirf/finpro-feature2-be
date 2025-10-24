import { z } from 'zod'

// Create Room Schema
export const createRoomSchema = z.object({
  propertyId: z.number()
    .int('Property ID must be an integer')
    .positive('Property ID must be positive'),
  name: z.string()
    .min(3, 'Room name must be at least 3 characters')
    .max(100, 'Room name must be at most 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  basePrice: z.number()
    .positive('Base price must be positive')
    .int('Base price must be an integer'),
  capacity: z.number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(20, 'Capacity must be at most 20'),
  totalUnits: z.number()
    .int('Total units must be an integer')
    .min(1, 'Total units must be at least 1')
    .max(100, 'Total units must be at most 100'),
  facilities: z.array(z.string()).optional()
})

// Update Room Schema
export const updateRoomSchema = z.object({
  name: z.string()
    .min(3, 'Room name must be at least 3 characters')
    .max(100, 'Room name must be at most 100 characters')
    .optional(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters')
    .optional(),
  basePrice: z.number()
    .positive('Base price must be positive')
    .int('Base price must be an integer')
    .optional(),
  capacity: z.number()
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(20, 'Capacity must be at most 20')
    .optional(),
  totalUnits: z.number()
    .int('Total units must be an integer')
    .min(1, 'Total units must be at least 1')
    .max(100, 'Total units must be at most 100')
    .optional(),
  facilities: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']).optional()
})

// Room ID Param Schema
export const roomIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Room ID must be a number')
})

// Property ID Query Schema (untuk get rooms by property)
export const propertyIdQuerySchema = z.object({
  propertyId: z.string().regex(/^\d+$/, 'Property ID must be a number').optional()
})

// Create Room Image Schema
export const createRoomImageSchema = z.object({
  roomId: z.number().int().positive('Room ID must be a positive integer'),
  url: z.string().url('Invalid image URL'),
  altText: z.string().max(200, 'Alt text must be at most 200 characters').optional(),
  order: z.number().int().min(0, 'Order must be at least 0').optional().default(0)
})

// Export types
export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>
export type RoomIdParamInput = z.infer<typeof roomIdParamSchema>
export type PropertyIdQueryInput = z.infer<typeof propertyIdQuerySchema>
export type CreateRoomImageInput = z.infer<typeof createRoomImageSchema>

