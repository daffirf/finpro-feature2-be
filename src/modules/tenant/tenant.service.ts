import { prisma } from '@/utils/database'
import { ApiError } from '@/utils/api-error'

export class TenantService {
  // Cancel user booking (by tenant)
  async cancelUserBooking(tenantUserId: number, bookingId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: {
          include: {
            room: {
              include: {
                property: {
                  include: {
                    tenant: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!booking) {
      throw new ApiError(404, 'Booking tidak ditemukan')
    }

    // Check if tenant owns the property
    const property = booking.items[0]?.room?.property
    if (!property || property.tenantId !== tenantUserId) {
      throw new ApiError(403, 'Anda tidak memiliki akses ke booking ini')
    }

    // Tenant can only cancel if payment proof is not uploaded yet
    if (booking.paymentProofUrl) {
      throw new ApiError(400, 'Tidak dapat membatalkan booking yang sudah upload bukti pembayaran')
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' }
    })

    return {
      message: 'Booking berhasil dibatalkan',
      booking: updatedBooking
    }
  }

  // Get property calendar (single property)
  async getPropertyCalendar(tenantUserId: number, propertyId: number, month?: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        tenant: true,
        rooms: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!property) {
      throw new ApiError(404, 'Property tidak ditemukan')
    }

    if (property.tenantId !== tenantUserId) {
      throw new ApiError(403, 'Anda tidak memiliki akses ke property ini')
    }

    // Determine date range
    let startDate: Date
    let endDate: Date

    if (month) {
      const [yearNum, monthNum] = month.split('-').map(Number)
      startDate = new Date(yearNum, monthNum - 1, 1)
      endDate = new Date(yearNum, monthNum, 0, 23, 59, 59)
    } else {
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    }

    const bookings = await prisma.booking.findMany({
      where: {
        items: {
          some: {
            room: {
              propertyId: property.id
            }
          }
        },
        status: { notIn: ['cancelled'] },
        OR: [
          {
            checkIn: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            checkOut: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            AND: [
              { checkIn: { lte: startDate } },
              { checkOut: { gte: endDate } }
            ]
          }
        ]
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        items: {
          select: {
            roomId: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const totalRooms = property.rooms.length
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalRoomDays = totalRooms * totalDays
    
    let bookedDays = 0
    bookings.forEach(booking => {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      const periodStart = checkIn < startDate ? startDate : checkIn
      const periodEnd = checkOut > endDate ? endDate : checkOut
      const days = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
      bookedDays += days
    })

    const occupancyRate = totalRoomDays > 0 ? (bookedDays / totalRoomDays) * 100 : 0

    return {
      property: {
        id: property.id,
        name: property.name,
        totalRooms,
        rooms: property.rooms
      },
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      bookings: bookings.map(b => ({
        id: b.id,
        roomId: b.items[0]?.roomId,
        checkIn: b.checkIn.toISOString().split('T')[0],
        checkOut: b.checkOut.toISOString().split('T')[0],
        status: b.status,
        guestName: b.user.name,
        guestEmail: b.user.email
      })),
      summary: {
        totalBookings: bookings.length,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        availableDays: totalRoomDays - bookedDays,
        bookedDays
      }
    }
  }

  // Get sales report
  async getSalesReport(tenantUserId: number, filters: {
    startDate?: string
    endDate?: string
    propertyId?: number
    userId?: number
    transactionStatus?: string
    sortBy?: 'createdAt' | 'totalPrice'
    sortOrder?: 'asc' | 'desc'
  }) {
    // Determine date range
    let startDate: Date
    let endDate: Date

    if (filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate)
      endDate = new Date(filters.endDate)
      endDate.setHours(23, 59, 59, 999)
    } else {
      // Default: last 30 days
      endDate = new Date()
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
    }

    // Build where condition
    const whereCondition: any = {
      items: {
        some: {
          room: {
            property: {
              tenantId: tenantUserId,
              deletedAt: null
            }
          }
        }
      },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    // Filter by property
    if (filters.propertyId) {
      whereCondition.items.some.room.propertyId = filters.propertyId
    }

    // Filter by user
    if (filters.userId) {
      whereCondition.userId = filters.userId
    }

    // Filter by status
    if (filters.transactionStatus) {
      whereCondition.status = filters.transactionStatus
    }

    // Determine sort order
    const orderBy: any = {}
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'
    orderBy[sortBy] = sortOrder

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
        items: {
          include: {
            room: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy
    })

    // Calculate summary statistics
    const totalRevenue = bookings
      .filter(b => ['confirmed', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + b.totalPrice, 0)

    const totalBookings = bookings.length

    const averageBookingValue = totalBookings > 0 
      ? Math.round(totalRevenue / totalBookings) 
      : 0

    // Group by month for monthly revenue
    const monthlyRevenueMap = new Map<string, { revenue: number; bookings: number }>()

    bookings.forEach(booking => {
      if (['confirmed', 'completed'].includes(booking.status)) {
        const monthKey = booking.createdAt.toISOString().substring(0, 7) // YYYY-MM
        const existing = monthlyRevenueMap.get(monthKey) || { revenue: 0, bookings: 0 }
        monthlyRevenueMap.set(monthKey, {
          revenue: existing.revenue + booking.totalPrice,
          bookings: existing.bookings + 1
        })
      }
    })

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        bookings: data.bookings
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Group by property for top properties
    const propertyRevenueMap = new Map<number, { 
      id: number; 
      name: string; 
      revenue: number; 
      bookings: number 
    }>()

    bookings.forEach(booking => {
      if (['confirmed', 'completed'].includes(booking.status)) {
        const property = booking.items[0]?.room?.property
        if (property) {
          const existing = propertyRevenueMap.get(property.id) || { 
            id: property.id, 
            name: property.name, 
            revenue: 0, 
            bookings: 0 
          }
          propertyRevenueMap.set(property.id, {
            ...existing,
            revenue: existing.revenue + booking.totalPrice,
            bookings: existing.bookings + 1
          })
        }
      }
    })

    const topProperties = Array.from(propertyRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) // Top 10 properties

    // Format bookings data
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingNo: booking.bookingNo,
      propertyName: booking.items[0]?.room?.property?.name || 'N/A',
      userName: booking.user.name || 'N/A',
      userEmail: booking.user.email,
      checkIn: booking.checkIn.toISOString().split('T')[0],
      checkOut: booking.checkOut.toISOString().split('T')[0],
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentMethod: booking.paymentMethod,
      createdAt: booking.createdAt.toISOString()
    }))

    return {
      summary: {
        totalRevenue,
        totalBookings,
        averageBookingValue,
        periodStart: startDate.toISOString().split('T')[0],
        periodEnd: endDate.toISOString().split('T')[0]
      },
      monthlyRevenue,
      topProperties,
      bookings: formattedBookings
    }
  }

  // Get all properties calendar
  async getAllPropertiesCalendar(tenantUserId: number, month?: string, year?: string) {
    // No separate tenant table, user with role TENANT is the tenant

    // Determine date range
    let startDate: Date
    let endDate: Date

    if (month) {
      const [yearNum, monthNum] = month.split('-').map(Number)
      startDate = new Date(yearNum, monthNum - 1, 1)
      endDate = new Date(yearNum, monthNum, 0, 23, 59, 59)
    } else if (year) {
      startDate = new Date(parseInt(year), 0, 1)
      endDate = new Date(parseInt(year), 11, 31, 23, 59, 59)
    } else {
      // Default: current month
      const now = new Date()
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    }

    // Get all properties owned by tenant
    const properties = await prisma.property.findMany({
      where: {
        tenantId: tenantUserId,
        deletedAt: null,
        published: true
      },
      include: {
        rooms: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Get all bookings for these properties
    const propertyIds = properties.map(p => p.id)
    const bookings = await prisma.booking.findMany({
      where: {
        items: {
          some: {
            room: {
              propertyId: { in: propertyIds }
            }
          }
        },
        status: { notIn: ['cancelled'] },
        OR: [
          {
            checkIn: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            checkOut: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            AND: [
              { checkIn: { lte: startDate } },
              { checkOut: { gte: endDate } }
            ]
          }
        ]
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        items: {
          select: {
            roomId: true,
            room: {
              select: {
                propertyId: true
              }
            }
          }
        }
      }
    })

    // Group bookings by property
    const propertySummaries = properties.map(property => {
      const propertyBookings = bookings.filter(b => b.items.some(item => item.room.propertyId === property.id))
      
      // Calculate occupancy stats
      const totalRooms = property.rooms.length
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const totalRoomDays = totalRooms * totalDays
      
      let bookedDays = 0
      propertyBookings.forEach(booking => {
        const checkIn = new Date(booking.checkIn)
        const checkOut = new Date(booking.checkOut)
        const periodStart = checkIn < startDate ? startDate : checkIn
        const periodEnd = checkOut > endDate ? endDate : checkOut
        const days = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
        bookedDays += days
      })

      const occupancyRate = totalRoomDays > 0 ? (bookedDays / totalRoomDays) * 100 : 0

      return {
        id: property.id,
        name: property.name,
        totalRooms,
        totalBookings: propertyBookings.length,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        availableDays: totalRoomDays - bookedDays,
        bookedDays
      }
    })

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      properties: propertySummaries,
      summary: {
        totalProperties: properties.length,
        totalRooms: properties.reduce((sum, p) => sum + p.rooms.length, 0),
        totalBookings: bookings.length,
        averageOccupancy: Math.round(
          (propertySummaries.reduce((sum, p) => sum + p.occupancyRate, 0) / 
          (propertySummaries.length || 1)) * 100
        ) / 100
      }
    }
  }

  // ==================== PROPERTY CRUD ====================

  // Get all properties owned by tenant
  async getMyProperties(tenantUserId: number) {
    const properties = await prisma.property.findMany({
      where: {
        tenantId: tenantUserId,
        deletedAt: null
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        rooms: {
          where: { deletedAt: null }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      success: true,
      data: properties.map(property => ({
        id: property.id,
        name: property.name,
        description: property.description,
        city: property.city,
        province: property.province,
        address: property.address,
        category: property.category,
        imageUrls: property.images.map(img => img.url),
        published: property.published,
        tenantId: property.tenantId,
        totalRooms: property.rooms.length,
        activeRooms: property.rooms.length, // Can be refined later
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString()
      }))
    }
  }

  // Get single property by ID
  async getPropertyById(tenantUserId: number, propertyId: number) {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenantId: tenantUserId,
        deletedAt: null
      },
      include: {
        images: true,
        rooms: {
          where: { deletedAt: null }
        }
      }
    })

    if (!property) {
      throw new ApiError(404, 'Property tidak ditemukan')
    }

    return {
      success: true,
      data: {
        id: property.id,
        name: property.name,
        description: property.description,
        city: property.city,
        province: property.province,
        address: property.address,
        category: property.category,
        imageUrls: property.images.map(img => img.url),
        published: property.published,
        tenantId: property.tenantId,
        totalRooms: property.rooms.length,
        activeRooms: property.rooms.length,
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString()
      }
    }
  }

  // Create new property
  async createProperty(tenantUserId: number, data: any) {
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
      '-' + Math.random().toString(36).substr(2, 9)

    const property = await prisma.property.create({
      data: {
        tenantId: tenantUserId,
        name: data.name,
        slug: slug,
        description: data.description || null,
        address: data.address || null,
        city: data.city || null,
        province: data.province || null,
        category: data.category || 'villa',
        published: false,
        images: data.imageUrls?.length > 0 ? {
          create: data.imageUrls.map((url: string, index: number) => ({
            url: url,
            isPrimary: index === 0,
            order: index
          }))
        } : undefined
      },
      include: {
        images: true
      }
    })

    return {
      success: true,
      message: 'Property berhasil ditambahkan',
      data: {
        id: property.id,
        name: property.name,
        description: property.description,
        city: property.city,
        province: property.province,
        address: property.address,
        category: property.category,
        imageUrls: property.images.map(img => img.url),
        published: property.published,
        tenantId: property.tenantId,
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString()
      }
    }
  }

  // Update property
  async updateProperty(tenantUserId: number, propertyId: number, data: any) {
    // Verify ownership
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenantId: tenantUserId,
        deletedAt: null
      }
    })

    if (!property) {
      throw new ApiError(404, 'Property tidak ditemukan atau Anda tidak memiliki akses')
    }

    // Update property
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        address: data.address ?? undefined,
        city: data.city ?? undefined,
        province: data.province ?? undefined,
        category: data.category ?? undefined,
        published: data.published ?? undefined
      },
      include: {
        images: true
      }
    })

    return {
      success: true,
      message: 'Property berhasil diupdate',
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        city: updated.city,
        province: updated.province,
        address: updated.address,
        category: updated.category,
        imageUrls: updated.images.map(img => img.url),
        published: updated.published,
        tenantId: updated.tenantId,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString()
      }
    }
  }

  // Delete property (soft delete)
  async deleteProperty(tenantUserId: number, propertyId: number) {
    // Verify ownership
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenantId: tenantUserId,
        deletedAt: null
      },
      include: {
        rooms: {
          where: { deletedAt: null }
        }
      }
    })

    if (!property) {
      throw new ApiError(404, 'Property tidak ditemukan atau Anda tidak memiliki akses')
    }

    // Check if property has active rooms
    if (property.rooms.length > 0) {
      throw new ApiError(400, 'Tidak dapat menghapus property yang masih memiliki room aktif')
    }

    // Soft delete
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        deletedAt: new Date()
      }
    })

    return {
      success: true,
      message: 'Property berhasil dihapus'
    }
  }
}

