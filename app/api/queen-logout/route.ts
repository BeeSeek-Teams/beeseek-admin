import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  const cookieOpts = { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, 
    path: '/'
  };

  // Clear both queen cookies
  response.cookies.set('queen_session', '', cookieOpts);
  response.cookies.set('queen_key', '', cookieOpts);

  return response;
}
