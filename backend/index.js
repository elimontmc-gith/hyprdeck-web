import express from 'express';
import cors from 'cors';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

const sql = postgres(process.env.DATABASE_URL);

// Whitelist your tables to prevent SQL injection
const allowedTables = ['test', 'users', 'products']; 

// Root route
app.get('/', (req, res) => res.send('Welcome to my API!'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 1️⃣ /data/:table or /data/:table:col_or_row
app.get('/data/:param', async (req, res) => {
  const { param } = req.params;

  try {
    let table, columnOrRow;
    if (param.includes(':')) {
      [table, columnOrRow] = param.split(':');
    } else {
      table = param;
    }

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    if (!columnOrRow) {
      // Return all rows
      const rows = await sql.unsafe(`SELECT * FROM ${table}`);
      return res.json(rows);
    } else {
      // Check if it's a column
      const columns = await sql.unsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
      const colNames = columns.map(c => c.column_name);

      if (colNames.includes(columnOrRow)) {
        const rows = await sql.unsafe(`SELECT ${columnOrRow} FROM ${table}`);
        return res.json(rows);
      } else {
        // Assume it’s a row search by primary key or 'id'
        const rows = await sql.unsafe(`SELECT * FROM ${table} WHERE id = '${columnOrRow}'`);
        if (rows.length === 0) return res.status(404).json({ error: 'request not found' });
        return res.json(rows[0]);
      }
    }

  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 2️⃣ /data/query/:searchrequest
app.get('/data/query/:searchrequest', async (req, res) => {
  const { searchrequest } = req.params;

  try {
    // Search through all allowed tables
    for (let table of allowedTables) {
      // Search column names
      const columns = await sql.unsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
      const colNames = columns.map(c => c.column_name);
      if (colNames.includes(searchrequest)) {
        const rows = await sql.unsafe(`SELECT ${searchrequest} FROM ${table}`);
        return res.json(rows);
      }

      // Search rows by id or any text column
      const rows = await sql.unsafe(`SELECT * FROM ${table} WHERE id = '${searchrequest}'`);
      if (rows.length > 0) return res.json(rows[0]);

      // Optional: search text columns for value match
      const textCols = colNames.join(", ");
      const textRows = await sql.unsafe(`SELECT * FROM ${table} WHERE ${textCols}::text LIKE '%${searchrequest}%'`);
      if (textRows.length > 0) return res.json(textRows);
    }

    return res.status(404).json({ error: 'request not found' });

  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));