"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const upload_service_1 = require("./upload.service");
class UploadController {
    constructor() {
        this.getFile = async (req, res, next) => {
            try {
                // Get file path from route parameters
                const { folder, filename } = req.params;
                if (!filename) {
                    return res.status(400).json({ error: 'File path is required' });
                }
                // Build file path array
                const filePath = folder ? [folder, filename] : [filename];
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
