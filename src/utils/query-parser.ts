import { PropertyCategory } from '@/generated/prisma'

/**
 * Parse and validate pagination parameters
 */
export function parsePaginationParams(query: any): {
  page: number
  limit: number
} {
  const page = Math.max(1, parseInt(query.page || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10')))
  
  return { page, limit }
}

/**
 * Parse sort parameter
 */
export function parseSortParam(sortBy?: string): string {
  const validSorts = ['price_asc', 'price_desc', 'name_asc', 'rating_desc']
  return validSorts.includes(sortBy || '') ? sortBy! : 'price_asc'
}

/**
 * Parse price range parameters
 */
export function parsePriceRange(query: any): {
  minPrice?: number
  maxPrice?: number
} {
  const minPrice = query.minPrice ? parseFloat(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : undefined
  
  return { minPrice, maxPrice }
}

/**
 * Parse guests parameter
 */
export function parseGuests(guests?: string | number): number {
  if (typeof guests === 'number') return Math.max(1, guests)
  return Math.max(1, parseInt(guests || '1'))
}

/**
 * Parse amenities from comma-separated string
 */
export function parseAmenities(amenities?: string | string[]): string[] {
  if (!amenities) return []
  
  if (Array.isArray(amenities)) {
    return amenities.filter(Boolean)
  }
  
  return amenities.split(',').map(a => a.trim()).filter(Boolean)
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString?: string): Date | undefined {
  if (!dateString) return undefined
  
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? undefined : date
}

/**
 * Parse property category
 */
export function parsePropertyCategory(category?: string): PropertyCategory | undefined {
  const validCategories: PropertyCategory[] = ['villa', 'hotel', 'apartment', 'guest_house']
  
  if (!category) return undefined
  
  return validCategories.includes(category as PropertyCategory) 
    ? (category as PropertyCategory) 
    : undefined
}

/**
 * Parse boolean from string or boolean
 */
export function parseBoolean(value?: string | boolean): boolean {
  if (typeof value === 'boolean') return value
  if (!value) return false
  
  const normalized = value.toString().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

/**
 * Parse search filters for properties
 */
export function parsePropertySearchFilters(query: any) {
  return {
    city: query.city?.trim() || '',
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: parseGuests(query.guests),
    sortBy: parseSortParam(query.sortBy),
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    amenities: parseAmenities(query.amenities),
    category: parsePropertyCategory(query.category),
    ...parsePaginationParams(query)
  }
}

/**
 * Build order by clause from sort parameter
 */
export function buildOrderByClause(sortBy: string): any {
  const orderByMap: Record<string, any> = {
    'price_asc': { createdAt: 'asc' },
    'price_desc': { createdAt: 'desc' },
    'name_asc': { name: 'asc' },
    'name_desc': { name: 'desc' },
    'rating_desc': { createdAt: 'desc' },
    'newest': { createdAt: 'desc' },
    'oldest': { createdAt: 'asc' }
  }
  
  return orderByMap[sortBy] || orderByMap['name_asc']
}

/**
 * Validate date range
 */
export function validateDateRange(checkIn?: string, checkOut?: string): {
  isValid: boolean
  error?: string
} {
  if (!checkIn && !checkOut) {
    return { isValid: true }
  }
  
  if (checkIn && !checkOut) {
    return { isValid: false, error: 'Check-out date is required' }
  }
  
  if (!checkIn && checkOut) {
    return { isValid: false, error: 'Check-in date is required' }
  }
  
  const checkInDate = new Date(checkIn!)
  const checkOutDate = new Date(checkOut!)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (isNaN(checkInDate.getTime())) {
    return { isValid: false, error: 'Invalid check-in date' }
  }
  
  if (isNaN(checkOutDate.getTime())) {
    return { isValid: false, error: 'Invalid check-out date' }
  }
  
  if (checkInDate < today) {
    return { isValid: false, error: 'Check-in date cannot be in the past' }
  }
  
  if (checkOutDate <= checkInDate) {
    return { isValid: false, error: 'Check-out date must be after check-in date' }
  }
  
  return { isValid: true }
}
