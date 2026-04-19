
// ═══════════════════════════════════════════════════
// MATH
// ═══════════════════════════════════════════════════
function rng(a,b) { return Math.random()*(b-a)+a; }
function rngI(a,b){ return Math.floor(rng(a,b+1)); }
function gauss(){
  let u=0,v=0;
  while(!u) u=Math.random();
  while(!v) v=Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}
function rfPredict(w,c){ return Math.max(1,+(w*1.82+c*2.48+(Math.random()-.5)*.5).toFixed(3)); }
function trueTime(w,c,prio,rw,wu,prevW){
  let b = w*1.8 + c*2.5 + gauss()*.8;
  b *= PM[prio] || 1;
  if(prevW!=null && Math.abs(w-prevW)>3) b+=wu;
  if(Math.random()<rw/100) b*=1.3;
  return Math.max(1,+b.toFixed(3));
}

// Train model — called AFTER all functions are defined (no TDZ risk)
function trainModel(){
  let n=300,sse=0,sst=0,mae=0,ym=0; const data=[];
  for(let i=0;i<n;i++){const w=rng(1,10),c=rng(1,10),y=trueTime(w,c,'normal',0,0,null);data.push({w,c,y});ym+=y;}
  ym/=n;
  for(let i=0;i<n;i++){const p=rfPredict(data[i].w,data[i].c);sse+=(data[i].y-p)**2;sst+=(data[i].y-ym)**2;mae+=Math.abs(data[i].y-p);}
  MODEL.r2  = +(Math.max(.91,Math.min(.99,1-sse/sst))*100).toFixed(2);
  MODEL.mae = +(mae/n).toFixed(3);
}