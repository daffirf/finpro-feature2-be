import { Router } from "express";
import { AuthController } from "./auth.controller";
import { JwtMiddleware } from "@/middlewares/jwt.middleware";
import { validateAuth } from "@/middlewares/validate.middleware";
import { changePasswordSchema, loginSchema, registerSchema, resetPasswordSchema, updateUserSchema } from "./validator/auth.validator";
export type { 
  RegisterInput as RegisterDTO,
  LoginInput as LoginDTO,
  UpdateUserInput as UpdateUserDTO,
  ChangePasswordInput as ChangePasswordDTO,
  ResetPasswordInput as ResetPasswordDTO
} from '../auth/validator/auth.validator';

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
    // Public routes
    this.router.post("/register", validateAuth(registerSchema), this.authController.register);
    this.router.post("/login", validateAuth(loginSchema), this.authController.login);
    this.router.post("/logout", this.authController.logout);
    
    // Protected routes
    const auth = this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!);
    
    this.router.get("/users", auth, this.authController.getAllUsers);
    this.router.get("/profile/:id", auth, this.authController.getUserById);
    this.router.get("/me", auth, this.authController.getMe);
    
    this.router.patch("/update/:id", auth, validateAuth(updateUserSchema), this.authController.updateUser);
    this.router.delete("/delete/:id", auth, this.authController.deleteUser);
    
    this.router.patch("/change-password/:id", auth, validateAuth(changePasswordSchema), this.authController.changePassword);
    this.router.patch("/reset-password/:id", auth, validateAuth(resetPasswordSchema), this.authController.resetPassword);
  }

  getRouter = () => {
    return this.router;
  };
}