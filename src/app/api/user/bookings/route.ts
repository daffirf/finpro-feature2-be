import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { 
  getPaginationParams, 
  getPaginationMeta, 
  createPaginatedResponse 
} from '@/lib/pagination'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const checkInStart = searchParams.get('checkInStart')
    const checkInEnd = searchParams.get('checkInEnd')
    const checkOutStart = searchParams.get('checkOutStart')
    const checkOutEnd = searchParams.get('checkOutEnd')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const { page, limit, skip } = getPaginationParams(searchParams)

    const where: any = { userId: user.id }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { property: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Filter by check-in date range
    if (checkInStart || checkInEnd) {
      where.checkIn = {}
      if (checkInStart) where.checkIn.gte = new Date(checkInStart)
      if (checkInEnd) where.checkIn.lte = new Date(checkInEnd)
    }

    // Filter by check-out date range
    if (checkOutStart || checkOutEnd) {
      where.checkOut = {}
      if (checkOutStart) where.checkOut.gte = new Date(checkOutStart)
      if (checkOutEnd) where.checkOut.lte = new Date(checkOutEnd)
    }

    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          property: {
            select: { name: true, address: true, images: true }
          },
          room: {
            select: { name: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.booking.count({ where })
    ])

    const meta = getPaginationMeta(page, limit, total)

    return NextResponse.json(createPaginatedResponse(bookings, meta))

  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

