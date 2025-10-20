"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    constructor() {
        this.register = async (req, res, next) => {
            try {
                const result = await this.authService.register(req.body);
                res.status(201).send(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const result = await this.authService.login(req.body);
                res.status(200).send(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.logout = async (req, res, next) => {
            // For JWT-based auth, logout is typically handled client-side
            // This endpoint confirms logout and can be used for logging/analytics
            res.status(200).send({ message: 'Logout successful' });
        };
        this.changePassword = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const { oldPassword, newPassword } = req.body;
                const result = await this.authService.changePassword(userId, oldPassword, newPassword);
                res.status(200).send(result);
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
                res.status(200).send(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
