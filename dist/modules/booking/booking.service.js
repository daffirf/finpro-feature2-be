"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const database_1 = require("@/utils/database");
const api_error_1 = require("@/utils/api-error");
const booking_utils_1 = require("@/utils/booking.utils");
const date_utils_1 = require("@/utils/date.utils");
const email_utils_1 = require("@/utils/email.utils");
const prisma_1 = require("@/generated/prisma");
class BookingService {
    async createBooking(userId, data) {
        // Validate dates
        const dateValidation = (0, booking_utils_1.validateBookingDates)(data.checkIn, data.checkOut);
        if (!dateValidation.valid) {
            throw new api_error_1.ApiError(400, dateValidation.error || 'Invalid dates');
        }
        // Get room details
        const room = await database_1.prisma.room.findUnique({
            where: { id: data.roomId },
            include: { property: true }
        });
        if (!room) {
            throw new api_error_1.ApiError(404, 'Kamar tidak ditemukan');
        }
        // Check room availability
        const isAvailable = await (0, booking_utils_1.checkRoomAvailability)(data.roomId, data.checkIn, data.checkOut);
        if (!isAvailable) {
            throw new api_error_1.ApiError(400, 'Kamar tidak tersedia untuk tanggal yang dipilih');
        }
        // Calculate pricing
        const nights = (0, date_utils_1.calculateNights)(data.checkIn, data.checkOut);
        const unitCount = data.unitCount || 1;
        const unitPrice = room.basePrice;
        const subTotal = unitPrice * nights * unitCount;
        // Generate booking number
        const bookingNo = `BK-${Date.now()}-${userId}`;
        // Create booking with item
        const booking = await database_1.prisma.booking.create({
            data: {
                bookingNo,
                userId,
                checkIn: new Date(data.checkIn),
                checkOut: new Date(data.checkOut),
                totalGuests: data.guests,
                totalPrice: subTotal,
                notes: data.notes || null,
                status: prisma_1.BookingStatus.pending_payment,
                items: {
                    create: {
                        roomId: data.roomId,
                        unitCount,
                        unitPrice,
                        nights,
                        subTotal
                    }
                }
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                items: {
                    include: {
                        room: {
                            include: {
                                property: {
                                    select: { id: true, name: true, address: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        return {
            booking,
            message: 'Pemesanan berhasil dibuat'
        };
    }
    async getBookingById(bookingId, userId) {
        const booking = await database_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        room: {
                            include: {
                                property: {
                                    select: { id: true, name: true, address: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!booking) {
            throw new api_error_1.ApiError(404, 'Pemesanan tidak ditemukan');
        }
        // Check if user has access to this booking
        if (booking.userId !== userId) {
            throw new api_error_1.ApiError(403, 'Unauthorized');
        }
        return { booking };
    }
    async cancelBooking(bookingId, userId, reason) {
        const booking = await database_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        room: {
                            include: {
                                property: {
                                    select: { id: true, name: true, address: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!booking) {
            throw new api_error_1.ApiError(404, 'Pemesanan tidak ditemukan');
        }
        if (booking.userId !== userId) {
            throw new api_error_1.ApiError(403, 'Unauthorized');
        }
        const cancellableStatuses = [prisma_1.BookingStatus.pending_payment, prisma_1.BookingStatus.waiting_confirmed];
        if (!cancellableStatuses.includes(booking.status)) {
            throw new api_error_1.ApiError(400, 'Pemesanan tidak dapat dibatalkan');
        }
        const updatedBooking = await database_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: prisma_1.BookingStatus.cancelled,
                cancelledAt: new Date(),
                cancelReason: reason || null
            }
        });
        if (reason && booking.user.email) {
            await (0, email_utils_1.sendBookingCancellation)(booking, reason);
        }
        return {
            booking: updatedBooking,
            message: 'Pemesanan berhasil dibatalkan'
        };
    }
    async uploadPaymentProof(userId, bookingId, fileUrl) {
        // Check if booking exists and belongs to user
        const booking = await database_1.prisma.booking.findUnique({
            where: { id: bookingId }
        });
        if (!booking) {
            throw new api_error_1.ApiError(404, 'Pemesanan tidak ditemukan');
        }
        if (booking.userId !== userId) {
            throw new api_error_1.ApiError(403, 'Unauthorized');
        }
        if (booking.status !== prisma_1.BookingStatus.pending_payment) {
            throw new api_error_1.ApiError(400, 'Pemesanan tidak dalam status menunggu pembayaran');
        }
        // Update booking with payment proof
        const updatedBooking = await database_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentProofUrl: fileUrl,
                paymentMethod: 'manual_transfer',
                status: prisma_1.BookingStatus.waiting_confirmed
            }
        });
        return {
            booking: updatedBooking,
            message: 'Bukti pembayaran berhasil diupload'
        };
    }
    async getUserBookings(userId) {
        const bookings = await database_1.prisma.booking.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        room: {
                            include: {
                                property: {
                                    select: { id: true, name: true, address: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { bookings };
    }
}
exports.BookingService = BookingService;
