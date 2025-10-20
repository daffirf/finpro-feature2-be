"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuth = void 0;
const zod_1 = require("zod");
const api_error_1 = require("@/utils/api-error");
const validateAuth = (schema) => {
    return async (req, res, next) => {
        try {
            // Validate request body
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Ambil error pertama untuk consistency dengan validator lama
                const firstError = error.errors[0];
                const message = firstError.message;
                next(new api_error_1.ApiError(400, message));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateAuth = validateAuth;
