import dotenv from 'dotenv'

dotenv.config()

// Server Configuration
export const PORT = process.env.PORT || 8000
export const NODE_ENV = process.env.NODE_ENV || 'development'

// JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'your-secret-key'

// Database
export const DATABASE_URL = process.env.DATABASE_URL
export const DIRECT_URL = process.env.DIRECT_URL

// SMTP/Email Configuration
export const SMTP_HOST = process.env.SMTP_HOST
export const SMTP_PORT = process.env.SMTP_PORT
export const SMTP_USER = process.env.SMTP_USER
export const SMTP_PASS = process.env.SMTP_PASS

// Frontend
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

// Cron
export const CRON_SECRET = process.env.CRON_SECRET
