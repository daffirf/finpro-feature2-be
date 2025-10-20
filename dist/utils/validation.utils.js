"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadSchema = exports.createReviewSchema = exports.searchSchema = exports.createBookingSchema = exports.createRoomSchema = exports.createPropertySchema = exports.loginSchema = exports.registerSchema = void 0;
exports.validateFile = validateFile;
const zod_1 = require("zod");
// Auth schemas
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nama minimal 2 karakter'),
    email: zod_1.z.string().email('Email tidak valid'),
    password: zod_1.z.string().min(6, 'Password minimal 6 karakter'),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.enum(['USER', 'TENANT']).default('USER')
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email tidak valid'),
    password: zod_1.z.string().min(1, 'Password harus diisi')
});
// Property schemas
exports.createPropertySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nama properti minimal 2 karakter'),
    description: zod_1.z.string().min(10, 'Deskripsi minimal 10 karakter'),
    address: zod_1.z.string().min(5, 'Alamat minimal 5 karakter'),
    city: zod_1.z.string().min(2, 'Kota minimal 2 karakter'),
    basePrice: zod_1.z.number().positive('Harga harus positif'),
    amenities: zod_1.z.array(zod_1.z.string()).optional(),
    images: zod_1.z.array(zod_1.z.string()).optional()
});
exports.createRoomSchema = zod_1.z.object({
    propertyId: zod_1.z.string().min(1, 'Property ID harus diisi'),
    name: zod_1.z.string().min(2, 'Nama kamar minimal 2 karakter'),
    description: zod_1.z.string().optional(),
    capacity: zod_1.z.number().int().positive('Kapasitas harus positif'),
    basePrice: zod_1.z.number().positive('Harga harus positif'),
    images: zod_1.z.array(zod_1.z.string()).optional()
});
// Booking schemas
exports.createBookingSchema = zod_1.z.object({
    propertyId: zod_1.z.string().min(1, 'Property ID harus diisi'),
    roomId: zod_1.z.string().min(1, 'Room ID harus diisi'),
    checkIn: zod_1.z.string().datetime('Tanggal check-in tidak valid'),
    checkOut: zod_1.z.string().datetime('Tanggal check-out tidak valid'),
    guests: zod_1.z.number().int().positive('Jumlah tamu harus positif'),
    notes: zod_1.z.string().optional()
});
// Search schemas
exports.searchSchema = zod_1.z.object({
    city: zod_1.z.string().min(1, 'Kota harus diisi'),
    checkIn: zod_1.z.string().datetime('Tanggal check-in tidak valid'),
    checkOut: zod_1.z.string().datetime('Tanggal check-out tidak valid'),
    guests: zod_1.z.number().int().positive('Jumlah tamu harus positif')
});
// Review schemas
exports.createReviewSchema = zod_1.z.object({
    bookingId: zod_1.z.string().min(1, 'Booking ID harus diisi'),
    rating: zod_1.z.number().int().min(1).max(5, 'Rating harus 1-5'),
    comment: zod_1.z.string().min(10, 'Komentar minimal 10 karakter')
});
// File upload validation
exports.fileUploadSchema = zod_1.z.object({
    file: zod_1.z.instanceof(File, { message: 'File harus diupload' }),
    maxSize: zod_1.z.number().default(1024 * 1024), // 1MB
    allowedTypes: zod_1.z.array(zod_1.z.string()).default(['image/jpeg', 'image/png'])
});
function validateFile(file, maxSize = 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png']) {
    if (file.size > maxSize) {
        return { valid: false, error: 'Ukuran file terlalu besar (maksimal 1MB)' };
    }
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Tipe file tidak didukung (hanya JPG/PNG)' };
    }
    return { valid: true };
}
