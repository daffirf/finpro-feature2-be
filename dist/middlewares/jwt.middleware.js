"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtMiddleware = void 0;
const auth_utils_1 = require("@/utils/auth.utils");
const api_error_1 = require("@/utils/api-error");
class JwtMiddleware {
    constructor() {
        this.verifyToken = (secretKey) => {
            return (req, res, next) => {
                const token = req.headers.authorization?.split(" ")[1];
                if (!token)
                    throw new api_error_1.ApiError(401, "Unauthorized");
                // Use centralized verifyToken
                const payload = (0, auth_utils_1.verifyToken)(token);
                if (!payload) {
                    throw new api_error_1.ApiError(401, "Token expired or invalid");
                }
                req.user = payload;
                next();
            };
        };
    }
}
exports.JwtMiddleware = JwtMiddleware;
