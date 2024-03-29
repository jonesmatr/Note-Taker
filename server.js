const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// HTML Routes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// API Routes
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        res.json(JSON.parse(data));
    });
});

// POST Routes and writing to db.json
app.post('/api/notes', (req, res) => {
    console.log("Received a new note:", req.body);
    const newNote = req.body;
    newNote.id = Date.now().toString();
    
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf-8', (err, data) => {
        if (err) {
            console.error("Error reading db.json:", err);
            return res.status(500).json({ error: "Failed to read the database file." });
        }
        const notes = JSON.parse(data);
        notes.push(newNote);
        fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes), (err) => {
            if (err) {
                console.error("Error writing to db.json:", err);
                return res.status(500).json({ error: "Failed to save the note to the database." });
            }
            res.json(newNote);
        });
    });
});

// DELETE Routes and deleting from db.json
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf-8', (err, data) => {
        if (err) throw err;
        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== noteId);
        fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes), (err) => {
            if (err) throw err;
            res.json({ message: 'Note deleted successfully!' });
        });
    });

});

// This is the default route, if none of the other routes match it will return the index page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});