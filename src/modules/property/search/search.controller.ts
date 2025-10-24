import { Request, Response, NextFunction } from 'express'
import { SearchService } from './search.service'
import { PropertyCategory } from '@/generated/prisma'
import { successHandler } from '@/helpers/successHandler'
import { errorHandler } from '@/helpers/errorHandler'
import { safeNumber, safeString, safeDate, validateEnum, safeArray } from '@/utils/query-helper'

export class SearchController {
  private searchService: SearchService

  constructor() {
    this.searchService = new SearchService()
  }

  searchProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page,
        limit,
        checkIn,
        checkOut,
        checkInDate,
        checkOutDate,
        name,
        city,
        guests,
        sortBy,
        sortOrder,
        minPrice,
        maxPrice,
        amenities,
        category
      } = req.query

      const categoryValue = validateEnum(category, PropertyCategory)

      const searchParams = {
        city: safeString(city) || safeString(name),
        checkIn: safeString(checkIn) || safeDate(checkInDate)?.toISOString().split('T')[0],
        checkOut: safeString(checkOut) || safeDate(checkOutDate)?.toISOString().split('T')[0],
        guests: safeNumber(guests),
        sortBy: safeString(sortBy) || (sortOrder === 'asc' ? 'price_asc' : sortOrder === 'desc' ? 'price_desc' : undefined),
        minPrice: safeString(minPrice),
        maxPrice: safeString(maxPrice),
        amenities: safeArray(amenities),
        category: categoryValue,
        page: safeNumber(page),
        limit: safeNumber(limit)
      }

      const result = await this.searchService.searchProperties(searchParams)
      
      return successHandler(res, result, 'Properties retrieved successfully', 200)
    } catch (error) {
      return errorHandler(res, 'Failed to search properties', 400, (error as Error).message)
    }
  }

  search = async (req: Request, res: Response, next: NextFunction) => {
    return this.searchProperties(req, res, next)
  }
}
