import dotenv from 'dotenv'

dotenv.config()

export const PORT = process.env.PORT || 4000
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
export const DATABASE_URL = process.env.DATABASE_URL
export const EMAIL_HOST = process.env.EMAIL_HOST
export const EMAIL_PORT = process.env.EMAIL_PORT
export const EMAIL_USER = process.env.EMAIL_USER
export const EMAIL_PASS = process.env.EMAIL_PASS
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
export const NODE_ENV = process.env.NODE_ENV || 'development'
