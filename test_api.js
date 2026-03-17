const jdText = "Looking for a Senior Software Engineer with strong background in Python, Django, and AWS. Must have at least 5 years of experience.";

async function testAPI() {
    console.log("Testing API with Job Description:");
    console.log(jdText);
    console.log("--------------------------------------------------");

    const response = await fetch("http://localhost:3000/api/match", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ jdText })
    });

    const data = await response.json();
    console.log("Parsed JD:", data.jdData);
    console.log("--------------------------------------------------");
    console.log("Top 3 Matches:");
    
    for (let i = 0; i < 3 && i < data.candidates.length; i++) {
        const c = data.candidates[i];
        console.log(`#${i + 1} ${c.name} - Score: ${c.score}%`);
        console.log(`Skills: ${c.parsedResume.skills.join(', ')}`);
        console.log(`Reason: ${c.reason}`);
        console.log("--------------------------------------------------");
    }
}

testAPI().catch(console.error);
