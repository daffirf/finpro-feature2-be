export interface RegisterDTO {
    name: string
    email: string
    password: string
    role?: 'user' | 'tenant'  // Optional, default to user
    phoneNumber?: string  // Optional phone number
}

export interface LoginDTO {
    email: string
    password: string
}

export interface UpdateUserDTO {
    name?: string
    email?: string
    password?: string
    role?: 'user' | 'tenant' 
    phoneNumber?: string
}
