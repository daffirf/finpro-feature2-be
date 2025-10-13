import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
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
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const bookingId = formData.get('bookingId') as string

    if (!file || !bookingId) {
      return NextResponse.json(
        { error: 'File dan booking ID diperlukan' },
        { status: 400 }
      )
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 1024 * 1024 // 1MB

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar (maksimal 1MB)' },
        { status: 400 }
      )
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file harus JPG atau PNG' },
        { status: 400 }
      )
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
      return NextResponse.json(
        { error: 'Ekstensi file tidak valid' },
        { status: 400 }
      )
    }

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Pemesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    if (booking.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { error: 'Pemesanan tidak dalam status menunggu pembayaran' },
        { status: 400 }
      )
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = join(process.cwd(), 'uploads', 'payments')
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${bookingId}-${Date.now()}.${file.name.split('.').pop()}`
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/payments/${fileName}`

    // Update booking with payment proof
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentProof: fileUrl,
        status: 'PAYMENT_CONFIRMED'
      }
    })

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Bukti pembayaran berhasil diupload'
    })

  } catch (error) {
    console.error('Upload payment proof error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

