import wifi from 'node-wifi';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Initialize wifi module
wifi.init({
    iface: null
});

export interface WifiNetworkData {
    ssid: string;
    bssid: string;
    mac: string; // same as bssid usually
    channel: number;
    frequency: number; // in MHz
    signal_level: number; // in dBm
    quality: number; // percentage
    security: string;
    security_flags: string;
    mode: string;
}

export class WifiService {
    static async getCurrentConnections(): Promise<WifiNetworkData[]> {
        // 1. Try node-wifi first
        try {
            console.log('[WifiService] Attempting to get current connections via node-wifi...');
            const connections = await wifi.getCurrentConnections();
            if (connections.length > 0) {
                console.log('[WifiService] node-wifi success:', connections);
                return connections.map(c => ({
                    ssid: c.ssid,
                    bssid: c.bssid || '',
                    mac: c.mac || '',
                    channel: c.channel,
                    frequency: c.frequency || 0,
                    signal_level: c.signal_level || 0,
                    quality: c.quality || 0,
                    security: c.security || '',
                    security_flags: Array.isArray(c.security_flags) ? c.security_flags.join(', ') : '',
                    mode: c.mode || ''
                }));
            }
        } catch (error) {
            console.warn('[WifiService] node-wifi failed:', error);
        }

        // 2. macOS Fallback (system_profiler)
        if (process.platform === 'darwin') {
            try {
                console.log('[WifiService] Trying macOS system_profiler fallback...');
                // Increase buffer size to 10MB to avoid truncation
                const { stdout } = await execPromise('system_profiler SPAirPortDataType -json', { maxBuffer: 1024 * 1024 * 10 });
                const data = JSON.parse(stdout);
                
                const wifiDataRoot = data.SPAirPortDataType?.[0];
                let current = null;
                let interfaceName = 'en0';

                // Look for current network info directly or within interfaces
                if (wifiDataRoot?.spairport_current_network_information) {
                    current = wifiDataRoot.spairport_current_network_information;
                } else if (wifiDataRoot?.spairport_airport_interfaces) {
                    for (const iface of wifiDataRoot.spairport_airport_interfaces) {
                        if (iface.spairport_current_network_information) {
                            current = iface.spairport_current_network_information;
                            interfaceName = iface._name || 'en0';
                            break;
                        }
                    }
                }

                if (current) {
                    const signalNoise = current.spairport_signal_noise || ''; // e.g. "-49 dBm / -92 dBm"
                    const rssi = parseInt(signalNoise.split(' ')[0] || '0');
                    
                    let ssid = current._name || 'Unknown';
                    
                    // Try to get real SSID if redacted
                    if (ssid === '<redacted>') {
                        try {
                             // Try networksetup as last resort for SSID
                             // Use full path /usr/sbin/networksetup to be safe
                             const { stdout: nsOut } = await execPromise(`/usr/sbin/networksetup -getairportnetwork ${interfaceName}`);
                             // Output: "Current Wi-Fi Network: MySSID"
                             const match = nsOut.match(/Current Wi-Fi Network: (.+)/);
                             if (match && match[1]) {
                                 ssid = match[1].trim();
                             }
                        } catch (e) {
                            console.warn('Failed to resolve redacted SSID via networksetup', e);
                            // Fallback: try en0 explicitly if interfaceName was different
                            if (interfaceName !== 'en0') {
                                try {
                                    const { stdout: nsOut } = await execPromise(`/usr/sbin/networksetup -getairportnetwork en0`);
                                    const match = nsOut.match(/Current Wi-Fi Network: (.+)/);
                                    if (match && match[1]) {
                                        ssid = match[1].trim();
                                    }
                                } catch (e2) {}
                            }
                        }
                    }

                    const channelStr = current.spairport_network_channel || '';
                    const channel = parseInt(channelStr.split(' ')[0] || '0');
                    let frequency = 0;
                    
                    if (channel > 0) {
                        if (channelStr.includes('5GHz')) {
                            frequency = 5000 + (channel * 5);
                        } else if (channelStr.includes('2GHz')) {
                            frequency = 2407 + (channel * 5);
                        }
                    }

                    const connection: WifiNetworkData = {
                        ssid: ssid,
                        bssid: current.spairport_wireless_mac_address || '',
                        mac: current.spairport_wireless_mac_address || '',
                        channel: channel,
                        frequency: frequency, 
                        signal_level: rssi,
                        quality: Math.min(Math.max(2 * (rssi + 100), 0), 100), // Approx quality
                        security: current.spairport_security_mode || '',
                        security_flags: '',
                        mode: current.spairport_network_phymode || ''
                    };
                    
                    console.log('[WifiService] macOS fallback success:', connection);
                    return [connection];
                }
            } catch (e) {
                console.error('[WifiService] macOS fallback failed:', e);
            }
        }

        // 3. Windows Fallback (netsh)
        if (process.platform === 'win32') {
            try {
                console.log('[WifiService] Trying Windows netsh fallback...');
                const { stdout } = await execPromise('netsh wlan show interfaces');
                const lines = stdout.split('\n');
                let ssid = '';
                let signal = 0;
                let bssid = '';

                for (const line of lines) {
                    const parts = line.split(':');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const value = parts.slice(1).join(':').trim();

                        if (key === 'SSID') ssid = value;
                        if (key === 'BSSID') bssid = value;
                        if (key === 'Signal') {
                            const percent = parseInt(value.replace('%', ''));
                            // Approx conversion: dBm = (quality / 2) - 100
                            signal = (percent / 2) - 100;
                        }
                    }
                }

                if (ssid) {
                    console.log('[WifiService] Windows fallback success:', ssid, signal);
                    return [{
                        ssid,
                        bssid,
                        mac: bssid,
                        channel: 0,
                        frequency: 0,
                        signal_level: signal,
                        quality: (signal + 100) * 2,
                        security: '',
                        security_flags: '',
                        mode: 'Managed'
                    }];
                }
            } catch (e) {
                console.warn('Windows netsh fallback failed', e);
            }
        }

