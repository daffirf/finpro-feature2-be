"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const prisma_1 = require("@/lib/prisma");
const errors_1 = require("@/lib/errors");
const booking_utils_1 = require("@/lib/booking-utils");
const email_1 = require("@/lib/email");
class BookingService {
    async createBooking(userId, data) {
        // Validate dates
        const dateValidation = (0, booking_utils_1.validateBookingDates)(data.checkIn, data.checkOut);
        if (!dateValidation.valid) {
            throw new errors_1.ApiError(400, dateValidation.error || 'Invalid dates');
        }
        // Check room availability
        const isAvailable = await (0, booking_utils_1.checkRoomAvailability)(data.roomId, data.checkIn, data.checkOut);
        if (!isAvailable) {
            throw new errors_1.ApiError(400, 'Kamar tidak tersedia untuk tanggal yang dipilih');
        }
        // Calculate total price
        const totalPrice = await (0, booking_utils_1.calculateBookingPrice)(data.roomId, data.checkIn, data.checkOut);
        // Create booking
        const booking = await prisma_1.prisma.booking.create({
            data: {
                userId,
                propertyId: data.propertyId,
                roomId: data.roomId,
                checkIn: new Date(data.checkIn),
                checkOut: new Date(data.checkOut),
                guests: data.guests,
                totalPrice: totalPrice,
                notes: data.notes || null,
                status: 'PENDING_PAYMENT'
            },
            include: {
                property: {
                    select: { name: true, address: true }
                },
                room: {
                    select: { name: true, capacity: true }
                }
            }
        });
        return {
            booking,
            message: 'Pemesanan berhasil dibuat'
        };
    }
    async getBookingById(bookingId, userId) {
        const booking = await prisma_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                property: {
                    select: {
                        name: true,
                        address: true
                    }
                },
                room: {
                    select: {
                        name: true,
                        capacity: true
                    }
                }
            }
        });
        if (!booking) {
            throw new errors_1.ApiError(404, 'Pemesanan tidak ditemukan');
        }
        // Check if user has access to this booking
        if (booking.userId !== userId) {
            throw new errors_1.ApiError(403, 'Unauthorized');
        }
        return { booking };
    }
    async cancelBooking(bookingId, userId, reason) {
        const booking = await prisma_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                property: {
                    select: {
                        name: true,
                        address: true
                    }
                },
                room: {
                    select: {
                        name: true
                    }
                }
            }
        });
        if (!booking) {
            throw new errors_1.ApiError(404, 'Pemesanan tidak ditemukan');
        }
        if (booking.userId !== userId) {
            throw new errors_1.ApiError(403, 'Unauthorized');
        }
        if (!['PENDING_PAYMENT', 'PAYMENT_CONFIRMED'].includes(booking.status)) {
            throw new errors_1.ApiError(400, 'Pemesanan tidak dapat dibatalkan');
        }
        const updatedBooking = await prisma_1.prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CANCELLED' }
        });
        if (reason) {
            await (0, email_1.sendBookingCancellation)(booking, reason);
        }
        return {
            booking: updatedBooking,
            message: 'Pemesanan berhasil dibatalkan'
        };
    }
    async uploadPaymentProof(userId, bookingId, fileUrl) {
        // Check if booking exists and belongs to user
        const booking = await prisma_1.prisma.booking.findUnique({
            where: { id: bookingId }
        });
        if (!booking) {
            throw new errors_1.ApiError(404, 'Pemesanan tidak ditemukan');
        }
        if (booking.userId !== userId) {
            throw new errors_1.ApiError(403, 'Unauthorized');
        }
        if (booking.status !== 'PENDING_PAYMENT') {
            throw new errors_1.ApiError(400, 'Pemesanan tidak dalam status menunggu pembayaran');
        }
        // Update booking with payment proof
        const updatedBooking = await prisma_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentProof: fileUrl,
                status: 'PAYMENT_CONFIRMED'
            }
        });
        return {
            booking: updatedBooking,
            message: 'Bukti pembayaran berhasil diupload'
        };
    }
    async getUserBookings(userId) {
        const bookings = await prisma_1.prisma.booking.findMany({
            where: { userId },
            include: {
                property: {
                    select: { name: true, address: true }
                },
                room: {
                    select: { name: true, capacity: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { bookings };
    }
}
exports.BookingService = BookingService;
