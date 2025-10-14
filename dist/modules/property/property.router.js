"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRouter = void 0;
const express_1 = require("express");
const property_controller_1 = require("./property.controller");
class PropertyRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.propertyController = new property_controller_1.PropertyController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Public routes - no authentication required
        // Search properties
        this.router.get('/search', this.propertyController.searchProperties);
        // Get property by ID
        this.router.get('/:id', this.propertyController.getPropertyById);
        // Get property prices
        this.router.get('/:id/prices', this.propertyController.getPropertyPrices);
    }
}
exports.PropertyRouter = PropertyRouter;
