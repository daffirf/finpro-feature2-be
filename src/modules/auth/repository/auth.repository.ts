import { prisma } from '@/utils/database'
import { RegisterDTO, UpdateUserDTO } from '../dto/auth.dto'

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  async create(data: RegisterDTO) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
        role: data.role || 'user',
      },
    })
    return user
  }

  async updateUser(id: number, data: UpdateUserDTO) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.password && { password: data.password }),
        ...(data.role && { role: data.role }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
      },
    })
  }

  async updatePassword(id: number, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })
  }

  async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id },
    })
  }

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }
}