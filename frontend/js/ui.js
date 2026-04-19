
// ═══════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════
function closeWelcome(){ document.getElementById('welcome').style.display='none'; }
function openWelcome() { document.getElementById('welcome').style.display='flex'; }

function tip(key, e){
  e.stopPropagation();
  const t=TIPS[key]; if(!t) return;
  const ov=document.getElementById('tt-ov');
  document.getElementById('tt-title').textContent=t.title;
  document.getElementById('tt-body').innerHTML=t.body.replace(/\n/g,'<br>');
  const r=e.target.getBoundingClientRect();
  ov.style.display='block';
  const box=document.getElementById('tt-box');
  box.style.left=Math.min(r.right+8,window.innerWidth-285)+'px';
  box.style.top=Math.max(r.top-10,10)+'px';
}
function closeTip(){ document.getElementById('tt-ov').style.display='none'; }

function togSec(hdr){
  const body=hdr.nextElementSibling,arrow=hdr.querySelector('.sb-arr');
  const open=!body.classList.contains('closed');
  body.classList.toggle('closed',open);
  arrow&&arrow.classList.toggle('open',!open);
}

function setMode(m){
  MODE=m;
  document.getElementById('btn-rand').className='mbtn'+(m==='random'?' on':'');
  document.getElementById('btn-man').className ='mbtn'+(m==='manual'?' on':'');
  document.getElementById('rand-cfg').style.display=m==='random'?'flex':'none';
  document.getElementById('man-cfg').style.display =m==='manual'?'block':'none';
  if(m==='manual'&&!MANUAL_ROWS.length){addRow();addRow();addRow();}
}

function togAlgo(i){
  if(SELECTED.has(i)&&SELECTED.size>1) SELECTED.delete(i); else SELECTED.add(i);
  [0,1,2,3].forEach(j=>{document.getElementById('ac'+j).className='achk'+(SELECTED.has(j)?' on-'+j:'');});
}

function togChaos(){
  CHAOS_ON=!CHAOS_ON;
  document.getElementById('chaos-wrap').className='chaos-wrap'+(CHAOS_ON?' on':'');
  document.getElementById('chaos-lbl').textContent=CHAOS_ON?'Disruptions enabled':'Simulate disruptions';
  document.getElementById('sw').className='sw'+(CHAOS_ON?' on':'');
  document.getElementById('swk').className='swk'+(CHAOS_ON?' on':'');
  document.getElementById('chaos-opts').style.display=CHAOS_ON?'flex':'none';
}

function addRow(){
  const id=Date.now()+'_'+Math.random().toFixed(5);
  MANUAL_ROWS.push({id,w:'',c:'',p:'normal'});drawRows();
}
function delRow(id){ MANUAL_ROWS=MANUAL_ROWS.filter(row=>row.id!==id);drawRows(); }
function updRow(id,f,v){ const row=MANUAL_ROWS.find(row=>row.id===id);if(row)row[f]=v; }
function drawRows(){
  document.getElementById('mrows').innerHTML=MANUAL_ROWS.map(row=>`
    <div class="mrow">
      <input type="number" min="1" max="10" step="0.1" placeholder="Wt" value="${row.w}"
        oninput="updRow('${row.id}','w',this.value)">
      <input type="number" min="1" max="10" step="0.1" placeholder="Cx" value="${row.c}"
        oninput="updRow('${row.id}','c',this.value)">
      <select onchange="updRow('${row.id}','p',this.value)">
        <option value="normal" ${row.p==='normal'?'selected':''}>🟡</option>
        <option value="urgent" ${row.p==='urgent'?'selected':''}>🔴</option>
        <option value="low"    ${row.p==='low'   ?'selected':''}>🟢</option>
      </select>
      <button class="del-btn" onclick="delRow('${row.id}')">✕</button>
    </div>`).join('');
}

function showErr(msg){
  const el=document.getElementById('err-msg');
  el.style.display=msg?'block':'none'; el.textContent=msg;
}

function showTab(t){
  ACTIVE_TAB=t;
  const TABS=['overview','gantt','charts','history','jobs','chaos','explain'];
  document.querySelectorAll('.tab-btn').forEach((b,i)=>{b.className='tab-btn'+(TABS[i]===t?' on':'');});
  TABS.forEach(n=>{const el=document.getElementById('tab-'+n);if(el)el.style.display=n===t?'block':'none';});
  if(t==='gantt'&&RESULT) setTimeout(drawGantt,50);
  if(t==='explain') drawExplain();
}

let _lt=null;
function startLoad(){let v=0;document.getElementById('load-prog').style.width='0%';_lt=setInterval(()=>{v=Math.min(v+Math.random()*8,88);document.getElementById('load-prog').style.width=v+'%';},120);}
function stopLoad(){clearInterval(_lt);document.getElementById('load-prog').style.width='100%';setTimeout(()=>document.getElementById('load-prog').style.width='0%',400);}
function animLoad(){let i=0;return setInterval(()=>document.getElementById('load-step').textContent=LOAD_STEPS[Math.min(i++,LOAD_STEPS.length-1)],260);}