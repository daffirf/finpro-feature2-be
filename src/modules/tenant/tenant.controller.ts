import { Request, Response, NextFunction } from 'express'
import { TenantService } from './tenant.service'

export class TenantController {
  private tenantService: TenantService

  constructor() {
    this.tenantService = new TenantService()
  }

  // Cancel user booking (by tenant)
  cancelUserBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantUserId = (req as any).user?.id
      const bookingId = parseInt(req.params.id)

      const result = await this.tenantService.cancelUserBooking(tenantUserId, bookingId)
      
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Get property calendar (single property)
  getPropertyCalendar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantUserId = (req as any).user?.id
      const propertyId = parseInt(req.params.id)
      const month = req.query.month as string | undefined

      const result = await this.tenantService.getPropertyCalendar(tenantUserId, propertyId, month)
      
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Get all properties calendar
  getAllPropertiesCalendar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantUserId = (req as any).user?.id
      const month = req.query.month as string | undefined
      const year = req.query.year as string | undefined

      const result = await this.tenantService.getAllPropertiesCalendar(tenantUserId, month, year)
      
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Get sales report
  getSalesReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantUserId = (req as any).user?.id
      const filters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        propertyId: req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined,
        userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
        transactionStatus: req.query.transactionStatus as string | undefined,
        sortBy: req.query.sortBy as 'createdAt' | 'totalPrice' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined
      }

      const result = await this.tenantService.getSalesReport(tenantUserId, filters)
      
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // ==================== PROPERTY CRUD ====================

  // Get all tenant properties
  getMyProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantUserId = (req as any).user?.id
      const result = await this.tenantService.getMyProperties(tenantUserId)
      
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Get single property by ID
  getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantUserId = (req as any).user?.id
      const propertyId = parseInt(req.params.id)
      
      const result = await this.tenantService.getPropertyById(tenantUserId, propertyId)
      
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Create new property
  createProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantUserId = (req as any).user?.id
      const data = req.body
      
      const result = await this.tenantService.createProperty(tenantUserId, data)
      
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Update property
  updateProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantUserId = (req as any).user?.id
      const propertyId = parseInt(req.params.id)
      const data = req.body
      
      const result = await this.tenantService.updateProperty(tenantUserId, propertyId, data)
      
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Delete property
  deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantUserId = (req as any).user?.id
      const propertyId = parseInt(req.params.id)
      
      const result = await this.tenantService.deleteProperty(tenantUserId, propertyId)
      
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}

