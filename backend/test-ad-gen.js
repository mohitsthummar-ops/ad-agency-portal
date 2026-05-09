require('dotenv').config({ path: './.env' });
const { GoogleGenAI } = require('@google/genai');

async function testPrompt() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const brand = "TechNova";
    const title = "Summer Sale";
    const offer = "50% Off Everything";
    const description = "Get the best gadgets at half price this summer.";
    const targetAudience = "Tech Enthusiasts";
    const imageStyle = "Futuristic 3D Render";

    const designAngles = [
        "Abstract & Geometric", "Minimalist & Elegant", "Futuristic & High-Tech",
        "Vintage & Nostalgic", "Nature & Organic", "Bold & Typographic",
        "Surreal & Dreamy", "Pop Art & Colorful", "Luxurious & Premium",
        "Dynamic & Energetic", "Soft & Pastel", "Dark & Moody"
    ];
    const randomAngle = designAngles[Math.floor(Math.random() * designAngles.length)];

    const systemPrompt = `You are an expert advertisement prompt engineer. Create a highly detailed, descriptive image generation prompt (max 50 words) based on the user's campaign details. Focus strongly on visual elements, striking colors, mood, layout, and style. Only output the pure prompt text without quotes.`;

    const userInput = `Business: ${brand}\nCampaign: ${title}\nOffer: ${offer}\nDescription: ${description}\nTarget Audience: ${targetAudience}\nRequested Style Format: ${imageStyle}\n\nCRITICAL INSTRUCTIONS:\n1. Generate a COMPLETELY UNIQUE, highly attractive advertisement concept.\n2. Incorporate specific, easily recognizable SYMBOLS and THEMES strongly related to the business and campaign.\n3. Apply a "${randomAngle}" design aesthetic twist to make this generation radically different from previous ones.\n4. Emphasize vibrant colors and premium modern aesthetics to easily attract users.\n5. Ensure this specific ad is a distinct, fresh variation.`;

    console.log("Random Angle Chosen:", randomAngle);
    try {
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: systemPrompt + "\n\n" + userInput + `\n\nVariation: ${Date.now()}`,
        });
        const generatedImagePrompt = aiResponse.text.trim();
        console.log("\nGenerated Prompt from Gemini:\n", generatedImagePrompt);

        const seed = Math.floor(Math.random() * 1000000000);
        console.log("\nFinal Prompt to Pollinations:\n", generatedImagePrompt);
        console.log("\nPollinations URL:\n", `https://image.pollinations.ai/prompt/${encodeURIComponent(generatedImagePrompt)}?width=1080&height=1080&seed=${seed}&nologo=true&model=flux`);

    } catch (e) {
        console.error("Error:", e);
    }
}

testPrompt();
