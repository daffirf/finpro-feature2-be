import { Router } from 'express'
import { PropertyController } from './property.controller'
import { JwtMiddleware } from '@/middlewares/jwt.middleware'
import { rbac } from '@/middlewares/rbac.middleware'

export class PropertyRouter {
  private router: Router
  private propertyController: PropertyController
  private jwtMiddleware: JwtMiddleware

  constructor() {
    this.router = Router()
    this.propertyController = new PropertyController()
    this.jwtMiddleware = new JwtMiddleware()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    const auth = this.jwtMiddleware.verifyToken()
    
    // Public routes - no authentication required
    // Search properties
    this.router.get('/search', this.propertyController.searchProperties)
    
    // Get property by ID
    this.router.get('/:id', this.propertyController.getPropertyById)
    
    // Get property prices
    this.router.get('/:id/prices', this.propertyController.getPropertyPrices)
    
    // Protected routes - Only TENANT can manage properties
    // Note: Uncomment these when PropertyController has these methods
    // this.router.post('/', auth, rbac.onlyTenant, this.propertyController.createProperty)
    // this.router.patch('/:id', auth, rbac.onlyTenant, this.propertyController.updateProperty)
    // this.router.delete('/:id', auth, rbac.onlyTenant, this.propertyController.deleteProperty)
    // this.router.get('/my-properties', auth, rbac.onlyTenant, this.propertyController.getMyProperties)
  }

  getRouter = () => {
    return this.router
  }
}
