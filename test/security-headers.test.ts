/**
 * @jest-environment node
 */
import nextConfig from '../next.config';

describe('Security headers configuration', () => {
  test('includes global permissions policy and CSP', async () => {
    // @ts-ignore - headers is async
    const headers = await nextConfig.headers();
    const global = headers.find((h: any) => h.source === '/:path*') || { headers: [] };
    const keys = (global.headers as any[]).map((h: any) => h.key);
    expect(keys).toContain('Permissions-Policy');
    expect(keys).toContain('Content-Security-Policy');
  });

  test('api route has CORS headers', async () => {
    // @ts-ignore
    const headers = await nextConfig.headers();
    const api = headers.find((h: any) => h.source === '/api/:path*') || { headers: [] };
    const keys = (api.headers as any[]).map((h: any) => h.key);
    expect(keys).toContain('Access-Control-Allow-Origin');
  });
});
