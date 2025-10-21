import { Request, Response, NextFunction } from 'express'
import { PropertyService } from './property.service'
import { ApiError } from '@/utils/api-error'

export class PropertyController {
  private propertyService: PropertyService

  constructor() {
    this.propertyService = new PropertyService()
  }

  searchProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        city,
        checkIn,
        checkOut,
        guests,
        sortBy,
        minPrice,
        maxPrice,
        amenities,
        category,
        page,
        limit
      } = req.query

      const searchParams = {
        city: city as string,
        checkIn: checkIn as string,
        checkOut: checkOut as string,
        guests: guests ? parseInt(guests as string) : undefined,
        sortBy: sortBy as string,
        minPrice: minPrice as string,
        maxPrice: maxPrice as string,
        amenities: amenities ? (amenities as string).split(',').filter(Boolean) : undefined,
        category: category as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      }

      const result = await this.propertyService.searchProperties(searchParams)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id)
      const result = await this.propertyService.getPropertyById(id)
      res.status(200).json(result)
    } catch (error) {
      next(error)
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
