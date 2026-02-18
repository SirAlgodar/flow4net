import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function middleware(request: NextRequest) {
  // Redirect HTTP -> HTTPS for non-localhost
  const proto = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol.replace(':',''));
  const host = request.headers.get('host') || request.nextUrl.host;
  const isLocal = host?.startsWith('localhost') || host?.startsWith('127.0.0.1');
  if (proto === 'http' && !isLocal) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 308);
  }

  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Debug logs for troubleshooting login issues
  if (pathname === '/login' || pathname.startsWith('/admin')) {
    console.log(`[Middleware] Accessing: ${pathname}, Token present: ${!!token}`);
  }
  
  // 1. If trying to access login page
  if (pathname === '/login') {
    if (token) {
      try {
        await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        // Token is valid, redirect to dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch (e) {
        // Token invalid, let them login
        console.error('[Middleware] Token verification failed on /login check:', e);
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
      console.error('[Middleware] Token verification failed on /admin check:', e);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*'],
};
