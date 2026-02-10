import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  const start = performance.now();
  try {
    const response = await fetch(targetUrl, {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000) // 5s timeout
    });

    // If HEAD fails (some servers block it), try GET
    if (!response.ok && response.status !== 405) {
        // If it's not a "Method Not Allowed", we consider it a potential failure, 
        // but let's try GET just to be sure if status is 4xx/5xx? 
        // Actually, just checking if we got *any* response is often enough for "connectivity",
        // but for "status", we want 200-299.
    }
    
    // We consider it "up" if we got a response, even if it's 403 or something, 
    // because it means the server is reachable. 
    // But typically we want 200 OK. Let's return the status code too.
    const end = performance.now();
    
    return NextResponse.json({
      status: response.ok ? 'up' : 'down', // strict check? or loose? Let's stick to strict 200-299 for "up"
      latency: Math.round(end - start),
      httpCode: response.status
    });
  } catch (error) {
    // Retry with GET if HEAD failed? Or just fail?
    // Let's try a quick GET with small range if possible, or just fail.
    // Simple is better for now.
    return NextResponse.json({
      status: 'down',
      latency: 0,
      error: 'Unreachable'
    });
  }
}
