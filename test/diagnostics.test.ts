
import { DiagnosticsEngine } from '../src/lib/diagnostics';

// Mock Browser Environment
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
                    read: () => Promise.resolve({ done: true, value: new Uint8Array(0) })
                })
            }
        });
    }
    if (url.includes('upload')) {
        return Promise.resolve({ ok: true });
    }
    if (url.includes('ip')) {
        return Promise.resolve({
            json: () => Promise.resolve({ ip: '1.2.3.4' })
        });
    }
    return Promise.reject(new Error('Unknown URL'));
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

Object.defineProperty(global, 'document', {
    value: {
        createElement: () => ({ getContext: () => null })
    },
    writable: true
});

async function runTest() {
    console.log('Starting DiagnosticsEngine Test...');
    
    const engine = new DiagnosticsEngine((status, progress) => {
        console.log(`[Progress ${progress}%] ${status}`);
    });

    try {
        const result = await engine.run();
        console.log('Test Completed Successfully!');
        console.log('Result:', JSON.stringify(result, null, 2));
        
        if (result.speed.download === 0 && result.speed.upload === 0) {
            console.log('Note: Speeds are 0 because of mock streams, but execution finished.');
        }
        
        // Validation
        if (!result.externalStatus) throw new Error('External status missing');
        if (result.network.ip !== '1.2.3.4') throw new Error('IP detection failed');
        
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
}

runTest();
