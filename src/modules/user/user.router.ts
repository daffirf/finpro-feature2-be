import { Router } from 'express';
import { UserController } from './user.controller';
import { JwtMiddleware } from '@/middlewares/jwt.middleware';
import { rbac } from '@/middlewares/rbac.middleware';
import { validateAuth } from '@/middlewares/validate.middleware';
import { updateUserSchema } from './validator/user.validator';
import { uploadImage, handleMulterError } from '@/config/multer.config';

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

    this.router.get('/me', auth, rbac.requireLogin, this.userController.getMe);
    this.router.get('/', auth, rbac.anyVerifiedRole, this.userController.getAllUsers);
    this.router.get('/:id', auth, rbac.anyVerifiedRole, this.userController.getUserById);
    this.router.patch('/:id', auth, rbac.checkOwnership('id'), validateAuth(updateUserSchema), this.userController.updateUser);
    this.router.post('/:id/avatar', auth, rbac.checkOwnership('id'), uploadImage.single('avatar'), handleMulterError, this.userController.uploadAvatar);
    this.router.delete('/:id', auth, rbac.checkOwnership('id'), this.userController.deleteUser);
  }

  getRouter = () => {
    return this.router;
  };
}
