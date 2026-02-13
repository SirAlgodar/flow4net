/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WifiInfo } from '../src/components/WifiInfo';
import { ClientPermissions } from '../src/lib/client-permissions';

// Mock ClientPermissions
jest.mock('../src/lib/client-permissions', () => ({
  ClientPermissions: {
    requestNetworkPermissions: jest.fn()
  }
}));

// Mock global fetch
global.fetch = jest.fn();

describe('WifiInfo Component - Permissions & Data Flow', () => {
  const mockNavigatorConnection = {
    type: 'wifi',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  beforeAll(() => {
    // Mock navigator.connection
    Object.defineProperty(window.navigator, 'connection', {
      value: mockNavigatorConnection,
      writable: true,
      configurable: true
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    
    // Default fetch failure (no backend data)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });
  });

  test('renders initial state with basic browser info', async () => {
    await act(async () => {
      render(<WifiInfo />);
    });

    // Should show "Rede" title
    expect(screen.getByText('Rede')).toBeInTheDocument();
    
    // Should show generic "WiFi" from navigator
    expect(screen.getByText('WiFi')).toBeInTheDocument();
    
    // Should show "Permissão Recomendada" banner if no permission
    expect(screen.getByText('Permissão Recomendada')).toBeInTheDocument();
  });

  test('explicit permission request success flow', async () => {
    // Setup success mock
    (ClientPermissions.requestNetworkPermissions as jest.Mock).mockResolvedValue({
      granted: true,
      data: { some: 'data' }
    });

    await act(async () => {
      render(<WifiInfo />);
    });

    const button = screen.getByText('Permitir Acesso à Rede');
    
    await act(async () => {
      fireEvent.click(button);
    });

    // Verify permission was requested
    expect(ClientPermissions.requestNetworkPermissions).toHaveBeenCalled();

    // Verify banner disappears (wait for state update)
    await waitFor(() => {
      expect(screen.queryByText('Permissão Recomendada')).not.toBeInTheDocument();
    });
  });

  test('explicit permission request denial flow', async () => {
    // Setup denial mock
    (ClientPermissions.requestNetworkPermissions as jest.Mock).mockResolvedValue({
      granted: false,
      error: 'User denied'
    });

    await act(async () => {
      render(<WifiInfo />);
    });

    const button = screen.getByText('Permitir Acesso à Rede');
    
    await act(async () => {
      fireEvent.click(button);
    });

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('User denied')).toBeInTheDocument();
    });
    
    // Banner should still be there
    expect(screen.getByText('Permissão Recomendada')).toBeInTheDocument();
  });

  test('backend data fallback works (simulating "granted" state)', async () => {
    // Setup backend success
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        connected: true,
        data: {
          ssid: 'Test_Network_5G',
          signal_level: -45
        }
      })
    });

    await act(async () => {
      render(<WifiInfo />);
    });

    // Should show SSID
    await waitFor(() => {
      expect(screen.getByText('Test_Network_5G')).toBeInTheDocument();
    });

    // Should NOT show permission banner (as we have data)
    expect(screen.queryByText('Permissão Recomendada')).not.toBeInTheDocument();
    
    // Should show signal strength
    expect(screen.getByText('-45 dBm')).toBeInTheDocument();
  });
});
