import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaginationParams, getPaginationMeta, createPaginatedResponse } from '@/lib/pagination'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    
    const city = searchParams.get('city') || ''
    const checkIn = searchParams.get('checkIn') || ''
    const checkOut = searchParams.get('checkOut') || ''
    const guests = parseInt(searchParams.get('guests') || '1')
    const sortBy = searchParams.get('sortBy') || 'price_asc'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || []

    const where = buildWhereClause(city, guests, minPrice, maxPrice, amenities)
    const orderBy = getOrderByClause(sortBy)

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          rooms: {
            where: { capacity: { gte: guests }, isActive: true },
            select: { id: true, name: true, capacity: true, basePrice: true }
          },
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.property.count({ where })
    ])

    let availableProperties = properties
    
    if (checkIn && checkOut) {
      const roomIds = properties.flatMap(p => p.rooms.map(r => r.id))
      const bookedRoomIds = await getBookedRoomIds(roomIds, checkIn, checkOut)
      
      availableProperties = properties
        .map(property => ({
          ...property,
          rooms: property.rooms.filter(room => !bookedRoomIds.has(room.id))
        }))
        .filter(property => property.rooms.length > 0)
    }

    const meta = getPaginationMeta(page, limit, total)

    return NextResponse.json(createPaginatedResponse(availableProperties, meta))

  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

function buildWhereClause(
  city: string, 
  guests: number, 
  minPrice: string | null, 
  maxPrice: string | null, 
  amenities: string[]
) {
  const where: any = {
    isActive: true,
    city: { contains: city, mode: 'insensitive' },
    rooms: {
      some: { capacity: { gte: guests }, isActive: true }
    }
  }

  if (minPrice || maxPrice) {
    where.basePrice = {}
    if (minPrice) where.basePrice.gte = parseFloat(minPrice)
    if (maxPrice) where.basePrice.lte = parseFloat(maxPrice)
  }

  if (amenities.length > 0) {
    where.amenities = { hasSome: amenities }
  }

  return where
}

function getOrderByClause(sortBy: string) {
  const orderByMap: Record<string, any> = {
    'price_asc': { basePrice: 'asc' },
    'price_desc': { basePrice: 'desc' },
    'name_asc': { name: 'asc' },
    'rating_desc': { reviews: { _count: 'desc' } }
  }
  return orderByMap[sortBy] || orderByMap['price_asc']
}

async function getBookedRoomIds(
  roomIds: string[], 
  checkIn: string, 
  checkOut: string
): Promise<Set<string>> {
  const startDate = new Date(checkIn)
  const endDate = new Date(checkOut)

  const bookedRooms = await prisma.booking.findMany({
    where: {
      roomId: { in: roomIds },
      status: { notIn: ['CANCELLED'] },
      OR: [{
        AND: [
          { checkIn: { lt: endDate } },
          { checkOut: { gt: startDate } }
        ]
      }]
    },
    select: { roomId: true }
  })

  return new Set(bookedRooms.map(b => b.roomId))
}
