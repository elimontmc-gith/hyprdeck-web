require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Supabase connection
});

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Root route
app.get('/', (req, res) => res.send('Welcome to my API!'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Example: get current time from DB
app.get('/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('DB query error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));