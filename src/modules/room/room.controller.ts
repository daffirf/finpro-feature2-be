import { Request, Response, NextFunction } from 'express'
import { RoomService } from './room.service'
import { ApiError } from '@/utils/api-error'
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto'

export class RoomController {
  private roomService: RoomService

  constructor() {
    this.roomService = new RoomService()
  }

  // GET /api/tenant/rooms - Get all rooms for tenant
  getMyRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.id

      if (!tenantId) {
        throw new ApiError(401, 'Unauthorized')
      }

      const result = await this.roomService.getMyRooms(tenantId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // GET /api/tenant/properties/:propertyId/rooms - Get rooms by property
  getRoomsByProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.id
      const propertyId = parseInt(req.params.propertyId)

      if (!tenantId) {
        throw new ApiError(401, 'Unauthorized')
      }

      if (isNaN(propertyId)) {
        throw new ApiError(400, 'Invalid property ID')
      }

      const result = await this.roomService.getRoomsByProperty(tenantId, propertyId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // GET /api/tenant/rooms/:id - Get room by ID
  getRoomById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.id
      const roomId = parseInt(req.params.id)

      if (!tenantId) {
        throw new ApiError(401, 'Unauthorized')
      }

      if (isNaN(roomId)) {
        throw new ApiError(400, 'Invalid room ID')
      }

      const result = await this.roomService.getRoomById(tenantId, roomId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // POST /api/tenant/rooms - Create new room
  createRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.id
      const imageFiles = req.files as Express.Multer.File[] | undefined

      if (!tenantId) {
        throw new ApiError(401, 'Unauthorized')
      }

      const roomData: CreateRoomDto = {
        propertyId: parseInt(req.body.propertyId),
        name: req.body.name,
        description: req.body.description,
        basePrice: parseInt(req.body.basePrice),
        capacity: parseInt(req.body.capacity),
        totalUnits: parseInt(req.body.totalUnits)
      }

      if (!roomData.propertyId || !roomData.name || !roomData.description || 
          !roomData.basePrice || !roomData.capacity || !roomData.totalUnits) {
        throw new ApiError(400, 'Missing required fields')
      }

      const result = await this.roomService.createRoom(tenantId, roomData, imageFiles)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  // PATCH /api/tenant/rooms/:id - Update room
  updateRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.id
      const roomId = parseInt(req.params.id)
      const imageFiles = req.files as Express.Multer.File[] | undefined

      if (!tenantId) {
        throw new ApiError(401, 'Unauthorized')
      }

      if (isNaN(roomId)) {
        throw new ApiError(400, 'Invalid room ID')
      }

      const updateData: UpdateRoomDto = {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.basePrice && { basePrice: parseInt(req.body.basePrice) }),
        ...(req.body.capacity && { capacity: parseInt(req.body.capacity) }),
        ...(req.body.totalUnits && { totalUnits: parseInt(req.body.totalUnits) })
      }

      const result = await this.roomService.updateRoom(tenantId, roomId, updateData, imageFiles)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // DELETE /api/tenant/rooms/:id - Delete room
  deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.id
      const roomId = parseInt(req.params.id)

      if (!tenantId) {
        throw new ApiError(401, 'Unauthorized')
      }

      if (isNaN(roomId)) {
        throw new ApiError(400, 'Invalid room ID')
      }

      const result = await this.roomService.deleteRoom(tenantId, roomId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // GET /api/rooms/:id/price - Get room price (public endpoint)
  getRoomPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = parseInt(req.params.id)

      if (isNaN(roomId)) {
        throw new ApiError(400, 'Invalid room ID')
      }

      const result = await this.roomService.getRoomPrice(roomId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}

