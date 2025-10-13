import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { sendBookingCancellation } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { userId: user.id }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const { id } = await params
    const body = await request.json()
    const { reason } = body

    const booking = await prisma.booking.findUnique({
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
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Pemesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    if (booking.property.tenant.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Tenant hanya bisa cancel jika bukti bayar belum diupload
    if (booking.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: 'Pemesanan hanya dapat dibatalkan sebelum user upload bukti pembayaran' },
        { status: 400 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    // Send cancellation email to user
    try {
      await sendBookingCancellation(booking, reason)
    } catch (emailError) {
      // Log but don't fail the request
    }

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Pemesanan berhasil dibatalkan'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

