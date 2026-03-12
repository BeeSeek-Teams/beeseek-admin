import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that do not require authentication
const publicPaths = ['/login', '/forgot-password', '/reset-password', '/queen/login'];

// Roles permitted to access the admin dashboard
const ALLOWED_ADMIN_ROLES = ['SUPPORT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];

/**
 * Decode a JWT payload without verification (verification is done by the backend).
 * We only use this to check the role claim for route-level gating.
 * Uses atob() which is available in Edge Runtime.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Validate queen_session cookie using Web Crypto HMAC-SHA256.
 * Cookie format: "<token>.<hex-signature>"
 */
async function isValidQueenSession(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue || !cookieValue.includes('.')) return false;
  const [token, signature] = cookieValue.split('.');
  const secret = process.env.QUEEN_BEE_PASSWORD || 'fallback-secret';

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(token));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return expected === signature;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;
  const queenSession = request.cookies.get('queen_session')?.value;

  // Protect Queen Bee routes separately — validate signed cookie
  if (pathname.startsWith('/queen') && pathname !== '/queen/login') {
    const isValid = await isValidQueenSession(queenSession);
    if (!isValid) {
      return NextResponse.redirect(new URL('/queen/login', request.url));
    }
    return NextResponse.next();
  }

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (!accessToken && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in, enforce role check
  if (accessToken && !isPublicPath) {
    const payload = decodeJwtPayload(accessToken);
    const role = payload?.role as string | undefined;

    if (!role || !ALLOWED_ADMIN_ROLES.includes(role)) {
      // Unauthorized role — redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      return response;
    }
  }

  if (accessToken && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
