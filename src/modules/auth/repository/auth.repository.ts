import { prisma } from '@/lib/prisma'
import { RegisterDTO, UpdateUserDTO } from '../dto/auth.dto'

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  async findById(id: string) {
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
        ...(data.phone && { phone: data.phone }),
        role: data.role || 'USER',
      },
    })
    return user
  }

  async updateUser(id: string, data: UpdateUserDTO) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.password && { password: data.password }),
        ...(data.role && { role: data.role }),
        ...(data.phone && { phone: data.phone }),
      },
    })
  }

  async updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })
  }

  async deleteUser(id: string) {
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
        phone: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from response
      },
    })
  }
}