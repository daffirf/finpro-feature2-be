import { Router } from 'express'
import { RoomController } from './room.controller'

export class RoomRouter {
  private router: Router
  private roomController: RoomController

  constructor() {
    this.router = Router()
    this.roomController = new RoomController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    // Public routes
    this.router.get('/:id/price', this.roomController.getRoomPrice)
  }

  getRouter = () => {
    return this.router
  }
}
