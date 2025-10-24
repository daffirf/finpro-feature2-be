import { ApiError } from '@/utils/api-error'
import { RoomRepository } from './repository/room.repository'
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto'
import { CloudinaryService } from '@/services/cloudinary.service'

export class RoomService {
  private roomRepository: RoomRepository
  private cloudinaryService: CloudinaryService

  constructor() {
    this.roomRepository = new RoomRepository()
    this.cloudinaryService = new CloudinaryService()
  }

  // Get all rooms for a tenant
  async getMyRooms(tenantId: number) {
    const rooms = await this.roomRepository.findByTenantId(tenantId)

    return {
      success: true,
      data: rooms.map(room => ({
        id: room.id,
        propertyId: room.propertyId,
        propertyName: room.property.name,
        name: room.name,
        description: room.description,
        basePrice: room.basePrice,
        capacity: room.capacity,
        totalUnits: room.totalUnits,
        availableUnits: room.totalUnits,
        imageUrls: room.images.map((img: any) => img.url),
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString()
      }))
    }
  }

  // Get rooms by property ID
  async getRoomsByProperty(tenantId: number, propertyId: number) {
    const property = await this.roomRepository.findPropertyByIdAndTenantId(propertyId, tenantId)

    if (!property) {
      throw new ApiError(404, 'Property tidak ditemukan atau Anda tidak memiliki akses')
    }

    const rooms = await this.roomRepository.findByPropertyId(propertyId)

    return {
      success: true,
      data: rooms.map(room => ({
        id: room.id,
        propertyId: room.propertyId,
        propertyName: room.property.name,
        name: room.name,
        description: room.description,
        basePrice: room.basePrice,
        capacity: room.capacity,
        totalUnits: room.totalUnits,
        availableUnits: room.totalUnits,
        imageUrls: room.images.map((img: any) => img.url),
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString()
      }))
    }
  }

  // Get room by ID
  async getRoomById(tenantId: number, roomId: number) {
    const room = await this.roomRepository.findById(roomId)

    if (!room || room.deletedAt) {
      throw new ApiError(404, 'Room tidak ditemukan')
    }

    // Verify tenant owns the property
    if (room.property.tenantId !== tenantId) {
      throw new ApiError(403, 'Anda tidak memiliki akses ke room ini')
    }

    return {
      success: true,
      data: {
        id: room.id,
        propertyId: room.propertyId,
        propertyName: room.property.name,
        name: room.name,
        description: room.description,
        basePrice: room.basePrice,
        capacity: room.capacity,
        totalUnits: room.totalUnits,
        availableUnits: room.totalUnits,
        imageUrls: room.images.map((img: any) => img.url),
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString()
      }
    }
  }

  // Create new room
  async createRoom(tenantId: number, data: CreateRoomDto, imageFiles?: Express.Multer.File[]) {
    const property = await this.roomRepository.findPropertyByIdAndTenantId(data.propertyId, tenantId)

    if (!property) {
      throw new ApiError(404, 'Property tidak ditemukan atau Anda tidak memiliki akses')
    }

    const room = await this.roomRepository.create({
      propertyId: data.propertyId,
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      capacity: data.capacity,
      totalUnits: data.totalUnits
    })

    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const uploadResult = await this.cloudinaryService.upload(imageFiles[i])
        await this.roomRepository.createRoomImage(room.id, uploadResult.secure_url, uploadResult.public_id, i)
      }
    }

    // Fetch created room with images
    const createdRoom = await this.roomRepository.findById(room.id)

    return {
      success: true,
      message: 'Room berhasil ditambahkan',
      data: {
        id: createdRoom!.id,
        propertyId: createdRoom!.propertyId,
        propertyName: createdRoom!.property.name,
        name: createdRoom!.name,
        description: createdRoom!.description,
        basePrice: createdRoom!.basePrice,
        capacity: createdRoom!.capacity,
        totalUnits: createdRoom!.totalUnits,
        imageUrls: createdRoom!.images.map((img: any) => img.url),
        createdAt: createdRoom!.createdAt.toISOString(),
        updatedAt: createdRoom!.updatedAt.toISOString()
      }
    }
  }

  // Update room
  async updateRoom(tenantId: number, roomId: number, data: UpdateRoomDto, imageFiles?: Express.Multer.File[]) {
    const room = await this.roomRepository.findById(roomId)

    if (!room || room.deletedAt) {
      throw new ApiError(404, 'Room tidak ditemukan')
    }

    // Verify tenant owns the property
    if (room.property.tenantId !== tenantId) {
      throw new ApiError(403, 'Anda tidak memiliki akses ke room ini')
    }

    const updated = await this.roomRepository.update(roomId, {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.basePrice && { basePrice: data.basePrice }),
      ...(data.capacity && { capacity: data.capacity }),
      ...(data.totalUnits && { totalUnits: data.totalUnits })
    })

    if (imageFiles && imageFiles.length > 0) {
      const currentImageCount = updated.images.length
      for (let i = 0; i < imageFiles.length; i++) {
        const uploadResult = await this.cloudinaryService.upload(imageFiles[i])
        await this.roomRepository.createRoomImage(updated.id, uploadResult.secure_url, uploadResult.public_id, currentImageCount + i)
      }
    }

    // Fetch updated room with images
    const updatedRoom = await this.roomRepository.findById(roomId)

    return {
      success: true,
      message: 'Room berhasil diupdate',
      data: {
        id: updatedRoom!.id,
        propertyId: updatedRoom!.propertyId,
        propertyName: updatedRoom!.property.name,
        name: updatedRoom!.name,
        description: updatedRoom!.description,
        basePrice: updatedRoom!.basePrice,
        capacity: updatedRoom!.capacity,
        totalUnits: updatedRoom!.totalUnits,
        imageUrls: updatedRoom!.images.map((img: any) => img.url),
        createdAt: updatedRoom!.createdAt.toISOString(),
        updatedAt: updatedRoom!.updatedAt.toISOString()
      }
    }
  }

  // Delete room
  async deleteRoom(tenantId: number, roomId: number) {
    const room = await this.roomRepository.findById(roomId)

    if (!room || room.deletedAt) {
      throw new ApiError(404, 'Room tidak ditemukan')
    }

    // Verify tenant owns the property
    if (room.property.tenantId !== tenantId) {
      throw new ApiError(403, 'Anda tidak memiliki akses ke room ini')
    }

    const activeBookings = await this.roomRepository.countActiveBookings(roomId)

    if (activeBookings > 0) {
      throw new ApiError(400, 'Tidak dapat menghapus room yang memiliki booking aktif')
    }

    await this.roomRepository.softDelete(roomId)

    return {
      success: true,
      message: 'Room berhasil dihapus'
    }
  }

  // Get room price (for calendar/booking)
  async getRoomPrice(roomId: number) {
    const room = await this.roomRepository.findById(roomId)

    if (!room) {
      throw new ApiError(404, 'Room tidak ditemukan')
    }

    return {
      success: true,
      data: {
        roomId: room.id,
        basePrice: room.basePrice,
        currency: 'IDR'
      }
    }
  }
}

