const { connectDB } = require('../config/db');

class User {
    static async create({ username, password, role, email }) {
        const db = await connectDB();
        const result = await db.run(
            `INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)`,
            [username, password, role, email]
        );
        return { id: result.lastID, username, role, email };
    }

    static async findByUsername(username) {
        const db = await connectDB();
        return db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    }

    static async findById(id) {
        const db = await connectDB();
        return db.get(`SELECT * FROM users WHERE id = ?`, [id]);
    }

    static async updateResumeData(id, resumeText, parsedSkills, parsedExperience) {
        const db = await connectDB();
        const skillsString = JSON.stringify(parsedSkills);
        await db.run(
            `UPDATE users SET resume_text = ?, parsed_skills = ?, parsed_experience = ? WHERE id = ?`,
            [resumeText, skillsString, parsedExperience, id]
        );
    }

    static async getAllCandidates() {
        const db = await connectDB();
        const candidates = await db.all(`SELECT * FROM users WHERE role = 'candidate'`);
        return candidates.map(c => ({
            ...c,
            parsed_skills: c.parsed_skills ? JSON.parse(c.parsed_skills) : []
        }));
    }
}

module.exports = User;
