require('dotenv').config();
const express = require('express');
const db = require('./db');
const connectDB = require('./db/mangodb');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

(async () => {
  await connectDB();
  console.log("Vault App Connected to MongoDB");

  // Routes
  app.get('/', (req, res) => res.send('NodeVault API is running'));

  app.get('/records', async (req, res) => {
    const records = await db.listRecords();
    res.json(records);
  });

  app.post('/records', async (req, res) => {
    const { name, value } = req.body;
    try {
      const record = await db.addRecord({ name, value });
      res.status(201).json(record);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/records/:id', async (req, res) => {
    const { id } = req.params;
    const { name, value } = req.body;
    const updated = await db.updateRecord(id, name, value);
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  });

  app.delete('/records/:id', async (req, res) => {
    const { id } = req.params;
    const deleted = await db.deleteRecord(id);
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json(deleted);
  });

  app.get('/records/search', async (req, res) => {
    const { keyword } = req.query;
    const results = await db.searchRecords(keyword || '');
    res.json(results);
  });

  app.get('/records/sort', async (req, res) => {
    const { field = 'name', order = 'asc' } = req.query;
    const sorted = await db.sortRecords(field.toLowerCase(), order.toLowerCase());
    res.json(sorted);
  });

  app.get('/records/export', async (req, res) => {
    await db.exportData();
    res.send('Data exported to export.txt');
  });

  app.get('/records/stats', async (req, res) => {
    await db.viewVaultStats(); // still logs to console
    res.send('Vault statistics printed in server logs');
  });

  app.listen(PORT, () => console.log(`NodeVault API listening on port ${PORT}`));
})();

