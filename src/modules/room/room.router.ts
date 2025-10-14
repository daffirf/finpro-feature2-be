import { Router } from 'express'

export class RoomRouter {
  private router: Router

  constructor() {
    this.router = Router()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    // Get room price
    this.router.get('/:id/price', (req, res) => {
      res.json({ message: 'Get room price endpoint - to be implemented' })
    })
  }

  getRouter = () => {
    return this.router
  }
}
