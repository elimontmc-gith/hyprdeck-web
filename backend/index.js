import express from 'express';
import cors from 'cors';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Connect to Supabase
const sql = postgres(process.env.DATABASE_URL);

// Root
app.get('/', (req, res) => res.send('Welcome to my API!'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Dynamic data route
app.get('/data/:name', async (req, res) => {
  const { name } = req.params;

  try {
    // Query the database for the specific name
    const result = await sql`SELECT * FROM users WHERE name = ${name}`;
    
    if (result.length === 0) {
      return res.status(404).json({ message: `No data found for ${name}` });
    }

    res.json(result[0]); // Return the first matching row
  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));