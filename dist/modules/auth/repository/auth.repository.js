"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const database_1 = require("@/utils/database");
class AuthRepository {
    async findByEmail(email) {
        return database_1.prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return database_1.prisma.user.findUnique({
            where: { id },
        });
    }
    async create(data) {
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                role: data.role || 'user',
                password: null,
                isEmailVerified: false,
            },
        });
        return user;
    }
    // Create user without password (for email verification flow)
    async createWithoutPassword(data) {
        return database_1.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                role: data.role,
                password: null, // Explicitly null
                isEmailVerified: false,
            },
        });
    }
    async updateUser(id, data) {
        return database_1.prisma.user.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
                ...(data.password && { password: data.password }),
                ...(data.role && { role: data.role }),
                ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
            },
        });
    }
    async updatePassword(id, hashedPassword) {
        return database_1.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }
    async deleteUser(id) {
        return database_1.prisma.user.delete({
            where: { id },
        });
    }
    async findAll() {
        return database_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    // Verification token methods
    async createVerificationToken(userId, token, expiresAt) {
        return database_1.prisma.verificationToken.create({
            data: {
                userId,
                token,
                type: 'email_verification',
                expiresAt,
            },
        });
    }
    async findVerificationToken(token) {
        return database_1.prisma.verificationToken.findUnique({
            where: { token },
            include: { user: true },
        });
    }
    async markTokenAsUsed(tokenId) {
        return database_1.prisma.verificationToken.update({
            where: { id: tokenId },
            data: { usedAt: new Date() },
        });
    }
    async deleteUsedTokens(userId) {
        return database_1.prisma.verificationToken.deleteMany({
            where: {
                userId,
                usedAt: { not: null },
            },
        });
    }
    // Find active tokens (not used and not expired) for rate limiting
    async findActiveTokensByUserId(userId) {
        const now = new Date();
        return database_1.prisma.verificationToken.findMany({
            where: {
                userId,
                usedAt: null,
                expiresAt: { gt: now },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async setPasswordAndVerify(userId, hashedPassword) {
        return database_1.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                isEmailVerified: true,
            },
        });
    }
}
exports.AuthRepository = AuthRepository;
