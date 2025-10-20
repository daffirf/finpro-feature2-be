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
      const id = req.params.id
      const result = await this.propertyService.getPropertyById(parseInt(id))
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  getPropertyPrices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id
      const roomId = req.query.roomId as string
      const month = req.query.month as string
      const checkIn = req.query.checkIn as string
      const checkOut = req.query.checkOut as string
      
      // Support both formats: month OR checkIn+checkOut
      if (checkIn && checkOut) {
        // Use checkIn as month parameter
        const result = await this.propertyService.getPropertyPrices(
          parseInt(id),
          roomId ? parseInt(roomId) : 1, // Default roomId = 1 if not provided
          checkIn
        )
        res.status(200).json(result)
      } else {
        const result = await this.propertyService.getPropertyPrices(
          parseInt(id),
          parseInt(roomId),
          month
        )
        res.status(200).json(result)
      }
    } catch (error) {
      next(error)
    }
  }
}
