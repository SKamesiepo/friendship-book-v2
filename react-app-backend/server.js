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
      player2_finished INTEGER DEFAULT 0,
      wyr_finished_count INTEGER DEFAULT 0
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
      const gameOver = row.wyr_finished_count === 2; // Game is over when both players finish
      res.json({ ...row, gameOver });
    }
  });
});

// Submit Answers and Increment `wyr_finished_count`
app.post('/session/:id/answers', (req, res) => {
  const { id } = req.params;
  const { playerName, answers } = req.body;

  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const isPlayer1 = session.player1 === playerName;
    const column = isPlayer1 ? 'player1_answers' : 'player2_answers';
    const finishedColumn = isPlayer1 ? 'player1_finished' : 'player2_finished';

    // Avoid double increment if already marked finished
    if (session[finishedColumn] === 1) {
      return res.json({ message: `${playerName} has already submitted answers.` });
    }

    db.run(
      `UPDATE sessions 
       SET ${column} = ?, 
           ${finishedColumn} = 1, 
           wyr_finished_count = wyr_finished_count + 1 
       WHERE id = ?`,
      [JSON.stringify(answers), id],
      (err) => {
        if (err) {
          res.status(500).json({ error: 'Failed to save answers and update game state' });
        } else {
          res.json({ message: `${playerName}'s answers submitted and game state updated` });
        }
      }
    );
  });
});

// Reset Game for "Would You Rather"
app.post('/session/:id/reset', (req, res) => {
  const { id } = req.params;

  db.run(
    `UPDATE sessions 
     SET player1_finished = 0, 
         player2_finished = 0, 
         wyr_finished_count = 0 
     WHERE id = ?`,
    [id],
    (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to reset session for "Would You Rather"' });
      } else {
        res.json({ message: 'Session reset successfully for "Would You Rather"' });
      }
    }
  );
});

app.post('/session/:id/drawing', (req, res) => {
  const { id } = req.params;
  const { playerName, drawingData, finished } = req.body;

  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const isPlayer1 = session.player1 === playerName;
    const drawingColumn = isPlayer1 ? 'player1_drawing_base64' : 'player2_drawing_base64';
    const finishedColumn = isPlayer1 ? 'player1_drawing_finished' : 'player2_drawing_finished';

    db.run(
      `UPDATE sessions 
       SET ${drawingColumn} = ?, 
           ${finishedColumn} = 1, 
           drawing_finished_count = drawing_finished_count + 1 
       WHERE id = ?`,
      [drawingData, id],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: 'Failed to save drawing' });
        }
        res.json({ message: 'Drawing saved successfully' });
      }
    );
  });
});

app.get('/session/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM sessions WHERE id = ?', [id], (err, session) => {
    if (err || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const gameOver = session.drawing_finished_count === 2;

    res.json({
      ...session,
      gameOver,
    });
  });
});



// Start the Server
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend running at http://0.0.0.0:${port}`);
});
