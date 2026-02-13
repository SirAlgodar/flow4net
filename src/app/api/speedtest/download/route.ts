
export async function GET() {
  try {
    // Attempt to proxy from Cloudflare Speedtest
    // Timeout set to 3s to avoid hanging if upstream is slow/blocked
    const targetUrl = 'https://speed.cloudflare.com/__down?bytes=50000000';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (response.ok && response.body) {
        return new Response(response.body, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Cache-Control': 'no-store, no-transform',
            },
        });
    }
    throw new Error(`Upstream error: ${response.status}`);
  } catch (error) {
    console.warn("Proxy download failed, falling back to local generation:", error);
    
    // Fallback: Generate noise locally
    const bufferSize = 64 * 1024;
    const noiseBuffer = new Uint8Array(bufferSize);
    for(let i=0; i<bufferSize; i++) noiseBuffer[i] = Math.floor(Math.random() * 256);

    const stream = new ReadableStream({
        pull(controller) {
            if (controller.desiredSize && controller.desiredSize > 0) {
                 controller.enqueue(noiseBuffer);
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Cache-Control': 'no-store, no-transform',
            'X-Speedtest-Source': 'LocalFallback'
        },
    });
  }
}
