/**
 * @file Next.js middleware for route protection.
 * Runs on every request to check authentication and authorization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AUTH } from '@/lib/constants';

/** Routes that don't require authentication */
const publicRoutes = ['/login', '/register'];

/** API routes that don't require authentication */
const publicApiRoutes = ['/api/auth/login', '/api/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route)) {
    // If user has session cookie, redirect to dashboard
    const session = request.cookies.get(AUTH.SESSION_COOKIE_NAME);
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Allow public API routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = request.cookies.get(AUTH.SESSION_COOKIE_NAME);

  if (!session) {
    // Redirect to login for page requests
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API requests
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
