import { prisma } from '@/lib/prisma'
import { sendBookingCancellation, sendCheckInReminder } from '@/lib/email'
import { BookingStatus } from '@/generated/prisma'

export class CronService {
  static init() {
    console.log('✅ Cron jobs initialized')
    // In a real application, you would set up actual cron jobs here
    // For example using node-cron or agenda.js
  }

  static async cancelExpiredBookings() {
    try {
      const expiredTime = new Date()
      expiredTime.setHours(expiredTime.getHours() - 24) // 24 hours ago

      const expiredBookings = await prisma.booking.findMany({
        where: {
          status: BookingStatus.pending_payment,
          createdAt: {
            lte: expiredTime
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              room: {
                include: {
                  property: {
                    select: {
                      id: true,
                      name: true,
                      address: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      for (const booking of expiredBookings) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { 
            status: BookingStatus.cancelled,
            cancelledAt: new Date(),
            cancelReason: 'Pemesanan dibatalkan otomatis karena tidak ada konfirmasi pembayaran dalam 24 jam'
          }
        })

        await sendBookingCancellation(booking as any, 'Pemesanan dibatalkan otomatis karena tidak ada konfirmasi pembayaran dalam 24 jam')
      }

      return {
        message: `${expiredBookings.length} expired bookings cancelled`,
        count: expiredBookings.length
      }
    } catch (error) {
      console.error('Cancel expired bookings error:', error)
      throw new Error('Failed to cancel expired bookings')
    }
  }

  static async sendCheckinReminders() {
    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      const upcomingBookings = await prisma.booking.findMany({
        where: {
          status: BookingStatus.confirmed,
          checkIn: {
            gte: tomorrow,
            lt: dayAfterTomorrow
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              room: {
                include: {
                  property: {
                    select: {
                      id: true,
                      name: true,
                      address: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      for (const booking of upcomingBookings) {
        await sendCheckInReminder(booking as any)
      }

      return {
        message: `${upcomingBookings.length} check-in reminders sent`,
        count: upcomingBookings.length
      }
    } catch (error) {
      console.error('Send check-in reminders error:', error)
      throw new Error('Failed to send check-in reminders')
    }
  }
}
