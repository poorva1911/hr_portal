const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function connectDB() {
    return open({
        filename: path.join(__dirname, '..', 'data', 'ats.sqlite'),
        driver: sqlite3.Database
    });
}

async function initDB() {
    const db = await connectDB();
    
    // Create Users table containing both HR and Candidates
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT CHECK(role IN ('hr', 'candidate')),
            email TEXT,
            resume_text TEXT,
            parsed_skills TEXT,
            parsed_experience INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("✅ SQLite Database connected and tables verified.");
    return db;
}

module.exports = { connectDB, initDB };
