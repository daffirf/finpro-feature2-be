import { ApiError } from '@/utils/api-error';
import { UserRepository } from './repository/user.repository';
import { UpdateUserDTO } from './dto/user.dto';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  // Get user by ID with business logic
  async getUserById(id: number) {
    if (!id) {
      throw new ApiError(400, "User ID is required");
    }

    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  // Update user with business logic
  async updateUser(id: number, data: UpdateUserDTO) {
    // Validate user exists
    const existingUser = await this.userRepo.findById(id);
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
      const emailExists = await this.userRepo.findByEmail(data.email);
      if (emailExists && emailExists.id !== id) {
        throw new ApiError(400, "Email already taken");
      }
    }

    // Update user (password updates should be done via auth module)
    const user = await this.userRepo.updateUser(id, data);

    return user;
  }

  // Delete user with business logic
  async deleteUser(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
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
