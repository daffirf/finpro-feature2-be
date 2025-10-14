"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_validator_1 = require("@/modules/validator/auth.validator");
const jwt_middleware_1 = require("@/middlewares/jwt.middleware");
class AuthRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.authController = new auth_controller_1.AuthController();
        this.jwtMiddleware = new jwt_middleware_1.JwtMiddleware();
        this.initializedRoutes();
    }
    initializedRoutes() {
        // Public routes
        this.router.post("/register", auth_validator_1.validateRegister, this.authController.register);
        this.router.post("/login", auth_validator_1.validateLogin, this.authController.login);
        this.router.post("/logout", this.authController.logout);
        // Protected routes (require authentication)
        this.router.get("/users", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET), this.authController.getAllUsers);
        this.router.get("/profile/:id", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET), this.authController.getUserById);
        this.router.get("/me", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET), this.authController.getMe);
        this.router.patch("/update/:id", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET), auth_validator_1.validateUpdateUser, this.authController.updateUser);
        this.router.delete("/delete/:id", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET), this.authController.deleteUser);
        this.router.patch("/change-password/:id", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET), auth_validator_1.validateChangePassword, this.authController.changePassword);
        this.router.patch("/reset-password/:id", this.jwtMiddleware.verifyToken(process.env.JWT_SECRET), auth_validator_1.validateResetPassword, this.authController.resetPassword);
    }
}
exports.AuthRouter = AuthRouter;
