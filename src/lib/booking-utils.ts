import { prisma } from './prisma'
import { BookingStatus } from '@/generated/prisma'

/**
 * Check if a room is available for the specified date range
 */
export async function checkRoomAvailability(
  roomId: number,
  checkIn: string | Date,
  checkOut: string | Date
): Promise<boolean> {
  const startDate = new Date(checkIn)
  const endDate = new Date(checkOut)

  // Check for conflicting bookings through BookingItems
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      items: {
        some: {
          roomId
        }
      },
      status: {
        notIn: [BookingStatus.cancelled, BookingStatus.expired, BookingStatus.rejected]
      },
      OR: [
        {
          AND: [
            { checkIn: { lt: endDate } },
            { checkOut: { gt: startDate } }
          ]
        }
      ]
    }
  })

  return !conflictingBooking
}

/**
 * Validate booking dates
 */
export function validateBookingDates(
  checkIn: string | Date,
  checkOut: string | Date
): { valid: boolean; error?: string } {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (checkInDate < today) {
    return { 
      valid: false, 
      error: 'Tanggal check-in tidak boleh di masa lalu' 
    }
  }

  if (checkOutDate <= checkInDate) {
    return { 
      valid: false, 
      error: 'Tanggal check-out harus setelah check-in' 
    }
  }

  const maxDays = 30
  const daysDiff = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysDiff > maxDays) {
    return { 
      valid: false, 
      error: `Maksimal pemesanan ${maxDays} hari` 
    }
  }

  return { valid: true }
}

/**
 * Calculate total price for a booking
 * Can be extended with price rules in the future
 */
export async function calculateBookingPrice(
  roomId: number,
  checkIn: string | Date,
  checkOut: string | Date,
  unitCount: number = 1
): Promise<number> {
  const room = await prisma.room.findUnique({
    where: { id: roomId }
  })

  if (!room) {
    throw new Error('Room not found')
  }

  const nights = calculateNights(checkIn, checkOut)
  const totalPrice = room.basePrice * nights * unitCount

  return totalPrice
}

/**
 * Calculate nights between two dates
 */
export function calculateNights(
  checkIn: string | Date,
  checkOut: string | Date
): number {
  const startDate = new Date(checkIn)
  const endDate = new Date(checkOut)
  return Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
}

/**
 * Check if booking payment is expired (1 hour timeout)
 */
export function isPaymentExpired(createdAt: Date): boolean {
  const oneHourInMs = 60 * 60 * 1000
  const now = new Date()
  return now.getTime() - createdAt.getTime() > oneHourInMs
}