        // 4. Linux Fallback (nmcli)
        if (process.platform === 'linux') {
            try {
                console.log('[WifiService] Trying Linux nmcli fallback...');
                // Get active connection: ACTIVE,SSID,SIGNAL,BARS
                const { stdout } = await execPromise('nmcli -t -f ACTIVE,SSID,SIGNAL dev wifi');
                const lines = stdout.split('\n');
                
                for (const line of lines) {
                    // Format: yes:SSID:Signal
                    // Note: nmcli signal is usually 0-100 quality, sometimes bars
                    // If it's bars, we can't use it easily. Assuming scale 0-100.
                    // Actually nmcli signal is usually "strength" (0-100).
                    const parts = line.split(':'); // delimiter is : for -t
                    // handle SSID with colons? nmcli escapes them? -t mode escapes : with \:
                    // A simpler way might be fixed width or specific fields.
                    // Let's assume standard output for now.
                    if (parts[0] === 'yes') {
                        const ssid = parts[1];
                        const signalStrength = parseInt(parts[2]); // 0-100
                        const signalDbm = (signalStrength / 2) - 100;

                        console.log('[WifiService] Linux fallback success:', ssid, signalDbm);
                        return [{
                            ssid,
                            bssid: '',
                            mac: '',
                            channel: 0,
                            frequency: 0,
                            signal_level: signalDbm,
                            quality: signalStrength,
                            security: '',
                            security_flags: '',
                            mode: 'Managed'
                        }];
                    }
                }
            } catch (e) {
                console.warn('Linux nmcli fallback failed', e);
            }
        }

        return [];
    }

    static async scan(): Promise<WifiNetworkData[]> {
        try {
            const networks = await wifi.scan();
            return networks.map(c => ({
                ssid: c.ssid,
                bssid: c.bssid || '',
                mac: c.mac || '',
                channel: c.channel,
                frequency: c.frequency || 0,
                signal_level: c.signal_level || 0,
                quality: c.quality || 0,
                security: c.security || '',
                security_flags: Array.isArray(c.security_flags) ? c.security_flags.join(', ') : '',
                mode: c.mode || ''
            }));
        } catch (error) {
            console.error('Error scanning wifi networks:', error);
            return [];
        }
    }
}
