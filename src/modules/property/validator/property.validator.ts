import { z } from 'zod'
import { PropertyCategory } from '@/generated/prisma'

// Property Category Enum
export const propertyCategoryEnum = z.enum(['villa', 'hotel', 'apartment', 'guest_house'])

// Create Property Schema
export const createPropertySchema = z.object({
  name: z.string()
    .min(3, 'Property name must be at least 3 characters')
    .max(100, 'Property name must be at most 100 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be at most 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  address: z.string()
    .max(200, 'Address must be at most 200 characters')
    .optional(),
  city: z.string()
    .max(100, 'City must be at most 100 characters')
    .optional(),
  province: z.string()
    .max(100, 'Province must be at most 100 characters')
    .optional(),
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
  category: propertyCategoryEnum,
  published: z.boolean().optional().default(false)
})

// Update Property Schema
export const updatePropertySchema = z.object({
  name: z.string()
    .min(3, 'Property name must be at least 3 characters')
    .max(100, 'Property name must be at most 100 characters')
    .optional(),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must be at most 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  address: z.string()
    .max(200, 'Address must be at most 200 characters')
    .optional(),
  city: z.string()
    .max(100, 'City must be at most 100 characters')
    .optional(),
  province: z.string()
    .max(100, 'Province must be at most 100 characters')
    .optional(),
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
  category: propertyCategoryEnum.optional(),
  published: z.boolean().optional()
})

// Search Property Schema
export const searchPropertySchema = z.object({
  city: z.string().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in must be in YYYY-MM-DD format').optional(),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out must be in YYYY-MM-DD format').optional(),
  guests: z.string().or(z.number()).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'rating_desc', 'newest', 'oldest']).optional(),
  minPrice: z.string().or(z.number()).optional(),
  maxPrice: z.string().or(z.number()).optional(),
  amenities: z.string().or(z.array(z.string())).optional(),
  category: propertyCategoryEnum.optional(),
  page: z.string().or(z.number()).optional(),
  limit: z.string().or(z.number()).optional()
})

// Property Price Query Schema
export const propertyPriceQuerySchema = z.object({
  roomId: z.string().or(z.number()),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
})

// Property ID Param Schema
export const propertyIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Property ID must be a number')
})

// Create Property Image Schema
export const createPropertyImageSchema = z.object({
  propertyId: z.number().int().positive('Property ID must be a positive integer'),
  url: z.string().url('Invalid image URL'),
  altText: z.string().max(200, 'Alt text must be at most 200 characters').optional(),
  isPrimary: z.boolean().optional().default(false),
  order: z.number().int().min(0, 'Order must be at least 0').optional().default(0)
})

// Export types
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
export type SearchPropertyInput = z.infer<typeof searchPropertySchema>
export type PropertyPriceQueryInput = z.infer<typeof propertyPriceQuerySchema>
export type PropertyIdParamInput = z.infer<typeof propertyIdParamSchema>
export type CreatePropertyImageInput = z.infer<typeof createPropertyImageSchema>

