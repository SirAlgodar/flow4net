import { DiagnosticsEngine } from '../src/lib/diagnostics';

describe('DiagnosticsEngine', () => {
    // Mock Browser Environment
    beforeAll(() => {
        const mockFetch = (url: string) => {
            if (url.includes('external-check')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ status: 'up', latency: 50 })
                });
            }
            if (url.includes('download')) {
                return Promise.resolve({
                    body: {
                        getReader: () => ({
                            read: () => Promise.resolve({ done: true, value: new Uint8Array(0) }),
                            cancel: () => Promise.resolve()
                        })
                    }
                });
            }
            if (url.includes('upload')) {
                return new Promise(resolve => setTimeout(() => resolve({ ok: true }), 10));
            }
            if (url.includes('ip')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ ip: '1.2.3.4' })
                });
            }
            if (url.includes('ping')) {
                return Promise.resolve({ ok: true });
            }
            if (url.includes('config/test-parameters')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ config: { testDuration: 1000 } })
                });
            }
            if (url.includes('network/wifi')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ connected: true, data: { ssid: 'TestWiFi', signal_level: -50 } })
                });
            }
            if (url.includes('/api/agent/network')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ ok: true, agent: { platform: 'windows', wifi: { ssid: 'AgentWiFi' } } })
                });
            }
            return Promise.reject(new Error(`Unknown URL: ${url}`));
        };

        (global as any).fetch = mockFetch;

        Object.defineProperty(global, 'navigator', {
            value: {
                userAgent: 'TestBot/1.0',
                connection: { effectiveType: '4g', downlink: 10, rtt: 50 },
                hardwareConcurrency: 4,
                deviceMemory: 8
            },
            writable: true
        });

        Object.defineProperty(global, 'performance', {
            value: {
                now: () => Date.now()
            },
            writable: true
        });
        
        // Mock document for canvas/video checks
        Object.defineProperty(global, 'document', {
            value: {
                createElement: () => ({ getContext: () => null })
            },
            writable: true
        });
    });

    test('should run full diagnostics successfully', async () => {
        console.log('Starting DiagnosticsEngine Test...');
        
        const engine = new DiagnosticsEngine((status, progress) => {
            console.log(`[Progress ${progress}%] ${status}`);
        });

        const result = await engine.run();
        console.log('Test Completed Successfully!');
        
        if (result.speed.downloadAvg === 0 && result.speed.uploadAvg === 0) {
            console.log('Note: Speeds are 0 because of mock streams, but execution finished.');
        }
        
        // Validation
        expect(result.downdetector).toBeDefined();
        expect(result.network.ip).toBe('1.2.3.4');
        expect(result.quality).toBeDefined();
        // Check for new properties
        expect(result.quality?.color).toBeDefined();
    });

    test('should detect mobile platform and apply correct config', async () => {
        // Mock Mobile User Agent
        Object.defineProperty(global, 'navigator', {
            value: {
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)',
                connection: { effectiveType: '4g', downlink: 10, rtt: 50 },
                hardwareConcurrency: 2,
                deviceMemory: 4
            },
            writable: true
        });

        console.log('Starting Mobile Diagnostics Test...');
        const engine = new DiagnosticsEngine((status, progress) => {});
        const result = await engine.run();
        
        // Check if device info is populated correctly
        // Note: DiagnosticsEngine.getDeviceInfo() uses platform-utils detectPlatform(userAgent)
        expect(result.device.userAgent).toContain('iPhone');
    });
});
