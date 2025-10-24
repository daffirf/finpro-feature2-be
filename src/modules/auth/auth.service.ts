import { RegisterDTO, LoginDTO, VerifyEmailDTO, SetPasswordDTO } from "./dto/auth.dto";
import { ApiError } from "@/utils/api-error";
import { AuthRepository } from "./repository/auth.repository";
import { EmailService } from "@/services/email.service";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

export class AuthService {
  private authRepo: AuthRepository;
  private emailService: EmailService;

  constructor() {
    this.authRepo = new AuthRepository();
    this.emailService = new EmailService();
  }

  /**
   * Register without password - send email verification
   */
  async register(data: RegisterDTO) {
    const role = data.role || "user";

    // Check if user already exists
    const existingUser = await this.authRepo.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(400, `Account with this email already exists`);
    }

    // Validate email format
    if (!this.isValidEmail(data.email)) {
      throw new ApiError(400, "Invalid email format");
    }

    // Create user WITHOUT password
    const user = await this.authRepo.createWithoutPassword({
      email: data.email,
      name: data.name,
      role: role as 'user' | 'tenant'
    });

    // Generate verification token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Token expires in 1 hour (for security)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Save token to database
    await this.authRepo.createVerificationToken(user.id, token, expiresAt);

    // Send verification email (non-blocking)
    this.emailService.sendEmailVerification(user, token).catch((error) => {
      console.error('Failed to send verification email:', error);
    });

    return {
      message: "Registration successful. Please check your email to verify your account.",
      email: user.email
    };
  }


  /**
   * Verify email token (GET request to check validity)
   */
  async verifyEmailToken(data: VerifyEmailDTO) {
    const tokenData = await this.authRepo.findVerificationToken(data.token);

    if (!tokenData) {
      throw new ApiError(400, "Invalid verification token");
    }

    // Check if already used
    if (tokenData.usedAt) {
      throw new ApiError(400, "This verification link has already been used");
    }

    // Check if expired
    if (new Date() > tokenData.expiresAt) {
      throw new ApiError(400, "Verification link has expired");
    }

    // Check if already verified
    if (tokenData.user.isEmailVerified) {
      throw new ApiError(400, "Email already verified");
    }

    return {
      valid: true,
      email: tokenData.user.email,
      name: tokenData.user.name
    };
  }

  /**
   * Set password after email verified
   */
  async setPassword(data: SetPasswordDTO) {
    // Validate password
    if (!data.password || data.password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    // Find and validate token
    const tokenData = await this.authRepo.findVerificationToken(data.token);

    if (!tokenData) {
      throw new ApiError(400, "Invalid verification token");
    }

    if (tokenData.usedAt) {
      throw new ApiError(400, "This verification link has already been used");
    }

    if (new Date() > tokenData.expiresAt) {
      throw new ApiError(400, "Verification link has expired");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Update user: set password and verify email
    await this.authRepo.setPasswordAndVerify(tokenData.userId, hashedPassword);

    // Mark token as used
    await this.authRepo.markTokenAsUsed(tokenData.id);

    // Clean up old used tokens (optional)
    await this.authRepo.deleteUsedTokens(tokenData.userId);

    return {
      message: "Password set successfully. You can now login.",
      success: true
    };
  }

  /**
   * Request password reset - send email with token
   */
  async forgotPassword(email: string) {
    // Find user by email
    const user = await this.authRepo.findByEmail(email);
    
    // Always return success message even if user doesn't exist (security best practice)
    if (!user) {
      return {
        message: "If this email is registered, you will receive a password reset link."
      };
    }

    // Check for existing active token (not used and not expired) to prevent spam
    const existingTokens = await this.authRepo.findActiveTokensByUserId(user.id);
    if (existingTokens && existingTokens.length > 0) {
      const latestToken = existingTokens[0];
      const timeSinceCreated = Date.now() - latestToken.createdAt.getTime();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      // If there's an active token created less than 5 minutes ago, prevent spam
      if (timeSinceCreated < fiveMinutes) {
        return {
          message: "If this email is registered, you will receive a password reset link."
        };
      }
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Save token to database (reuse verification token table)
    await this.authRepo.createVerificationToken(user.id, token, expiresAt);

    // Send reset password email (non-blocking)
    this.emailService.sendPasswordResetEmail(user, token).catch((error) => {
      console.error('Failed to send password reset email:', error);
    });

    return {
      message: "If this email is registered, you will receive a password reset link."
    };
  }

  /**
   * Reset password using token from email
   */
  async resetPasswordWithToken(token: string, newPassword: string) {
    // Validate password
    if (!newPassword || newPassword.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    // Find and validate token
    const tokenData = await this.authRepo.findVerificationToken(token);

    if (!tokenData) {
      throw new ApiError(400, "Invalid or expired reset link");
    }

    if (tokenData.usedAt) {
      throw new ApiError(400, "This reset link has already been used");
    }

    if (new Date() > tokenData.expiresAt) {
      throw new ApiError(400, "Reset link has expired");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.authRepo.updatePassword(tokenData.userId, hashedPassword);

    // Mark token as used
    await this.authRepo.markTokenAsUsed(tokenData.id);

    // Clean up old used tokens
    await this.authRepo.deleteUsedTokens(tokenData.userId);

    return {
      message: "Password has been reset successfully. You can now login."
    };
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
      role: user.role,
      isEmailVerified: user.isEmailVerified ?? false
    };
    
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    
    return jwt.sign(payload, secretKey, { 
      expiresIn: expiresIn as any
    });
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
