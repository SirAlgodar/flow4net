

async function testLinkCreation() {
    try {
        console.log('--- Testing Link Creation ---');
        
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3100/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        
        if (!loginRes.ok) {
            console.error('Login failed');
            process.exit(1);
        }

        const cookie = loginRes.headers.get('set-cookie');
        if (!cookie) {
            console.error('No cookie received');
            process.exit(1);
        }
        
        // Extract token
        const token = cookie.split(';')[0];
        console.log('Got token cookie');

        // 2. Create Link
        console.log('Creating QUICK link...');
        const createRes = await fetch('http://localhost:3100/api/admin/links', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Cookie': token
            },
            body: JSON.stringify({
                type: 'QUICK',
                config: {
                    allowSpeedTest: true,
                    allowPing: true,
                    allowTraceroute: true,
                    allowVideo: false,
                    allowVoip: false,
                    allowWeb: true
                }
            })
        });

        const data = await createRes.json();
        console.log('Create Response:', JSON.stringify(data, null, 2));

        if (!createRes.ok) {
            console.error('Link creation failed');
            process.exit(1);
        }

        console.log('✅ Link created successfully');
        console.log('Code:', data.link.code);
        
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

testLinkCreation();
