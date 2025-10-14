import { Router } from 'express'
import { JwtMiddleware } from '@/middlewares/jwt.middleware'

export class ReviewRouter {
  private router: Router
  private jwtMiddleware: JwtMiddleware

  constructor() {
    this.router = Router()
    this.jwtMiddleware = new JwtMiddleware()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    // Create review (requires authentication)
    this.router.post('/', this.jwtMiddleware.verifyToken(), (req, res) => {
      res.json({ message: 'Create review endpoint - to be implemented' })
    })

    // Get reviews for property/booking
    this.router.get('/', (req, res) => {
      res.json({ message: 'Get reviews endpoint - to be implemented' })
    })

    // Respond to review (tenant only)
    this.router.post('/:id/response', this.jwtMiddleware.verifyToken(), (req, res) => {
      res.json({ message: 'Respond to review endpoint - to be implemented' })
    })
  }

  getRouter = () => {
    return this.router
  }
}
