import { RegisterDTO, UpdateUserDTO } from '../dto/auth.dto';
export declare class AuthRepository {
    findByEmail(email: string): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        password: string;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        password: string;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(data: RegisterDTO): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        password: string;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: string, data: UpdateUserDTO): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        password: string;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updatePassword(id: string, hashedPassword: string): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        password: string;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        password: string;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
