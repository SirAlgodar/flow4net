
async function testLogin() {
    try {
        console.log('Testing login...');
        const res = await fetch('http://localhost:3100/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (res.ok) {
            console.log('✅ Login successful');
        } else {
            console.log('❌ Login failed');
            process.exit(1);
        }
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

testLogin();
