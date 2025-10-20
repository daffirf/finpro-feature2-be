"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_ENV = exports.FRONTEND_URL = exports.EMAIL_PASS = exports.EMAIL_USER = exports.EMAIL_PORT = exports.EMAIL_HOST = exports.DATABASE_URL = exports.JWT_SECRET = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT || 8000;
exports.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
exports.DATABASE_URL = process.env.DATABASE_URL;
exports.EMAIL_HOST = process.env.EMAIL_HOST;
exports.EMAIL_PORT = process.env.EMAIL_PORT;
exports.EMAIL_USER = process.env.EMAIL_USER;
exports.EMAIL_PASS = process.env.EMAIL_PASS;
exports.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
exports.NODE_ENV = process.env.NODE_ENV || 'development';
