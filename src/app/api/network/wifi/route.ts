import { NextResponse } from 'next/server';
import { WifiService } from '@/lib/wifi-service';

export async function GET() {
    try {
        console.log('[API] /api/network/wifi called');
        const connections = await WifiService.getCurrentConnections();
        console.log('[API] WifiService result:', JSON.stringify(connections, null, 2));
        
        // Return the first connection if available, or empty object
        const currentConnection = connections.length > 0 ? connections[0] : null;

        return NextResponse.json({
            connected: !!currentConnection,
            data: currentConnection,
            // Include scan results optionally? Maybe too slow/heavy for default call
        });
    } catch (error) {
        console.error('API Error getting wifi info:', error);
        return NextResponse.json({ error: 'Failed to get wifi info' }, { status: 500 });
    }
}
