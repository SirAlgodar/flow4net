const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function test() {
    console.log('Testing macOS fallback logic...');
    try {
        const { stdout } = await execPromise('system_profiler SPAirPortDataType -json', { maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer
        // console.log('Raw output length:', stdout.length);
        const data = JSON.parse(stdout);
        console.log('JSON Keys:', Object.keys(data));
        if (data.SPAirPortDataType) {
             console.log('SPAirPortDataType length:', data.SPAirPortDataType.length);
             if (data.SPAirPortDataType.length > 0) {
                 console.log('First item keys:', Object.keys(data.SPAirPortDataType[0]));
                 console.log('Interfaces:', JSON.stringify(data.SPAirPortDataType[0].spairport_airport_interfaces, null, 2));
             }
        }
        
        // Try to find correct path
        const wifiDataRoot = data.SPAirPortDataType?.[0];
        let current = null;

        if (wifiDataRoot?.spairport_current_network_information) {
            current = wifiDataRoot.spairport_current_network_information;
        } else if (wifiDataRoot?.spairport_airport_interfaces) {
            // It might be an array of interfaces
            for (const iface of wifiDataRoot.spairport_airport_interfaces) {
                if (iface.spairport_current_network_information) {
                    current = iface.spairport_current_network_information;
                    break;
                }
            }
        }

        if (current) {
            const signalNoise = current.spairport_signal_noise || ''; 
            const rssi = parseInt(signalNoise.split(' ')[0] || '0');
            
            let ssid = current._name || 'Unknown';
            
            if (ssid === '<redacted>') {
                console.log('SSID is redacted, trying networksetup...');
                try {
                     const { stdout: nsOut } = await execPromise('networksetup -getairportnetwork en0');
                     const match = nsOut.match(/Current Wi-Fi Network: (.+)/);
                     if (match && match[1]) {
                         ssid = match[1].trim();
                     } else {
                         console.log('networksetup output:', nsOut);
                     }
                } catch (e) {
                    console.warn('Failed to resolve redacted SSID via networksetup', e);
                }
            }

            console.log('Success!', { ssid, rssi });
        } else {
            console.log('No wifi data found in system_profiler output');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
