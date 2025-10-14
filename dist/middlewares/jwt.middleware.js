"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtMiddleware = void 0;
const auth_1 = require("@/lib/auth");
const errors_1 = require("@/lib/errors");
class JwtMiddleware {
    constructor() {
        this.verifyToken = (secretKey) => {
            return (req, res, next) => {
                const token = req.headers.authorization?.split(" ")[1];
                if (!token)
                    throw new errors_1.ApiError(401, "Unauthorized");
                // Use centralized verifyToken function from auth.ts
                const payload = (0, auth_1.verifyToken)(token);
                if (!payload) {
                    throw new errors_1.ApiError(401, "Token expired or invalid");
                }
                req.user = payload;
                next();
            };
        };
    }
}
exports.JwtMiddleware = JwtMiddleware;
