import { Router } from "express";
import { AuthController } from "./auth.controller";
import { JwtMiddleware } from "@/middlewares/jwt.middleware";
import { validateAuth } from "@/middlewares/validate.middleware";
import { changePasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "./validator/auth.validator";

export type { 
  RegisterInput as RegisterDTO,
  LoginInput as LoginDTO,
  ChangePasswordInput as ChangePasswordDTO,
  ResetPasswordInput as ResetPasswordDTO
} from './validator/auth.validator';

export class AuthRouter {
  private router: Router;
  private authController: AuthController;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializedRoutes();
  }

  private initializedRoutes() {
    // Public routes - Authentication
    this.router.post("/register", validateAuth(registerSchema), this.authController.register);
    this.router.post("/login", validateAuth(loginSchema), this.authController.login);
    this.router.post("/logout", this.authController.logout);
    
    // Protected routes - Password management
    const auth = this.jwtMiddleware.verifyToken();
    this.router.patch("/change-password", auth, validateAuth(changePasswordSchema), this.authController.changePassword);
    this.router.patch("/reset-password", auth, validateAuth(resetPasswordSchema), this.authController.resetPassword);
  }

  getRouter = () => {
    return this.router;
  };
}
