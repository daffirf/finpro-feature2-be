"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRouter = void 0;
const express_1 = require("express");
const jwt_middleware_1 = require("@/middlewares/jwt.middleware");
class TenantRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.jwtMiddleware = new jwt_middleware_1.JwtMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // All tenant routes require authentication and tenant role
        this.router.use(this.jwtMiddleware.verifyToken());
        // Tenant bookings management
        this.router.get('/bookings', (req, res) => {
            res.json({ message: 'Get tenant bookings endpoint - to be implemented' });
        });
        this.router.post('/bookings/:id/confirm', (req, res) => {
            res.json({ message: 'Confirm booking endpoint - to be implemented' });
        });
        this.router.post('/bookings/:id/reject', (req, res) => {
            res.json({ message: 'Reject booking endpoint - to be implemented' });
        });
        // Properties management
        this.router.get('/properties', (req, res) => {
            res.json({ message: 'Get tenant properties endpoint - to be implemented' });
        });
        this.router.get('/properties/:id', (req, res) => {
            res.json({ message: 'Get tenant property by ID endpoint - to be implemented' });
        });
        // Price rules management
        this.router.get('/price-rules', (req, res) => {
            res.json({ message: 'Get price rules endpoint - to be implemented' });
        });
        this.router.post('/price-rules', (req, res) => {
            res.json({ message: 'Create price rule endpoint - to be implemented' });
        });
        // Rooms management
        this.router.get('/rooms', (req, res) => {
            res.json({ message: 'Get tenant rooms endpoint - to be implemented' });
        });
        // Reports
        this.router.get('/reports', (req, res) => {
            res.json({ message: 'Get tenant reports endpoint - to be implemented' });
        });
    }
}
exports.TenantRouter = TenantRouter;
