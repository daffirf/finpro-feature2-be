import { RegisterDTO, LoginDTO } from "./dto/auth.dto";
import { ApiError } from "@/utils/api-error";
import { AuthRepository } from "./repository/auth.repository";
import { EmailService } from "@/services/email.service";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthService {
  private authRepo: AuthRepository;
  private emailService: EmailService;

  constructor() {
    this.authRepo = new AuthRepository();
    this.emailService = new EmailService();
  }

  // Register account
  async register(data: RegisterDTO) {
    // Set default role if not provided
    const role = data.role || "user";

    // Check if user already exists
    const existingUser = await this.authRepo.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(400, `${role} with this email already exists`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.authRepo.create({
      ...data,
      password: hashedPassword,
    });

    // Remove password from response
    const { password, ...safeUser } = user;

    // Send welcome email (non-blocking)
    this.emailService.sendWelcomeEmail(user).catch((error) => {
      console.error('Failed to send welcome email:', error);
    });

    return safeUser;
  }

  // Login user with business logic
  async login(data: LoginDTO) {
    const user = await this.authRepo.findByEmail(data.email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Check if user has password
    if (!user.password) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
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
  private generateToken(user: any): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    
    return jwt.sign(payload, secretKey, { 
      expiresIn: expiresIn as any
    });
  }

  // Change password with business logic
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ) {
    // Validate new password strength
    if (newPassword.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    // Get user
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!user.password) {
      throw new ApiError(400, "User has no password set");
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new ApiError(400, "Old password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.authRepo.updatePassword(userId, hashedNewPassword);

    return { message: "Password changed successfully" };
  }

  // Reset password (for forgot password flow)
  async resetPassword(userId: number, newPassword: string) {
    // Validate password strength
    if (newPassword.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    // Get user
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new ApiError(404, "Account not found");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.authRepo.updatePassword(userId, hashedPassword);

    return { message: "Reset password successful" };
  }
}
