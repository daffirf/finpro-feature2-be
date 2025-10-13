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
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { reason } = body

    const booking = await prisma.booking.findUnique({
      where: { id },
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
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Pemesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (!['PENDING_PAYMENT', 'PAYMENT_CONFIRMED'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Pemesanan tidak dapat dibatalkan' },
        { status: 400 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    await sendBookingCancellation(booking, reason)

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

