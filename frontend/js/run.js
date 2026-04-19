
// ═══════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════
function runSim(){
  showErr('');
  const btn=document.getElementById('run-btn');
  btn.disabled=true; btn.innerHTML='<span class="spin-icon">⟳</span> Running...';
  document.getElementById('loading').className='show';
  startLoad(); const al=animLoad();

  setTimeout(()=>{
    try{
      let nM=parseInt(document.getElementById('nm').value)||rngI(3,10);
      let nJ=parseInt(document.getElementById('nj').value)||rngI(20,50);
      nM=Math.max(1,Math.min(30,nM)); nJ=Math.max(1,Math.min(200,nJ));
      const rw=parseInt(document.getElementById('rework-sl').value)||8;
      const wu=parseFloat(document.getElementById('warmup-sl').value)||.5;
      const defPrio=document.getElementById('def-prio').value||'normal';

      let manual=null;
      if(MODE==='manual'){
        manual=MANUAL_ROWS.filter(row=>row.w&&row.c);
        if(!manual.length) throw new Error('Add at least one job with Weight and Complexity values.');
        nJ=manual.length;
      }

      const elM=document.getElementById('ch-machine'),elMat=document.getElementById('ch-material'),elP=document.getElementById('ch-power');
      const opts={machine:elM?elM.checked:true,material:elMat?elMat.checked:false,power:elP?elP.checked:false};

      const jobs=buildJobs(nJ,manual,rw,wu,defPrio);
      const ACTIVE=[...SELECTED].sort();
      const baseMachines=buildM(nM);
      const chaosEvs=CHAOS_ON?applyChaos(baseMachines,opts):[];

      const algos=ACTIVE.map(ai=>{
        const ms=buildM(nM);
        chaosEvs.filter(e=>e.type==='machine').forEach(ev=>{const m=ms.find(x=>x.id===ev.id);if(m){m.avail+=ev.dt;m.down=ev.dt;}});
        chaosEvs.filter(e=>e.type==='power').forEach(ev=>ms.slice(0,3).forEach(m=>m.avail+=ev.dt));
        const rj=SIM[ai](jobs,ms);
        return{ai,name:ALGO_NAMES[ai],color:ALGO_C[ai],jobs:rj,machines:ms,stats:calcStats(rj,ms)};
      });

      const baseline=algos.find(a=>a.ai===0)||algos[0];
      const aiAlgos=algos.filter(a=>a.ai!==0);
      const best=aiAlgos.length?aiAlgos.reduce((b,a)=>a.stats.avgWait<b.stats.avgWait?a:b,aiAlgos[0]):baseline;
      const impPct=baseline.stats.avgWait>0?+((baseline.stats.avgWait-best.stats.avgWait)/baseline.stats.avgWait*100).toFixed(2):0;

      RESULT={cfg:{nM,nJ,chaos:CHAOS_ON,rw,wu,r2:MODEL.r2,mae:MODEL.mae,ts:new Date().toISOString()},
              algos,baseline,best,chaosEvs,impPct,
              saved:+((baseline.stats.avgWait-(best||baseline).stats.avgWait)*nJ).toFixed(2)};
      HISTORY.unshift(RESULT); if(HISTORY.length>10) HISTORY.pop();
      saveRunToDB(RESULT); // ← persist to MySQL (fire-and-forget, non-blocking)

      clearInterval(al); stopLoad(); document.getElementById('loading').className='';
      drawAll();
    }catch(err){
      clearInterval(al); stopLoad(); document.getElementById('loading').className='';
      showErr('⚠ '+err.message);
    }
    btn.disabled=false; btn.innerHTML='▶ Run Simulation';
  },80);
}