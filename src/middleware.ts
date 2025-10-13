import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/properties/search',
    '/api/properties/',
    '/api/uploads/',
    '/api/rooms/',
    '/api/cron/'
  ]

  const isPublic = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isPublic) {
    return NextResponse.next()
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token
  const user = verifyToken(token)
  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  // Check role-based access
  const tenantRoutes = ['/tenant', '/api/tenant']
  const userRoutes = ['/user', '/api/user', '/api/bookings']

  if (request.nextUrl.pathname.startsWith('/tenant') || request.nextUrl.pathname.startsWith('/api/tenant')) {
    if (user.role !== 'TENANT' && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/user') || request.nextUrl.pathname.startsWith('/api/user')) {
    if (user.role !== 'USER' && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

