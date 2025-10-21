import { PropertyCategory } from '@/generated/prisma'

export interface CreatePropertyDto {
  name: string
  slug: string
  description?: string
  address?: string
  city?: string
  province?: string
  latitude?: number
  longitude?: number
  category: PropertyCategory
  published?: boolean
}

export interface UpdatePropertyDto {
  name?: string
  slug?: string
  description?: string
  address?: string
  city?: string
  province?: string
  latitude?: number
  longitude?: number
  category?: PropertyCategory
  published?: boolean
}

export interface PropertySearchDto {
  city?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'rating_desc'
  minPrice?: string
  maxPrice?: string
  amenities?: string[]
  category?: PropertyCategory
  page?: number
  limit?: number
}

export interface PropertyPriceQueryDto {
  roomId: number
  month: string // Format: YYYY-MM
}

export interface CreatePropertyImageDto {
  propertyId: number
  url: string
  altText?: string
  isPrimary?: boolean
  order?: number
}

export interface PropertyResponseDto {
  id: number
  tenantId: number
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  province: string | null
  latitude: number | null
  longitude: number | null
  category: PropertyCategory
  published: boolean
  createdAt: Date
  updatedAt: Date
}

