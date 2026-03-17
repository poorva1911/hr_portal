const { askLLM } = require('./llmClient');

async function parseJD(jdText) {
    try {
        const systemInstruction = "You are an expert HR assistant. Extract the job role, required skills as an array, and the minimum required experience in years as a number from the job description. Respond simply with JSON: { role: string, skills: string[], experience: number }. If experience is not mentioned, use 0.";
        const prompt = `Job Description:\n${jdText}`;
        const result = await askLLM(prompt, systemInstruction, 7000);
        return {
            role: result.role || "Unknown Role",
            skills: result.skills || [],
            experience: Number(result.experience) || 0
        };
    } catch (e) {
        console.log("Falling back to rule-based JD parsing...");
        return fallbackParseJD(jdText);
    }
}

function fallbackParseJD(jdText) {
    const text = jdText.toLowerCase();
    
    // Simple experience fallback: look for "X years" or "X+ years"
    const expMatch = jdText.match(/(\d+)[\+]*\s*years/i);
    const experience = expMatch ? parseInt(expMatch[1]) : 0;
    
    // Dummy role extractor
    let role = "Software Engineer";
    if (text.includes("manager")) role = "Manager";
    else if (text.includes("data")) role = "Data Scientist / Analyst";
    else if (text.includes("designer")) role = "Designer";
    
    // Simple skills fallback
    const techDict = ['react', 'node', 'python', 'java', 'javascript', 'html', 'css', 'go', 'ruby', 'sql', 'aws', 'docker', 'kubernetes', 'typescript', 'mongodb', 'php', 'c++'];
    const skills = techDict.filter(skill => text.includes(skill.toLowerCase()));

    return { role, skills, experience };
}

module.exports = { parseJD };
