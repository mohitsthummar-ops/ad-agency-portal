const fetch = require('node-fetch');

async function test() {
    const prompt = `Create a professional advertisement poster for: Business: Test Business, Campaign: Summer Mega Sale 2026, Offer: Flat 50% OFF on all items, Target Audience: General, Style: Modern, High Quality, Instagram Post, Social Media Ready, vibrant colors, clean typography`;
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&seed=12345&nologo=true&model=flux`;
    
    console.log("Fetching:", imageUrl);
    const res = await fetch(imageUrl);
    console.log("Status:", res.status);
    console.log("Headers:", res.headers.raw());
    
    const text = await res.text();
    console.log("Response starts with:", text.substring(0, 100));
}

test();
