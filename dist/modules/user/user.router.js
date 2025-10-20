"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const jwt_middleware_1 = require("@/middlewares/jwt.middleware");
const validate_middleware_1 = require("@/middlewares/validate.middleware");
const user_validator_1 = require("./validator/user.validator");
class UserRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.userController = new user_controller_1.UserController();
        this.jwtMiddleware = new jwt_middleware_1.JwtMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        const auth = this.jwtMiddleware.verifyToken();
        // All user routes require authentication
        this.router.get('/me', auth, this.userController.getMe);
        this.router.get('/', auth, this.userController.getAllUsers); // Admin only ideally
        this.router.get('/:id', auth, this.userController.getUserById);
        this.router.patch('/:id', auth, (0, validate_middleware_1.validateAuth)(user_validator_1.updateUserSchema), this.userController.updateUser);
        this.router.delete('/:id', auth, this.userController.deleteUser);
    }
}
exports.UserRouter = UserRouter;
