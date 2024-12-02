const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite Database
const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create Tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      player1 TEXT,
      player2 TEXT,
      player1_answers TEXT,
      player2_answers TEXT,
      player1_finished INTEGER DEFAULT 0,
      player2_finished INTEGER DEFAULT 0
    );
  `);
});

// API Routes

// Create a Session
app.post('/session', (req, res) => {
  const { sessionId, playerName } = req.body;
  db.run(
    'INSERT INTO sessions (id, player1) VALUES (?, ?)',
    [sessionId, playerName],
    (err) => {
      if (err) {
        res.status(500).json({ error: 'Session already exists or failed to create' });
      } else {
        res.json({ message: 'Session created', sessionId });
      }
    }
  );
});

// Join a Session
app.post('/session/join', (req, res) => {
  const { sessionId, playerName } = req.body;
  db.get('SELECT player1, player2 FROM sessions WHERE id = ?', [sessionId], (err, row) => {
    if (err || !row) {
      res.status(404).json({ error: 'Session not found' });
    } else if (row.player2) {
      res.status(400).json({ error: 'Session full' });
    } else {
      db.run('UPDATE sessions SET player2 = ? WHERE id = ?', [playerName, sessionId], (updateErr) => {
        if (updateErr) {
          res.status(500).json({ error: 'Failed to join session' });
        } else {
          res.json({ message: 'Joined session', sessionId });
        }
      });
    }
  });
});

// Get Session State
app.get('/session/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, row) => {
    if (err || !row) {
      res.status(404).json({ error: 'Session not found' });
    } else {
      res.json(row);
    }
  });
});

// Submit Answers
app.post('/session/:id/answers', (req, res) => {
  const { id } = req.params;
  const { playerName, answers } = req.body;

  db.get('SELECT player1, player2 FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const isPlayer1 = session.player1 === playerName;
    const column = isPlayer1 ? 'player1_answers' : 'player2_answers';
    const finishedColumn = isPlayer1 ? 'player1_finished' : 'player2_finished';

    db.run(
      `UPDATE sessions SET ${column} = ?, ${finishedColumn} = 1 WHERE id = ?`,
      [JSON.stringify(answers), id],
      (err) => {
        if (err) {
          res.status(500).json({ error: 'Failed to save answers' });
        } else {
          res.json({ message: `${isPlayer1 ? 'Player 1' : 'Player 2'} answers submitted` });
        }
      }
    );
  });
});

// Mark Player as Finished
app.post('/session/:id/finish', (req, res) => {
  const { id } = req.params;
  const { playerName } = req.body;

  db.get('SELECT player1, player2 FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const finishedColumn = session.player1 === playerName ? 'player1_finished' : 'player2_finished';

    db.run(
      `UPDATE sessions SET ${finishedColumn} = 1 WHERE id = ?`,
      [id],
      (err) => {
        if (err) {
          res.status(500).json({ error: 'Failed to mark as finished' });
        } else {
          res.json({ message: `${playerName} has finished` });
        }
      }
    );
  });
});

// Start the Server
app.listen(5000, '0.0.0.0', () => {
  console.log('Backend running at http://0.0.0.0:5000');
});
