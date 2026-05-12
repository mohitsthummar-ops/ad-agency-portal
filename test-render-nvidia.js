// Test NVIDIA FLUX image generation directly
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const NVIDIA_API_KEY = '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';

const prompt = `Create a premium modern advertisement poster for TechGadgets Pro.
Brand: TechGadgets Pro
Headline: Summer Sale 2026
Offer: 50% OFF all products
Visual: sleek smartphones, earbuds, smartwatches on gradient background
Style: modern minimal, vibrant neon accents, 8K quality, commercial ad poster
Typography: clean bold fonts, Instagram post format`;

async function testNvidia() {
    console.log('🚀 Testing NVIDIA FLUX image generation...');
    try {
        const response = await axios.post(
            "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell",
            {
                text_prompts: [{ text: prompt }],
                seed: Math.floor(Math.random() * 999999)
            },
            {
                headers: {
                    "Authorization": `Bearer ${NVIDIA_API_KEY}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                timeout: 60000
            }
        );

        if (response.data?.artifacts?.[0]?.base64) {
            const buf = Buffer.from(response.data.artifacts[0].base64, 'base64');
            // Detect format
            let ext = 'jpg';
            if (buf[0] === 0x89 && buf[1] === 0x50) ext = 'png';
            else if (buf[0] === 0x52 && buf[1] === 0x49) ext = 'webp';

            const outFile = path.join(__dirname, `nvidia_test_output.${ext}`);
            fs.writeFileSync(outFile, buf);
            console.log(`✅ SUCCESS! Image saved as: ${outFile}`);
            console.log(`   Format: ${ext.toUpperCase()}, Size: ${(buf.length / 1024).toFixed(1)} KB`);
        } else {
            console.error('❌ No image data in response:', JSON.stringify(response.data, null, 2));
        }
    } catch (e) {
        if (e.response) {
            console.error('❌ NVIDIA API Error:', e.response.status, JSON.stringify(e.response.data, null, 2));
        } else {
            console.error('❌ Request Error:', e.message);
        }
    }
}

testNvidia();
