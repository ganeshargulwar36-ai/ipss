
// ═══════════════════════════════════════════════════
// INIT — trainModel called last, after all defs
// ═══════════════════════════════════════════════════
// Initial theme: dark → show sun icon (to switch to light)
const _tb = document.getElementById('theme-btn');
_tb.textContent = '☀️';
_tb.title       = 'Switch to light mode';
_tb.style.color = '#c8f000';
trainModel();
loadHistoryFromDB();
