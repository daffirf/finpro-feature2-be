import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRegister, validateLogin, validateUpdateUser, validateChangePassword, validateResetPassword } from "@/modules/validator/auth.validator";
import { JwtMiddleware } from "@/middlewares/jwt.middleware";

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
    this.router.post("/register", validateRegister, this.authController.register);
    this.router.post("/login", validateLogin, this.authController.login);
    this.router.post("/logout", this.authController.logout);
    
    // Protected routes (require authentication)
    this.router.get("/users", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!), this.authController.getAllUsers);
    this.router.get("/profile/:id", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!), this.authController.getUserById);
    this.router.get("/me", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!), this.authController.getMe);
    
    this.router.patch("/update/:id", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!), validateUpdateUser, this.authController.updateUser);
    this.router.delete("/delete/:id", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!), this.authController.deleteUser);
    
    this.router.patch("/change-password/:id", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!), validateChangePassword, this.authController.changePassword);
    this.router.patch("/reset-password/:id", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!), validateResetPassword, this.authController.resetPassword);
  }

  getRouter = () => {
    return this.router;
  };
}
