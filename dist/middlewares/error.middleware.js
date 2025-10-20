"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorMiddleware = (err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = err.message || "Something went wrong!";
    const details = err.details;
    res.status(status).send({
        message,
        ...(details && { details })
    });
};
exports.errorMiddleware = errorMiddleware;
