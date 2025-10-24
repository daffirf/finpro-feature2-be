import { ApiError } from '@/utils/api-error'
import { PropertyRepository } from './repository/property.repository'
import { CreatePropertyDto } from './dto/property.dto'
import { CloudinaryService } from '@/services/cloudinary.service'

export class PropertyService {
  private propertyRepository: PropertyRepository
  private cloudinaryService: CloudinaryService

  constructor() {
    this.propertyRepository = new PropertyRepository()
    this.cloudinaryService = new CloudinaryService()
  }

  async getPropertyById(id: number, checkInDate?: Date, checkOutDate?: Date) {
    const property = await this.propertyRepository.findById(id)

    if (!property) {
      throw new ApiError(404, 'Properti tidak ditemukan')
    }

    if (checkInDate && checkOutDate) {
      const roomIds = property.rooms.map(r => r.id)
      const bookedRoomIds = await this.propertyRepository.getBookedRoomIds(
        roomIds,
        checkInDate,
        checkOutDate
      )
      
      const availableRooms = property.rooms.map(room => ({
        ...room,
        isAvailable: !bookedRoomIds.has(room.id)
      }))

      return {
        property: {
          ...property,
          rooms: availableRooms
        }
      }
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

  async createProperty(tenantId: number, data: CreatePropertyDto, imageFile?: Express.Multer.File) {
    const user = await this.propertyRepository.findUserById(tenantId)

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
    const properties = await this.propertyRepository.findByTenantId(tenantId)

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
    const property = await this.propertyRepository.findByIdAndTenantId(propertyId, tenantId)

    if (!property) {
      throw new ApiError(404, 'Property tidak ditemukan atau Anda tidak memiliki akses')
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.description !== undefined) updateData.description = data.description
    if (data.address !== undefined) updateData.address = data.address
    if (data.city !== undefined) updateData.city = data.city
    if (data.province !== undefined) updateData.province = data.province
    if (data.category !== undefined) updateData.category = data.category
    if (data.published !== undefined) updateData.published = data.published
    if (data.latitude !== undefined) updateData.latitude = data.latitude
    if (data.longitude !== undefined) updateData.longitude = data.longitude

    const updated = await this.propertyRepository.update(propertyId, updateData)

    if (imageFile) {
      const uploadResult = await this.cloudinaryService.upload(imageFile)
      await this.propertyRepository.createPropertyImage(updated.id, uploadResult.secure_url, false)
    }

    const updatedProperty = await this.propertyRepository.findById(propertyId)

    return {
      success: true,
      message: 'Property berhasil diupdate',
      data: updatedProperty
    }
  }

  async deleteProperty(tenantId: number, propertyId: number) {
    const property = await this.propertyRepository.findByIdAndTenantId(propertyId, tenantId)

    if (!property) {
      throw new ApiError(404, 'Property tidak ditemukan atau Anda tidak memiliki akses')
    }

    if (property.rooms.length > 0) {
      throw new ApiError(400, 'Tidak dapat menghapus property yang masih memiliki room aktif')
    }

    await this.propertyRepository.softDelete(propertyId)

    return {
      success: true,
      message: 'Property berhasil dihapus'
    }
  }
}
