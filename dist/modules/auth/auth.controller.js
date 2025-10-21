"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    constructor() {
        /**
         * POST /api/auth/register
         * Register without password - sends verification email
         */
        this.register = async (req, res, next) => {
            try {
                const data = req.body;
                const result = await this.authService.register(data);
                res.status(201).json({
                    success: true,
                    ...result
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * GET /api/auth/verify-email?token=xxx
         * Check token validity before setting password
         */
        this.verifyEmailToken = async (req, res, next) => {
            try {
                const { token } = req.query;
                if (!token || typeof token !== 'string') {
                    return res.status(400).json({
                        success: false,
                        error: 'Token is required'
                    });
                }
                const result = await this.authService.verifyEmailToken({ token });
                res.json({
                    success: true,
                    ...result
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /api/auth/set-password
         * Set password after email verification
         */
        this.setPassword = async (req, res, next) => {
            try {
                const data = req.body;
                const result = await this.authService.setPassword(data);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /api/auth/forgot-password
         * Request password reset email
         */
        this.forgotPassword = async (req, res, next) => {
            try {
                const { email } = req.body;
                const result = await this.authService.forgotPassword(email);
                res.json({
                    success: true,
                    ...result
                });
            }
            catch (error) {
                next(error);
            }
        };
        /**
         * POST /api/auth/reset-password-with-token
         * Reset password using token from email (public endpoint)
         */
        this.resetPasswordWithToken = async (req, res, next) => {
            try {
                const { token, password } = req.body;
                const result = await this.authService.resetPasswordWithToken(token, password);
                res.json({
                    success: true,
                    ...result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const result = await this.authService.login(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.logout = async (req, res, next) => {
            // For JWT-based auth, logout is typically handled client-side
            // This endpoint confirms logout and can be used for logging/analytics
            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        };
        this.changePassword = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const { oldPassword, newPassword } = req.body;
                const result = await this.authService.changePassword(userId, oldPassword, newPassword);
                res.status(200).json({
                    success: true,
                    ...result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.resetPassword = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const { password } = req.body;
                const result = await this.authService.resetPassword(userId, password);
                res.status(200).json({
                    success: true,
                    ...result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
