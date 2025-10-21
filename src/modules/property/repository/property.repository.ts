import { prisma } from '@/utils/database'
import { BookingStatus, PropertyCategory } from '@/generated/prisma'
import { PropertyWhereClause, PropertyOrderBy } from '../types/property.types'

export class PropertyRepository {
  async findMany(
    where: PropertyWhereClause,
    orderBy: PropertyOrderBy,
    skip: number,
    take: number
  ) {
    return prisma.property.findMany({
      where,
      include: {
        rooms: {
          where: {
            deletedAt: null
          },
          select: {
            id: true,
            name: true,
            capacity: true,
            basePrice: true
          }
        },
        reviews: {
          select: { rating: true }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy,
      skip,
      take
    })
  }

  async count(where: PropertyWhereClause) {
    return prisma.property.count({ where })
  }

  async findById(id: number) {
    return prisma.property.findUnique({
      where: { id },
      include: {
        rooms: {
          where: { deletedAt: null },
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
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true }
        }
      }
    })
  }

  async findBySlug(slug: string) {
    return prisma.property.findUnique({
      where: { slug },
      include: {
        rooms: {
          where: { deletedAt: null }
        },
        images: true
      }
    })
  }

  async create(tenantId: number, data: any) {
    return prisma.property.create({
      data: {
        ...data,
        tenantId
      },
      include: {
        images: true,
        rooms: true
      }
    })
  }

  async createPropertyImage(propertyId: number, url: string, isPrimary: boolean = true) {
    return prisma.propertyImage.create({
      data: {
        propertyId,
        url,
        isPrimary,
        order: 0
      }
    })
  }

  async update(id: number, data: any) {
    return prisma.property.update({
      where: { id },
      data
    })
  }

  async softDelete(id: number) {
    return prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
  }

  async getBookedRoomIds(
    roomIds: number[],
    startDate: Date,
    endDate: Date
  ): Promise<Set<number>> {
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          notIn: [
            BookingStatus.cancelled,
            BookingStatus.expired,
            BookingStatus.rejected
          ]
        },
        OR: [
          {
            AND: [
              { checkIn: { lt: endDate } },
              { checkOut: { gt: startDate } }
            ]
          }
        ]
      },
      include: {
        items: {
          where: { roomId: { in: roomIds } },
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

  async checkRoomAvailability(roomId: number, startDate: Date, endDate: Date): Promise<boolean> {
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        items: {
          some: { roomId }
        },
        status: {
          notIn: [
            BookingStatus.cancelled,
            BookingStatus.expired,
            BookingStatus.rejected
          ]
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

  async findRoomById(roomId: number) {
    return prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        basePrice: true,
        capacity: true,
        name: true,
        property: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  async findByTenantId(tenantId: number) {
    return prisma.property.findMany({
      where: {
        tenantId,
        deletedAt: null
      },
      include: {
        rooms: {
          where: { deletedAt: null }
        },
        images: true,
        _count: {
          select: { reviews: true, rooms: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}
