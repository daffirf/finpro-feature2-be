"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const prisma_1 = require("@/lib/prisma");
const errors_1 = require("@/lib/errors");
const pagination_1 = require("@/lib/pagination");
class PropertyService {
    async searchProperties(params) {
        const { city = '', checkIn = '', checkOut = '', guests = 1, sortBy = 'price_asc', minPrice, maxPrice, amenities = [], page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = this.buildWhereClause(city, guests, minPrice, maxPrice, amenities);
        const orderBy = this.getOrderByClause(sortBy);
        const [properties, total] = await Promise.all([
            prisma_1.prisma.property.findMany({
                where,
                include: {
                    rooms: {
                        where: { capacity: { gte: guests }, isActive: true },
                        select: { id: true, name: true, capacity: true, basePrice: true }
                    },
                    reviews: { select: { rating: true } },
                    _count: { select: { reviews: true } }
                },
                orderBy,
                skip,
                take: limit
            }),
            prisma_1.prisma.property.count({ where })
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
        const meta = (0, pagination_1.getPaginationMeta)(page, limit, total);
        return (0, pagination_1.createPaginatedResponse)(availableProperties, meta);
    }
    async getPropertyById(id) {
        const property = await prisma_1.prisma.property.findUnique({
            where: {
                id: id,
                isActive: true
            },
            include: {
                rooms: {
                    where: {
                        isActive: true
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
            throw new errors_1.ApiError(404, 'Properti tidak ditemukan');
        }
        return { property };
    }
    async getPropertyPrices(propertyId, roomId, month) {
        if (!roomId || !month) {
            throw new errors_1.ApiError(400, 'Parameter roomId dan month diperlukan');
        }
        const startDate = new Date(month);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        // Get room base price
        const room = await prisma_1.prisma.room.findUnique({
            where: { id: roomId },
            select: { basePrice: true }
        });
        if (!room) {
            throw new errors_1.ApiError(404, 'Kamar tidak ditemukan');
        }
        // Get price rules for the property
        const priceRules = await prisma_1.prisma.priceRule.findMany({
            where: {
                propertyId,
                isActive: true,
                OR: [
                    {
                        startDate: {
                            lte: endDate
                        },
                        endDate: {
                            gte: startDate
                        }
                    }
                ]
            }
        });
        // Generate price data for each day in the month
        const prices = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            let price = Number(room.basePrice);
            let isHoliday = false;
            let isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            // Check for price rules
            const applicableRule = priceRules.find(rule => {
                const ruleStart = new Date(rule.startDate);
                const ruleEnd = new Date(rule.endDate);
                return currentDate >= ruleStart && currentDate <= ruleEnd;
            });
            if (applicableRule) {
                if (applicableRule.priceType === 'PERCENTAGE') {
                    price = price * (1 + Number(applicableRule.value) / 100);
                }
                else {
                    price = Number(applicableRule.value);
                }
                isHoliday = true;
            }
            // Check if room is available for this date
            const isAvailable = await this.checkRoomAvailability(roomId, dateStr);
            prices.push({
                date: dateStr,
                price: Math.round(price),
                isAvailable,
                isHoliday,
                isWeekend
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return { prices };
    }
    buildWhereClause(city, guests, minPrice, maxPrice, amenities) {
        const where = {
            isActive: true,
            city: { contains: city, mode: 'insensitive' },
            rooms: {
                some: { capacity: { gte: guests }, isActive: true }
            }
        };
        if (minPrice || maxPrice) {
            where.basePrice = {};
            if (minPrice)
                where.basePrice.gte = parseFloat(minPrice);
            if (maxPrice)
                where.basePrice.lte = parseFloat(maxPrice);
        }
        if (amenities.length > 0) {
            where.amenities = { hasSome: amenities };
        }
        return where;
    }
    getOrderByClause(sortBy) {
        const orderByMap = {
            'price_asc': { basePrice: 'asc' },
            'price_desc': { basePrice: 'desc' },
            'name_asc': { name: 'asc' },
            'rating_desc': { reviews: { _count: 'desc' } }
        };
        return orderByMap[sortBy] || orderByMap['price_asc'];
    }
    async getBookedRoomIds(roomIds, checkIn, checkOut) {
        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);
        const bookedRooms = await prisma_1.prisma.booking.findMany({
            where: {
                roomId: { in: roomIds },
                status: { notIn: ['CANCELLED'] },
                OR: [{
                        AND: [
                            { checkIn: { lt: endDate } },
                            { checkOut: { gt: startDate } }
                        ]
                    }]
            },
            select: { roomId: true }
        });
        return new Set(bookedRooms.map(b => b.roomId));
    }
    async checkRoomAvailability(roomId, date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        const conflictingBooking = await prisma_1.prisma.booking.findFirst({
            where: {
                roomId,
                status: {
                    not: 'CANCELLED'
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
