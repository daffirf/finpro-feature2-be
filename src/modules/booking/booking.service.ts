import { prisma } from '@/utils/database'
import { ApiError } from '@/utils/api-error'
import { 
  checkRoomAvailability, 
  validateBookingDates
} from '@/utils/booking.utils'
import { calculateNights } from '@/utils/date.utils'
import { sendBookingCancellation } from '@/services/email.service'
import { BookingStatus } from '@/generated/prisma'

export interface CreateBookingDTO {
  roomId: number
  checkIn: string
  checkOut: string
  totalGuests: number
  unitCount?: number
  notes?: string
  paymentMethod?: string
}

export class BookingService {
  
  async createBooking(userId: number, data: CreateBookingDTO) {
    // Validate dates
    const dateValidation = validateBookingDates(data.checkIn, data.checkOut)
    if (!dateValidation.valid) {
      throw new ApiError(400, dateValidation.error || 'Invalid dates')
    }

    // Get room details
    const room = await prisma.room.findUnique({
      where: { id: data.roomId },
      include: { property: true }
    })

    if (!room) {
      throw new ApiError(404, 'Kamar tidak ditemukan')
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

    // Calculate pricing
    const nights = calculateNights(data.checkIn, data.checkOut)
    const unitCount = data.unitCount || 1
    const unitPrice = room.basePrice
    const subTotal = unitPrice * nights * unitCount

    // Generate booking number
    const bookingNo = `BK-${Date.now()}-${userId}`

    // Create booking with item
    const booking = await prisma.booking.create({
      data: {
        bookingNo,
        userId,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        totalGuests: data.totalGuests,
        totalPrice: subTotal,
        notes: data.notes || null,
        status: BookingStatus.pending_payment,
        items: {
          create: {
            roomId: data.roomId,
            unitCount,
            unitPrice,
            nights,
            subTotal
          }
        }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            room: {
              include: {
                property: {
                  select: { id: true, name: true, address: true }
                }
              }
            }
          }
        }
      }
    })

    return {
      booking,
      message: 'Pemesanan berhasil dibuat'
    }
  }

  async getBookingById(bookingId: number, userId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
                  select: { id: true, name: true, address: true }
                }
              }
            }
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

  async cancelBooking(bookingId: number, userId: number, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
                  select: { id: true, name: true, address: true }
                }
              }
            }
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

    const cancellableStatuses = [BookingStatus.pending_payment, BookingStatus.waiting_confirmed]
    if (!cancellableStatuses.includes(booking.status as any)) {
      throw new ApiError(400, 'Pemesanan tidak dapat dibatalkan')
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: BookingStatus.cancelled,
        cancelledAt: new Date(),
        cancelReason: reason || null
      }
    })

    if (reason && booking.user.email) {
      await sendBookingCancellation(booking as any, reason)
    }

    return {
      booking: updatedBooking,
      message: 'Pemesanan berhasil dibatalkan'
    }
  }

  async uploadPaymentProof(userId: number, bookingId: number, fileUrl: string) {
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

    if (booking.status !== BookingStatus.pending_payment) {
      throw new ApiError(400, 'Pemesanan tidak dalam status menunggu pembayaran')
    }

    // Update booking with payment proof
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentProofUrl: fileUrl,
        paymentMethod: 'manual_transfer',
        status: BookingStatus.waiting_confirmed
      }
    })

    return {
      booking: updatedBooking,
      message: 'Bukti pembayaran berhasil diupload'
    }
  }

  async getUserBookings(userId: number) {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            room: {
              include: {
                property: {
                  select: { id: true, name: true, address: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { bookings }
  }
}
