"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const database_1 = require("@/utils/database");
const api_error_1 = require("@/utils/api-error");
const pagination_utils_1 = require("@/utils/pagination.utils");
const prisma_1 = require("@/generated/prisma");
class PropertyService {
    async searchProperties(params) {
        const { city = '', checkIn = '', checkOut = '', guests = 1, sortBy = 'price_asc', minPrice, maxPrice, amenities = [], page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = this.buildWhereClause(city, guests, minPrice, maxPrice, amenities);
        const orderBy = this.getOrderByClause(sortBy);
        const [properties, total] = await Promise.all([
            database_1.prisma.property.findMany({
                where,
                include: {
                    rooms: {
                        where: {
                            capacity: { gte: guests },
                            deletedAt: null
                        },
                        select: { id: true, name: true, capacity: true, basePrice: true }
                    },
                    reviews: { select: { rating: true } },
                    _count: { select: { reviews: true } }
                },
                orderBy,
                skip,
                take: limit
            }),
            database_1.prisma.property.count({ where })
        ]);
        let availableProperties = properties;
        if (checkIn && checkOut) {
            const roomIds = properties.flatMap(p => p.rooms.map(r => r.id));
            const bookedRoomIds = await this.getBookedRoomIds(roomIds, checkIn, checkOut);
            availableProperties = properties
                .map(property => ({
                ...property,
                rooms: property.rooms.filter(room => !bookedRoomIds.has(room.id))
            }))
                .filter(property => property.rooms.length > 0);
        }
        const meta = (0, pagination_utils_1.getPaginationMeta)(page, limit, total);
        return (0, pagination_utils_1.createPaginatedResponse)(availableProperties, meta);
    }
    async getPropertyById(id) {
        const property = await database_1.prisma.property.findUnique({
            where: {
                id: id
            },
            include: {
                rooms: {
                    where: {
                        deletedAt: null
                    },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        capacity: true,
                        basePrice: true,
                        images: true
                    }
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        reviews: true
                    }
                }
            }
        });
        if (!property) {
            throw new api_error_1.ApiError(404, 'Properti tidak ditemukan');
        }
        return { property };
    }
    async getPropertyPrices(propertyId, roomId, month) {
        if (!roomId || !month) {
            throw new api_error_1.ApiError(400, 'Parameter roomId dan month diperlukan');
        }
        const startDate = new Date(month);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        // Get room base price
        const room = await database_1.prisma.room.findUnique({
            where: { id: roomId },
            select: { basePrice: true }
        });
        if (!room) {
            throw new api_error_1.ApiError(404, 'Kamar tidak ditemukan');
        }
        // Generate price data for each day in the month
        // Note: PriceRule tidak ada di schema, jadi kita gunakan base price
        const prices = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const price = Number(room.basePrice);
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            // Check if room is available for this date
            const isAvailable = await this.checkRoomAvailability(roomId, dateStr);
            prices.push({
                date: dateStr,
                price: Math.round(price),
                isAvailable,
                isWeekend
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return { prices };
    }
    buildWhereClause(city, guests, minPrice, maxPrice, amenities) {
        const where = {
            published: true,
            deletedAt: null,
            city: { contains: city, mode: 'insensitive' },
            rooms: {
                some: {
                    capacity: { gte: guests },
                    deletedAt: null
                }
            }
        };
        // Note: basePrice ada di Room, bukan Property
        // Untuk filter harga, perlu query rooms
        if (minPrice || maxPrice) {
            const priceFilter = {};
            if (minPrice)
                priceFilter.gte = parseFloat(minPrice);
            if (maxPrice)
                priceFilter.lte = parseFloat(maxPrice);
            where.rooms.some.basePrice = priceFilter;
        }
        return where;
    }
    getOrderByClause(sortBy) {
        const orderByMap = {
            // Property tidak memiliki basePrice, ada di Room
            // Untuk sementara sort by name atau createdAt
            'price_asc': { createdAt: 'asc' },
            'price_desc': { createdAt: 'desc' },
            'name_asc': { name: 'asc' },
            'rating_desc': { createdAt: 'desc' }
        };
        return orderByMap[sortBy] || orderByMap['name_asc'];
    }
    async getBookedRoomIds(roomIds, checkIn, checkOut) {
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);
        // Booking tidak memiliki roomId langsung, harus cek melalui items
        const bookings = await database_1.prisma.booking.findMany({
            where: {
                status: { notIn: [prisma_1.BookingStatus.cancelled, prisma_1.BookingStatus.expired, prisma_1.BookingStatus.rejected] },
                OR: [{
                        AND: [
                            { checkIn: { lt: endDate } },
                            { checkOut: { gt: startDate } }
                        ]
                    }]
            },
            include: {
                items: {
                    where: {
                        roomId: { in: roomIds }
                    },
                    select: { roomId: true }
                }
            }
        });
        const bookedRoomIds = new Set();
        bookings.forEach(booking => {
            booking.items.forEach(item => {
                bookedRoomIds.add(item.roomId);
            });
        });
        return bookedRoomIds;
    }
    async checkRoomAvailability(roomId, date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
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
}
exports.PropertyService = PropertyService;
