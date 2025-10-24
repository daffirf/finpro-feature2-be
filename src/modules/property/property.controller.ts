import { Request, Response, NextFunction } from 'express'
import { PropertyService } from './property.service'
import { ApiError } from '@/utils/api-error'
import { successHandler } from '@/helpers/successHandler'
import { errorHandler } from '@/helpers/errorHandler'
import { safeNumber, safeDate } from '@/utils/query-helper'

export class PropertyController {
  private propertyService: PropertyService

  constructor() {
    this.propertyService = new PropertyService()
  }

  getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = safeNumber(req.params.id)
      if (!id) {
        throw new ApiError(400, 'Invalid property ID')
      }

      const checkInDate = safeDate(req.query.checkInDate)
      const checkOutDate = safeDate(req.query.checkOutDate)

      const result = await this.propertyService.getPropertyById(id, checkInDate, checkOutDate)
      
      return successHandler(res, result, 'Property details retrieved successfully', 200)
    } catch (error) {
      next(error)
    }
  }

  getPropertyDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = safeNumber(req.params.id)
      if (!propertyId) {
        throw new ApiError(400, 'Invalid property ID')
      }

      const checkInDate = safeDate(req.query.checkInDate)
      const checkOutDate = safeDate(req.query.checkOutDate)

      const result = await this.propertyService.getPropertyById(propertyId, checkInDate, checkOutDate)
      
      return successHandler(res, result, 'Property details retrieved successfully', 200)
    } catch (error) {
      return errorHandler(res, 'Failed to get property details', 400, (error as Error).message)
    }
  }

  getPropertyPrices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      const roomId = parseInt(req.query.roomId as string)
      const month = req.query.month as string
      
      const result = await this.propertyService.getPropertyPrices(
        id,
        roomId,
        month
      )
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  createProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.id
      const imageFile = req.file
      const propertyData = req.body

      if (!tenantId) {
        throw new ApiError(401, 'Unauthorized')
      }

      if (propertyData.latitude) {
        propertyData.latitude = parseFloat(propertyData.latitude)
      }
      if (propertyData.longitude) {
        propertyData.longitude = parseFloat(propertyData.longitude)
      }
      if (propertyData.published) {
        propertyData.published = propertyData.published === 'true' || propertyData.published === true
      }

      const result = await this.propertyService.createProperty(tenantId, propertyData, imageFile)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  getMyProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.id

      if (!tenantId) {
        throw new ApiError(401, 'Unauthorized')
      }

      const result = await this.propertyService.getMyProperties(tenantId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  updateProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.id
      const propertyId = parseInt(req.params.id)
      const imageFile = req.file
      const propertyData = req.body

      if (!tenantId) {
        throw new ApiError(401, 'Unauthorized')
      }

      if (propertyData.latitude) {
        propertyData.latitude = parseFloat(propertyData.latitude)
      }
      if (propertyData.longitude) {
        propertyData.longitude = parseFloat(propertyData.longitude)
      }
      if (propertyData.published !== undefined) {
        propertyData.published = propertyData.published === 'true' || propertyData.published === true
      }

      const result = await this.propertyService.updateProperty(tenantId, propertyId, propertyData, imageFile)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.id
      const propertyId = parseInt(req.params.id)

      if (!tenantId) {
        throw new ApiError(401, 'Unauthorized')
      }

      const result = await this.propertyService.deleteProperty(tenantId, propertyId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
