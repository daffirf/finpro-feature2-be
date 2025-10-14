export interface RegisterDTO {
    name: string
    email: string
    password: string
    role?: 'USER' | 'TENANT' | 'ADMIN'  // Optional, default to USER
    phone?: string  // Optional phone number
}

export interface LoginDTO {
    email: string
    password: string
}

export interface UpdateUserDTO {
    name?: string
    email?: string
    password?: string
    role?: 'USER' | 'TENANT' | 'ADMIN' 
    phone?: string
}
