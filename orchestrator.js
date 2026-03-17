const User = require('./models/User');
const { getCandidates } = require('./utils/csvParser');
const { parseJD } = require('./agents/jdParser');
const { analyzeResume } = require('./agents/resumeAnalyzer');
const { matchCandidate } = require('./agents/matcher');

async function runATS(jdText) {
    console.log("Starting ATS pipeline...");

    // Step 1: Parse JD
    console.log("Parsing JD...");
    const parsedJD = await parseJD(jdText);
    console.log("JD Parsed:", parsedJD);

    // Step 2: Load Candidates from SQLite Database
    console.log("Loading Candidates from SQLite...");
    let dbCandidates = await User.getAllCandidates();
    let candidatesToMatch = [];

    // Map DB candidates to standard matching format
    dbCandidates.forEach(user => {
        if (user.resume_text) {
            candidatesToMatch.push({
                name: user.username,
                email: user.email,
                resume_text: user.resume_text,
                parsedResume: {
                    skills: user.parsed_skills || [],
                    experience: user.parsed_experience || 0
                }
            });
        }
    });

    // Fallback: If DB has no candidates with resumes, load from CSV (Demo purposes)
    if (candidatesToMatch.length === 0) {
        console.log("No candidates found in DB. Falling back to CSV seeding logic...");
        const rawCsvCandidates = getCandidates();
        console.log(`Loaded ${rawCsvCandidates.length} fallback candidates from CSV.`);
        
        // Analyze CSV candidates (Since they aren't pre-analyzed like DB docs)
        const csvResults = await Promise.all(
            rawCsvCandidates.map(async (candidate) => {
                const parsedResume = await analyzeResume(candidate.resume_text);
                return {
                    name: candidate.name,
                    email: candidate.email,
                    resume_text: candidate.resume_text,
                    parsedResume
                };
            })
        );
        candidatesToMatch = csvResults;
    } else {
        console.log(`Loaded ${candidatesToMatch.length} parsed candidates from DB.`);
    }

    // Step 3 & 4: Match candidates against JD
    console.log("Matching candidates against Job Description...");
    const results = await Promise.all(
        candidatesToMatch.map(async (candidate) => {
            const matchInfo = await matchCandidate(parsedJD, candidate.parsedResume);

            return {
                name: candidate.name,
                email: candidate.email,
                parsedResume: candidate.parsedResume,
                score: matchInfo.score,
                reason: matchInfo.reason
            };
        })
    );

    // Step 5: Rank descending by score
    results.sort((a, b) => b.score - a.score);

    // Step 6: Return Top N (all for demo)
    return {
        jdData: parsedJD,
        candidates: results
    };
}

module.exports = { runATS };
