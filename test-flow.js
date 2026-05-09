

async function run() {
    const API = 'http://localhost:5002/api';

    // 1. Register Client
    const userEmail = `client_${Date.now()}@test.com`;
    console.log(`Registering client: ${userEmail}`);
    let res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Client Test', email: userEmail, password: 'password123', role: 'client' })
    });
    let data = await res.json();
    if (!data.success) return console.error("Client Reg Failed:", data);
    const clientToken = data.token;

    // 3. Client logs in (to get the 1-Year Free plan applied)
    res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: 'password123' })
    });
    data = await res.json();
    if (!data.success) return console.error("Client Login Failed:", data);

    // 3b. Client Submits Request
    console.log(`Client submitting ad request...`);
    res = await fetch(`${API}/ad-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clientToken}` },
        body: JSON.stringify({
            title: 'Summer Blast Sale',
            businessName: 'Acme Corp',
            description: 'Massive summer discounts up to 50%',
            targetAudience: 'All age groups, low budget',
            offerDetails: '50% off all items'
        })
    });
    data = await res.json();
    if (!data.success) return console.error("Submit Request Failed:", data);
    const requestId = data.request._id;

    // 4. Register Admin
    const adminEmail = `admin_${Date.now()}@test.com`;
    console.log(`Registering admin: ${adminEmail}`);
    res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Admin Test', email: adminEmail, password: 'password123', role: 'admin' })
    });
    data = await res.json();
    if (!data.success) return console.error("Admin Reg Failed:", data);
    const adminToken = data.token;

    // 5. Admin Approves Request
    console.log(`Admin approving request...`);
    res = await fetch(`${API}/ad-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ adminNote: 'Looks good' })
    });
    data = await res.json();
    if (!data.success) return console.error("Approve Failed:", data);

    // 6. Client Generates Image
    console.log(`Client generating image...`);
    res = await fetch(`${API}/ad-requests/${requestId}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clientToken}` }
    });

    data = await res.json();
    if (!data.success) return console.error("Generate Image Failed:", data);
    console.log("Image Generated URL:", data.imageUrl);
    console.log("All tests passed successfully.");
}

run().catch(console.error);
