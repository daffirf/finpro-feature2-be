"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successHandler = successHandler;
function successHandler(res, data = null, message, statusCode = 200) {
    return res.status(statusCode).json(({
        status: true,
        message,
        data
    }));
}
