import { Property, Room, Review, PropertyImage, PropertyCategory } from '@/generated/prisma'

export interface PropertySearchParams {
  city?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  sortBy?: string
  minPrice?: string
  maxPrice?: string
  amenities?: string[]
  category?: PropertyCategory
  page?: number
  limit?: number
}

export interface PropertyWithRooms extends Property {
  rooms: Pick<Room, 'id' | 'name' | 'capacity' | 'basePrice'>[]
  reviews: Pick<Review, 'rating'>[]
  _count: {
    reviews: number
  }
}

export interface PropertyDetailWithRelations extends Property {
  rooms: (Pick<Room, 'id' | 'name' | 'description' | 'capacity' | 'basePrice'> & {
    images: any[]
  })[]
  reviews: (Review & {
    user: {
      name: string | null
    }
  })[]
  _count: {
    reviews: number
  }
}

export interface PropertyPriceData {
  date: string
  price: number
  isAvailable: boolean
  isWeekend: boolean
}

export interface PropertyWhereClause {
  published?: boolean
  deletedAt?: null
  city?: {
    contains: string
    mode: 'insensitive'
  }
  category?: PropertyCategory
  rooms?: {
    some: {
      capacity?: { gte: number }
      deletedAt?: null
      basePrice?: {
        gte?: number
        lte?: number
      }
    }
  }
}

export type PropertyOrderBy = 
  | { createdAt: 'asc' | 'desc' }
  | { name: 'asc' | 'desc' }
  | { updatedAt: 'asc' | 'desc' }
