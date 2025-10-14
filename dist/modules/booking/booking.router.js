"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRouter = void 0;
const express_1 = require("express");
const booking_controller_1 = require("./booking.controller");
const jwt_middleware_1 = require("@/middlewares/jwt.middleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 1024 * 1024 } // 1MB
});
class BookingRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.bookingController = new booking_controller_1.BookingController();
        this.jwtMiddleware = new jwt_middleware_1.JwtMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // All booking routes require authentication
        this.router.use(this.jwtMiddleware.verifyToken());
        // Create booking
        this.router.post('/', this.bookingController.createBooking);
        // Get user bookings
        this.router.get('/user', this.bookingController.getUserBookings);
        // Upload payment proof
        this.router.post('/payment-proof', upload.single('file'), this.bookingController.uploadPaymentProof);
        // Get booking by ID
        this.router.get('/:id', this.bookingController.getBookingById);
        // Cancel booking
        this.router.post('/:id/cancel', this.bookingController.cancelBooking);
    }
}
exports.BookingRouter = BookingRouter;
