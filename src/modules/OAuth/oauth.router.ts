import { Router } from 'express';
import { OAuthController } from './oauth.controller';

export class OAuthRouter {
  private router: Router;
  private oauthController: OAuthController;

  constructor() {
    this.router = Router();
    this.oauthController = new OAuthController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/google', this.oauthController.googleLogin);
  }

  getRouter = () => {
    return this.router;
  };
}

