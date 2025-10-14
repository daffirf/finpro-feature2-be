"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const errors_1 = require("@/lib/errors");
class UploadService {
    async getFile(filePath) {
        try {
            const fullPath = (0, path_1.join)(process.cwd(), 'uploads', ...filePath);
            // Check if file exists
            await (0, promises_1.access)(fullPath);
            // Read file
            const file = await (0, promises_1.readFile)(fullPath);
            // Determine content type based on file extension
            const extension = filePath[filePath.length - 1].split('.').pop()?.toLowerCase();
            const contentType = this.getContentType(extension || '');
            return {
                file,
                contentType,
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                }
            };
        }
        catch (error) {
            throw new errors_1.ApiError(404, 'File not found');
        }
    }
    getContentType(extension) {
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'json': 'application/json'
        };
        return mimeTypes[extension] || 'application/octet-stream';
    }
}
exports.UploadService = UploadService;
