"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const jwt_middleware_1 = require("@/middlewares/jwt.middleware");
const validate_middleware_1 = require("@/middlewares/validate.middleware");
const auth_validator_1 = require("./validator/auth.validator");
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
        // Public routes - Registration & Email Verification
        this.router.post("/register", (0, validate_middleware_1.validateAuth)(auth_validator_1.registerSchema), this.authController.register);
        this.router.get("/verify-email", this.authController.verifyEmailToken);
        this.router.post("/set-password", (0, validate_middleware_1.validateAuth)(auth_validator_1.setPasswordSchema), this.authController.setPassword);
        // Public routes - Authentication
        this.router.post("/login", (0, validate_middleware_1.validateAuth)(auth_validator_1.loginSchema), this.authController.login);
        this.router.post("/logout", this.authController.logout);
        // Public routes - Password Reset (via email)
        this.router.post("/forgot-password", this.authController.forgotPassword);
        this.router.post("/reset-password-with-token", this.authController.resetPasswordWithToken);
        // Protected routes - Password management
        const auth = this.jwtMiddleware.verifyToken();
        this.router.patch("/change-password", auth, (0, validate_middleware_1.validateAuth)(auth_validator_1.changePasswordSchema), this.authController.changePassword);
        this.router.patch("/reset-password", auth, (0, validate_middleware_1.validateAuth)(auth_validator_1.resetPasswordSchema), this.authController.resetPassword);
    }
}
exports.AuthRouter = AuthRouter;
