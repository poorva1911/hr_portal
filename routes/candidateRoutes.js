const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const User = require('../models/User');
const { analyzeResume } = require('../agents/resumeAnalyzer');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Setup Multer to store uploaded PDF in memory
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authenticateToken, requireRole('candidate'), upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No PDF file uploaded." });
        }
        
        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: "Only PDF files are supported." });
        }

        // Extract text from PDF buffer
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ error: "Could not extract text from the provided PDF." });
        }

        // Analyze Resume using the AI Agent
        console.log(`Analyzing resume for candidate ID: ${req.user.id}`);
        const parsedResume = await analyzeResume(resumeText);
        
        // Save to DB
        await User.updateResumeData(
            req.user.id, 
            resumeText, 
            parsedResume.skills || [], 
            parsedResume.experience || 0
        );

        res.json({ 
            message: "Resume processed successfully", 
            parsedData: parsedResume 
        });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Failed to process resume: " + error.message });
    }
});

// Get Candidate Status
router.get('/me', authenticateToken, requireRole('candidate'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        
        res.json({
            username: user.username,
            hasResume: !!user.resume_text,
            skills: user.parsed_skills ? JSON.parse(user.parsed_skills) : [],
            experience: user.parsed_experience || 0
        });
    } catch (error) {
        console.error("Fetch profile error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
