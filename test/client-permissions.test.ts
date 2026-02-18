/**
 * @jest-environment jsdom
 */
import { ClientPermissions } from '../src/lib/client-permissions';

describe('ClientPermissions.requestGeolocation', () => {
  const originalNavigator = { ...navigator };
  const originalIsSecure = (window as any).isSecureContext;

  beforeEach(() => {
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
    Object.defineProperty(window, 'location', {
      value: new URL('https://localhost'),
      configurable: true,
    } as any);

    (navigator as any).geolocation = {
      getCurrentPosition: jest.fn(),
    };

    (navigator as any).permissions = undefined;
  });

  afterAll(() => {
    Object.defineProperty(window, 'isSecureContext', { value: originalIsSecure, configurable: true });
    Object.assign(navigator, originalNavigator);
  });

  test('nega em contexto HTTP não seguro fora de localhost', async () => {
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
    Object.defineProperty(window, 'location', {
      value: new URL('http://example.com'),
      configurable: true,
    } as any);

    const result = await ClientPermissions.requestGeolocation();
    expect(result.granted).toBe(false);
    expect(result.error).toMatch(/HTTPS/i);
  });

  test('permite localhost mesmo sem contexto seguro', async () => {
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true });
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost:3100'),
      configurable: true,
    } as any);

    (navigator as any).geolocation.getCurrentPosition = (success: any) => {
      success({
        coords: {
          latitude: 1,
          longitude: 2,
          accuracy: 10,
        },
      });
    };

    const result = await ClientPermissions.requestGeolocation();
    expect(result.granted).toBe(true);
    expect(result.data).toMatchObject({ latitude: 1, longitude: 2 });
  });

  test('detecta bloqueio por política em iframe com permissions denied', async () => {
    Object.defineProperty(window, 'top', { value: {}, configurable: true });

    (navigator as any).permissions = {
      query: jest.fn().mockResolvedValue({ state: 'denied' }),
    };

    const result = await ClientPermissions.requestGeolocation();
    expect(result.granted).toBe(false);
    expect(result.error).toMatch(/política de permissões/i);
  });
});

