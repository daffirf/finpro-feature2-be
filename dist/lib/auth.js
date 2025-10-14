"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.authenticateUser = authenticateUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("./prisma");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 12);
}
async function verifyPassword(password, hashedPassword) {
    return bcryptjs_1.default.compare(password, hashedPassword);
}
function generateToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    }, JWT_SECRET, { expiresIn: '2h' });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
async function authenticateUser(email, password) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
    });
    if (!user || !await verifyPassword(password, user.password)) {
        return null;
    }
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    };
}
