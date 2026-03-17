const { initDB, connectDB } = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const candidates = [
    { username: 'alice', pass: 'pass123', email: 'alice@example.com', skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'], exp: 5, resume: "Experienced web developer with 5 years building scalable applications using React and Node.js. Proficient in frontend technologies (HTML, CSS, JS) and RESTful API design. Strong focus on UI/UX." },
    { username: 'bob', pass: 'pass123', email: 'bob@example.com', skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'], exp: 7, resume: "Backend engineer with 7 years of experience configuring and deploying scalable web services on AWS. Expert in Python, Django REST Framework, and SQL database optimization." },
    { username: 'charlie', pass: 'pass123', email: 'charlie@example.com', skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes'], exp: 4, resume: "Software Engineer with a solid background in Java and Spring Boot. 4 years of experience building microservices and deploying them using Kubernetes and Docker." },
    { username: 'diana', pass: 'pass123', email: 'diana@example.com', skills: ['JavaScript', 'React', 'Vue', 'TypeScript', 'Figma'], exp: 3, resume: "Creative frontend developer. 3 years experience with modern JavaScript frameworks like React and Vue. Strong design sense and experience with Figma." },
    { username: 'eve', pass: 'pass123', email: 'eve@example.com', skills: ['Go', 'Python', 'Kubernetes', 'Terraform', 'CI/CD'], exp: 6, resume: "DevOps Engineer with 6 years experience. Expert in infrastructure as code using Terraform, developing custom tools in Go and Python, and managing Kubernetes clusters." },
    { username: 'frank', pass: 'pass123', email: 'frank@example.com', skills: ['C++', 'Python', 'Machine Learning', 'TensorFlow'], exp: 5, resume: "Machine Learning Engineer focused on computer vision. 5 years experience applying advanced ML models using TensorFlow and PyTorch. Strong C++ systems knowledge." },
    { username: 'grace', pass: 'pass123', email: 'grace@example.com', skills: ['JavaScript', 'Angular', 'Node.js', 'Express', 'MongoDB'], exp: 8, resume: "Full-stack web developer with 8 years of experience. Deep knowledge of the MEAN stack (MongoDB, Express, Angular, Node.js). Led multiple high-performing agile teams." },
    { username: 'henry', pass: 'pass123', email: 'henry@example.com', skills: ['PHP', 'Laravel', 'MySQL', 'JavaScript'], exp: 4, resume: "Backend developer with 4 years experience in PHP and Laravel. Adept at building custom CMS platforms and e-commerce backends with MySQL." },
    { username: 'ivy', pass: 'pass123', email: 'ivy@example.com', skills: ['Ruby', 'Ruby on Rails', 'PostgreSQL', 'Redis'], exp: 6, resume: "Ruby on Rails developer. 6 years building fast, robust, and scalable monolith applications. Strong background in caching with Redis and database queries." },
    { username: 'jack', pass: 'pass123', email: 'jack@example.com', skills: ['Python', 'Data Analysis', 'Pandas', 'SQL', 'Tableau'], exp: 3, resume: "Data Analyst with 3 years experience. Skilled in Python (Pandas, NumPy) for data manipulation, SQL for data extraction, and Tableau for visualization." }
];

async function seed() {
    console.log("Initializing database...");
    await initDB();
    
    // Create HR
    try {
        const hrExists = await User.findByUsername('admin');
        if (!hrExists) {
            const hrPass = await bcrypt.hash('admin123', 10);
            await User.create({ username: 'admin', password: hrPass, role: 'hr', email: 'hr@company.com' });
            console.log("✅ Created HR user: admin / admin123");
        } else {
            console.log("HR user already exists.");
        }
    } catch (e) { console.error("Error creating HR", e); }

    // Create Candidates
    for (const c of candidates) {
        try {
            const exists = await User.findByUsername(c.username);
            if (!exists) {
                const hashed = await bcrypt.hash(c.pass, 10);
                const userObj = await User.create({ username: c.username, password: hashed, role: 'candidate', email: c.email });
                
                // Directly seed their parsed resume data to save LLM/PDF extraction time!
                await User.updateResumeData(userObj.id, c.resume, c.skills, c.exp);
                console.log(`✅ Created candidate: ${c.username} / ${c.pass}`);
            }
        } catch (e) {
            console.log(`Skipped ${c.username}: Error or already exists.`);
        }
    }
    
    console.log("\nDatabase seeded successfully!");
}

seed().catch(console.error);
