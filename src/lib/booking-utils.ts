import { prisma } from './prisma'

/**
 * Check if a room is available for the specified date range
 */
export async function checkRoomAvailability(
  roomId: string,
  checkIn: string | Date,
  checkOut: string | Date
): Promise<boolean> {
  const startDate = new Date(checkIn)
  const endDate = new Date(checkOut)

  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      status: {
        notIn: ['CANCELLED']
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
 * Calculate total price for a booking with price rules
 */
export async function calculateBookingPrice(
  roomId: string,
  checkIn: string | Date,
  checkOut: string | Date
): Promise<number> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      property: {
        include: {
          priceRules: {
            where: { isActive: true }
          }
        }
      }
    }
  })

  if (!room) {
    throw new Error('Room not found')
  }

  let totalPrice = 0
  const startDate = new Date(checkIn)
  const endDate = new Date(checkOut)
  const currentDate = new Date(startDate)

  while (currentDate < endDate) {
    let dailyPrice = Number(room.basePrice)

    const applicableRule = room.property.priceRules.find(rule => {
      const ruleStart = new Date(rule.startDate)
      const ruleEnd = new Date(rule.endDate)
      return currentDate >= ruleStart && currentDate <= ruleEnd
    })

    if (applicableRule) {
      if (applicableRule.priceType === 'PERCENTAGE') {
        dailyPrice = dailyPrice * (1 + Number(applicableRule.value) / 100)
      } else {
        dailyPrice = Number(applicableRule.value)
      }
    }

    totalPrice += dailyPrice
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return Math.round(totalPrice)
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

