
// ═══════════════════════════════════════════════════
// SIMULATION
// ═══════════════════════════════════════════════════
function buildJobs(n,manual,rw,wu,defPrio){
  const src=(manual&&manual.length)?manual:Array(n).fill(null);
  const jobs=[];
  src.forEach((m,i)=>{
    const w=m?Math.max(1,Math.min(10,parseFloat(m.w)||rng(1,10))):+rng(1,10).toFixed(2);
    const c=m?Math.max(1,Math.min(10,parseFloat(m.c)||rng(1,10))):+rng(1,10).toFixed(2);
    const p=m?(m.p||defPrio):defPrio;
    const prevW=i>0?jobs[i-1].w:null;
    const dd=+(w*2+c*1.5+rng(5,20)).toFixed(2);
    jobs.push({id:i+1,w:+w.toFixed(2),c:+c.toFixed(2),p,pt:trueTime(w,c,p,rw,wu,prevW),
               dd,pred:0,wait:0,start:0,finish:0,machine:''});
  });
  return jobs;
}

function buildM(n){
  return Array.from({length:n},(_,i)=>({id:i+1,name:MNAMES[i]||`Station ${i+1}`,avail:0,busy:0,jobs:0,down:0}));
}

function applyChaos(ms,opts){
  const evs=[];
  if(opts.machine){
    ms.forEach(m=>{
      if(Math.random()<.65){const dt=+rng(6,25).toFixed(2);m.avail+=dt;m.down=dt;evs.push({type:'machine',name:m.name,id:m.id,dt});}
    });
    if(!evs.some(e=>e.type==='machine')){
      const f=ms[Math.floor(Math.random()*ms.length)];const dt=+rng(8,20).toFixed(2);
      f.avail+=dt;f.down=dt;evs.push({type:'machine',name:f.name,id:f.id,dt});
    }
  }
  if(opts.material&&Math.random()<.6)
    evs.push({type:'material',name:'Material Shortage — Steel Plates',dt:+rng(8,20).toFixed(2)});
  if(opts.power&&Math.random()<.45){
    const dt=+rng(12,32).toFixed(2);
    ms.slice(0,Math.min(3,ms.length)).forEach(m=>m.avail+=dt);
    evs.push({type:'power',name:'Power Outage — Section B',dt});
  }
  return evs;
}

function doAssign(jobs,ms){
  jobs.forEach(j=>{
    const m=ms.reduce((a,b)=>a.avail<=b.avail?a:b);
    j.start=+m.avail.toFixed(3);j.wait=+Math.max(0,j.start).toFixed(3);
    j.finish=+(j.start+j.pt).toFixed(3);j.machine=m.name;
    m.busy+=j.pt;m.avail=j.finish;m.jobs++;
  });
  return jobs;
}

const SIM=[
  (j,ms)=>doAssign(JSON.parse(JSON.stringify(j)),ms),
  (j,ms)=>{const jj=JSON.parse(JSON.stringify(j));jj.forEach(x=>x.pred=rfPredict(x.w,x.c));jj.sort((a,b)=>a.pred-b.pred);return doAssign(jj,ms);},
  (j,ms)=>{const jj=JSON.parse(JSON.stringify(j));const po={urgent:0,normal:1,low:2};jj.sort((a,b)=>po[a.p]!==po[b.p]?po[a.p]-po[b.p]:a.dd-b.dd);return doAssign(jj,ms);},
  (j,ms)=>{const jj=JSON.parse(JSON.stringify(j));let mi=0;jj.forEach(x=>{const m=ms[mi%ms.length];x.start=+m.avail.toFixed(3);x.wait=+Math.max(0,x.start).toFixed(3);x.finish=+(x.start+x.pt).toFixed(3);x.machine=m.name;m.busy+=x.pt;m.avail=x.finish;m.jobs++;mi++;});return jj;},
];

function calcStats(jobs,ms){
  const waits=jobs.map(j=>j.wait),fins=jobs.map(j=>j.finish);
  const mk=Math.max(...fins)||1,tb=ms.reduce((s,m)=>s+m.busy,0);
  return{avgWait:+(waits.reduce((a,b)=>a+b)/waits.length).toFixed(3),maxWait:+Math.max(...waits).toFixed(3),
         totalWait:+waits.reduce((a,b)=>a+b).toFixed(3),makespan:+mk.toFixed(3),
         throughput:+(jobs.length/mk*60).toFixed(2),util:+(tb/(ms.length*mk)*100).toFixed(2),count:jobs.length};
}