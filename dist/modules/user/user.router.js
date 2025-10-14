"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const jwt_middleware_1 = require("@/middlewares/jwt.middleware");
class UserRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.jwtMiddleware = new jwt_middleware_1.JwtMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // User bookings (requires authentication)
        this.router.get('/bookings', this.jwtMiddleware.verifyToken(), (req, res) => {
            res.json({ message: 'Get user bookings endpoint - to be implemented' });
        });
    }
}
exports.UserRouter = UserRouter;
