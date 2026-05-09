
async function run() {
    const API = 'http://localhost:5002/api';

    console.log("--- Starting Ad Generation Demo ---");

    // 1. Register Client
    const userEmail = `demo_client_${Date.now()}@example.com`;
    console.log(`[1/5] Registering new client: ${userEmail}`);
    let res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Luxe Client', email: userEmail, password: 'password123', role: 'client' })
    });
    let data = await res.json();
    if (!data.success) return console.error("Client Reg Failed:", data);
    const clientToken = data.token;

    // 2. Client logs in
    res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: 'password123' })
    });
    data = await res.json();
    if (!data.success) return console.error("Client Login Failed:", data);

    // 3. Client Submits Request
    console.log(`[2/5] Submitting stylish ad request for 'Elite Watch Co'...`);
    res = await fetch(`${API}/ad-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clientToken}` },
        body: JSON.stringify({
            title: 'Heritage Series Launch',
            businessName: 'Elite Watch Co',
            description: 'Handcrafted luxury timepieces with timeless elegance and precision engineering.',
            targetAudience: 'High-income professionals, connoisseurs of luxury',
            offerDetails: 'Exclusive early access and a complimentary leather travel case.',
            imageStyle: 'Instagram Post'
        })
    });
    data = await res.json();
    if (!data.success) return console.error("Submit Request Failed:", data);
    const requestId = data.request._id;

    // 4. Register Admin (or use existing if possible, but register is safer for a clean demo)
    const adminEmail = `demo_admin_${Date.now()}@example.com`;
    console.log(`[3/5] Registering demo admin: ${adminEmail}`);
    res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Demo Admin', email: adminEmail, password: 'password123', role: 'admin' })
    });
    data = await res.json();
    if (!data.success) return console.error("Admin Reg Failed:", data);
    const adminToken = data.token;

    // 5. Admin Approves Request
    console.log(`[4/5] Admin approving the request...`);
    res = await fetch(`${API}/ad-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ adminNote: 'This is a perfect candidate for the new Flux model generation.' })
    });
    data = await res.json();
    if (!data.success) return console.error("Approve Failed:", data);

    // 6. Client Generates Image
    console.log(`[5/5] Generating premium ad image using Flux model...`);
    // Note: This might take a few seconds as it connects to Pollinations
    const startTime = Date.now();
    res = await fetch(`${API}/ad-requests/${requestId}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clientToken}` }
    });

    data = await res.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (!data.success) return console.error("Generate Image Failed:", data);
    
    console.log("\n--- Demo Successful! ---");
    console.log(`Time taken: ${duration}s`);
    console.log("Pollinations URL (Flux Model):", data.imageUrl);
    console.log("\nCopy the URL above into your browser to see the stylish ad result.");
}

run().catch(console.error);
