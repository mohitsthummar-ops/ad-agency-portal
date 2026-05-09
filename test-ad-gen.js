require('dotenv').config({ path: './backend/.env' });
const { GoogleGenAI } = require('@google/genai');

async function testPrompt() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const brand = "TechNova";
    const title = "Summer Sale";
    const offer = "50% Off Everything";
    const description = "Get the best gadgets at half price this summer.";
    const targetAudience = "Tech Enthusiasts";
    const imageStyle = "Futuristic 3D Render";

    const systemPrompt = `You are an expert advertisement prompt engineer. Create a highly detailed, descriptive image generation prompt (max 50 words) based on the user's campaign details. Focus on visual elements, colors, mood, layout, style, related symbols, and theme. Only output the pure prompt text without any conversational filler or quotes.`;

    const randomSeedRandomizer = Math.floor(Math.random() * 10000000);
    const userInput = `Business: ${brand}\nCampaign: ${title}\nOffer: ${offer}\nDescription: ${description}\nTarget Audience: ${targetAudience}\nStyle Format: ${imageStyle}\nMake it a highly unique, stylish, and incredibly creative advertisement poster. Include highly relevant symbols and thematic elements that easily attract the user. Use vibrant colors and premium modern aesthetics. Ensure this specific ad is a distinct, fresh variation. (Randomization Seed: ${randomSeedRandomizer})`;

    console.log("Input to Gemini:\n" + userInput);

    try {
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemPrompt + "\n\n" + userInput,
        });
        console.log("\nGenerated Prompt:\n", aiResponse.text.trim());
    } catch (e) {
        console.error("Error:", e);
    }
}

testPrompt();
