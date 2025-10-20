"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const api_error_1 = require("@/utils/api-error");
const user_repository_1 = require("./repository/user.repository");
class UserService {
    constructor() {
        this.userRepo = new user_repository_1.UserRepository();
    }
    // Get user by ID with business logic
    async getUserById(id) {
        if (!id) {
            throw new api_error_1.ApiError(400, "User ID is required");
        }
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new api_error_1.ApiError(404, "User not found");
        }
        return user;
    }
    // Update user with business logic
    async updateUser(id, data) {
        // Validate user exists
        const existingUser = await this.userRepo.findById(id);
        if (!existingUser) {
            throw new api_error_1.ApiError(404, "User not found");
        }
        // Validate email format if provided
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new api_error_1.ApiError(400, "Invalid email format");
            }
            // Check if email is already taken by another user
            const emailExists = await this.userRepo.findByEmail(data.email);
            if (emailExists && emailExists.id !== id) {
                throw new api_error_1.ApiError(400, "Email already taken");
            }
        }
        // Update user (password updates should be done via auth module)
        const user = await this.userRepo.updateUser(id, data);
        return user;
    }
    // Delete user with business logic
    async deleteUser(id) {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new api_error_1.ApiError(404, "User not found");
        }
        await this.userRepo.deleteUser(id);
        return { message: "User deleted successfully" };
    }
    // Get all users (admin function)
    async getAllUsers() {
        const users = await this.userRepo.findAll();
        return { users };
    }
}
exports.UserService = UserService;
