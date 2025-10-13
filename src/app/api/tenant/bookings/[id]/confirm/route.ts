import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { userId: user.id }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Get booking
    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            tenant: true
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

    if (booking.property.tenant.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (booking.status !== 'PAYMENT_CONFIRMED') {
      return NextResponse.json(
        { error: 'Pemesanan tidak dalam status pembayaran dikonfirmasi' },
        { status: 400 }
      )
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED'
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        property: {
          select: { name: true, address: true }
        },
        room: {
          select: { name: true }
        }
      }
    })

    // Send confirmation email
    try {
      const { sendBookingConfirmation } = await import('@/lib/email')
      await sendBookingConfirmation(updatedBooking)
    } catch (emailError) {
      // Log but don't fail the request
    }

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Pembayaran berhasil dikonfirmasi'
    })

  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
