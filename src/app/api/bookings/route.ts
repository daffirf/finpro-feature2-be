import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createBookingSchema } from '@/lib/validation'
import { 
  checkRoomAvailability, 
  validateBookingDates, 
  calculateBookingPrice 
} from '@/lib/booking-utils'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    const dateValidation = validateBookingDates(
      validatedData.checkIn,
      validatedData.checkOut
    )
    
    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      )
    }

    const isAvailable = await checkRoomAvailability(
      validatedData.roomId,
      validatedData.checkIn,
      validatedData.checkOut
    )

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Kamar tidak tersedia untuk tanggal yang dipilih' },
        { status: 400 }
      )
    }

    const totalPrice = await calculateBookingPrice(
      validatedData.roomId,
      validatedData.checkIn,
      validatedData.checkOut
    )

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        propertyId: validatedData.propertyId,
        roomId: validatedData.roomId,
        checkIn: new Date(validatedData.checkIn),
        checkOut: new Date(validatedData.checkOut),
        guests: validatedData.guests,
        totalPrice: totalPrice,
        notes: validatedData.notes || null,
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

    return NextResponse.json({
      booking,
      message: 'Pemesanan berhasil dibuat'
    }, { status: 201 })

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
