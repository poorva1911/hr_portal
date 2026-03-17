require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper to run an LLM prompt with timeout and JSON parsing
async function askLLM(prompt, systemInstruction = "You are a helpful AI that returns JSON.", timeoutMs = 7000) {
    if (!genAI) {
        throw new Error('No API key provided');
    }

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
        systemInstruction
    });

    try {
        // Run with a timeout promise race
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('LLM Timeout')), timeoutMs)
        );

        const responsePromise = model.generateContent(prompt);

        const result = await Promise.race([responsePromise, timeoutPromise]);
        
        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("LLM Error:", error.message);
        throw error;
    }
}

module.exports = { askLLM };
