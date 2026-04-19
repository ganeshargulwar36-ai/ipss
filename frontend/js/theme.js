
// ═══════════════════════════════════════════════════
// THEME TOGGLE
// ═══════════════════════════════════════════════════
function toggleTheme(){
  const html  = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const next  = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  const btn   = document.getElementById('theme-btn');
  btn.textContent = next === 'dark' ? '☀️' : '🌙';
  btn.title       = next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  btn.style.color = next === 'dark' ? '#f59e0b' : '#2563eb';
  // Re-render charts and gantt with updated colors
  if(RESULT){ drawCharts(); }
  if(RESULT && ACTIVE_TAB === 'gantt') setTimeout(drawGantt, 50);
}