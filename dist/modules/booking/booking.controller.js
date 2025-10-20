"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const booking_service_1 = require("./booking.service");
const promises_1 = require("fs/promises");
const path_1 = require("path");
class BookingController {
    constructor() {
        this.createBooking = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const result = await this.bookingService.createBooking(userId, req.body);
                res.status(201).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getBookingById = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const bookingId = parseInt(req.params.id);
                const result = await this.bookingService.getBookingById(bookingId, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.cancelBooking = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const bookingId = parseInt(req.params.id);
                const { reason } = req.body;
                const result = await this.bookingService.cancelBooking(bookingId, userId, reason);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.uploadPaymentProof = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const file = req.file;
                const bookingId = parseInt(req.body.bookingId);
                if (!file || !bookingId) {
                    return res.status(400).json({
                        error: 'File dan booking ID diperlukan'
                    });
                }
                // Validate file
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                const maxSize = 1024 * 1024; // 1MB
                if (file.size > maxSize) {
                    return res.status(400).json({
                        error: 'Ukuran file terlalu besar (maksimal 1MB)'
                    });
                }
                if (!allowedTypes.includes(file.mimetype)) {
                    return res.status(400).json({
                        error: 'Format file harus JPG atau PNG'
                    });
                }
                // Save file
                const uploadDir = (0, path_1.join)(process.cwd(), 'uploads', 'payments');
                await (0, promises_1.mkdir)(uploadDir, { recursive: true });
                const fileName = `${bookingId}-${Date.now()}.${file.originalname.split('.').pop()}`;
                const filePath = (0, path_1.join)(uploadDir, fileName);
                await (0, promises_1.writeFile)(filePath, file.buffer);
                const fileUrl = `/uploads/payments/${fileName}`;
                const result = await this.bookingService.uploadPaymentProof(userId, bookingId, fileUrl);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserBookings = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const result = await this.bookingService.getUserBookings(userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.bookingService = new booking_service_1.BookingService();
    }
}
exports.BookingController = BookingController;
