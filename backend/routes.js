const express = require('express');
const { getDB } = require('./db');
const { appendToExcel, EXCEL_PATH } = require('./excel');
const fs = require('fs');

const router = express.Router();

router.get('/history', async (req, res) => {
  const db = getDB();
  if (!db) return res.json({ ok: false, rows: [], reason: 'no-db' });
  try {
    const [rows] = await db.query(
      'SELECT id, ts, machines, jobs, chaos, improvement_pct, best_algo, saved_minutes, full_data ' +
      'FROM app_history ORDER BY id DESC LIMIT 10'
    );
    const parsed = rows.map(r => ({
      ...r,
      full_data: JSON.parse(r.full_data),
    }));
    res.json({ ok: true, rows: parsed });
  } catch (err) {
    console.error('/api/history error:', err.message);
    res.status(500).json({ ok: false, reason: err.message });
  }
});

router.post('/history', async (req, res) => {
  const { cfg, best, impPct, saved } = req.body;
  if (!cfg) return res.status(400).json({ ok: false, reason: 'missing cfg' });

  await appendToExcel(req.body);

  const db = getDB();
  if (db) {
    try {
      await db.query(
        `INSERT INTO app_history
           (machines, jobs, chaos, improvement_pct, best_algo, saved_minutes, full_data)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          cfg.nM    ?? 0,
          cfg.nJ    ?? 0,
          cfg.chaos ? 1 : 0,
          impPct    ?? 0,
          best?.name ?? '',
          saved     ?? 0,
          JSON.stringify(req.body),
        ]
      );
    } catch (err) {
      console.error('/api/history MySQL error:', err.message);
    }
  }

  res.json({ ok: true });
});

router.get('/history/export', (req, res) => {
  if (!fs.existsSync(EXCEL_PATH)) {
    return res.status(404).json({ ok: false, reason: 'No history yet. Run a simulation first.' });
  }
  res.setHeader('Content-Disposition', 'attachment; filename="IPSS_History.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.sendFile(EXCEL_PATH);
});

module.exports = router;
