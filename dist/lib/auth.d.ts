export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'TENANT' | 'ADMIN';
}
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
export declare function generateToken(user: AuthUser): string;
export declare function verifyToken(token: string): AuthUser | null;
export declare function authenticateUser(email: string, password: string): Promise<AuthUser | null>;
