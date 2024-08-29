const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Added this line
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create users and todos tables if they don't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255),
            email VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT
        )`);
    }
});

// Submit form route
app.post('/submit-form', (req, res) => {
    const { name, email, message } = req.body;
    console.log("Form Data:", req.body);
    db.run("INSERT INTO todos (task) VALUES (?)", [`${name} (${email}): ${message}`], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.redirect('/show-data');
    });
});

// Route to display submitted data
app.get('/show-data', (req, res) => {
    db.all("SELECT * FROM todos", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log("Database Rows:", rows);
        let html = '<h1>Submitted Data</h1><ul>';
        rows.forEach(row => {
            html += `<li>${row.task}</li>`;
        });
        html += '</ul><a href="/">Back to Home</a>';
        res.send(html);
    });
});

// Main route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve images from the public folder
app.use("/public/image", express.static('image'));

// API to get all todos
app.get('/todos', (req, res) => {
    db.all("SELECT * FROM todos", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ todos: rows });
    });
});

// API to add a new todo
app.post('/todos', (req, res) => {
    const { task } = req.body;
    db.run("INSERT INTO todos (task) VALUES (?)", [task], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, task });
    });
});

// API to update a todo
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { task } = req.body;
    db.run("UPDATE todos SET task = ? WHERE id = ?", [task, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ updated: this.changes });
    });
});

// API to delete a todo
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM todos WHERE id = ?", id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});