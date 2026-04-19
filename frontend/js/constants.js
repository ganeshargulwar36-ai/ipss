'use strict';
// ═══════════════════════════════════════════════════
// ALL CONSTANTS FIRST — prevents Temporal Dead Zone
// ═══════════════════════════════════════════════════
const ALGO_NAMES = ['FCFS','ML+SPT','EDD','Round Robin'];
const ALGO_C  = ['#f59e0b','#c8f000','#22c55e','#a78bfa'];
const ALGO_CA = ['rgba(245,158,11,.45)','rgba(200,240,0,.45)','rgba(34,197,94,.45)','rgba(167,139,250,.45)'];
const MNAMES  = [
  "CNC Lathe #1","Milling Station A","Welding Unit Alpha","Assembly Bench 1",
  "Paint Booth East","QC Bay 1","Packaging Line A","Cutting Table 1",
  "Drill Press #1","Grinding Station","Heat Treatment Oven","Inspection Bay 1",
  "Conveyor Alpha","Robot Arm RX-7","CNC Lathe #2","Milling Station B",
  "Welding Unit Beta","Assembly Bench 2","Paint Booth West","QC Bay 2",
  "Packaging Line B","Cutting Table 2","Drill Press #2","Forging Station",
  "Laser Cutter","Robot Arm RX-9","Surface Grinder","CMM Station","Hydraulic Press","Anodizing Tank"
];
// PM must be const-declared before any function that uses it is CALLED (not just defined)
const PM = { urgent: 1.25, normal: 1.0, low: 0.85 };
const LOAD_STEPS = [
  'Generating factory jobs...','Applying chaos events...',
  'Running FCFS...','Training Random Forest model...','Running ML+SPT...',
  'Running EDD scheduler...','Running Round Robin...','Computing all stats...','Rendering results...'
];
const TIPS = {
  machines: {
    title: 'What are machines?',
    body: 'Machines are workstations on your factory floor — CNC Lathes, Welding Units, Assembly Benches, etc. Each handles one job at a time.\n\n🔴 Too few machines = long queues.\n🟢 The AI scheduler assigns jobs so even 5 machines handle 50 jobs with minimal wait.'
  },
  jobs: {
    title: 'What are jobs?',
    body: 'Jobs are tasks the factory must complete. Each has:\n• Weight (1–10): physical size/heaviness\n• Complexity (1–10): technical difficulty\n\nThese two numbers predict how long the job takes.\n\n🟢 The ML model learns this relationship and sorts jobs accordingly.'
  },
  priority: {
    title: 'Job priority',
    body: '🔴 Urgent = rush order — processed 25% faster\n🟡 Normal = standard job\n🟢 Low = can wait longer\n\n🔴 Without priority, urgent orders wait as long as routine ones.\n🟢 EDD algorithm uses priority as a tiebreaker for smarter scheduling.'
  },
  rework: {
    title: 'Rework probability',
    body: 'When a job fails QC inspection, it is partially redone (+30% processing time).\n\n🔴 Real factories have 5–15% rework rates. Ignoring this gives unrealistically optimistic results.\n🟢 Setting 5–15% makes results match real factory conditions.'
  },
  warmup: {
    title: 'Machine warm-up time',
    body: 'When switching between very different job types, the machine needs reconfiguration time.\n\n🔴 Ignoring this underestimates total processing time.\n🟢 Warm-up is added when consecutive jobs differ significantly in weight.'
  },
  algorithms: {
    title: 'Scheduling algorithms',
    body: 'An algorithm decides the ORDER jobs are processed — different orders cause very different wait times.\n\n🟡 FCFS = arrival order (no intelligence)\n🟢 ML+SPT = AI sorts shortest jobs first\n🔵 EDD = earliest deadline first\n🟣 Round Robin = even distribution\n\nSelect 2+ to compare them side by side.'
  },
  chaos: {
    title: 'Chaos Mode',
    body: 'Simulates real-world disruptions:\n🔧 Machine breakdowns (6–25 min downtime)\n📦 Material shortages\n⚡ Power outages\n\n🔴 Without chaos, results are dangerously optimistic.\n🟢 Both algorithms face identical disruptions — comparison stays fair. At least 1 event is guaranteed when chaos is ON.'
  },
  manual: {
    title: 'Manual job input',
    body: 'Enter specific jobs to test exact scenarios.\n\nWeight (1–10): physical size\nComplexity (1–10): technical difficulty\nPriority: Urgent / Normal / Low\n\n🟢 Tests with your actual job mix to see precisely how much the AI helps your specific factory setup.'
  }
};