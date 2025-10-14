import { RegisterDTO, LoginDTO, UpdateUserDTO } from './dto/auth.dto';
import { type AuthUser } from '@/lib/auth';
export declare class AuthService {
    private authRepo;
    private mailService;
    constructor();
    register(data: RegisterDTO): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(data: LoginDTO): Promise<{
        user: AuthUser;
        token: string;
    }>;
    getUserId(id: string): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: string, data: UpdateUserDTO): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getMe(id: string): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getAllUsers(): Promise<{
        name: string;
        id: string;
        email: string;
        phone: string | null;
        role: import("@/generated/prisma").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    resetPassword(userId: string, newPassword: string): Promise<{
        message: string;
    }>;
}
