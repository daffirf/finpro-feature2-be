import { Router } from 'express';
import { UserController } from './user.controller';
import { JwtMiddleware } from '@/middlewares/jwt.middleware';
import { rbac } from '@/middlewares/rbac.middleware';
import { validateAuth } from '@/middlewares/validate.middleware';
import { updateUserSchema } from './validator/user.validator';

export class UserRouter {
  private router: Router;
  private userController: UserController;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const auth = this.jwtMiddleware.verifyToken();

    // Get current user profile - requires login only (verified or not)
    this.router.get('/me', auth, rbac.requireLogin, this.userController.getMe);
    
    // Get all users - requires verified account (any role)
    this.router.get('/', auth, rbac.anyVerifiedRole, this.userController.getAllUsers);
    
    // Get user by ID - requires verified account
    this.router.get('/:id', auth, rbac.anyVerifiedRole, this.userController.getUserById);
    
    // Update user - requires ownership (user can only update their own profile)
    this.router.patch('/:id', auth, rbac.checkOwnership('id'), validateAuth(updateUserSchema), this.userController.updateUser);
    
    // Delete user - requires ownership (user can only delete their own account)
    this.router.delete('/:id', auth, rbac.checkOwnership('id'), this.userController.deleteUser);
  }

  getRouter = () => {
    return this.router;
  };
}
