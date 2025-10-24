import { Router } from 'express'
import { PropertyController } from './property.controller'
import { SearchRouter } from './search/search.router'
import { JwtMiddleware } from '@/middlewares/jwt.middleware'
import { rbac } from '@/middlewares/rbac.middleware'
import { uploadImage, handleMulterError } from '@/config/multer.config'
import { validateAuth } from '@/middlewares/validate.middleware'
import { createPropertySchema } from './validator/property.validator'

export class PropertyRouter {
  private router: Router
  private propertyController: PropertyController
  private searchRouter: SearchRouter
  private jwtMiddleware: JwtMiddleware

  constructor() {
    this.router = Router()
    this.propertyController = new PropertyController()
    this.searchRouter = new SearchRouter()
    this.jwtMiddleware = new JwtMiddleware()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    const auth = this.jwtMiddleware.verifyToken()
    
    this.router.use('/search', this.searchRouter.getRouter())
    this.router.get('/my-properties', auth, rbac.onlyTenant, this.propertyController.getMyProperties)
    this.router.get('/:id/details', this.propertyController.getPropertyDetails)
    this.router.get('/:id/prices', this.propertyController.getPropertyPrices)
    this.router.get('/:id', this.propertyController.getPropertyById)
    
    this.router.post(
      '/', 
      auth, 
      rbac.onlyTenant, 
      uploadImage.single('image'), 
      handleMulterError,
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
