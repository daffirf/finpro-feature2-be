import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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
    const booking = await prisma.booking.findUnique({
      where: { id: id },
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

    const body = await request.json()
    const { reason } = body

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: id },
      data: {
        status: 'CANCELLED'
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

    // Send rejection email
    try {
      const { sendPaymentRejection } = await import('@/lib/email')
      await sendPaymentRejection(updatedBooking, reason)
    } catch (emailError) {
      // Log but don't fail the request
    }

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Pembayaran ditolak, booking dibatalkan'
    })

  } catch (error) {
    console.error('Reject payment error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

