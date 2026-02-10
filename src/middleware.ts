import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If trying to access login page
  if (pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        // Token is valid, redirect to dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch (e) {
        // Token invalid, let them login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // 2. If trying to access protected routes (e.g. /admin)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      return NextResponse.next();
    } catch (e) {
      // Token invalid
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*'],
};
