import fs from 'fs';
import path from 'path';

// Function to create a list of Notes
function generateNotes(n) {
    const notes = [];

    for (let i = 1; i <= n; i++) {
        notes.push({
            id: i,
            title: `Note ${i}`,
            author: {
                name: `Author ${i}`,
                email: `mail_${i}@gmail.com`,
            },
            content: `Content for note ${i}`,
        });
    }

    return { notes };
}

// Function to write to a specific path the Notes list
function writeToFile(data, outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 4), 'utf-8');
    console.log(`Success`);
}

// Checking the second argument exists and is a number
const args = process.argv.slice(2);
if (args.length !== 1 || isNaN(Number(args[0]))) {
    console.error("Usage: node generateNotes.js <N>");
    process.exit(1);
}

// Calling generate notes with the given number to a path we want
const n = parseInt(args[0], 10);
const notes = generateNotes(n);
writeToFile(notes, './data/notes.json');
