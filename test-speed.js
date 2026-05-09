require('dotenv').config({ path: './backend/.env' });

const API_URL = 'http://localhost:5002/api';
const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'password123';

async function testSpeed() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        console.log('Fetching requests...');
        const reqRes = await fetch(`${API_URL}/ad-requests/my`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const reqData = await reqRes.json();
        const approvedReq = reqData.requests.find(r => r.status === 'approved');

        if (!approvedReq) {
            console.error('No approved requests found for test user.');
            return;
        }

        console.log(`Testing speed for request: ${approvedReq._id}`);
        const start = Date.now();
        const genRes = await fetch(`${API_URL}/ad-requests/${approvedReq._id}/generate-ai`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
        });
        const genData = await genRes.json();
        const end = Date.now();

        console.log('Response received in:', (end - start) / 1000, 'seconds');
        console.log('Success:', genData.success);
        console.log('Image URL:', genData.imageUrl);
        
        if (genData.imageUrl && genData.imageUrl.startsWith('http')) {
            console.log('✅ Success: Returned direct Pollinations URL immediately.');
        } else {
            console.log('❌ Failed: Returned non-external URL or error');
            console.log('Response preview:', JSON.stringify(genData).substring(0, 200));
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testSpeed();
