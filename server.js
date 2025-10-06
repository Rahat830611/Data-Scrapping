import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';
import { open } from 'sqlite';

const app = express();
app.use(cors());
app.use(express.json());

const dbPromise = open({
  filename: './data.db',
  driver: sqlite3.Database
});

(async () => {
  const db = await dbPromise;
  await db.exec(`CREATE TABLE IF NOT EXISTS scraped_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    url TEXT,
    price TEXT,
    source TEXT,
    scraped_at TEXT
  )`);
})();

app.get('/api/data', async (req, res) => {
  const db = await dbPromise;
  const { page = 1, limit = 20, q = '', all } = req.query;
  let query = 'SELECT * FROM scraped_data';
  const params = [];
  if (q) {
    query += ' WHERE title LIKE ? OR source LIKE ?';
    params.push(`%${q}%`, `%${q}%`);
  }
  query += ' ORDER BY id DESC';
  const rows = await db.all(query, params);
  if (all) return res.json({ items: rows });
  const offset = (page - 1) * limit;
  const paged = rows.slice(offset, offset + Number(limit));
  res.json({ items: paged, total: rows.length });
});

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  const db = await dbPromise;
  const newItem = {
    title: 'Sample Item from ' + url,
    url,
    price: '$' + (Math.random() * 100).toFixed(2),
    source: 'DemoSource',
    scraped_at: new Date().toISOString()
  };
  await db.run('INSERT INTO scraped_data (title, url, price, source, scraped_at) VALUES (?, ?, ?, ?, ?)', 
    [newItem.title, newItem.url, newItem.price, newItem.source, newItem.scraped_at]);
  res.json({ success: true, item: newItem });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
