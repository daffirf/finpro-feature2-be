import { ApiError } from '@/utils/api-error';
import { UserRepository } from './repository/user.repository';
import { UpdateUserDTO } from './dto/user.dto';
import { CloudinaryService } from '@/services/cloudinary.service';

export class UserService {
  private userRepo: UserRepository;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.userRepo = new UserRepository();
    this.cloudinaryService = new CloudinaryService();
  }

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

  async updateUser(id: number, data: UpdateUserDTO) {
    const existingUser = await this.userRepo.findById(id);
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new ApiError(400, "Invalid email format");
      }

      const emailExists = await this.userRepo.findByEmail(data.email);
      if (emailExists && emailExists.id !== id) {
        throw new ApiError(400, "Email already taken");
      }
    }

    const user = await this.userRepo.updateUser(id, data);

    return user;
  }

  async deleteUser(id: number) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await this.userRepo.deleteUser(id);
    return { message: "User deleted successfully" };
  }

  async getAllUsers() {
    const users = await this.userRepo.findAll();
    return { users };
  }

  async uploadAvatar(userId: number, file: Express.Multer.File) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const result = await this.cloudinaryService.upload(file);
    const updatedUser = await this.userRepo.updateUser(userId, {
      avatarUrl: result.secure_url
    });

    return {
      message: "Avatar berhasil diupload",
      avatarUrl: result.secure_url,
      user: updatedUser
    };
  }
}
