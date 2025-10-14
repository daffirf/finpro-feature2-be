import { Router } from 'express'
import { JwtMiddleware } from '@/middlewares/jwt.middleware'

export class UserRouter {
  private router: Router
  private jwtMiddleware: JwtMiddleware

  constructor() {
    this.router = Router()
    this.jwtMiddleware = new JwtMiddleware()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    // User bookings (requires authentication)
    this.router.get('/bookings', this.jwtMiddleware.verifyToken(), (req, res) => {
      res.json({ message: 'Get user bookings endpoint - to be implemented' })
    })
  }

  getRouter = () => {
    return this.router
  }
}
