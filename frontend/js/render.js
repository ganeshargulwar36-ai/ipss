
// ═══════════════════════════════════════════════════
// RENDER ALL
// ═══════════════════════════════════════════════════
function fmt(v,d=2){ return typeof v==='number'?+v.toFixed(d):v??'—'; }

function drawAll(){
  const R=RESULT;
  document.getElementById('empty').style.display='none';
  document.getElementById('result').style.display='block';
  document.getElementById('live-wrap').style.display='flex';
  document.getElementById('chaos-badge').style.display=R.cfg.chaos?'inline':'none';
  document.getElementById('model-sec').style.display='block';
  document.getElementById('exp-sec').style.display='block';
  document.getElementById('sbar').style.display='flex';
  document.getElementById('r2v').textContent=R.cfg.r2+'%';
  document.getElementById('maev').textContent=R.cfg.mae+' min';
  drawHero(); drawPS(); drawAlgoStrip(); drawKPIs(); drawCharts();
  drawGanttSel(); drawHistory(); drawJobs(); drawChaos(); drawSbar();
  showTab(ACTIVE_TAB);
}

function drawHero(){
  const R=RESULT;
  const p=document.getElementById('h-pct');
  p.textContent=(R.impPct>0?'+':'')+R.impPct+'%';
  p.className='hero-pct '+(R.impPct>0?'pos':R.impPct<0?'neg':'neu');
  document.getElementById('h-sub').textContent=`${R.best.name} vs FCFS — ${R.saved} total minutes saved`;
  document.getElementById('h-stats').innerHTML=[
    {l:'Machines',v:R.cfg.nM},{l:'Jobs',v:R.cfg.nJ},{l:'Algorithms',v:R.algos.length},
    {l:'Chaos',v:R.cfg.chaos?'ON ⚡':'OFF'},{l:'Rework',v:R.cfg.rw+'%'},{l:'Best',v:R.best.name}
  ].map(x=>`<div class="hs"><div class="v">${x.v}</div><div class="l">${x.l}</div></div>`).join('');
}

function drawPS(){
  const R=RESULT; const el=document.getElementById('ps-main');
  let ch='';
  if(R.cfg.chaos&&R.chaosEvs&&R.chaosEvs.length>0){
    const mEvs=R.chaosEvs.filter(e=>e.type==='machine');
    const total=mEvs.reduce((s,e)=>s+e.dt,0).toFixed(1);
    const others=R.chaosEvs.filter(e=>e.type!=='machine');
    ch=`<div class="alert a-red" style="margin-bottom:10px">
      ⚡ <strong>Chaos Active</strong> — ${mEvs.length} machine breakdown${mEvs.length!==1?'s':''}
      (${total} min total)${others.length?' + '+others.map(e=>e.type).join(', '):''}
      <a href="#" onclick="showTab('chaos');return false;"
         style="color:var(--danger);font-weight:600;margin-left:8px">View details →</a>
    </div>`;
  } else if(R.cfg.chaos){
    ch=`<div class="alert a-amber" style="margin-bottom:10px">⚡ <strong>Chaos enabled</strong> — no events triggered this run. Re-run or check options above.</div>`;
  }

  if(R.impPct>20){
    el.innerHTML=ch+`<div class="ps-box">
      <div class="ps-prob"><div class="ps-ico">🔴</div><div>
        <div class="ps-tag">The Problem</div>
        <div class="ps-txt">FCFS averaged <strong>${fmt(R.baseline.stats.avgWait)} min</strong> wait — large jobs arriving first blocked all small ones, creating a queue bottleneck.</div>
      </div></div>
      <div class="ps-sol"><div class="ps-ico">🟢</div><div>
        <div class="ps-tag">AI Solution</div>
        <div class="ps-txt">${R.best.name} cut avg wait to <strong>${fmt(R.best.stats.avgWait)} min</strong> — a <strong>${R.impPct}% improvement</strong>, saving ${R.saved} total minutes across all jobs.</div>
      </div></div>
    </div>`;
  } else if(R.impPct>0){
    el.innerHTML=ch+`<div class="alert a-green">✅ <strong>AI improved by ${R.impPct}%</strong> — ${R.best.name} reduced avg wait from ${fmt(R.baseline.stats.avgWait)} to ${fmt(R.best.stats.avgWait)} min.</div>`;
  } else {
    el.innerHTML=ch+`<div class="alert a-blue">ℹ <strong>Similar performance this run.</strong> Try 40+ jobs with varied sizes for a larger AI advantage.</div>`;
  }
}

