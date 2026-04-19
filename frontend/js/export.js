
// ═══════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════
function dl(c,t,n){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:t}));a.download=n;a.click();}
function ps(v,w=12){return(String(v)+'            ').substring(0,w);}

function doCSV(){
  if(!RESULT)return;const R=RESULT;
  const rows=[['Intelligent Production Scheduling System Export'],['Machines',R.cfg.nM,'Jobs',R.cfg.nJ,'Chaos',R.cfg.chaos?'Yes':'No','Rework',R.cfg.rw+'%'],[],
    ['=== PERFORMANCE ==='],['Metric',...R.algos.map(a=>a.name)]];
  ['avgWait','maxWait','totalWait','makespan','throughput','util'].forEach(k=>rows.push([k,...R.algos.map(a=>a.stats[k])]));
  rows.push(['Best',R.best.name],['Improvement vs FCFS',R.impPct+'%'],[]);
  if(R.chaosEvs.length){rows.push(['=== CHAOS ==='],['Type','Name','Downtime']);R.chaosEvs.forEach(e=>rows.push([e.type,e.name,e.dt]));rows.push([]);}
  R.algos.forEach(a=>{rows.push([`=== ${a.name} ===`],['Job','Priority','Wt','Cx','Proc','Wait','Machine']);a.jobs.forEach(j=>rows.push([j.id,j.p,j.w,j.c,j.pt,j.wait,j.machine]));rows.push([]);});
  dl(rows.map(r=>r.join(',')).join('\n'),'text/csv','digital_twin_results.csv');
}

function doJSON(){
  if(!RESULT)return;
  dl(JSON.stringify({config:RESULT.cfg,algorithms:RESULT.algos.map(a=>({name:a.name,stats:a.stats})),chaosEvents:RESULT.chaosEvs,improvement_pct:RESULT.impPct,best:RESULT.best.name},null,2),'application/json','digital_twin_results.json');
}

function doTxt(){
  if(!RESULT)return;const R=RESULT;
  const l=['╔═══════════════════════════════════════════════╗','║    INTELLINTELLIGENT PRODUCTION SCHEDULING SYSTEM — REPORT      ║','╚═══════════════════════════════════════════════╝','',
    `Generated : ${new Date(R.cfg.ts).toLocaleString()}`,
    `Machines  : ${R.cfg.nM}  |  Jobs: ${R.cfg.nJ}  |  Algos: ${R.algos.length}`,
    `Chaos     : ${R.cfg.chaos?'ENABLED':'DISABLED'}  |  Rework: ${R.cfg.rw}%  |  Warmup: ${R.cfg.wu}min`,'',
    'PERFORMANCE','─'.repeat(58),
    '  Metric              '+R.algos.map(a=>ps(a.name)).join(''),'─'.repeat(58),
    ...['avgWait','maxWait','totalWait','makespan','throughput','util'].map(k=>'  '+ps({avgWait:'Avg Wait (min)',maxWait:'Max Wait (min)',totalWait:'Total Wait (min)',makespan:'Makespan (min)',throughput:'Throughput (j/hr)',util:'Utilisation (%)'}[k],22)+R.algos.map(a=>ps(a.stats[k])).join('')),'',
    `  ★ Best       : ${R.best.name}`,`  ★ Improvement : ${R.impPct>0?'+':''}${R.impPct}%`,`  ★ Wait Saved  : ${R.saved} min`,''];
  if(R.chaosEvs.length){l.push('CHAOS EVENTS','─'.repeat(40));R.chaosEvs.forEach(e=>l.push(`  [${e.type.toUpperCase()}] ${e.name} — ${e.dt} min`));l.push('');}
  l.push('═'.repeat(50));
  dl(l.join('\n'),'text/plain','digital_twin_report.txt');
}