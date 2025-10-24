import { Router } from 'express'
import { JwtMiddleware } from '@/middlewares/jwt.middleware'
import { rbac } from '@/middlewares/rbac.middleware'
import { TenantController } from './tenant.controller'
import { RoomController } from '../room/room.controller'
import { uploadImage, handleMulterError } from '@/config/multer.config'

export class TenantRouter {
  private router: Router
  private jwtMiddleware: JwtMiddleware
  private tenantController: TenantController
  private roomController: RoomController

  constructor() {
    this.router = Router()
    this.jwtMiddleware = new JwtMiddleware()
    this.tenantController = new TenantController()
    this.roomController = new RoomController()
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
    this.router.get('/rooms', rbac.onlyTenant, this.roomController.getMyRooms)
    this.router.get('/properties/:propertyId/rooms', rbac.onlyTenant, this.roomController.getRoomsByProperty)
    this.router.post(
      '/rooms',
      rbac.onlyTenant,
      uploadImage.array('images', 5),
      handleMulterError,
      this.roomController.createRoom
    )
    this.router.get('/rooms/:id', rbac.onlyTenant, this.roomController.getRoomById)
    this.router.patch(
      '/rooms/:id',
      rbac.onlyTenant,
      uploadImage.array('images', 5),
      handleMulterError,
      this.roomController.updateRoom
    )
    this.router.delete('/rooms/:id', rbac.onlyTenant, this.roomController.deleteRoom)

    // Reports (Sales Report & Analysis)
    this.router.get('/reports', this.tenantController.getSalesReport)
  }

  getRouter = () => {
    return this.router
  }
}
