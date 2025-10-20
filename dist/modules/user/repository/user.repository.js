"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = require("@/utils/database");
class UserRepository {
    async findAll() {
        return database_1.prisma.user.findMany({
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
    async findById(id) {
        return database_1.prisma.user.findUnique({
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
    async findByEmail(email) {
        return database_1.prisma.user.findUnique({
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
    async updateUser(id, data) {
        return database_1.prisma.user.update({
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
    async deleteUser(id) {
        return database_1.prisma.user.delete({
            where: { id },
        });
    }
}
exports.UserRepository = UserRepository;