function drawAlgoStrip(){
  const R=RESULT,el=document.getElementById('algo-strip');
  el.style.gridTemplateColumns=`repeat(${R.algos.length},1fr)`;
  el.innerHTML=R.algos.map(a=>{
    const diff=(R.baseline&&a.ai!==R.baseline.ai)?+(R.baseline.stats.avgWait-a.stats.avgWait).toFixed(2):0;
    const isBest=a.ai===R.best.ai;
    const cls=diff>0?'dd-g':diff<0?'dd-b':'dd-n';
    const dtxt=diff>0?`▼ ${diff} min saved`:diff<0?`▲ ${Math.abs(diff)} min worse`:'Baseline';
    return`<div class="acard acard-${a.ai}">
      ${isBest?'<div class="best-star">★ BEST</div>':''}
      <div class="ac-name">${a.name}</div>
      <div class="ac-val">${fmt(a.stats.avgWait)}<span class="ac-unit">min</span></div>
      <div class="ac-lbl">avg wait time</div>
      <div class="ac-delta ${cls}">${dtxt}</div>
    </div>`;
  }).join('');
}

function drawKPIs(){
  const R=RESULT;
  const metrics=[{l:'Max Wait',k:'maxWait',u:'min'},{l:'Makespan',k:'makespan',u:'min'},
                 {l:'Throughput',k:'throughput',u:'j/hr'},{l:'Utilisation',k:'util',u:'%'},
                 {l:'Total Wait',k:'totalWait',u:'min'},{l:'Jobs Done',k:'count',u:''}];
  document.getElementById('kpi-grid').innerHTML=metrics.map(m=>{
    const vals=R.algos.map(a=>`<div><div class="kv kv-${a.ai}">${fmt(a.stats[m.k],1)}<u>${m.u}</u></div><div class="kv-n">${a.name}</div></div>`).join('<span style="color:var(--border2);font-size:11px;padding:0 3px">·</span>');
    return`<div class="kpi"><div class="kpi-lbl">${m.l}</div><div class="kpi-row">${vals}</div></div>`;
  }).join('');
}

// Charts
function dc(id){if(CHARTS[id]){CHARTS[id].destroy();delete CHARTS[id];}}
const CS={responsive:true,maintainAspectRatio:false};
const TX=()=>({color:document.documentElement.getAttribute('data-theme')==='dark'?'#555555':'#64748b',font:{size:10,family:'Exo 2'}});
const GR=()=>({color:document.documentElement.getAttribute('data-theme')==='dark'?'rgba(255,255,255,.04)':'rgba(0,0,0,.06)'});

