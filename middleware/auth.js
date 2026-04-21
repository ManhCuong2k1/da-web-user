import { NextResponse } from 'next/server'

export function middleware(req) {
  const { pathname } = req.nextUrl
  if (pathname === '/login' || pathname === '/register') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/register'],
}
