import { RegisterDTO, LoginDTO, UpdateUserDTO } from "./dto/auth.dto";
import { ApiError } from "@/lib/errors";
import { AuthRepository } from "./repository/auth.repository";
import { MailService } from "./../mail/mail.service";
import { CloudinaryService } from "@/services/cloudinary.service";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthService {
  private authRepo: AuthRepository;
  private mailService: MailService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.authRepo = new AuthRepository();
    this.mailService = new MailService();
    this.cloudinaryService = new CloudinaryService();
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

    // Hash password using centralized function
    const hashedPassword = await bcrypt.hash(data.password, 10);

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
  async login(data: LoginDTO) {
    // Authenticate user using centralized function
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
    
    // Type assertion to satisfy jwt.sign type requirements
    return jwt.sign(payload, secretKey, { 
      expiresIn: expiresIn as any
    });
  }

  // Get user by ID with business logic
  async getUserId(id: number) {
    if (!id) {
      throw new ApiError(400, "User ID is required");
    }

    const user = await this.authRepo.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Remove password from response
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // Update user with business logic
  async updateUser(id: number, data: UpdateUserDTO) {
    // Validate user exists
    const existingUser = await this.authRepo.findById(id);
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    // Validate email format if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new ApiError(400, "Invalid email format");
      }

      // Check if email is already taken by another user
      const emailExists = await this.authRepo.findByEmail(data.email);
      if (emailExists && emailExists.id !== id) {
        throw new ApiError(400, "Email already taken");
      }
    }

    // Validate password strength if provided
    if (data.password) {
      if (data.password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
      }
      // Hash new password
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Update user
    const user = await this.authRepo.updateUser(id, data);

    // Remove password from response
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // Get current user (alias for getUserId)
  async getMe(id: number) {
    return this.getUserId(id);
  }

  // Delete user with business logic
  async deleteUser(id: number) {
    const user = await this.authRepo.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await this.authRepo.deleteUser(id);
    return { message: "User deleted successfully" };
  }

  // Get all users (admin function)
  async getAllUsers() {
    return this.authRepo.findAll();
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
