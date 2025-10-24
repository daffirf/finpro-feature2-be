import { prisma } from '@/utils/database'
import { BookingStatus } from '@/generated/prisma'

export class RoomRepository {
  // Find all rooms by property ID
  async findByPropertyId(propertyId: number) {
    return prisma.room.findMany({
      where: {
        propertyId,
        deletedAt: null
      },
      select: {
        id: true,
        propertyId: true,
        name: true,
        description: true,
        basePrice: true,
        capacity: true,
        totalUnits: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        images: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            url: true,
            order: true
          }
        },
        property: {
          select: {
            id: true,
            name: true,
            city: true,
            province: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Find all rooms by tenant ID
  async findByTenantId(tenantId: number) {
    return prisma.room.findMany({
      where: {
        property: {
          tenantId,
          deletedAt: null
        },
        deletedAt: null
      },
      select: {
        id: true,
        propertyId: true,
        name: true,
        description: true,
        basePrice: true,
        capacity: true,
        totalUnits: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        images: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            url: true,
            order: true
          }
        },
        property: {
          select: {
            id: true,
            name: true,
            city: true,
            province: true,
            tenantId: true
          }
        }
      },
      orderBy: [
        { property: { name: 'asc' } },
        { name: 'asc' }
      ]
    })
  }

  // Find room by ID
  async findById(id: number) {
    return prisma.room.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        property: {
          select: {
            id: true,
            name: true,
            city: true,
            province: true,
            tenantId: true
          }
        }
      }
    })
  }

  // Create room
  async create(data: any) {
    return prisma.room.create({
      data,
      include: {
        images: true,
        property: {
          select: {
            id: true,
            name: true,
            tenantId: true
          }
        }
      }
    })
  }

  // Update room
  async update(id: number, data: any) {
    return prisma.room.update({
      where: { id },
      data,
      include: {
        images: true,
        property: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  // Soft delete room
  async softDelete(id: number) {
    return prisma.room.update({
      where: { id },
      data: { 
        deletedAt: new Date()
      }
    })
  }

  // Create room image
  async createRoomImage(roomId: number, url: string, publicId: string, order: number = 0) {
    return prisma.roomImage.create({
      data: {
        roomId,
        url,
        publicId,
        order
      }
    })
  }

  // Get available units for a room
  async getAvailableUnits(roomId: number, startDate: Date, endDate: Date): Promise<number> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { totalUnits: true }
    })

    if (!room) return 0

    // Count booked units in the date range
    const bookedUnits = await prisma.bookingItem.count({
      where: {
        roomId,
        booking: {
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
      }
    })

    return room.totalUnits - bookedUnits
  }

  // Check if tenant owns the room
  async isOwnedByTenant(roomId: number, tenantId: number): Promise<boolean> {
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        property: {
          tenantId
        },
        deletedAt: null
      }
    })

    return !!room
  }

  // Find rooms with property filters
  async findManyWithFilters(filters: {
    tenantId?: number
    propertyId?: number
    status?: 'active' | 'inactive'
  }) {
    return prisma.room.findMany({
      where: {
        ...( filters.propertyId && { propertyId: filters.propertyId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.tenantId && {
          property: {
            tenantId: filters.tenantId
          }
        }),
        deletedAt: null
      },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        property: {
          select: {
            id: true,
            name: true,
            city: true,
            tenantId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Check if property exists and is owned by tenant
  async findPropertyByIdAndTenantId(propertyId: number, tenantId: number) {
    return prisma.property.findFirst({
      where: {
        id: propertyId,
        tenantId,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        tenantId: true
      }
    })
  }

  // Count active bookings for a room
  async countActiveBookings(roomId: number): Promise<number> {
    return prisma.booking.count({
      where: {
        items: {
          some: {
            roomId: roomId
          }
        },
        status: {
          notIn: [
            BookingStatus.cancelled, 
            BookingStatus.expired, 
            BookingStatus.rejected, 
            BookingStatus.completed
          ]
        }
      }
    })
  }
}

