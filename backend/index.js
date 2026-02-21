import express from 'express';
import cors from 'cors';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Connect to database using postgres
const sql = postgres(process.env.DATABASE_URL);

// Root route
app.get('/', (req, res) => res.send('Welcome to my API!'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Example: get current time from DB
app.get('/data', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json(result[0]); // postgres returns array of rows
  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));