const fs = require('fs');
const { parse } = require('csv-parse/sync');
const path = require('path');

function getCandidates() {
    const csvFilePath = path.join(__dirname, '..', 'data', 'resumes.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse the CSV
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });
    
    // Process and normalize skills/experience
    return records.map(record => ({
        ...record,
        experience: Number(record.experience),
        skillsList: record.skills.split(',').map(s => s.trim())
    }));
}

module.exports = { getCandidates };
