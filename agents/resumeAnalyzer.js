const { askLLM } = require('./llmClient');

async function analyzeResume(resumeText) {
    try {
        const systemInstruction = "Extract the technical skills as an array of strings, and the total years of experience as a number from the following candidate resume. Respond simply with JSON: { skills: string[], experience: number }. If experience is not stated clearly, output 0.";
        const prompt = `Resume:\n${resumeText}`;
        const result = await askLLM(prompt, systemInstruction, 7000);
        return {
            skills: result.skills || [],
            experience: Number(result.experience) || 0
        };
    } catch (e) {
        console.log("Falling back to rule-based Resume analysis...");
        return fallbackAnalyzeResume(resumeText);
    }
}

function fallbackAnalyzeResume(resumeText) {
    const text = resumeText.toLowerCase();
    
    // Look for numbers before "years" 
    const expMatch = resumeText.match(/(\d+)\s*years?/i);
    const experience = expMatch ? parseInt(expMatch[1]) : 0;

    // Common skills lookup
    const techDict = ['react', 'node', 'python', 'java', 'javascript', 'html', 'css', 'go', 'ruby', 'sql', 'aws', 'docker', 'kubernetes', 'typescript', 'mongodb', 'php', 'c++', 'angular', 'django', 'pandas', 'spring', 'vue', 'machine learning', 'tensorflow'];
    const skills = techDict.filter(skill => text.includes(skill.toLowerCase()));

    return { skills, experience };
}

module.exports = { analyzeResume };
