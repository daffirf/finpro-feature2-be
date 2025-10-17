"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadRouter = void 0;
const express_1 = require("express");
const upload_controller_1 = require("./upload.controller");
class UploadRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.uploadController = new upload_controller_1.UploadController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Serve files from uploads directory
        // Handle nested paths
        this.router.get('/:folder/:filename', this.uploadController.getFile);
        this.router.get('/:filename', this.uploadController.getFile);
    }
}
exports.UploadRouter = UploadRouter;
