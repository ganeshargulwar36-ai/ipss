const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const DATA_DIR   = path.join(__dirname, '..', 'data');
const EXCEL_PATH = path.join(DATA_DIR, 'history.xlsx');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

async function getWorkbook() {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'IPSS';
  wb.modified = new Date();

  if (fs.existsSync(EXCEL_PATH)) {
    await wb.xlsx.readFile(EXCEL_PATH);
  } else {
    const ws = wb.addWorksheet('Simulation History', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });

    ws.columns = [
      { header: 'Run #',           key: 'run_no',      width: 8  },
      { header: 'Timestamp',       key: 'ts',          width: 22 },
      { header: 'Machines',        key: 'machines',    width: 10 },
      { header: 'Jobs',            key: 'jobs',        width: 8  },
      { header: 'Chaos',           key: 'chaos',       width: 8  },
      { header: 'Best Algorithm',  key: 'best_algo',   width: 16 },
      { header: 'Improvement (%)', key: 'imp_pct',     width: 16 },
      { header: 'Minutes Saved',   key: 'saved_min',   width: 14 },
      { header: 'Rework (%)',       key: 'rework',      width: 12 },
      { header: 'ML R² Score (%)', key: 'r2',          width: 16 },
      { header: 'FCFS Avg Wait',   key: 'fcfs_wait',   width: 14 },
      { header: 'MLSPT Avg Wait',  key: 'mlspt_wait',  width: 15 },
      { header: 'EDD Avg Wait',    key: 'edd_wait',    width: 14 },
      { header: 'RR Avg Wait',     key: 'rr_wait',     width: 14 },
      { header: 'FCFS Util (%)',   key: 'fcfs_util',   width: 14 },
      { header: 'MLSPT Util (%)',  key: 'mlspt_util',  width: 15 },
      { header: 'EDD Util (%)',    key: 'edd_util',    width: 14 },
      { header: 'RR Util (%)',     key: 'rr_util',     width: 14 },
      { header: 'Chaos Events',    key: 'chaos_evs',   width: 14 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A1A' } };
      cell.font   = { bold: true, color: { argb: 'FFC8F000' }, name: 'Calibri', size: 11 };
      cell.border = { bottom: { style: 'medium', color: { argb: 'FFC8F000' } } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 20;
  }
  return wb;
}

async function appendToExcel(body) {
  try {
    const { cfg, algos = [], best = {}, chaosEvs = [], impPct = 0, saved = 0 } = body;
    const wb = await getWorkbook();
    const ws = wb.getWorksheet('Simulation History') || wb.addWorksheet('Simulation History');

    const runNo = ws.rowCount;

    const find = name => algos.find(a => a.name === name)?.stats ?? {};
    const fcfs  = find('FCFS');
    const mlspt = find('ML+SPT');
    const edd   = find('EDD');
    const rr    = find('Round Robin');

    const dataRow = ws.addRow({
      run_no:     runNo,
      ts:         new Date(cfg.ts ?? Date.now()).toLocaleString(),
      machines:   cfg.nM   ?? 0,
      jobs:       cfg.nJ   ?? 0,
      chaos:      cfg.chaos ? 'YES' : 'NO',
      best_algo:  best.name ?? '',
      imp_pct:    impPct   ?? 0,
      saved_min:  saved    ?? 0,
      rework:     cfg.rw   ?? 0,
      r2:         cfg.r2   ?? 0,
      fcfs_wait:  fcfs.avgWait  ?? '',
      mlspt_wait: mlspt.avgWait ?? '',
      edd_wait:   edd.avgWait   ?? '',
      rr_wait:    rr.avgWait    ?? '',
      fcfs_util:  fcfs.util     ?? '',
      mlspt_util: mlspt.util    ?? '',
      edd_util:   edd.util      ?? '',
      rr_util:    rr.util       ?? '',
      chaos_evs:  chaosEvs.length,
    });

    const isEven = (runNo % 2 === 0);
    dataRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: isEven ? 'FF111111' : 'FF1A1A1A' },
      };
      cell.font      = { color: { argb: 'FFE2E8F0' }, name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    const impCell = dataRow.getCell('imp_pct');
    impCell.font = {
      bold: true,
      color: { argb: impPct > 0 ? 'FF22C55E' : 'FFEF4444' },
      name: 'Calibri', size: 10,
    };

    await wb.xlsx.writeFile(EXCEL_PATH);
    console.log(`📊  Excel updated → data/history.xlsx (run #${runNo})`);
  } catch (err) {
    console.error('Excel append error:', err.message);
  }
}

module.exports = { appendToExcel, EXCEL_PATH };
