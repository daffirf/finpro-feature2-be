import { Router } from 'express'
import { JwtMiddleware } from '@/middlewares/jwt.middleware'

export class TenantRouter {
  private router: Router
  private jwtMiddleware: JwtMiddleware

  constructor() {
    this.router = Router()
    this.jwtMiddleware = new JwtMiddleware()
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

    // Properties management
    this.router.get('/properties', (req, res) => {
      res.json({ message: 'Get tenant properties endpoint - to be implemented' })
    })

    this.router.get('/properties/:id', (req, res) => {
      res.json({ message: 'Get tenant property by ID endpoint - to be implemented' })
    })

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

    // Reports
    this.router.get('/reports', (req, res) => {
      res.json({ message: 'Get tenant reports endpoint - to be implemented' })
    })
  }

  getRouter = () => {
    return this.router
  }
}
