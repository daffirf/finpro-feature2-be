import { Router } from 'express'
import { PropertyController } from './property.controller'

export class PropertyRouter {
  private router: Router
  private propertyController: PropertyController

  constructor() {
    this.router = Router()
    this.propertyController = new PropertyController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    // Public routes - no authentication required
    
    // Search properties
    this.router.get('/search', this.propertyController.searchProperties)
    
    // Get property by ID
    this.router.get('/:id', this.propertyController.getPropertyById)
    
    // Get property prices
    this.router.get('/:id/prices', this.propertyController.getPropertyPrices)
  }

  getRouter = () => {
    return this.router
  }
}
