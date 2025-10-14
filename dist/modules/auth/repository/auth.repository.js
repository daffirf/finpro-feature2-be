"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = require("@/lib/prisma");
class AuthRepository {
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
        });
    }
    async create(data) {
        const user = await prisma_1.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: data.password,
                ...(data.phone && { phone: data.phone }),
                role: data.role || 'USER',
            },
        });
        return user;
    }
    async updateUser(id, data) {
        return prisma_1.prisma.user.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
                ...(data.password && { password: data.password }),
                ...(data.role && { role: data.role }),
                ...(data.phone && { phone: data.phone }),
            },
        });
    }
    async updatePassword(id, hashedPassword) {
        return prisma_1.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }
    async deleteUser(id) {
        return prisma_1.prisma.user.delete({
            where: { id },
        });
    }
    async findAll() {
        return prisma_1.prisma.user.findMany({
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
        });
    }
}
exports.AuthRepository = AuthRepository;
