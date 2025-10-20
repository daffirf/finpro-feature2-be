"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const api_error_1 = require("@/utils/api-error");
class UserController {
    constructor() {
        this.getAllUsers = async (req, res, next) => {
            try {
                const result = await this.userService.getAllUsers();
                res.status(200).send(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserById = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const result = await this.userService.getUserById(id);
                res.status(200).send(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMe = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    throw new api_error_1.ApiError(401, "Unauthorized");
                }
                const result = await this.userService.getUserById(userId);
                res.status(200).send(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateUser = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userData = req.body;
                const currentUserId = req.user?.id;
                const currentUserRole = req.user?.role;
                // User can only update their own profile unless they're admin
                if (id !== currentUserId && currentUserRole !== 'admin') {
                    throw new api_error_1.ApiError(403, "Forbidden: You can only update your own profile");
                }
                const result = await this.userService.updateUser(id, userData);
                res.status(200).send(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteUser = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const currentUserId = req.user?.id;
                const currentUserRole = req.user?.role;
                // User can only delete their own account unless they're admin
                if (id !== currentUserId && currentUserRole !== 'admin') {
                    throw new api_error_1.ApiError(403, "Forbidden: You can only delete your own account");
                }
                const result = await this.userService.deleteUser(id);
                res.status(200).send(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.userService = new user_service_1.UserService();
    }
}
exports.UserController = UserController;
