
// ═══════════════════════════════════════════════════
// BACKEND INTEGRATION
// ═══════════════════════════════════════════════════

/**
 * Saves the current RESULT to MySQL via the Express backend.
 * Silently fails if the backend is unavailable.
 */
async function saveRunToDB(result) {
  try {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cfg:       result.cfg,
        algos:     result.algos.map(a => ({ ai: a.ai, name: a.name, color: a.color, stats: a.stats })),
        best:      { ai: result.best.ai, name: result.best.name },
        chaosEvs:  result.chaosEvs,
        impPct:    result.impPct,
        saved:     result.saved,
      }),
    });
    const json = await res.json();
    if (!json.ok && json.reason !== 'no-db') {
      console.warn('IPSS: DB save failed —', json.reason);
    }
  } catch (e) {
    // Backend not running — no-op, local history still works
  }
}

/**
 * Loads the last 10 runs from MySQL and merges them into the
 * local HISTORY array so they appear in the History tab after
 * a page refresh.
 */
async function loadHistoryFromDB() {
  try {
    const res  = await fetch('/api/history');
    const json = await res.json();
    if (!json.ok || !json.rows || !json.rows.length) return;
    json.rows.forEach(row => {
      const r = row.full_data;
      // Avoid duplicates when the same ts already exists in memory
      if (!HISTORY.some(h => h.cfg && h.cfg.ts === (r.cfg && r.cfg.ts))) {
        HISTORY.push(r);
      }
    });
    // Keep sorted: newest first
    HISTORY.sort((a, b) => new Date(b.cfg.ts) - new Date(a.cfg.ts));
    if (HISTORY.length > 10) HISTORY.length = 10;
    console.log(`IPSS: Loaded ${json.rows.length} run(s) from database.`);
  } catch (e) {
    // Backend not running — silently ignore, app works offline
  }
}