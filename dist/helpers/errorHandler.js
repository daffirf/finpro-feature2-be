"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(res, message, statusCode = 500, data = null) {
    return res.status(statusCode).json({
        status: false,
        message,
        data
    });
}
