import { Router } from 'express'
import { JwtMiddleware } from '@/middlewares/jwt.middleware'
import { TenantController } from './tenant.controller'

export class TenantRouter {
  private router: Router
  private jwtMiddleware: JwtMiddleware
  private tenantController: TenantController

  constructor() {
    this.router = Router()
    this.jwtMiddleware = new JwtMiddleware()
    this.tenantController = new TenantController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    // All tenant routes require authentication and tenant role
    this.router.use(this.jwtMiddleware.verifyToken())

    // Tenant bookings management
    this.router.get('/bookings', (req, res) => {
      res.json({ message: 'Get tenant bookings endpoint - to be implemented' })
    })

    this.router.post('/bookings/:id/confirm', (req, res) => {
      res.json({ message: 'Confirm booking endpoint - to be implemented' })
    })

    this.router.post('/bookings/:id/reject', (req, res) => {
      res.json({ message: 'Reject booking endpoint - to be implemented' })
    })

    // Cancel user booking (converted from Next.js)
    this.router.post('/bookings/:id/cancel', this.tenantController.cancelUserBooking)

    // Properties management
    this.router.get('/properties', this.tenantController.getMyProperties)
    this.router.post('/properties', this.tenantController.createProperty)
    this.router.get('/properties/:id', this.tenantController.getPropertyById)
    this.router.patch('/properties/:id', this.tenantController.updateProperty)
    this.router.delete('/properties/:id', this.tenantController.deleteProperty)

    // Property calendar (converted from Next.js)
    this.router.get('/properties/:id/calendar', this.tenantController.getPropertyCalendar)
    
    // All properties calendar (converted from Next.js)
    this.router.get('/properties/calendar', this.tenantController.getAllPropertiesCalendar)

    // Price rules management
    this.router.get('/price-rules', (req, res) => {
      res.json({ message: 'Get price rules endpoint - to be implemented' })
    })

    this.router.post('/price-rules', (req, res) => {
      res.json({ message: 'Create price rule endpoint - to be implemented' })
    })

    // Rooms management
    this.router.get('/rooms', (req, res) => {
      res.json({ message: 'Get tenant rooms endpoint - to be implemented' })
    })

    // Reports (Sales Report & Analysis)
    this.router.get('/reports', this.tenantController.getSalesReport)
  }

  getRouter = () => {
    return this.router
  }
}
