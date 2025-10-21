import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { RegisterDTO, SetPasswordDTO, VerifyEmailDTO } from "./dto/auth.dto";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/register
   * Register without password - sends verification email
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RegisterDTO = req.body;
      const result = await this.authService.register(data);
      
      res.status(201).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/auth/verify-email?token=xxx
   * Check token validity before setting password
   */
  verifyEmailToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Token is required'
        });
      }

      const result = await this.authService.verifyEmailToken({ token });
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/set-password
   * Set password after email verification
   */
  setPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: SetPasswordDTO = req.body;
      const result = await this.authService.setPassword(data);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/forgot-password
   * Request password reset email
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await this.authService.forgotPassword(email);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/reset-password-with-token
   * Reset password using token from email (public endpoint)
   */
  resetPasswordWithToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      const result = await this.authService.resetPasswordWithToken(token, password);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    // For JWT-based auth, logout is typically handled client-side
    // This endpoint confirms logout and can be used for logging/analytics
    res.status(200).json({ 
      success: true,
      message: 'Logout successful' 
    });
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const { oldPassword, newPassword } = req.body;
      const result = await this.authService.changePassword(userId, oldPassword, newPassword);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const { password } = req.body;
      const result = await this.authService.resetPassword(userId, password);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };
}
