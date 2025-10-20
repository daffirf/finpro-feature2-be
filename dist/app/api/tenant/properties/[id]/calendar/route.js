"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const prisma_1 = require("@/lib/prisma");
const auth_1 = require("@/lib/auth");
async function GET(request, { params }) {
    try {
        const token = request.cookies.get('auth-token')?.value;
        if (!token) {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = (0, auth_1.verifyToken)(token);
        if (!user || user.role !== 'TENANT') {
            return server_1.NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const tenant = await prisma_1.prisma.tenant.findUnique({
            where: { userId: user.id }
        });
        if (!tenant) {
            return server_1.NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // Format: YYYY-MM
        const year = searchParams.get('year');
        // Verify property belongs to tenant
        const property = await prisma_1.prisma.property.findFirst({
            where: {
                id,
                tenantId: tenant.id
            },
            include: {
                rooms: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                        basePrice: true
                    }
                }
            }
        });
        if (!property) {
            return server_1.NextResponse.json({ error: 'Properti tidak ditemukan' }, { status: 404 });
        }
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
        // Get all bookings in the date range
        const bookings = await prisma_1.prisma.booking.findMany({
            where: {
                propertyId: id,
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
                roomId: true,
                checkIn: true,
                checkOut: true,
                status: true,
                user: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                checkIn: 'asc'
            }
        });
        // Generate calendar data for each room
        const roomCalendars = property.rooms.map(room => {
            const calendar = generateRoomCalendar(room, startDate, endDate, bookings.filter(b => b.roomId === room.id));
            return {
                roomId: room.id,
                roomName: room.name,
                capacity: room.capacity,
                basePrice: room.basePrice,
                calendar
            };
        });
        return server_1.NextResponse.json({
            property: {
                id: property.id,
                name: property.name
            },
            period: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            },
            rooms: roomCalendars
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
function generateRoomCalendar(room, startDate, endDate, bookings) {
    const calendar = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        // Check if room is booked on this date
        const booking = bookings.find(b => {
            const checkIn = new Date(b.checkIn);
            const checkOut = new Date(b.checkOut);
            return currentDate >= checkIn && currentDate < checkOut;
        });
        calendar.push({
            date: dateStr,
            dayOfWeek: currentDate.getDay(),
            status: booking ? 'BOOKED' : 'AVAILABLE',
            booking: booking ? {
                id: booking.id,
                guestName: booking.user.name,
                checkIn: booking.checkIn.toISOString().split('T')[0],
                checkOut: booking.checkOut.toISOString().split('T')[0],
                status: booking.status
            } : null
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return calendar;
}
