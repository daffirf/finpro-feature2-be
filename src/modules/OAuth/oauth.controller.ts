import { Request, Response, NextFunction } from 'express';
import { OAuthService } from './oauth.service';
import { ApiError } from '@/utils/api-error';

export class OAuthController {
  private oauthService: OAuthService;

  constructor() {
    this.oauthService = new OAuthService();
  }

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, role } = req.body;

      if (!token) {
        throw new ApiError(400, 'Google token is required');
      }

      if (role && role !== 'user' && role !== 'tenant') {
        throw new ApiError(400, 'Invalid role. Must be "user" or "tenant"');
      }

      const result = await this.oauthService.googleLogin(token, role);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

