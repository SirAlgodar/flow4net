import { detectPlatform, getPlatformSpecificConfig, Platform } from '../src/lib/platform-utils';

describe('Platform Utils', () => {
    test('should detect Windows', () => {
        expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(Platform.Windows);
    });

    test('should detect MacOS', () => {
        expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe(Platform.MacOS);
    });

    test('should detect Linux', () => {
        expect(detectPlatform('Mozilla/5.0 (X11; Linux x86_64)')).toBe(Platform.Linux);
    });

    test('should detect Android', () => {
        expect(detectPlatform('Mozilla/5.0 (Linux; Android 10; SM-G960U)')).toBe(Platform.Android);
    });

    test('should detect iOS', () => {
        expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)')).toBe(Platform.iOS);
    });

    test('should return correct config for Mobile', () => {
        const config = getPlatformSpecificConfig(Platform.Android);
        expect(config.testDuration).toBe(10000);
        expect(config.threads).toBe(2);
    });

    test('should return correct config for Desktop', () => {
        const config = getPlatformSpecificConfig(Platform.MacOS);
        expect(config.testDuration).toBe(15000);
        expect(config.threads).toBe(4);
    });
});
