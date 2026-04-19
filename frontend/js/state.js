
// ═══════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════
let MODE = 'random', CHAOS_ON = false, RESULT = null;
let HISTORY = [], ACTIVE_TAB = 'overview';
let SELECTED = new Set([0,1,2,3]), MANUAL_ROWS = [], CHARTS = {};
let MODEL = { r2: 0, mae: 0 };