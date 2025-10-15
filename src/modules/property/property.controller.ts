import { Request, Response, NextFunction } from 'express'
import { PropertyService } from './property.service'

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
}
