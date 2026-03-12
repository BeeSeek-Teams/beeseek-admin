import { NextRequest, NextResponse } from 'next/server';

/**
 * Queen API Proxy — forwards requests to the backend with the x-queen-key header
 * injected from the httpOnly queen_key cookie. This keeps the queen password
 * completely out of client-side JavaScript.
 *
 * Usage: fetch('/api/queen-proxy/users/admin/list')
 *   → GET http://backend:3009/users/admin/list with x-queen-key header
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  const queenKey = request.cookies.get('queen_key')?.value;
  if (!queenKey) {
    return NextResponse.json({ error: 'Unauthorized — no queen key' }, { status: 401 });
  }

  const targetPath = pathSegments.join('/');
  const url = `${BACKEND_URL}/${targetPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-queen-key': queenKey,
  };

  const fetchOptions: RequestInit = { method, headers };

  if (method !== 'GET' && method !== 'HEAD') {
    try {
      const body = await request.text();
      if (body) fetchOptions.body = body;
    } catch {
      // No body
    }
  }

  try {
    const backendRes = await fetch(url, fetchOptions);
    const data = await backendRes.text();

    return new NextResponse(data, {
      status: backendRes.status,
      headers: { 'Content-Type': backendRes.headers.get('Content-Type') || 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}