function drawCharts(){
  const R=RESULT,labs=R.algos.map(a=>a.name);

  dc('bar-main');
  document.getElementById('lg-main').innerHTML=R.algos.map(a=>`<span class="li"><span class="ld" style="background:${a.color}"></span>${a.name}</span>`).join('');
  CHARTS['bar-main']=new Chart(document.getElementById('bar-main'),{
    type:'bar',
    data:{labels:['Avg Wait','Max Wait','Total Wait','Makespan'],
          datasets:R.algos.map(a=>({label:a.name,data:[a.stats.avgWait,a.stats.maxWait,a.stats.totalWait,a.stats.makespan],backgroundColor:ALGO_CA[a.ai],borderColor:a.color,borderWidth:1.5,borderRadius:4}))},
    options:{...CS,plugins:{legend:{display:false}},scales:{x:{ticks:TX(),grid:GR()},y:{ticks:TX(),grid:GR()}}}
  });

  dc('bar-util');
  CHARTS['bar-util']=new Chart(document.getElementById('bar-util'),{
    type:'bar',data:{labels:labs,datasets:[{data:R.algos.map(a=>a.stats.util),backgroundColor:R.algos.map(a=>ALGO_CA[a.ai]),borderColor:R.algos.map(a=>a.color),borderWidth:1.5,borderRadius:4}]},
    options:{...CS,plugins:{legend:{display:false}},scales:{x:{ticks:TX(),grid:GR()},y:{min:0,max:100,ticks:TX(),grid:GR()}}}
  });

  dc('bar-thru');
  CHARTS['bar-thru']=new Chart(document.getElementById('bar-thru'),{
    type:'bar',data:{labels:labs,datasets:[{data:R.algos.map(a=>a.stats.throughput),backgroundColor:R.algos.map(a=>ALGO_CA[a.ai]),borderColor:R.algos.map(a=>a.color),borderWidth:1.5,borderRadius:4}]},
    options:{...CS,plugins:{legend:{display:false}},scales:{x:{ticks:TX(),grid:GR()},y:{ticks:TX(),grid:GR()}}}
  });

  dc('line-proc');
  document.getElementById('lg-line').innerHTML=R.algos.map(a=>`<span class="li"><span class="ld" style="background:${a.color}"></span>${a.name}</span>`).join('');
  CHARTS['line-proc']=new Chart(document.getElementById('line-proc'),{
    type:'line',
    data:{datasets:R.algos.map(a=>({label:a.name,data:a.jobs.map((j,i)=>({x:i+1,y:j.pt})),borderColor:a.color,backgroundColor:'transparent',pointRadius:2,tension:.3,borderWidth:1.5}))},
    options:{...CS,plugins:{legend:{display:false}},scales:{x:{type:'linear',ticks:TX(),grid:GR()},y:{ticks:TX(),grid:GR()}}}
  });

  dc('sc-wait');
  document.getElementById('lg-scatter').innerHTML=R.algos.map(a=>`<span class="li"><span class="ld" style="background:${a.color}"></span>${a.name}</span>`).join('');
  CHARTS['sc-wait']=new Chart(document.getElementById('sc-wait'),{
    type:'scatter',
    data:{datasets:R.algos.map(a=>({label:a.name,data:a.jobs.map((j,i)=>({x:i+1,y:+j.wait.toFixed(2)})),backgroundColor:ALGO_CA[a.ai],pointRadius:3}))},
    options:{...CS,plugins:{legend:{display:false}},scales:{x:{ticks:TX(),grid:GR()},y:{ticks:TX(),grid:GR()}}}
  });

  drawHistCharts();
}

// Gantt
function drawGanttSel(){
  document.getElementById('gantt-sel').innerHTML=RESULT.algos.map(a=>`<option value="${a.ai}">${a.name}</option>`).join('');
}
function drawGantt(){
  if(!RESULT)return;
  const ai=parseInt(document.getElementById('gantt-sel').value);
  const algo=RESULT.algos.find(a=>a.ai===ai); if(!algo)return;
  const canvas=document.getElementById('gantt-canvas'),ctx=canvas.getContext('2d');
  const ms=algo.machines,mk=algo.stats.makespan;
  const ROW=26,PL=112,PR=16,PT=28,PB=16;
  const W=canvas.parentElement.offsetWidth-4,H=ms.length*ROW+PT+PB;
  canvas.width=W;canvas.height=H;canvas.style.height=H+'px';
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  ctx.fillStyle=isDark?'#111111':'#f1f5f9';ctx.fillRect(0,0,W,H);
  const TW=W-PL-PR,scale=TW/mk;
  for(let i=0;i<=6;i++){
    const t=mk*i/6,x=PL+t*scale;
    ctx.strokeStyle=isDark?'#1e1e1e':'#e2e8f0';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x,PT);ctx.lineTo(x,H-PB);ctx.stroke();
    ctx.fillStyle=isDark?'#555555':'#94a3b8';ctx.font='9px Exo 2,sans-serif';ctx.textAlign='center';ctx.fillText(t.toFixed(0)+'m',x,PT-6);
  }
  const PC={urgent:'#ef4444',normal:'#f59e0b',low:'#22c55e'};
  ms.forEach((m,mi)=>{
    const y=PT+mi*ROW;
    ctx.fillStyle=mi%2===0?'rgba(255,255,255,.01)':'rgba(255,255,255,.03)';ctx.fillRect(PL,y,TW,ROW);
    ctx.fillStyle=isDark?'#555555':'#64748b';ctx.font='9px Exo 2,sans-serif';ctx.textAlign='right';
    ctx.fillText(m.name.substring(0,14),PL-5,y+ROW/2+3);
  });
  algo.jobs.forEach(j=>{
    const mi=ms.findIndex(m=>m.name===j.machine);if(mi<0)return;
    const y=PT+mi*ROW,x=PL+j.start*scale,bw=Math.max(2,j.pt*scale);
    const col=PC[j.p]||'#d4a31a';
    ctx.fillStyle=col+'66';ctx.fillRect(x,y+2,bw-1,ROW-4);
    ctx.strokeStyle=col;ctx.lineWidth=1;ctx.strokeRect(x,y+2,bw-1,ROW-4);
    if(bw>22){ctx.fillStyle='#e2e8f0';ctx.font='8px JetBrains Mono,monospace';ctx.textAlign='center';ctx.fillText('#'+j.id,x+bw/2,y+ROW/2+3);}
  });
}

