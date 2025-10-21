"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const jwt_middleware_1 = require("@/middlewares/jwt.middleware");
const rbac_middleware_1 = require("@/middlewares/rbac.middleware");
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
        // Get current user profile - requires login only (verified or not)
        this.router.get('/me', auth, rbac_middleware_1.rbac.requireLogin, this.userController.getMe);
        // Get all users - requires verified account (any role)
        this.router.get('/', auth, rbac_middleware_1.rbac.anyVerifiedRole, this.userController.getAllUsers);
        // Get user by ID - requires verified account
        this.router.get('/:id', auth, rbac_middleware_1.rbac.anyVerifiedRole, this.userController.getUserById);
        // Update user - requires ownership (user can only update their own profile)
        this.router.patch('/:id', auth, rbac_middleware_1.rbac.checkOwnership('id'), (0, validate_middleware_1.validateAuth)(user_validator_1.updateUserSchema), this.userController.updateUser);
        // Delete user - requires ownership (user can only delete their own account)
        this.router.delete('/:id', auth, rbac_middleware_1.rbac.checkOwnership('id'), this.userController.deleteUser);
    }
}
exports.UserRouter = UserRouter;
