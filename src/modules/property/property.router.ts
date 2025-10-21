import { Router } from 'express'
import { PropertyController } from './property.controller'
import { JwtMiddleware } from '@/middlewares/jwt.middleware'
import { rbac } from '@/middlewares/rbac.middleware'
import { uploadImage, handleMulterError } from '@/config/multer.config'
import { validateAuth } from '@/middlewares/validate.middleware'
import { createPropertySchema } from './validator/property.validator'

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
    
    this.router.get('/search', this.propertyController.searchProperties)
    this.router.get('/my-properties', auth, rbac.onlyTenant, this.propertyController.getMyProperties)
    this.router.get('/:id', this.propertyController.getPropertyById)
    this.router.get('/:id/prices', this.propertyController.getPropertyPrices)
    
    this.router.post(
      '/', 
      auth, 
      rbac.onlyTenant, 
      uploadImage.single('image'), 
      handleMulterError,
      validateAuth(createPropertySchema),
      this.propertyController.createProperty
    )
    
    this.router.patch(
      '/:id', 
      auth, 
      rbac.onlyTenant, 
      uploadImage.single('image'),
      handleMulterError,
      this.propertyController.updateProperty
    )
    
    this.router.delete('/:id', auth, rbac.onlyTenant, this.propertyController.deleteProperty)
  }

  getRouter = () => {
    return this.router
  }
}
