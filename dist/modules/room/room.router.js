"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomRouter = void 0;
const express_1 = require("express");
class RoomRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get room price
        this.router.get('/:id/price', (req, res) => {
            res.json({ message: 'Get room price endpoint - to be implemented' });
        });
    }
}
exports.RoomRouter = RoomRouter;
