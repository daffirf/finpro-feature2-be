import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/errors'
import { getPaginationParams, getPaginationMeta, createPaginatedResponse } from '@/lib/pagination'

export interface PropertySearchParams {
  city?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  sortBy?: string
  minPrice?: string
  maxPrice?: string
  amenities?: string[]
  page?: number
  limit?: number
}

export class PropertyService {

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
      page = 1,
      limit = 10
    } = params

    const skip = (page - 1) * limit
    const where = this.buildWhereClause(city, guests, minPrice, maxPrice, amenities)
    const orderBy = this.getOrderByClause(sortBy)

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          rooms: {
            where: { capacity: { gte: guests }, isActive: true },
            select: { id: true, name: true, capacity: true, basePrice: true }
          },
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.property.count({ where })
    ])

    let availableProperties = properties
    
    if (checkIn && checkOut) {
      const roomIds = properties.flatMap(p => p.rooms.map(r => r.id))
      const bookedRoomIds = await this.getBookedRoomIds(roomIds, checkIn, checkOut)
      
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

  async getPropertyById(id: string) {
    const property = await prisma.property.findUnique({
      where: {
        id: id,
        isActive: true
      },
      include: {
        rooms: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            name: true,
            description: true,
            capacity: true,
            basePrice: true,
            images: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    })

    if (!property) {
      throw new ApiError(404, 'Properti tidak ditemukan')
    }

    return { property }
  }

  async getPropertyPrices(propertyId: string, roomId: string, month: string) {
    if (!roomId || !month) {
      throw new ApiError(400, 'Parameter roomId dan month diperlukan')
    }

    const startDate = new Date(month)
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

    // Get room base price
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { basePrice: true }
    })

    if (!room) {
      throw new ApiError(404, 'Kamar tidak ditemukan')
    }

    // Get price rules for the property
    const priceRules = await prisma.priceRule.findMany({
      where: {
        propertyId,
        isActive: true,
        OR: [
          {
            startDate: {
              lte: endDate
            },
            endDate: {
              gte: startDate
            }
          }
        ]
      }
    })

    // Generate price data for each day in the month
    const prices = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      let price = Number(room.basePrice)
      let isHoliday = false
      let isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

      // Check for price rules
      const applicableRule = priceRules.find(rule => {
        const ruleStart = new Date(rule.startDate)
        const ruleEnd = new Date(rule.endDate)
        return currentDate >= ruleStart && currentDate <= ruleEnd
      })

      if (applicableRule) {
        if (applicableRule.priceType === 'PERCENTAGE') {
          price = price * (1 + Number(applicableRule.value) / 100)
        } else {
          price = Number(applicableRule.value)
        }
        isHoliday = true
      }

      // Check if room is available for this date
      const isAvailable = await this.checkRoomAvailability(roomId, dateStr)

      prices.push({
        date: dateStr,
        price: Math.round(price),
        isAvailable,
        isHoliday,
        isWeekend
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return { prices }
  }

  private buildWhereClause(
    city: string, 
    guests: number, 
    minPrice: string | undefined, 
    maxPrice: string | undefined, 
    amenities: string[]
  ) {
    const where: any = {
      isActive: true,
      city: { contains: city, mode: 'insensitive' },
      rooms: {
        some: { capacity: { gte: guests }, isActive: true }
      }
    }

    if (minPrice || maxPrice) {
      where.basePrice = {}
      if (minPrice) where.basePrice.gte = parseFloat(minPrice)
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice)
    }

    if (amenities.length > 0) {
      where.amenities = { hasSome: amenities }
    }

    return where
  }

  private getOrderByClause(sortBy: string) {
    const orderByMap: Record<string, any> = {
      'price_asc': { basePrice: 'asc' },
      'price_desc': { basePrice: 'desc' },
      'name_asc': { name: 'asc' },
      'rating_desc': { reviews: { _count: 'desc' } }
    }
    return orderByMap[sortBy] || orderByMap['price_asc']
  }

  private async getBookedRoomIds(
    roomIds: string[], 
    checkIn: string, 
    checkOut: string
  ): Promise<Set<string>> {
    const startDate = new Date(checkIn)
    const endDate = new Date(checkOut)

    const bookedRooms = await prisma.booking.findMany({
      where: {
        roomId: { in: roomIds },
        status: { notIn: ['CANCELLED'] },
        OR: [{
          AND: [
            { checkIn: { lt: endDate } },
            { checkOut: { gt: startDate } }
          ]
        }]
      },
      select: { roomId: true }
    })

    return new Set(bookedRooms.map(b => b.roomId))
  }

  private async checkRoomAvailability(roomId: string, date: string): Promise<boolean> {
    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 1)

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        status: {
          not: 'CANCELLED'
        },
        OR: [
          {
            AND: [
              { checkIn: { lt: endDate } },
              { checkOut: { gt: startDate } }
            ]
          }
        ]
      }
    })

    return !conflictingBooking
  }
}
