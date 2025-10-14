"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
class AuthController {
    constructor() {
        this.register = async (req, res, next) => {
            const result = await this.authService.register(req.body);
            res.status(201).send(result);
        };
        this.login = async (req, res, next) => {
            const result = await this.authService.login(req.body);
            res.status(200).send(result);
        };
        this.getAllUsers = async (req, res, next) => {
            const result = await this.authService.getAllUsers();
            res.status(200).send(result);
        };
        this.getUserById = async (req, res, next) => {
            const id = req.params.id;
            const result = await this.authService.getUserId(id);
            res.status(200).send(result);
        };
        this.getMe = async (req, res, next) => {
            const userId = req.params.id || req.user?.userId;
            const result = await this.authService.getMe(userId);
            res.status(200).send(result);
        };
        this.updateUser = async (req, res, next) => {
            const id = req.params.id;
            const userData = req.body;
            const result = await this.authService.updateUser(id, userData);
            res.status(200).send(result);
        };
        this.deleteUser = async (req, res, next) => {
            const id = req.params.id;
            const result = await this.authService.deleteUser(id);
            res.status(200).send(result);
        };
        this.changePassword = async (req, res, next) => {
            const userId = req.params.id || req.user?.userId;
            const { oldPassword, newPassword } = req.body;
            const result = await this.authService.changePassword(userId, oldPassword, newPassword);
            res.status(200).send(result);
        };
        this.resetPassword = async (req, res, next) => {
            const userId = req.params.id || req.user?.userId;
            const { password } = req.body;
            const result = await this.authService.resetPassword(userId, password);
            res.status(200).send(result);
        };
        this.logout = async (req, res, next) => {
            // For JWT-based auth, logout is typically handled client-side
            // This endpoint confirms logout and can be used for logging/analytics
            res.status(200).send({ message: 'Logout successful' });
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
