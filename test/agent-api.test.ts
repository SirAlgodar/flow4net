import { GET } from '@/app/api/agent/network/route';

jest.mock('child_process', () => {
  return {
    execFile: (
      cmd: string,
      args: string[],
      options: any,
      cb: (error: any, stdout: string, stderr: string) => void
    ) => {
      const err: any = new Error('not found');
      err.code = 'ENOENT';
      cb(err, '', 'not found');
    },
  };
});

describe('Agent API route', () => {
  const originalEnv = process.env.FLOW4_AGENT_BIN;

  afterEach(() => {
    process.env.FLOW4_AGENT_BIN = originalEnv;
  });

  test('reports not installed when binary is missing', async () => {
    const res = await GET();
    const json: any = await res.json();

    expect(json.ok).toBe(false);
    expect(json.installed).toBe(false);
    expect(json.error).toBe('Agent binary not found');
  });
});
