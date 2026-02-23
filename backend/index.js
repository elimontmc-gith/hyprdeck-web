import express from 'express';
import cors from 'cors';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

const sql = postgres(process.env.DATABASE_URL);

// Whitelist tables
const allowedTables = ['test', 'users', 'products'];

/* ===========================
   ROOT + HEALTH
=========================== */

app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/dbhealth', async (req, res) => {
  const data = await fetch('https://status.supabase.com/api/v2/status.json');
  const json = await data.json();
  const status = json.status.description;
  res.json({ status: status });
});

/* ===========================
   DATA ROUTE
   /data/:table
   ?id=1
   ?name=alice
   ?q=alice&fuzzy=true
=========================== */

app.get('/data/:table', async (req, res) => {
  const { table } = req.params;
  const { q, fuzzy, ...filters } = req.query;

  try {
    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = ${table}
    `;

    const colNames = columns.map(c => c.column_name);

    const textColumns = columns
      .filter(c =>
        c.data_type.includes('character') ||
        c.data_type.includes('text')
      )
      .map(c => c.column_name);

    // No filters, no search
    if (!q && Object.keys(filters).length === 0) {
      const rows = await sql`
        SELECT * FROM ${sql.identifier([table])}
      `;
      return res.json(rows);
    }

    const conditions = [];

    // Column filters (?name=Alice)
    for (const [key, value] of Object.entries(filters)) {
      if (!colNames.includes(key)) {
        return res.status(400).json({ error: `Invalid column: ${key}` });
      }

      conditions.push(sql`
        ${sql.identifier([key])} = ${value}
      `);
    }

    // Global search
    if (q) {
      if (textColumns.length === 0) {
        return res.status(400).json({ error: 'No searchable text columns' });
      }

      const searchParts = textColumns.map(col => {
        if (fuzzy === 'true') {
          return sql`
            ${sql.identifier([col])} ILIKE ${'%' + q + '%'}
          `;
        } else {
          return sql`
            ${sql.identifier([col])} = ${q}
          `;
        }
      });

      conditions.push(sql`(${sql(searchParts, ' OR ')})`);
    }

    const rows = await sql`
      SELECT * FROM ${sql.identifier([table])}
      WHERE ${sql(conditions, ' AND ')}
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No matching records found' });
    }

    res.json(rows);

  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

/* ===========================
   START SERVER
=========================== */

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});