import { prisma } from '@/utils/database'
import { ApiError } from '@/utils/api-error'
import { getPaginationMeta, createPaginatedResponse } from '@/utils/pagination.utils'
import { buildOrderByClause } from '@/utils/query-parser'
import { PropertyRepository } from './repository/property.repository'
import { PropertySearchParams, PropertyWhereClause } from './types/property.types'
import { CreatePropertyDto } from './dto/property.dto'
import { CloudinaryService } from '@/services/cloudinary.service'

export class PropertyService {
  private propertyRepository: PropertyRepository
  private cloudinaryService: CloudinaryService

  constructor() {
    this.propertyRepository = new PropertyRepository()
    this.cloudinaryService = new CloudinaryService()
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
      const bookedRoomIds = await this.getBookedRoomIds(roomIds as number[], checkIn, checkOut)
      
      availableProperties = properties
        .map(property => ({
          ...property,
          rooms: property.rooms.filter(room => !bookedRoomIds.has(room.id as number))
        }))
        .filter(property => property.rooms.length > 0)
    }

    const meta = getPaginationMeta(page, limit, total)

    return createPaginatedResponse(availableProperties, meta)
  }

  async getPropertyById(id: number) {
    const property = await this.propertyRepository.findById(id)

    if (!property) {
      throw new ApiError(404, 'Properti tidak ditemukan')
    }

    return { property }
  }

  async getPropertyPrices(propertyId: number, roomId: number, month: string) {
    if (!month) {
      throw new ApiError(400, 'Parameter month atau checkIn diperlukan')
    }
    
    // Default roomId to 1 if not provided
    if (!roomId) {
      roomId = 1
    }

    const startDate = new Date(month)
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

    const room = await this.propertyRepository.findRoomById(roomId)

    if (!room) {
      throw new ApiError(404, 'Kamar tidak ditemukan')
    }

    const prices = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const price = Number(room.basePrice)
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 1)
      const isAvailable = await this.propertyRepository.checkRoomAvailability(
        roomId,
        currentDate,
        nextDate
      )

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

  async createProperty(tenantId: number, data: CreatePropertyDto, imageFile?: Express.Multer.File) {
    const user = await prisma.user.findUnique({
      where: { id: tenantId }
    })

    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan')
    }

    if (user.role !== 'tenant') {
      throw new ApiError(403, 'Hanya tenant yang dapat mendaftarkan property')
    }

    const existingProperty = await this.propertyRepository.findBySlug(data.slug)
    if (existingProperty) {
      throw new ApiError(400, 'Slug property sudah digunakan')
    }

    const property = await this.propertyRepository.create(tenantId, data)

    if (imageFile) {
      const uploadResult = await this.cloudinaryService.upload(imageFile)
      await this.propertyRepository.createPropertyImage(property.id, uploadResult.secure_url, true)
    }

    const createdProperty = await this.propertyRepository.findById(property.id)

    return {
      message: 'Property berhasil didaftarkan',
      property: createdProperty
    }
  }

  async getMyProperties(tenantId: number) {
    const properties = await prisma.property.findMany({
      where: {
        tenantId: tenantId,
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
        activeRooms: property.rooms.length,
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString()
      }))
    }
  }

  async updateProperty(tenantId: number, propertyId: number, data: Partial<CreatePropertyDto>, imageFile?: Express.Multer.File) {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenantId: tenantId,
        deletedAt: null
      }
    })

    if (!property) {
      throw new ApiError(404, 'Property tidak ditemukan atau Anda tidak memiliki akses')
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        name: data.name ?? undefined,
        slug: data.slug ?? undefined,
        description: data.description ?? undefined,
        address: data.address ?? undefined,
        city: data.city ?? undefined,
        province: data.province ?? undefined,
        category: data.category ?? undefined,
        published: data.published ?? undefined,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined
      },
      include: {
        images: true
      }
    })

    if (imageFile) {
      const uploadResult = await this.cloudinaryService.upload(imageFile)
      await this.propertyRepository.createPropertyImage(updated.id, uploadResult.secure_url, false)
    }

    return {
      success: true,
      message: 'Property berhasil diupdate',
      data: updated
    }
  }

  async deleteProperty(tenantId: number, propertyId: number) {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenantId: tenantId,
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

    if (property.rooms.length > 0) {
      throw new ApiError(400, 'Tidak dapat menghapus property yang masih memiliki room aktif')
    }

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
