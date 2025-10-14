import { Router } from 'express'
import { UploadController } from './upload.controller'

export class UploadRouter {
  private router: Router
  private uploadController: UploadController

  constructor() {
    this.router = Router()
    this.uploadController = new UploadController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    // Serve files from uploads directory
    // Handle all paths with wildcard
    this.router.get('*', this.uploadController.getFile)
  }

  getRouter = () => {
    return this.router
  }
}
