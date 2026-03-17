# Agentic Applicant Tracking System (ATS)

An intelligent, full-stack Applicant Tracking System powered by AI agents. This platform automates the hiring pipeline by using specialized LLM agents to parse Job Descriptions, analyze Candidate Resumes (PDFs), and intelligently rank matches with concrete reasoning. 

Built with Node.js, Express, SQLite, and the Google Gemini API.

## 🚀 Features

- **Agentic AI Workflow**: Multiple specialized AI agents work together in a pipeline:
  - **JD Parsing Agent**: Extracts core roles, mandatory skills, and years of experience from unstructured Job Descriptions.
  - **Resume Analysis Agent**: Scrapes and interprets PDF resumes uploaded by candidates, classifying their technical skills and experience levels.
  - **Matching Agent**: Intelligently scores candidates against the JD criteria, returning a percentage match and human-readable reasoning.
- **Fail-Safe Architecture**: Every AI agent contains a deterministic, rule-based fallback mechanism. If the AI API fails, times out, or lacks a key, the system automatically falls back to regex and keyword-matching ensuring 100% uptime.
- **Role-Based Access Control (RBAC)**: Secure JWT-based authentication separating user domains.
  - **HR Dashboard**: Allows recruiters to paste Job Descriptions and view ranked candidate results.
  - **Candidate Portal**: Allows candidates to upload their PDF resumes via drag-and-drop and view their AI-analyzed live profile.
- **Local Persistence**: Data is persistently stored using SQLite (`ats.sqlite`), making it easy to run locally without complex database deployments.
- **Modern UI/UX**: A responsive, dark-themed frontend utilizing glassmorphism, smooth CSS transitions, and SVG circular progress indicators.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JSON Web Tokens (JWT), Bcrypt.js
- **File Parsing**: Multer (file uploads), pdf-parse (PDF text extraction)
- **AI Integration**: `@google/generative-ai` (Gemini)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher recommended)
- A Google Gemini API Key. Get one from [Google AI Studio](https://aistudio.google.com/).

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/agentic-ats.git
cd agentic-ats
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
JWT_SECRET=super_secret_dev_key
```
*(Note: If no API key is provided, the system will still function using its deterministic rule-based fallbacks.)*

### 4. Seed the Database (Optional but Recommended)
To immediately populate the database with a test HR account and 10 pre-analyzed candidates:
```bash
npm run seed
# Note: If this script isn't in package.json, just run: node seed.js
```

### 5. Start the Server
```bash
node server.js
```
The application will be running at `http://localhost:3000`.

## 🎮 How to Use

### For HR Recruiters
1. Navigate to `http://localhost:3000`.
2. Login using the spawned credentials (if using `seed.js`, use `admin` / `admin123`) or create a new HR account in the "Sign Up" tab.
3. On the HR Dashboard, paste a Job Description (e.g., "Looking for a Senior React developer with 5 years experience...").
4. Click "Find Candidates" and watch the AI Agents rank the candidates in the database in real-time!

### For Candidates
1. Navigate to `http://localhost:3000`.
2. Create a new account under the "Sign Up" tab, selecting "I am a Candidate".
3. On the Candidate Portal, drag and drop a `.pdf` version of your resume.
4. The system will extract the text, send it to the Resume Analyzer Agent, and return your extracted core skills and experience to your live profile.

## 📁 Project Structure

```text
├── agents/             # AI Agent Logic (JD Parser, Resume Analyzer, Matcher)
├── config/             # Database configuration and connection
├── data/               # SQLite database file and fallback CSVs
├── middleware/         # Express middleware (JWT Authentication)
├── models/             # SQLite User/Candidate data models
├── public/             # Static Frontend (HTML, CSS, JS)
├── routes/             # Express API Routes (Auth, Candidate)
├── utils/              # Helper utilities (CSV parsers)
├── .env                # API Keys and Secrets
├── orchestrator.js     # Pipeline connecting the AI agents to the database
├── server.js           # Main Express server entry point
└── seed.js             # Initial database population script
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
