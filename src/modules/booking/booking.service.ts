import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/errors'
import { 
  checkRoomAvailability, 
  validateBookingDates, 
  calculateBookingPrice 
} from '@/lib/booking-utils'
import { sendBookingCancellation } from '@/lib/email'

export interface CreateBookingDTO {
  propertyId: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  notes?: string
}

export class BookingService {
  
  async createBooking(userId: string, data: CreateBookingDTO) {
    // Validate dates
    const dateValidation = validateBookingDates(data.checkIn, data.checkOut)
    if (!dateValidation.valid) {
      throw new ApiError(400, dateValidation.error || 'Invalid dates')
    }

    // Check room availability
    const isAvailable = await checkRoomAvailability(
      data.roomId,
      data.checkIn,
      data.checkOut
    )

    if (!isAvailable) {
      throw new ApiError(400, 'Kamar tidak tersedia untuk tanggal yang dipilih')
    }

    // Calculate total price
    const totalPrice = await calculateBookingPrice(
      data.roomId,
      data.checkIn,
      data.checkOut
    )

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        propertyId: data.propertyId,
        roomId: data.roomId,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        guests: data.guests,
        totalPrice: totalPrice,
        notes: data.notes || null,
        status: 'PENDING_PAYMENT'
      },
      include: {
        property: {
          select: { name: true, address: true }
        },
        room: {
          select: { name: true, capacity: true }
        }
      }
    })

    return {
      booking,
      message: 'Pemesanan berhasil dibuat'
    }
  }

  async getBookingById(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
            name: true,
            capacity: true
          }
        }
      }
    })

    if (!booking) {
      throw new ApiError(404, 'Pemesanan tidak ditemukan')
    }

    // Check if user has access to this booking
    if (booking.userId !== userId) {
      throw new ApiError(403, 'Unauthorized')
    }

    return { booking }
  }

  async cancelBooking(bookingId: string, userId: string, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
      throw new ApiError(404, 'Pemesanan tidak ditemukan')
    }

    if (booking.userId !== userId) {
      throw new ApiError(403, 'Unauthorized')
    }

    if (!['PENDING_PAYMENT', 'PAYMENT_CONFIRMED'].includes(booking.status)) {
      throw new ApiError(400, 'Pemesanan tidak dapat dibatalkan')
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    })

    if (reason) {
      await sendBookingCancellation(booking, reason)
    }

    return {
      booking: updatedBooking,
      message: 'Pemesanan berhasil dibatalkan'
    }
  }

  async uploadPaymentProof(userId: string, bookingId: string, fileUrl: string) {
    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      throw new ApiError(404, 'Pemesanan tidak ditemukan')
    }

    if (booking.userId !== userId) {
      throw new ApiError(403, 'Unauthorized')
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      throw new ApiError(400, 'Pemesanan tidak dalam status menunggu pembayaran')
    }

    // Update booking with payment proof
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentProof: fileUrl,
        status: 'PAYMENT_CONFIRMED'
      }
    })

    return {
      booking: updatedBooking,
      message: 'Bukti pembayaran berhasil diupload'
    }
  }

  async getUserBookings(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        property: {
          select: { name: true, address: true }
        },
        room: {
          select: { name: true, capacity: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { bookings }
  }
}
