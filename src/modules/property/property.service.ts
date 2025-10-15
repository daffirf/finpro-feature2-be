import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/errors'
import { getPaginationParams, getPaginationMeta, createPaginatedResponse } from '@/lib/pagination'
import { BookingStatus } from '@/generated/prisma'

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
            where: { 
              capacity: { gte: guests },
              deletedAt: null
            },
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

  async getPropertyById(id: number) {
    const property = await prisma.property.findUnique({
      where: {
        id: id
      },
      include: {
        rooms: {
          where: {
            deletedAt: null
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

  async getPropertyPrices(propertyId: number, roomId: number, month: string) {
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

    // Generate price data for each day in the month
    // Note: PriceRule tidak ada di schema, jadi kita gunakan base price
    const prices = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const price = Number(room.basePrice)
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

      // Check if room is available for this date
      const isAvailable = await this.checkRoomAvailability(roomId, dateStr)

      prices.push({
        date: dateStr,
        price: Math.round(price),
        isAvailable,
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

    // Note: basePrice ada di Room, bukan Property
    // Untuk filter harga, perlu query rooms
    if (minPrice || maxPrice) {
      const priceFilter: any = {}
      if (minPrice) priceFilter.gte = parseFloat(minPrice)
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice)
      
      where.rooms.some.basePrice = priceFilter
    }

    return where
  }

  private getOrderByClause(sortBy: string) {
    const orderByMap: Record<string, any> = {
      // Property tidak memiliki basePrice, ada di Room
      // Untuk sementara sort by name atau createdAt
      'price_asc': { createdAt: 'asc' },
      'price_desc': { createdAt: 'desc' },
      'name_asc': { name: 'asc' },
      'rating_desc': { createdAt: 'desc' }
    }
    return orderByMap[sortBy] || orderByMap['name_asc']
  }

  private async getBookedRoomIds(
    roomIds: number[], 
    checkIn: string, 
    checkOut: string
  ): Promise<Set<number>> {
    const startDate = new Date(checkIn)
    const endDate = new Date(checkOut)

    // Booking tidak memiliki roomId langsung, harus cek melalui items
    const bookings = await prisma.booking.findMany({
      where: {
        status: { notIn: [BookingStatus.cancelled, BookingStatus.expired, BookingStatus.rejected] },
        OR: [{
          AND: [
            { checkIn: { lt: endDate } },
            { checkOut: { gt: startDate } }
          ]
        }]
      },
      include: {
        items: {
          where: {
            roomId: { in: roomIds }
          },
          select: { roomId: true }
        }
      }
    })

    const bookedRoomIds = new Set<number>()
    bookings.forEach(booking => {
      booking.items.forEach(item => {
        bookedRoomIds.add(item.roomId)
      })
    })

    return bookedRoomIds
  }

  private async checkRoomAvailability(roomId: number, date: string): Promise<boolean> {
    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 1)

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        items: {
          some: {
            roomId
          }
        },
        status: {
          notIn: [BookingStatus.cancelled, BookingStatus.expired, BookingStatus.rejected]
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
