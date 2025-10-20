"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const api_error_1 = require("@/utils/api-error");
const auth_repository_1 = require("./repository/auth.repository");
const mail_service_1 = require("./../mail/mail.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    constructor() {
        this.authRepo = new auth_repository_1.AuthRepository();
        this.mailService = new mail_service_1.MailService();
    }
    // Register account
    async register(data) {
        // Set default role if not provided
        const role = data.role || "user";
        // Check if user already exists
        const existingUser = await this.authRepo.findByEmail(data.email);
        if (existingUser) {
            throw new api_error_1.ApiError(400, `${role} with this email already exists`);
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        // Create user
        const user = await this.authRepo.create({
            ...data,
            password: hashedPassword,
        });
        // Remove password from response
        const { password, ...safeUser } = user;
        // Send welcome email (non-blocking)
        this.mailService.sendWelcomeEmail(user).catch((error) => {
            console.error('Failed to send welcome email:', error);
        });
        return safeUser;
    }
    // Login user with business logic
    async login(data) {
        const user = await this.authRepo.findByEmail(data.email);
        if (!user) {
            throw new api_error_1.ApiError(401, "Invalid email or password");
        }
        // Check if user has password
        if (!user.password) {
            throw new api_error_1.ApiError(401, "Invalid email or password");
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new api_error_1.ApiError(401, "Invalid email or password");
        }
        // Generate JWT token
        const token = this.generateToken(user);
        // Remove password from response
        const { password, ...safeUser } = user;
        return {
            user: safeUser,
            token
        };
    }
    // Generate JWT token method
    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
        const secretKey = process.env.JWT_SECRET || 'your-secret-key';
        const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
        return jsonwebtoken_1.default.sign(payload, secretKey, {
            expiresIn: expiresIn
        });
    }
    // Change password with business logic
    async changePassword(userId, oldPassword, newPassword) {
        // Validate new password strength
        if (newPassword.length < 6) {
            throw new api_error_1.ApiError(400, "Password must be at least 6 characters");
        }
        // Get user
        const user = await this.authRepo.findById(userId);
        if (!user) {
            throw new api_error_1.ApiError(404, "User not found");
        }
        if (!user.password) {
            throw new api_error_1.ApiError(400, "User has no password set");
        }
        // Verify old password
        const isOldPasswordValid = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new api_error_1.ApiError(400, "Old password is incorrect");
        }
        // Hash new password
        const hashedNewPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Update password
        await this.authRepo.updatePassword(userId, hashedNewPassword);
        return { message: "Password changed successfully" };
    }
    // Reset password (for forgot password flow)
    async resetPassword(userId, newPassword) {
        // Validate password strength
        if (newPassword.length < 6) {
            throw new api_error_1.ApiError(400, "Password must be at least 6 characters");
        }
        // Get user
        const user = await this.authRepo.findById(userId);
        if (!user) {
            throw new api_error_1.ApiError(404, "Account not found");
        }
        // Hash new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Update password
        await this.authRepo.updatePassword(userId, hashedPassword);
        return { message: "Reset password successful" };
    }
}
exports.AuthService = AuthService;
