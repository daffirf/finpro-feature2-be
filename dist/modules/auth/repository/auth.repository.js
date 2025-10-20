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
                password: data.password,
                ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
                role: data.role || 'user',
            },
        });
        return user;
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
}
exports.AuthRepository = AuthRepository;
