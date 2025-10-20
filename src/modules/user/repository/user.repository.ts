import { prisma } from '@/utils/database';
import { UpdateUserDTO } from '../dto/user.dto';

export class UserRepository {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        avatarUrl: true,
        address: true,
        city: true,
        country: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        avatarUrl: true,
        address: true,
        city: true,
        country: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        avatarUrl: true,
        address: true,
        city: true,
        country: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(id: number, data: UpdateUserDTO) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        avatarUrl: true,
        address: true,
        city: true,
        country: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

