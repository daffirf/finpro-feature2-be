import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tenant = await getTenant(user.id)
    
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const dateFilter = buildDateFilter(searchParams)
    const bookings = await getBookingsForReport(tenant.id, dateFilter)
    
    const report = generateReport(bookings)

    return NextResponse.json({ report })

  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

async function getTenant(userId: string) {
  return prisma.tenant.findUnique({ where: { userId } })
}

function buildDateFilter(searchParams: URLSearchParams) {
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const filter: any = {}
  
  if (startDate) filter.gte = new Date(startDate)
  if (endDate) filter.lte = new Date(endDate)
  
  return filter
}

async function getBookingsForReport(tenantId: string, dateFilter: any) {
  return prisma.booking.findMany({
    where: {
      property: { tenantId },
      status: { in: ['CONFIRMED', 'COMPLETED'] },
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    },
    include: {
      property: { select: { name: true } },
      user: { select: { name: true, email: true } }
    }
  })
}

function generateReport(bookings: any[]) {
  const totalRevenue = calculateTotalRevenue(bookings)
  const totalBookings = bookings.length
  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

  return {
    totalRevenue,
    totalBookings,
    averageBookingValue,
    monthlyRevenue: calculateMonthlyRevenue(bookings),
    topProperties: getTopProperties(bookings)
  }
}

function calculateTotalRevenue(bookings: any[]): number {
  return bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0)
}

function calculateMonthlyRevenue(bookings: any[]) {
  const monthly = bookings.reduce((acc, booking) => {
    const month = booking.createdAt.toISOString().slice(0, 7)
    const existing = acc.find(item => item.month === month)
    
    if (existing) {
      existing.revenue += Number(booking.totalPrice)
    } else {
      acc.push({ month, revenue: Number(booking.totalPrice) })
    }
    return acc
  }, [] as { month: string; revenue: number }[])

  return monthly.sort((a, b) => a.month.localeCompare(b.month))
}

function getTopProperties(bookings: any[]) {
  const stats = bookings.reduce((acc, booking) => {
    const name = booking.property.name
    const existing = acc.find(item => item.name === name)
    
    if (existing) {
      existing.revenue += Number(booking.totalPrice)
      existing.bookings += 1
    } else {
      acc.push({
        name,
        revenue: Number(booking.totalPrice),
        bookings: 1
      })
    }
    return acc
  }, [] as { name: string; revenue: number; bookings: number }[])

  return stats.sort((a, b) => b.revenue - a.revenue).slice(0, 5)
}

