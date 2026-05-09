require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testGeneration() {
    console.log("Starting NVIDIA NIM integration test...");
    
    // Simulate req.body / AdRequest record
    const request = {
        title: "Spring Summer Collection",
        businessName: "Fashion Hub",
        offerDetails: "Get 40% OFF all seasonal styles",
        description: "A trendy fashion boutique selling vibrant summer clothes for millennials.",
        targetAudience: "Millennials, Fashion enthusiasts",
        imageStyle: "Instagram Post",
        contactInfo: "@fashionhub | fashionhub.com"
    };

    // ═══════════════════════════════════════════════════════════════
    //  AI IMAGE GENERATOR (Direct FLUX Prompting) - Copied from Controller
    // ═══════════════════════════════════════════════════════════════
    const title = request.title || 'Exclusive Collection';
    const brand = request.businessName || 'BRAND';
    const offer = request.offerDetails || 'Limited Time Offer';
    const description = request.description || '';
    const targetAudience = request.targetAudience || 'General';
    const imageStyle = request.imageStyle || 'Instagram Post';
    const contactInfo = request.contactInfo || '';

    // Map resolution based on style
    const resolutionMap = {
        'Instagram Post': { ratio: '1:1', width: 1024, height: 1024 },
        'Facebook Banner': { ratio: '16:9', width: 1440, height: 810 },
        'Poster': { ratio: '4:5', width: 1024, height: 1280 }
    };
    const styleInfo = resolutionMap[imageStyle] || { ratio: '1:1', width: 1024, height: 1024 };

    // 🎯 4. 🎨 STYLE CONTROL
    let styleKeywords = 'Modern, minimal, elegant (not cluttered)';
    const lowerDesc = description.toLowerCase();
    const lowerBrand = brand.toLowerCase();
    
    if (lowerDesc.includes('food') || lowerDesc.includes('burger') || lowerDesc.includes('pizza') || lowerBrand.includes('bakery') || lowerBrand.includes('cafe')) {
        styleKeywords = 'delicious food photography, warm lighting, restaurant ad poster, modern, clean';
    } else if (lowerDesc.includes('fashion') || lowerDesc.includes('clothing') || lowerDesc.includes('wear') || lowerBrand.includes('boutique')) {
        styleKeywords = 'trendy fashion models, urban style, instagram aesthetic, high-end editorial';
    } else if (lowerDesc.includes('tech') || lowerDesc.includes('gadget') || lowerDesc.includes('software') || lowerDesc.includes('app')) {
        styleKeywords = 'futuristic design, neon glow, minimal tech branding, premium tech showcase';
    } else if (lowerDesc.includes('gym') || lowerDesc.includes('fitness') || lowerDesc.includes('workout') || lowerBrand.includes('gym')) {
        styleKeywords = 'strong athletes, dark cinematic lighting, motivational poster, high contrast';
    }

    // 🧠 1. ✅ FINAL PRODUCTION PROMPT (BEST VERSION)
    const finalPrompt = `Create a premium, modern advertisement poster.

Business Name: ${brand}
Campaign Title: ${title}
Offer: ${offer}
Target Audience: ${targetAudience}
Description: ${description}
Contact Info: ${contactInfo}

Design Requirements:
- Show "${brand}" as a logo-style brand header at the top
- Add a bold headline: "${title}"
- Highlight offer "${offer}" in large, eye-catching typography
- Add a strong CTA: "Shop Now" or "Order Now"
- Place contact info "${contactInfo}" at the bottom (small clean text)

Layout:
- Professional advertisement layout:
  Top → Brand Name  
  Center → Product visuals  
  Middle → Offer highlight  
  Bottom → CTA + Contact  
- Clean spacing, balanced composition

Visual Style:
- Ultra-realistic or premium 3D design
- Bright lighting, soft shadows, depth
- Use relevant objects based on business type: (cakes, clothes, food, gadgets, gym, etc.)
- ${styleKeywords}

Typography:
- Clean, readable fonts
- Proper alignment (no distorted text)
- Social media ad style (Instagram/Facebook)

Format:
- ${imageStyle}

Mood:
- Premium commercial advertisement
- Eye-catching, trendy 2026 marketing style

IMPORTANT:
- Must look like a real advertisement poster (not just an image)
- Include both visuals + marketing text clearly

Negative Prompt:
blurry, distorted text, unreadable fonts, low quality, messy layout, watermark, overdesign`;

    const seed = Math.floor(Math.random() * 1000000);
    let backgroundBuffer = null;

    console.log(`\n[Ad Gen] Full Constructed Prompt:\n---------------------------\n${finalPrompt}\n---------------------------\n`);
    
    if (!process.env.NVIDIA_API_KEY) {
        console.error("❌ ERROR: NVIDIA_API_KEY not found in .env file!");
        return;
    }

    try {
        console.log(`[Ad Gen] Sending prompt to NVIDIA NIM (FLUX.1-schnell)...`);
        const startTime = Date.now();
        const response = await axios.post("https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell", {
            text_prompts: [{ text: finalPrompt }],
            seed: seed
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            timeout: 60000
        });

        if (response.data && response.data.artifacts && response.data.artifacts[0] && response.data.artifacts[0].base64) {
            backgroundBuffer = Buffer.from(response.data.artifacts[0].base64, 'base64');
            const ms = Date.now() - startTime;
            console.log(`[Ad Gen] ✅ Successfully got image from NVIDIA NIM! Took ${ms}ms.`);
            
            // Save to disk
            const outputPath = path.join(__dirname, 'test_nvidia_output.jpg');
            fs.writeFileSync(outputPath, backgroundBuffer);
            console.log(`[Ad Gen] Image saved successfully to: ${outputPath}`);
            console.log(`[Ad Gen] File size: ${(backgroundBuffer.length / 1024).toFixed(2)} KB`);
        } else {
            console.warn(`[Ad Gen] ❌ NVIDIA API returned unexpected response format.`);
            console.log(response.data);
        }
    } catch (e) {
        console.error(`[Ad Gen] ❌ NVIDIA API Error:`, e.response?.data || e.message);
    }
}

testGeneration();
