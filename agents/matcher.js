const { askLLM } = require('./llmClient');

async function matchCandidate(jdData, candidateData) {
    try {
        const systemInstruction = `You are an AI HR recruiter. You will be provided with a JSON representing a Job Description, and a JSON representing a Candidate's Profile. Return a match score from 0 to 100 on how well the candidate fits the role, and a succinct (1-sentence) reason. Respond simply with JSON: { score: number, reason: string }.`;
        
        const prompt = `JD JSON:\n${JSON.stringify(jdData, null, 2)}\n\nCandidate JSON:\n${JSON.stringify(candidateData, null, 2)}`;
        
        const result = await askLLM(prompt, systemInstruction, 7000);
        return {
            score: Number(result.score) || 0,
            reason: result.reason || "Score calculated."
        };
    } catch (e) {
        console.log("Falling back to rule-based Matching...");
        return fallbackMatchCandidate(jdData, candidateData);
    }
}

function fallbackMatchCandidate(jdData, candidateData) {
    const jdSkills = new Set((jdData.skills || []).map(s => s.toLowerCase()));
    const candSkills = new Set((candidateData.skills || []).map(s => s.toLowerCase()));
    
    // Skill overlap calculation
    let matchCount = 0;
    for (const skill of candSkills) {
        if (jdSkills.has(skill)) {
            matchCount++;
        }
    }
    
    const maxSkills = jdSkills.size === 0 ? 1 : jdSkills.size;
    let skillScore = (matchCount / maxSkills) * 100;
    
    // Experience logic
    let expScore = 0;
    if (candidateData.experience >= jdData.experience) {
        expScore = 100;
    } else if (jdData.experience > 0) {
        expScore = (candidateData.experience / jdData.experience) * 100;
    }
    
    // 60% skills, 40% experience weight
    const finalScore = Math.round((skillScore * 0.6) + (expScore * 0.4));
    
    let reason = `Based on fallback logic: Candidate has ${matchCount} matching skills and ${candidateData.experience} years experience.`;
    if (finalScore > 80) reason += " Strong match.";
    else if (finalScore > 50) reason += " Moderate match.";
    else reason += " Weak match.";

    return { score: finalScore, reason };
}

module.exports = { matchCandidate };
