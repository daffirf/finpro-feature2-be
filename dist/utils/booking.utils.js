"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRoomAvailability = checkRoomAvailability;
exports.validateBookingDates = validateBookingDates;
exports.calculateBookingPrice = calculateBookingPrice;
exports.isPaymentExpired = isPaymentExpired;
const database_1 = require("./database");
const prisma_1 = require("@/generated/prisma");
const date_utils_1 = require("./date.utils");
/**
 * Check if a room is available for the specified date range
 */
async function checkRoomAvailability(roomId, checkIn, checkOut) {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    // Check for conflicting bookings through BookingItems
    const conflictingBooking = await database_1.prisma.booking.findFirst({
        where: {
            items: {
                some: {
                    roomId
                }
            },
            status: {
                notIn: [prisma_1.BookingStatus.cancelled, prisma_1.BookingStatus.expired, prisma_1.BookingStatus.rejected]
            },
            OR: [
                {
                    AND: [
                        { checkIn: { lt: endDate } },
                        { checkOut: { gt: startDate } }
                    ]
                }
            ]
        }
    });
    return !conflictingBooking;
}
/**
 * Validate booking dates
 */
function validateBookingDates(checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
        return {
            valid: false,
            error: 'Tanggal check-in tidak boleh di masa lalu'
        };
    }
    if (checkOutDate <= checkInDate) {
        return {
            valid: false,
            error: 'Tanggal check-out harus setelah check-in'
        };
    }
    const maxDays = 30;
    const daysDiff = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > maxDays) {
        return {
            valid: false,
            error: `Maksimal pemesanan ${maxDays} hari`
        };
    }
    return { valid: true };
}
/**
 * Calculate total price for a booking
 * Can be extended with price rules in the future
 */
async function calculateBookingPrice(roomId, checkIn, checkOut, unitCount = 1) {
    const room = await database_1.prisma.room.findUnique({
        where: { id: roomId }
    });
    if (!room) {
        throw new Error('Room not found');
    }
    const nights = (0, date_utils_1.calculateNights)(checkIn, checkOut);
    const totalPrice = room.basePrice * nights * unitCount;
    return totalPrice;
}
/**
 * Check if booking payment is expired (1 hour timeout)
 */
function isPaymentExpired(createdAt) {
    const oneHourInMs = 60 * 60 * 1000;
    const now = new Date();
    return now.getTime() - createdAt.getTime() > oneHourInMs;
}
