const express = require('express');
const app = express();
const mariadb = require('mariadb');
const path = require('path');

// MariaDB Datenbankverbindung
const pool = mariadb.createPool({
  host: 'mariadb1.local.cs.hs-rm.de',
  ssl: {
    rejectUnauthorized: false
  },
  user: 'xxx',
  password: 'xxx',
  database: 'ezeil001',
  port: 3306,
  connectionLimit: 5
});

/**
 * Test the database connection.
 */
pool.getConnection()
  .then(conn => {
    console.log('Connected to database');
    conn.release(); // release to pool
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  });

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

/**
 * API endpoint to save high score.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post('/save-score', (req, res) => {
  const { playerName, score } = req.body;
  console.log('Request body:', req.body); // Log the request body

  if (!playerName || score === undefined) {
    res.status(400).send('Bad Request: Missing playerName or score');
    return;
  }

  const query = 'INSERT INTO highscores (playerName, score) VALUES (?, ?)';
  pool.query(query, [playerName, score])
    .then(result => {
      res.send('Score saved');
    })
    .catch(err => {
      console.error('Error saving score:', err);
      res.status(500).send('Error saving score');
    });
});

/**
 * API endpoint to get high scores.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.get('/highscores', (req, res) => {
  const query = 'SELECT * FROM highscores ORDER BY score DESC';
  pool.query(query)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error('Error fetching highscores:', err);
      res.status(500).send('Error fetching highscores');
    });
});

const port = 3000; // Use a different port than 3306
const hostname = 'localhost';
/**
 * Start the server.
 * @param {number} port - The port number.
 * @param {string} hostname - The hostname.
 * @param {Function} callback - The callback function.
 */
app.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});
