import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.authService.register(req.body);
    res.status(201).send(result);
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.authService.login(req.body);
    res.status(200).send(result);
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const result = await this.authService.getAllUsers();
    res.status(200).send(result);
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await this.authService.getUserId(id);
    res.status(200).send(result);
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id || (req as any).user?.userId;
    const result = await this.authService.getMe(userId);
    res.status(200).send(result);
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const userData = req.body;
    const result = await this.authService.updateUser(id, userData);
    res.status(200).send(result);
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await this.authService.deleteUser(id);
    res.status(200).send(result);
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id || (req as any).user?.userId;
    const { oldPassword, newPassword } = req.body;
    const result = await this.authService.changePassword(userId, oldPassword, newPassword);
    res.status(200).send(result);
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id || (req as any).user?.userId;
    const { password } = req.body;
    const result = await this.authService.resetPassword(userId, password);
    res.status(200).send(result);
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    // For JWT-based auth, logout is typically handled client-side
    // This endpoint confirms logout and can be used for logging/analytics
    res.status(200).send({ message: 'Logout successful' });
  };
}
