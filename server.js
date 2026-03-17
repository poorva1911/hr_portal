require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./config/db');
const { runATS } = require('./orchestrator');
const { authenticateToken, requireRole } = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);

// Protected HR Endpoint for matching
app.post('/api/match', authenticateToken, requireRole('hr'), async (req, res) => {
    try {
        const { jdText } = req.body;
        if (!jdText || jdText.trim().length === 0) {
            return res.status(400).json({ error: "Job Description is required." });
        }

        const result = await runATS(jdText);
        res.json(result);
    } catch (error) {
        console.error("Pipeline Error:", error);
        res.status(500).json({ error: "An internal error occurred." });
    }
});

const PORT = process.env.PORT || 3000;

// Initialize Database before starting the server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 ATS Server (with Auth & SQLite) running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
});
