const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: './.env' });

async function test() {
    console.log('Listing models...');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const models = await ai.models.list();
        console.log('Available models:', models.map(m => m.name));
    } catch (err) {
        console.error('List models failed:', err.message);
    }

    console.log('\nTesting Pollinations variants...');
    const variants = [
        'https://pollinations.ai/p/test?width=512&height=512',
        'https://image.pollinations.ai/prompt/test',
        'https://pollinations.ai/prompt/test',
        'https://pollinations.ai/v1/image/prompt/test'
    ];

    for (const url of variants) {
        try {
            const resp = await fetch(url, { method: 'GET' });
            console.log(`URL: ${url}`);
            console.log(`Status: ${resp.status}`);
            console.log(`Content-Type: ${resp.headers.get('content-type')}`);
            if (resp.headers.get('content-type').includes('image')) {
                console.log(' SUCCESS: Got an image!');
            }
        } catch (e) {
            console.log(`URL: ${url} failed: ${e.message}`);
        }
    }
}

test();
