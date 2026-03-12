import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHmac } from 'crypto';

function signToken(token: string): string {
  const secret = process.env.QUEEN_BEE_PASSWORD || 'fallback-secret';
  return createHmac('sha256', secret).update(token).digest('hex');
}

function isValidSession(cookieValue: string): boolean {
  if (!cookieValue || !cookieValue.includes('.')) return false;
  const [token, signature] = cookieValue.split('.');
  return signToken(token) === signature;
}

export async function POST(request: Request) {
  const { password } = await request.json();
  const queenPassword = process.env.QUEEN_BEE_PASSWORD;

  if (password === queenPassword) {
    const token = randomBytes(32).toString('hex');
    const signature = signToken(token);
    const sessionValue = `${token}.${signature}`;

    const response = NextResponse.json({ success: true });
    const cookieOpts = { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/'
    };
    // Session cookie for middleware validation
    response.cookies.set('queen_session', sessionValue, cookieOpts);
    // Key cookie — used by the proxy to attach x-queen-key header to backend requests
    response.cookies.set('queen_key', queenPassword!, cookieOpts);
    return response;
  }

  return NextResponse.json({ success: false, message: 'Invalid Queen Password' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('queen_session')?.value;
  
  if (!cookie || !isValidSession(cookie)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  
  return NextResponse.json({ authenticated: true });
}
