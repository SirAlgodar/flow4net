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
            if (url.includes('free.freeipapi.com')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        asnOrganization: 'FreeIPAPI ISP',
                        countryName: 'Brasil',
                        regionName: 'SP',
                        cityName: 'São Paulo',
                        latitude: -23.5,
                        longitude: -46.6
                    })
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
            if (url.includes('api.ipify.org') || url.includes('api64.ipify.org')) {
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
        
        expect(result.downdetector).toBeDefined();
        expect(result.network.ip).toBe('1.2.3.4');
        expect(result.quality).toBeDefined();
        expect(result.network.provider).toBe('FreeIPAPI ISP');
        expect(result.network.ipMetadata?.asnOrganization).toBe('FreeIPAPI ISP');
        expect(result.network.ipMetadata?.country).toBe('Brasil');
        expect(result.network.ssid).toBe('TestWiFi');
        expect(result.network.rssi).toBe(-50);
        expect(result.device.cores).toBe(4);
        expect(result.device.ram).toBe('8 GB');
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
        
        expect(result.device.userAgent).toContain('iPhone');
        expect(result.device.cores).toBe(2);
        expect(result.device.ram).toBe('4 GB');
    });
});
