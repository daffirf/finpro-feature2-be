import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { ApiError } from "@/utils/api-error";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getAllUsers();
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.userService.getUserById(id);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }
      const result = await this.userService.getUserById(userId);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      const currentUserId = (req as any).user?.id;
      const currentUserRole = (req as any).user?.role;
      
      // User can only update their own profile unless they're admin
      if (id !== currentUserId && currentUserRole !== 'admin') {
        throw new ApiError(403, "Forbidden: You can only update your own profile");
      }
      
      const result = await this.userService.updateUser(id, userData);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const currentUserId = (req as any).user?.id;
      const currentUserRole = (req as any).user?.role;
      
      // User can only delete their own account unless they're admin
      if (id !== currentUserId && currentUserRole !== 'admin') {
        throw new ApiError(403, "Forbidden: You can only delete your own account");
      }
      
      const result = await this.userService.deleteUser(id);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}

