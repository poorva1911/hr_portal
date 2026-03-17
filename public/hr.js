document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'hr') {
        window.location.href = '/login.html';
        return;
    }

    const jdInput = document.getElementById('jd-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analyzeText = analyzeBtn.querySelector('.btn-text');
    const loader = analyzeBtn.querySelector('.loader');

    const welcomeText = document.getElementById('welcome-text');
    const logoutBtn = document.getElementById('logout-btn');
    
    welcomeText.textContent = `Welcome, ${localStorage.getItem('username')}`;
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });
    
    const resultsSection = document.getElementById('results-section');
    const jdSummary = document.getElementById('jd-summary');
    const candidatesGrid = document.getElementById('candidates-grid');
    const template = document.getElementById('candidate-card-template');

    analyzeBtn.addEventListener('click', async () => {
        const jdText = jdInput.value.trim();
        if (!jdText) {
            alert('Please enter a Job Description first.');
            return;
        }

        // UI Loading state
        analyzeBtn.disabled = true;
        analyzeText.textContent = "Analyzing...";
        loader.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        candidatesGrid.innerHTML = '';

        try {
            const response = await fetch('/api/match', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ jdText })
            });

            if (!response.ok) {
                throw new Error("Failed to process request");
            }

            const data = await response.json();
            renderResults(data);
        } catch (error) {
            console.error(error);
            alert('An error occurred during processing. Is the server running?');
        } finally {
            analyzeBtn.disabled = false;
            analyzeText.textContent = "Find Candidates";
            loader.classList.add('hidden');
        }
    });

    function renderResults(data) {
        const { jdData, candidates } = data;

        // Render JD summary
        jdSummary.innerHTML = `
            <div><strong>Detected Role:</strong> ${jdData.role}</div>
            <div><strong>Required Exp:</strong> ${jdData.experience} yrs</div>
            <div><strong>Core Skills:</strong> ${jdData.skills.join(', ') || 'None Detected'}</div>
        `;

        const jdSkillsLower = new Set(jdData.skills.map(s => s.toLowerCase()));

        // Render Cards
        candidates.forEach((candidate, index) => {
            const clone = template.content.cloneNode(true);
            const card = clone.querySelector('.card');
            
            // Set animation delay
            card.style.setProperty('--animation-order', index);

            // Basic info
            clone.querySelector('.candidate-name').textContent = candidate.name;
            clone.querySelector('.candidate-email').textContent = candidate.email;
            clone.querySelector('.reason-text').textContent = candidate.reason;

            // Score Circle
            const score = candidate.score;
            const scorePath = clone.querySelector('.score-path');
            const scoreText = clone.querySelector('.score-text');
            
            // Allow DOM to render then animate stroke
            setTimeout(() => {
                scorePath.setAttribute('stroke-dasharray', `${score}, 100`);
            }, 100);
            
            scoreText.textContent = `${score}%`;

            if (score >= 80) scorePath.classList.add('score-high');
            else if (score >= 50) scorePath.classList.add('score-med');
            else scorePath.classList.add('score-low');

            // Experience
            clone.querySelector('.exp-badge').textContent = `${candidate.parsedResume.experience} Years`;

            // Skills
            const tagsContainer = clone.querySelector('.skills-tags');
            
            // Safely handle missing candidate skills array
            const candidateSkills = candidate.parsedResume.skills || [];
            
            if (candidateSkills.length === 0) {
                tagsContainer.innerHTML = '<span class="skill-tag">No technical skills detected</span>';
            } else {
                candidateSkills.forEach(skill => {
                    const span = document.createElement('span');
                    span.classList.add('skill-tag');
                    span.textContent = skill;
                    if (jdSkillsLower.has(skill.toLowerCase())) {
                        span.classList.add('matched');
                    }
                    tagsContainer.appendChild(span);
                });
            }

            candidatesGrid.appendChild(clone);
        });

        resultsSection.classList.remove('hidden');
    }
});
