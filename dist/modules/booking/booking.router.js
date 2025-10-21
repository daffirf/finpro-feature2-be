"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRouter = void 0;
const express_1 = require("express");
const booking_controller_1 = require("./booking.controller");
const jwt_middleware_1 = require("@/middlewares/jwt.middleware");
const rbac_middleware_1 = require("@/middlewares/rbac.middleware");
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
        // All booking routes require authentication AND user role (tenant cannot book)
        const auth = this.jwtMiddleware.verifyToken();
        // Only verified USER can create bookings (tenant tidak bisa booking)
        this.router.post('/', auth, rbac_middleware_1.rbac.onlyUser, this.bookingController.createBooking);
        // Only verified USER can view their bookings
        this.router.get('/user', auth, rbac_middleware_1.rbac.onlyUser, this.bookingController.getUserBookings);
        // Only verified USER can upload payment proof
        this.router.post('/payment-proof', auth, rbac_middleware_1.rbac.onlyUser, upload.single('file'), this.bookingController.uploadPaymentProof);
        // Only verified USER can get booking details
        this.router.get('/:id', auth, rbac_middleware_1.rbac.onlyUser, this.bookingController.getBookingById);
        // Only verified USER can cancel booking
        this.router.post('/:id/cancel', auth, rbac_middleware_1.rbac.onlyUser, this.bookingController.cancelBooking);
    }
}
exports.BookingRouter = BookingRouter;
