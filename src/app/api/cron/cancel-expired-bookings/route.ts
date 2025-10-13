import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isPaymentExpired } from '@/lib/booking-utils'

/**
 * Cron job to auto-cancel expired bookings
 * Should be called every 5-10 minutes
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        paymentProof: null,
        createdAt: {
          lt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      }
    })

    let cancelledCount = 0

    for (const booking of expiredBookings) {
      if (isPaymentExpired(booking.createdAt)) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' }
        })
        cancelledCount++
      }
    }

    return NextResponse.json({
      message: `Cancelled ${cancelledCount} expired bookings`,
      cancelledCount
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cancel expired bookings' },
      { status: 500 }
    )
  }
}

