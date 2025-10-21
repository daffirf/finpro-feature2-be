"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const database_1 = require("@/utils/database");
const auth_utils_1 = require("@/utils/auth.utils");
const email_service_1 = require("@/services/email.service");
async function POST(request, { params }) {
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
        const { id } = await params;
        const body = await request.json();
        const { reason } = body;
        const booking = await database_1.prisma.booking.findUnique({
            where: { id },
            include: {
                property: {
                    include: {
                        tenant: true
                    }
                },
                user: {
                    select: { name: true, email: true }
                },
                room: {
                    select: { name: true }
                }
            }
        });
        if (!booking) {
            return server_1.NextResponse.json({ error: 'Pemesanan tidak ditemukan' }, { status: 404 });
        }
        if (booking.property.tenant.userId !== user.id) {
            return server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        // Tenant hanya bisa cancel jika bukti bayar belum diupload
        if (booking.status !== 'PENDING_PAYMENT') {
            return server_1.NextResponse.json({ error: 'Pemesanan hanya dapat dibatalkan sebelum user upload bukti pembayaran' }, { status: 400 });
        }
        const updatedBooking = await database_1.prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
        // Send cancellation email to user
        try {
            await (0, email_service_1.sendBookingCancellation)(booking, reason);
        }
        catch (emailError) {
            // Log but don't fail the request
        }
        return server_1.NextResponse.json({
            booking: updatedBooking,
            message: 'Pemesanan berhasil dibatalkan'
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