// History
function drawHistory(){
  document.getElementById('hist-grid').innerHTML=HISTORY.map((R,i)=>`
    <div class="hcard ${i===0?'active':''}" onclick="loadHist(${i})">
      <div class="hrun">Run #${HISTORY.length-i} · ${new Date(R.cfg.ts).toLocaleTimeString()}</div>
      <div class="himp" style="color:${R.impPct>0?'var(--success)':'var(--danger)'}">${R.impPct>0?'+':''}${R.impPct}%</div>
      <div class="hmeta">${R.cfg.nM} machines · ${R.cfg.nJ} jobs<br>Best: ${R.best.name}</div>
    </div>`).join('');
  drawHistCharts();
}
function drawHistCharts(){
  if(HISTORY.length<2)return;
  dc('line-hist');dc('line-hist2');
  const labels=HISTORY.map((_,i)=>'Run '+(HISTORY.length-i)).reverse();
  CHARTS['line-hist']=new Chart(document.getElementById('line-hist'),{
    type:'line',
    data:{labels,datasets:[{label:'Improvement %',data:HISTORY.map(x=>x.impPct).reverse(),borderColor:'#6dbf74',backgroundColor:'rgba(109,191,116,.1)',fill:true,tension:.4,pointRadius:4,pointBackgroundColor:'#6dbf74'}]},
    options:{...CS,plugins:{legend:{display:false}},scales:{x:{ticks:TX(),grid:GR()},y:{ticks:TX(),grid:GR()}}}
  });
  const ds=[0,1,2,3].map(ai=>{
    const data=HISTORY.map(R=>{const a=R.algos.find(x=>x.ai===ai);return a?a.stats.avgWait:null;}).reverse();
    if(data.every(d=>d===null))return null;
    return{label:ALGO_NAMES[ai],data,borderColor:ALGO_C[ai],backgroundColor:'transparent',tension:.4,pointRadius:3,borderWidth:1.5};
  }).filter(Boolean);
  document.getElementById('lg-hist').innerHTML=ds.map(d=>`<span class="li"><span class="ld" style="background:${d.borderColor}"></span>${d.label}</span>`).join('');
  CHARTS['line-hist2']=new Chart(document.getElementById('line-hist2'),{
    type:'line',data:{labels,datasets:ds},
    options:{...CS,plugins:{legend:{display:false}},scales:{x:{ticks:TX(),grid:GR()},y:{ticks:TX(),grid:GR()}}}
  });
}
function loadHist(i){
  RESULT=HISTORY[i];drawAll();
  document.querySelectorAll('.hcard').forEach((c,j)=>c.className='hcard'+(j===i?' active':''));
}

