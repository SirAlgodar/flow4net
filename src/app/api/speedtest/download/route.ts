
export async function GET() {
  // 10MB total size
  const totalSize = 10 * 1024 * 1024;
  const bufferSize = 64 * 1024; // 64KB chunks
  
  // Create a reusable noise buffer to save CPU during the stream loop
  const noiseBuffer = new Uint8Array(bufferSize);
  for(let i=0; i<bufferSize; i++) noiseBuffer[i] = Math.floor(Math.random() * 256);

  const stream = new ReadableStream({
    start(controller) {
        let sent = 0;
        try {
            while (sent < totalSize) {
                // Enqueue the reused buffer. 
                // Note: In some environments, enqueued chunks should be copied if modified later, 
                // but here we don't modify it.
                controller.enqueue(noiseBuffer);
                sent += bufferSize;
            }
            controller.close();
        } catch (err) {
            // If the stream is cancelled by the client, this might throw
            // We can just ignore it or log it
            try { controller.close(); } catch(e) {}
        }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-store, no-transform',
    },
  });
}
