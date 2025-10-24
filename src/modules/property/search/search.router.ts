import { Router } from 'express'
import { SearchController } from './search.controller'

export class SearchRouter {
  private router: Router
  private searchController: SearchController

  constructor() {
    this.router = Router()
    this.searchController = new SearchController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get('/', this.searchController.searchProperties)
  }

  getRouter = () => {
    return this.router
  }
}

