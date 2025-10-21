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
        role: data.role || 'user',
        password: null,
        isEmailVerified: false,
      },
    })
    return user
  }

  // Create user without password (for email verification flow)
  async createWithoutPassword(data: {
    email: string
    name: string
    role: 'user' | 'tenant'
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        password: null, // Explicitly null
        isEmailVerified: false,
      },
    })
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

  // Verification token methods
  async createVerificationToken(userId: number, token: string, expiresAt: Date) {
    return prisma.verificationToken.create({
      data: {
        userId,
        token,
        type: 'email_verification',
        expiresAt,
      },
    })
  }

  async findVerificationToken(token: string) {
    return prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    })
  }

  async markTokenAsUsed(tokenId: number) {
    return prisma.verificationToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    })
  }

  async deleteUsedTokens(userId: number) {
    return prisma.verificationToken.deleteMany({
      where: {
        userId,
        usedAt: { not: null },
      },
    })
  }

  // Find active tokens (not used and not expired) for rate limiting
  async findActiveTokensByUserId(userId: number) {
    const now = new Date();
    return prisma.verificationToken.findMany({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async setPasswordAndVerify(userId: number, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
      },
    })
  }
}