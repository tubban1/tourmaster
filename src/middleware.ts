import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/tours',
  '/guides',
  '/vehicles',
  '/itineraries',
  '/members',
  '/suppliers',
  '/bookings',
  '/admin',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 允许 API 路由、静态资源、登录页、根路径等
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // 只拦截受保护的页面
  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isProtected) {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      const loginUrl = new URL('/', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico).*)',
  ],
}