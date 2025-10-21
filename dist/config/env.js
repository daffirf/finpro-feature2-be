"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRON_SECRET = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.CLOUDINARY_CLOUD_NAME = exports.FRONTEND_URL = exports.SMTP_PASS = exports.SMTP_USER = exports.SMTP_PORT = exports.SMTP_HOST = exports.DIRECT_URL = exports.DATABASE_URL = exports.JWT_SECRET_KEY = exports.JWT_SECRET = exports.NODE_ENV = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Server Configuration
exports.PORT = process.env.PORT || 8000;
exports.NODE_ENV = process.env.NODE_ENV || 'development';
// JWT
exports.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
exports.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'your-secret-key';
// Database
exports.DATABASE_URL = process.env.DATABASE_URL;
exports.DIRECT_URL = process.env.DIRECT_URL;
// SMTP/Email Configuration
exports.SMTP_HOST = process.env.SMTP_HOST;
exports.SMTP_PORT = process.env.SMTP_PORT;
exports.SMTP_USER = process.env.SMTP_USER;
exports.SMTP_PASS = process.env.SMTP_PASS;
// Frontend
exports.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// Cloudinary
exports.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
exports.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
exports.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
// Cron
exports.CRON_SECRET = process.env.CRON_SECRET;
