"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRouter = void 0;
const express_1 = require("express");
const jwt_middleware_1 = require("@/middlewares/jwt.middleware");
class ReviewRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.jwtMiddleware = new jwt_middleware_1.JwtMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Create review (requires authentication)
        this.router.post('/', this.jwtMiddleware.verifyToken(), (req, res) => {
            res.json({ message: 'Create review endpoint - to be implemented' });
        });
        // Get reviews for property/booking
        this.router.get('/', (req, res) => {
            res.json({ message: 'Get reviews endpoint - to be implemented' });
        });
        // Respond to review (tenant only)
        this.router.post('/:id/response', this.jwtMiddleware.verifyToken(), (req, res) => {
            res.json({ message: 'Respond to review endpoint - to be implemented' });
        });
    }
}
exports.ReviewRouter = ReviewRouter;
