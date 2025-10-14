"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const errors_1 = require("@/lib/errors");
const auth_repository_1 = require("./repository/auth.repository");
const mail_service_1 = require("./../mail/mail.service");
const auth_1 = require("@/lib/auth");
class AuthService {
    constructor() {
        this.authRepo = new auth_repository_1.AuthRepository();
        this.mailService = new mail_service_1.MailService();
    }
    // Register new user with business logic
    async register(data) {
        // Check if user already exists
        const existing = await this.authRepo.findByEmail(data.email);
        if (existing) {
            throw new errors_1.ApiError(400, 'User already exists');
        }
        // Hash password using centralized function
        const hashedPassword = await (0, auth_1.hashPassword)(data.password);
        // Create user
        const user = await this.authRepo.create({
            ...data,
            password: hashedPassword,
        });
        // Remove password from response
        const { password, ...safeUser } = user;
        return safeUser;
    }
    // Login user with business logic
    async login(data) {
        // Authenticate user using centralized function
        const authenticatedUser = await (0, auth_1.authenticateUser)(data.email, data.password);
        if (!authenticatedUser) {
            throw new errors_1.ApiError(401, 'Invalid email or password');
        }
        // Generate JWT token using centralized function (includes id, email, name, role)
        const token = (0, auth_1.generateToken)(authenticatedUser);
        return {
            user: authenticatedUser,
            token
        };
    }
    // Get user by ID with business logic
    async getUserId(id) {
        if (!id) {
            throw new errors_1.ApiError(400, 'User ID is required');
        }
        const user = await this.authRepo.findById(id);
        if (!user) {
            throw new errors_1.ApiError(404, 'User not found');
        }
        // Remove password from response
        const { password, ...safeUser } = user;
        return safeUser;
    }
    // Update user with business logic
    async updateUser(id, data) {
        // Validate user exists
        const existingUser = await this.authRepo.findById(id);
        if (!existingUser) {
            throw new errors_1.ApiError(404, 'User not found');
        }
        // Validate email format if provided
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new errors_1.ApiError(400, 'Invalid email format');
            }
            // Check if email is already taken by another user
            const emailExists = await this.authRepo.findByEmail(data.email);
            if (emailExists && emailExists.id !== id) {
                throw new errors_1.ApiError(400, 'Email already taken');
            }
        }
        // Validate password strength if provided
        if (data.password) {
            if (data.password.length < 6) {
                throw new errors_1.ApiError(400, 'Password must be at least 6 characters');
            }
            // Hash new password using centralized function
            data.password = await (0, auth_1.hashPassword)(data.password);
        }
        // Update user
        const user = await this.authRepo.updateUser(id, data);
        // Remove password from response
        const { password, ...safeUser } = user;
        return safeUser;
    }
    // Get current user (alias for getUserId)
    async getMe(id) {
        return this.getUserId(id);
    }
    // Delete user with business logic
    async deleteUser(id) {
        const user = await this.authRepo.findById(id);
        if (!user) {
            throw new errors_1.ApiError(404, 'User not found');
        }
        await this.authRepo.deleteUser(id);
        return { message: 'User deleted successfully' };
    }
    // Get all users (admin function)
    async getAllUsers() {
        return this.authRepo.findAll();
    }
    // Change password with business logic
    async changePassword(userId, oldPassword, newPassword) {
        // Validate new password strength
        if (newPassword.length < 6) {
            throw new errors_1.ApiError(400, 'Password must be at least 6 characters');
        }
        // Get user
        const user = await this.authRepo.findById(userId);
        if (!user) {
            throw new errors_1.ApiError(404, 'User not found');
        }
        // Verify old password using centralized function
        const isOldPasswordValid = await (0, auth_1.verifyPassword)(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new errors_1.ApiError(400, 'Old password is incorrect');
        }
        // Hash new password using centralized function
        const hashedNewPassword = await (0, auth_1.hashPassword)(newPassword);
        // Update password
        await this.authRepo.updatePassword(userId, hashedNewPassword);
        return { message: 'Password changed successfully' };
    }
    // Reset password (for forgot password flow)
    async resetPassword(userId, newPassword) {
        // Validate password strength
        if (newPassword.length < 6) {
            throw new errors_1.ApiError(400, 'Password must be at least 6 characters');
        }
        // Get user
        const user = await this.authRepo.findById(userId);
        if (!user) {
            throw new errors_1.ApiError(404, 'Account not found');
        }
        // Hash new password using centralized function
        const hashedPassword = await (0, auth_1.hashPassword)(newPassword);
        // Update password
        await this.authRepo.updatePassword(userId, hashedPassword);
        return { message: 'Reset password successful' };
    }
}
exports.AuthService = AuthService;
