"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const database_1 = require("@/utils/database");
const auth_utils_1 = require("@/utils/auth.utils");
async function GET(request) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = (0, auth_utils_1.verifyToken)(token);
        if (!user || user.role !== 'TENANT') {
            return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const tenant = await database_1.prisma.tenant.findUnique({
            where: { userId: user.id }
        });
        if (!tenant) {
            return server_1.NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // Format: YYYY-MM
        const year = searchParams.get('year');
        // Determine date range
        let startDate;
        let endDate;
        if (month) {
            const [yearNum, monthNum] = month.split('-').map(Number);
            startDate = new Date(yearNum, monthNum - 1, 1);
            endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);
        }
        else if (year) {
            startDate = new Date(parseInt(year), 0, 1);
            endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        }
        else {
            // Default: current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }
        // Get all properties owned by tenant
        const properties = await database_1.prisma.property.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true
            },
            include: {
                rooms: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        // Get all bookings for these properties
        const propertyIds = properties.map(p => p.id);
        const bookings = await database_1.prisma.booking.findMany({
            where: {
                propertyId: { in: propertyIds },
                status: { notIn: ['CANCELLED'] },
                OR: [
                    {
                        checkIn: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    {
                        checkOut: {
                            gte: startDate,
                            lte: endDate
                        }
                    },
                    {
                        AND: [
                            { checkIn: { lte: startDate } },
                            { checkOut: { gte: endDate } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                propertyId: true,
                roomId: true,
                checkIn: true,
                checkOut: true,
                status: true
            }
        });
        // Group bookings by property
        const propertySummaries = properties.map(property => {
            const propertyBookings = bookings.filter(b => b.propertyId === property.id);
            // Calculate occupancy stats
            const totalRooms = property.rooms.length;
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const totalRoomDays = totalRooms * totalDays;
            let bookedDays = 0;
            propertyBookings.forEach(booking => {
                const checkIn = new Date(booking.checkIn);
                const checkOut = new Date(booking.checkOut);
                const periodStart = checkIn < startDate ? startDate : checkIn;
                const periodEnd = checkOut > endDate ? endDate : checkOut;
                const days = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
                bookedDays += days;
            });
            const occupancyRate = totalRoomDays > 0 ? (bookedDays / totalRoomDays) * 100 : 0;
            return {
                id: property.id,
                name: property.name,
                totalRooms,
                totalBookings: propertyBookings.length,
                occupancyRate: Math.round(occupancyRate * 100) / 100,
                availableDays: totalRoomDays - bookedDays,
                bookedDays
            };
        });
        return server_1.NextResponse.json({
            period: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            },
            properties: propertySummaries,
            summary: {
                totalProperties: properties.length,
                totalRooms: properties.reduce((sum, p) => sum + p.rooms.length, 0),
                totalBookings: bookings.length,
                averageOccupancy: Math.round((propertySummaries.reduce((sum, p) => sum + p.occupancyRate, 0) /
                    (propertySummaries.length || 1)) * 100) / 100
            }
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
