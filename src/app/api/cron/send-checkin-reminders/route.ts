import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendCheckInReminder } from '@/lib/email'

/**
 * Cron job to send H-1 check-in reminders
 * Should be called once per day (e.g., every morning at 9 AM)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        checkIn: {
          gte: tomorrow,
          lt: dayAfterTomorrow
        }
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

    let sentCount = 0

    for (const booking of upcomingBookings) {
      try {
        await sendCheckInReminder(booking)
        sentCount++
      } catch (error) {
        // Continue with other bookings even if one fails
        continue
      }
    }

    return NextResponse.json({
      message: `Sent ${sentCount} check-in reminders`,
      sentCount
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}

