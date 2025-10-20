import { Router } from 'express';
import { UserController } from './user.controller';
import { JwtMiddleware } from '@/middlewares/jwt.middleware';
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

    // All user routes require authentication
    this.router.get('/me', auth, this.userController.getMe);
    this.router.get('/', auth, this.userController.getAllUsers); // Admin only ideally
    this.router.get('/:id', auth, this.userController.getUserById);
    this.router.patch('/:id', auth, validateAuth(updateUserSchema), this.userController.updateUser);
    this.router.delete('/:id', auth, this.userController.deleteUser);
  }

  getRouter = () => {
    return this.router;
  };
}
