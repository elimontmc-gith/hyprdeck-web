require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Verify env variable exists
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set!');
  process.exit(1); // Stop early if missing
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

app.get('/', (req, res) => res.send('Welcome to my API!'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});