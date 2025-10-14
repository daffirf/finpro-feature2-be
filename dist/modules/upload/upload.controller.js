"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const upload_service_1 = require("./upload.service");
class UploadController {
    constructor() {
        this.getFile = async (req, res, next) => {
            try {
                // Get path from request path, removing /uploads prefix
                const requestPath = req.path.startsWith('/') ? req.path.substring(1) : req.path;
                const filePath = requestPath ? requestPath.split('/') : [];
                if (!filePath.length) {
                    return res.status(400).json({ error: 'File path is required' });
                }
                const result = await this.uploadService.getFile(filePath);
                // Set headers
                Object.entries(result.headers).forEach(([key, value]) => {
                    res.setHeader(key, value);
                });
                // Send file
                res.send(result.file);
            }
            catch (error) {
                next(error);
            }
        };
        this.uploadService = new upload_service_1.UploadService();
    }
}
exports.UploadController = UploadController;
