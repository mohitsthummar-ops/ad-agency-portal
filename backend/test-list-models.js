const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
    try {
        const response = await ai.models.list();
        console.log('Response Keys:', Object.keys(response));
        if (response.models) {
             console.log('Models property found, length:', response.models.length);
             console.log('First model name:', response.models[0].name);
        } else {
             console.log('Direct response:', JSON.stringify(response).substring(0, 500));
        }
    } catch (err) {
        console.error('Error listing models:', err);
    }
}

listModels();
