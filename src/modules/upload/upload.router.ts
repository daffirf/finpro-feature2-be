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
    // Handle nested paths
    this.router.get('/:folder/:filename', this.uploadController.getFile)
    this.router.get('/:filename', this.uploadController.getFile)
  }

  getRouter = () => {
    return this.router
  }
}
