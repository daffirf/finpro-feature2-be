"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRouter = void 0;
const express_1 = require("express");
const property_controller_1 = require("./property.controller");
const jwt_middleware_1 = require("@/middlewares/jwt.middleware");
class PropertyRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.propertyController = new property_controller_1.PropertyController();
        this.jwtMiddleware = new jwt_middleware_1.JwtMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        const auth = this.jwtMiddleware.verifyToken();
        // Public routes - no authentication required
        // Search properties
        this.router.get('/search', this.propertyController.searchProperties);
        // Get property by ID
        this.router.get('/:id', this.propertyController.getPropertyById);
        // Get property prices
        this.router.get('/:id/prices', this.propertyController.getPropertyPrices);
        // Protected routes - Only TENANT can manage properties
        // Note: Uncomment these when PropertyController has these methods
        // this.router.post('/', auth, rbac.onlyTenant, this.propertyController.createProperty)
        // this.router.patch('/:id', auth, rbac.onlyTenant, this.propertyController.updateProperty)
        // this.router.delete('/:id', auth, rbac.onlyTenant, this.propertyController.deleteProperty)
        // this.router.get('/my-properties', auth, rbac.onlyTenant, this.propertyController.getMyProperties)
    }
}
exports.PropertyRouter = PropertyRouter;