// Jobs
function drawJobs(){
  document.getElementById('jgrid').innerHTML=RESULT.algos.map(a=>`
    <div class="jtw">
      <div class="jth"><span style="color:${a.color}">${a.name}</span><span style="font-size:9px;color:var(--text3)">${a.jobs.length} jobs</span></div>
      <div class="jscroll"><table>
        <thead><tr><th>Job</th><th>Prio</th><th>Wt</th><th>Cx</th><th>Proc</th><th>Wait</th><th>Machine</th></tr></thead>
        <tbody>${a.jobs.map(j=>{
          const wc=j.wait>10?'whi':j.wait>5?'wmd':'wlo';
          const pc={urgent:'pu',normal:'pn',low:'pl'}[j.p]||'';
          return`<tr><td style="color:${a.color};font-weight:600">${j.id}</td><td class="${pc}">${j.p.substring(0,3).toUpperCase()}</td><td>${j.w}</td><td>${j.c}</td><td>${j.pt}</td><td class="${wc}">${j.wait}</td><td style="font-size:9px;color:var(--text3)">${j.machine.substring(0,15)}</td></tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>`).join('');
}

// Chaos tab
function drawChaos(){
  const R=RESULT,el=document.getElementById('chaos-content');
  if(!R.cfg.chaos){
    el.innerHTML=`<div style="text-align:center;padding:60px 20px;opacity:.35"><div style="font-size:44px;margin-bottom:10px">💤</div><div style="font-family:var(--font-d);font-size:18px;color:var(--text2)">Chaos Mode Disabled</div><div style="font-size:12px;color:var(--text3);margin-top:6px">Toggle Chaos Mode ON in the sidebar and re-run.</div></div>`;return;
  }
  if(!R.chaosEvs||R.chaosEvs.length===0){
    el.innerHTML=`<div style="text-align:center;padding:60px 20px;opacity:.4"><div style="font-size:44px;margin-bottom:10px">✅</div><div style="font-family:var(--font-d);font-size:18px;color:var(--text2)">No Events This Run</div><div style="font-size:12px;color:var(--text3);margin-top:6px">Ensure at least one chaos type is checked, then re-run.</div></div>`;return;
  }
  const total=R.chaosEvs.reduce((s,e)=>s+e.dt,0).toFixed(1);
  const mEvs=R.chaosEvs.filter(e=>e.type==='machine');
  el.innerHTML=`<div class="alert a-red" style="margin-bottom:14px"><strong>⚡ ${R.chaosEvs.length} disruption event${R.chaosEvs.length!==1?'s':''} — ${total} min total downtime</strong><br><span style="font-weight:400">All ${R.algos.length} algorithms ran under identical conditions — comparison is fair.</span></div>
  ${R.chaosEvs.map(ev=>{
    const lbl={machine:'Machine breakdown',material:'Material shortage',power:'Power outage'}[ev.type]||ev.type;
    return`<div class="cev ${ev.type}"><div><div class="cev-type">${lbl}</div><div class="cev-name">${ev.name}</div>${ev.id?`<div class="cev-mid">Machine ID: #${ev.id}</div>`:''}</div><div><div class="cev-dt">+${ev.dt} min</div><div class="cev-unit">downtime</div></div></div>`;
  }).join('')}
  ${mEvs.length>0?`<div class="alert a-blue" style="margin-top:12px"><strong>How it affected scheduling:</strong><br>${mEvs.map(e=>`${e.name} was unavailable for ${e.dt} min — jobs rerouted to other machines.`).join('<br>')}</div>`:''}`;
}

// Feature Guide tab — fully detailed with problem/solution for every feature
function drawExplain(){
  const features=[
    {ico:'⚙',ttl:'FCFS — The Baseline Problem',
     prob:'Jobs processed in arrival order. Two massive 30-min jobs arrive first → all 48 quick 2-min jobs wait 60+ minutes. Creates severe bottlenecks every day.',
     sol:'FCFS is kept as the baseline. Every other algorithm is measured by how much better it does. Proves that smarter scheduling beats "first come, first served" every time.'},
    {ico:'🤖',ttl:'ML+SPT — The AI Solution',
     prob:'We cannot know job duration before processing it. Without predictions we cannot sort by duration, so we are stuck with FCFS.',
     sol:'A Random Forest model (150 trees, trained on 2,000 samples) predicts duration from Weight and Complexity. Jobs sorted shortest-first. Average wait drops 30–60%. Even imperfect predictions beat arrival-order scheduling.'},
    {ico:'📅',ttl:'EDD — Earliest Due Date',
     prob:'FCFS and ML+SPT ignore deadlines entirely. Urgent customer orders with tight delivery windows miss their deadlines.',
     sol:'Sorts by deadline first, then priority. Urgent orders jump the queue. Best for factories with hard SLA commitments to customers.'},
    {ico:'🔄',ttl:'Round Robin — Fair Distribution',
     prob:'Uneven job assignment overloads some machines while others sit idle. One bottleneck machine blocks the whole floor.',
     sol:'Cycles jobs evenly across all machines in rotation. Every machine gets equal work. Best when load balance matters more than minimising total wait.'},
    {ico:'🏷',ttl:'Job Priorities (Urgent / Normal / Low)',
     prob:'All jobs treated equally means rush orders wait just as long as routine items. Customers with urgent needs are not served faster.',
     sol:'Urgent = 25% faster processing (rush handling). EDD uses priority as a tiebreaker. Manual mode lets you set priority per job. Reflects real factory operations.'},
    {ico:'🔁',ttl:'Rework Probability',
     prob:'Simulations without QC failures are too optimistic. Real factories have 5–15% rework rates. Unrealistic results lead to bad planning decisions.',
     sol:'Set 0–30% chance a job fails QC and needs partial rework (+30% processing time). Makes simulation results match real factory conditions much more closely.'},
    {ico:'🌡',ttl:'Machine Warm-up Time',
     prob:'Switching between very different job types (tiny precision part → massive heavy component) requires machine reconfiguration. Ignoring this underestimates total time.',
     sol:'Configurable warm-up delay added when consecutive jobs differ significantly in Weight. Adds physical realism to scheduling decisions.'},
    {ico:'⚡',ttl:'Chaos Mode — 3 Disruption Types',
     prob:'Real factories always have disruptions. Results without chaos are dangerously optimistic for real-world deployment decisions.',
     sol:'Machine breakdowns (6–25 min), material shortages, power outages. Applied identically to all algorithms — fair comparison. At least 1 event guaranteed when enabled.'},
    {ico:'📅',ttl:'Gantt Chart',
     prob:'Raw numbers hide WHERE time is wasted. You cannot tell which machines are idle, which jobs are creating blockages, or how each algorithm differs visually.',
     sol:'Visual timeline: rows = machines, blocks = jobs. Gaps = idle time = wasted capacity. Block colour = priority. Instantly reveals inefficiencies invisible in tables.'},
    {ico:'📜',ttl:'Run History (last 10 runs)',
     prob:'Single runs vary due to random job generation. You cannot tell if a configuration change actually helped without comparing across multiple runs.',
     sol:'Stores last 10 simulations. Click any card to reload it. Trend charts confirm AI consistently wins across different settings, job counts, and chaos scenarios.'},
    {ico:'📤',ttl:'Export — CSV, Report, JSON',
     prob:'Results are only visible inside the app. You cannot share them with professors, managers, or colleagues, or use them in other tools.',
     sol:'CSV exports full job-level data for Excel/Pandas analysis. TXT creates a formatted report with comparison tables. JSON exports structured data for APIs and databases.'},
  ];
  document.getElementById('ex-grid').innerHTML=features.map(f=>`
    <div class="ex-card">
      <div class="ex-hdr"><div class="ex-ico">${f.ico}</div><div class="ex-ttl">${f.ttl}</div></div>
      <div class="ex-prob"><div class="ex-prob-tag">🔴 The Problem</div><div class="ex-prob-txt">${f.prob}</div></div>
      <div class="ex-sol"><div class="ex-sol-tag">🟢 The Solution</div><div class="ex-sol-txt">${f.sol}</div></div>
    </div>`).join('');
}

// Status bar
function drawSbar(){
  const R=RESULT;
  const failIds=new Set(R.chaosEvs.filter(e=>e.type==='machine').map(e=>e.id));
  document.getElementById('sbar-pills').innerHTML=R.algos[0].machines.map(m=>`<span class="sb-pill${failIds.has(m.id)?' fail':''}">${m.name.substring(0,10)}${failIds.has(m.id)?' ⚡':''}</span>`).join('');
  document.getElementById('sbar-ts').textContent='Last run: '+new Date(R.cfg.ts).toLocaleTimeString();
}