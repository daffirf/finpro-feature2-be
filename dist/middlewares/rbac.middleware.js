"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rbac = exports.RBACMiddleware = void 0;
const api_error_1 = require("@/utils/api-error");
class RBACMiddleware {
    constructor() {
        /**
         * Require user to be logged in
         * Usage: rbac.requireLogin
         */
        this.requireLogin = (req, res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    throw new api_error_1.UnauthorizedError("You must login first");
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Require user email to be verified
         * Usage: rbac.requireVerified
         */
        this.requireVerified = (req, res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    throw new api_error_1.UnauthorizedError("You must login first");
                }
                // Jika isEmailVerified tidak ada di JWT, anggap false
                if (user.isEmailVerified === false) {
                    throw new api_error_1.ForbiddenError("Email verification required. Please verify your email address.");
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * Only verified TENANT can access
         * Usage: rbac.onlyTenant
         */
        this.onlyTenant = (req, res, next) => {
            return this.requireRoles(['tenant'], true)(req, res, next);
        };
        /**
         * Only verified USER can access
         * Usage: rbac.onlyUser
         */
        this.onlyUser = (req, res, next) => {
            return this.requireRoles(['user'], true)(req, res, next);
        };
        /**
         * Both user and tenant can access (but must be verified)
         * Usage: rbac.anyVerifiedRole
         */
        this.anyVerifiedRole = (req, res, next) => {
            return this.requireRoles(['user', 'tenant'], true)(req, res, next);
        };
    }
    /**
     * Check if user has required roles
     * Usage: rbac.checkRole(['tenant']) or rbac.checkRole(['user', 'tenant'])
     */
    checkRole(requiredRoles) {
        return (req, res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    throw new api_error_1.UnauthorizedError("Authentication required. Please login first.");
                }
                if (!user.role || !requiredRoles.includes(user.role)) {
                    throw new api_error_1.ForbiddenError(`Access denied. Required role: ${requiredRoles.join(" or ")}`);
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
    /**
     * Require specific roles AND email verification
     * Usage: rbac.requireRoles(['tenant'])
     */
    requireRoles(requiredRoles, requireVerification = true) {
        return (req, res, next) => {
            try {
                const user = req.user;
                // Check login
                if (!user) {
                    throw new api_error_1.UnauthorizedError("Authentication required. Please login first.");
                }
                // Check role
                if (!user.role || !requiredRoles.includes(user.role)) {
                    throw new api_error_1.ForbiddenError(`Access denied. This feature is only available for ${requiredRoles.join(" or ")}.`);
                }
                // Check email verification (optional)
                if (requireVerification && user.isEmailVerified === false) {
                    throw new api_error_1.ForbiddenError("Email verification required. Please verify your email to access this feature.");
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
    /**
     * Prevent cross-role access
     * Tenant cannot access user features and vice versa
     * Usage: rbac.preventCrossRole(['user'])
     */
    preventCrossRole(allowedRoles) {
        return (req, res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    throw new api_error_1.UnauthorizedError("Authentication required");
                }
                if (!allowedRoles.includes(user.role)) {
                    const roleType = user.role === 'tenant' ? 'tenant' : 'user';
                    throw new api_error_1.ForbiddenError(`This feature is not available for ${roleType} accounts. Please use the appropriate ${roleType} features.`);
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
    /**
     * Check if user owns the resource
     * Usage: rbac.checkOwnership('userId') or rbac.checkOwnership('tenantId')
     */
    checkOwnership(paramKey = 'id') {
        return (req, res, next) => {
            try {
                const user = req.user;
                const resourceOwnerId = parseInt(req.params[paramKey]);
                if (!user) {
                    throw new api_error_1.UnauthorizedError("Authentication required");
                }
                if (user.id !== resourceOwnerId) {
                    throw new api_error_1.ForbiddenError("You can only access your own resources");
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.RBACMiddleware = RBACMiddleware;
// Export singleton instance
exports.rbac = new RBACMiddleware();
