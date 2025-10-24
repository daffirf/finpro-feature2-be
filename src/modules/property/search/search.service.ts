import { getPaginationMeta, createPaginatedResponse } from '@/utils/pagination.utils'
import { buildOrderByClause } from '@/utils/query-parser'
import { PropertyRepository } from '../repository/property.repository'
import { PropertySearchParams, PropertyWhereClause } from '../types/property.types'

export class SearchService {
  private propertyRepository: PropertyRepository

  constructor() {
    this.propertyRepository = new PropertyRepository()
  }

  async searchProperties(params: PropertySearchParams) {
    const {
      city = '',
      checkIn = '',
      checkOut = '',
      guests = 1,
      sortBy = 'price_asc',
      minPrice,
      maxPrice,
      amenities = [],
      category,
      page = 1,
      limit = 10
    } = params

    const skip = (page - 1) * limit
    const where = this.buildWhereClause(city, guests, minPrice, maxPrice, amenities, category)
    const orderBy = buildOrderByClause(sortBy)

    const [properties, total] = await Promise.all([
      this.propertyRepository.findMany(where, orderBy, skip, limit),
      this.propertyRepository.count(where)
    ])

    let availableProperties = properties
    
    if (checkIn && checkOut) {
      const startDate = new Date(checkIn)
      const endDate = new Date(checkOut)
      const roomIds = properties.flatMap(p => p.rooms.map(r => r.id))
      const bookedRoomIds = await this.propertyRepository.getBookedRoomIds(
        roomIds,
        startDate,
        endDate
      )
      
      availableProperties = properties
        .map(property => ({
          ...property,
          rooms: property.rooms.filter(room => !bookedRoomIds.has(room.id))
        }))
        .filter(property => property.rooms.length > 0)
    }

    const meta = getPaginationMeta(page, limit, total)

    return createPaginatedResponse(availableProperties, meta)
  }

  private buildWhereClause(
    city: string, 
    guests: number, 
    minPrice: string | undefined, 
    maxPrice: string | undefined, 
    amenities: string[],
    category?: string
  ): PropertyWhereClause {
    const where: PropertyWhereClause = {
      published: true,
      deletedAt: null,
      city: { contains: city, mode: 'insensitive' },
      rooms: {
        some: { 
          capacity: { gte: guests },
          deletedAt: null
        }
      }
    }

    if (category && (category === 'villa' || category === 'hotel' || category === 'apartment' || category === 'guest_house')) {
      where.category = category
    }

    if (minPrice || maxPrice) {
      const priceFilter: any = {}
      if (minPrice) priceFilter.gte = parseFloat(minPrice)
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice)
      
      if (where.rooms?.some) {
        where.rooms.some.basePrice = priceFilter
      }
    }

    return where
  }
}

