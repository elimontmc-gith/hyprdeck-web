require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});