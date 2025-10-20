"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const database_1 = require("@/utils/database");
const email_utils_1 = require("@/utils/email.utils");
const prisma_1 = require("@/generated/prisma");
class CronService {
    static init() {
        // In a real application, you would set up actual cron jobs here
        // For example using node-cron or agenda.js
    }
    static async cancelExpiredBookings() {
        try {
            const expiredTime = new Date();
            expiredTime.setHours(expiredTime.getHours() - 24); // 24 hours ago
            const expiredBookings = await database_1.prisma.booking.findMany({
                where: {
                    status: prisma_1.BookingStatus.pending_payment,
                    createdAt: {
                        lte: expiredTime
                    }
                },
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
                                        select: {
                                            id: true,
                                            name: true,
                                            address: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            for (const booking of expiredBookings) {
                await database_1.prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: prisma_1.BookingStatus.cancelled,
                        cancelledAt: new Date(),
                        cancelReason: 'Pemesanan dibatalkan otomatis karena tidak ada konfirmasi pembayaran dalam 24 jam'
                    }
                });
                await (0, email_utils_1.sendBookingCancellation)(booking, 'Pemesanan dibatalkan otomatis karena tidak ada konfirmasi pembayaran dalam 24 jam');
            }
            return {
                message: `${expiredBookings.length} expired bookings cancelled`,
                count: expiredBookings.length
            };
        }
        catch (error) {
            console.error('Cancel expired bookings error:', error);
            throw new Error('Failed to cancel expired bookings');
        }
    }
    static async sendCheckinReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            const upcomingBookings = await database_1.prisma.booking.findMany({
                where: {
                    status: prisma_1.BookingStatus.confirmed,
                    checkIn: {
                        gte: tomorrow,
                        lt: dayAfterTomorrow
                    }
                },
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
                                        select: {
                                            id: true,
                                            name: true,
                                            address: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            for (const booking of upcomingBookings) {
                await (0, email_utils_1.sendCheckInReminder)(booking);
            }
            return {
                message: `${upcomingBookings.length} check-in reminders sent`,
                count: upcomingBookings.length
            };
        }
        catch (error) {
            console.error('Send check-in reminders error:', error);
            throw new Error('Failed to send check-in reminders');
        }
    }
}
exports.CronService = CronService;
