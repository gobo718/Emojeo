(()=>{'use strict';
const $=id=>document.getElementById(id);
const VERSION='PASS76 RECOVERY · v001';
const RUN_KEY='pass76-recovery-v001-40cell';
const KJOB='emojeo-step4-pass76-recovery-job';
const fixed=[
 [3,'A0003'],[3,'A0007'],[54,'A0014'],[54,'A0017'],[0,'A0001'],[1,'A0021'],
 [54,'A0010'],[24,'A0004'],[38,'A0019'],[46,'A0022'],[29,'A0011'],[72,'A0017']
];
const desired=['HAS_EXPRESSION','HAS_OBJECT','HAS_PART','HAS_FUNCTION','HAS_SYMPTOM','IMPLIES_SETTING','CONTRASTS_WITH','SIMILAR_TO','HAS_POSITIVE_VALENCE','HAS_NEGATIVE_VALENCE','SYMBOLIZES_ASSOCIATES_WITH','CONVEYS_EMOTION','HAS_STATE_CONDITION'];
let U,R,O,A=new Map(),M=new Map(),items=[],pollTimer=null,active=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=()=>globalThis.GenreactrixCloudApi;
const RUNNER_BASE='https://emojeo-step4-calibrated.billylabs.workers.dev';
const base=()=>RUNNER_BASE;
const key=()=>String(api()?.getKey?.()||'');
function stamp(){return new Date().toLocaleTimeString()}
function setStatus(stage,text){$('stage').textContent=stage;$('status').textContent=text;$('updated').textContent=`Last update: ${stamp()}`}
function make(si,aid,n){
 const s=R.subjects[si],a=A.get(aid),m=M.get(a.relationshipType)||{};
 return{caseId:`AC${String(n).padStart(2,'0')}`,subject:{index:si,glyph:s.glyph,name:s.name},assertion:{assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,seedSources:Array.isArray(a.seedSources)?a.seedSources:[]},ontology:{domain:m.domain||'',definition:m.definition||''}};
}
function build(){
 let picks=[...fixed],seen=new Set(picks.map(x=>x.join('|'))),assertions=U.assertions;
 for(let k=0;picks.length<40&&k<5000;k++){
  const type=desired[k%desired.length],pool=assertions.filter(a=>a.relationshipType===type);if(!pool.length)continue;
  const a=pool[(k*17+5)%pool.length],si=(k*23+7)%R.subjects.length,key=`${si}|${a.assertionId}`;
  if(seen.has(key))continue;seen.add(key);picks.push([si,a.assertionId]);
 }
 items=picks.slice(0,40).map((x,i)=>make(x[0],x[1],i+1));
 $('sample').innerHTML=items.map(x=>`<div><b>${x.caseId}</b> ${esc(x.subject.glyph)} ${esc(x.subject.name)} · ${esc(x.assertion.relationshipType)} → ${esc(x.assertion.tag)}</div>`).join('');
}
async function req(path,opt={}){
 if(!base())throw new Error('Genreactrix AI Worker URL is not configured in this browser.');
 if(!key())throw new Error('Genreactrix analysis key is not configured in this browser.');
 const r=await fetch(base()+path,{...opt,headers:{'content-type':'application/json','x-analysis-key':key(),...(opt.headers||{})}}),j=await r.json().catch(()=>({}));
 if(!r.ok||j.ok===false)throw new Error(j.error||`HTTP ${r.status}`);return j.result??j;
}
function renderJob(j){
 if(!j)return;
 $('job').textContent=j.id||'—';
 $('progress').textContent=`${j.completed||0}/${j.total||0}`;
 $('queued').textContent=String(j.queued||0);$('processing').textContent=String(j.processing||0);$('failed').textContent=String(j.failed||0);
 active=['queued','running'].includes(String(j.state||''));$('start').disabled=active;
 const label=String(j.state||'unknown').toUpperCase();
 setStatus(label,`${j.message||''}\nCompleted ${j.completed||0}/${j.total||0} · queued ${j.queued||0} · processing ${j.processing||0} · failed ${j.failed||0}`);
 $('download').disabled=!j.id;
}
async function health(){
 const h=await req('/api/emojeo/step4/health');
 $('provider').textContent=(h.providerOrder||[]).join(' → ');
 if(!h.ready)throw new Error(`Runner bindings incomplete · D1 ${h.d1?'✓':'✗'} · Queue ${h.queue?'✓':'✗'} · AI ${h.ai?'✓':'✗'}`);
 setStatus('READY',`${h.version} · D1 ✓ · Queue ✓ · AI ✓`);$('start').disabled=active;return h;
}
async function check(){
 const id=localStorage.getItem(KJOB)||'';if(!id)return null;
 const x=await req('/api/emojeo/step4/jobs/'+encodeURIComponent(id));renderJob(x.job);return x.job;
}
function startPoll(){if(pollTimer)clearInterval(pollTimer);pollTimer=setInterval(()=>{if(active)check().catch(e=>setStatus('STATUS ERROR',e.message))},4000)}
async function start(){
 $('start').disabled=true;setStatus('SUBMITTING','Sending the fixed 40-cell calibrated acceptance set…');
 try{
  const x=await req('/api/emojeo/step4/jobs',{method:'POST',body:JSON.stringify({runKey:RUN_KEY,items})});
  const j=x.job;localStorage.setItem(KJOB,j.id);renderJob(j);if(x.reused)setStatus('RESUMED',`Active job reused instead of creating a duplicate.\n${j.id}`);
 }catch(e){$('start').disabled=false;setStatus('START FAILED',e.message)}
}
async function download(){
 try{
  const id=localStorage.getItem(KJOB);if(!id)throw new Error('No job ID');
  const x=await req('/api/emojeo/step4/jobs/'+encodeURIComponent(id)+'/results');
  const blob=new Blob([JSON.stringify(x,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`emojeo-step4-pass76-recovery-${id}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1200);
  setStatus('DOWNLOADED',`${x.job.completed}/${x.job.total} complete · ${x.job.failed} failed.`);
 }catch(e){setStatus('DOWNLOAD FAILED',e.message)}
}
async function init(){
 $('version').textContent=VERSION;
 const [u,r,o]=await Promise.all(['Emojeo_STEP4_Assertion_Universe_v001.json','Emojeo_STEP4_RunSpec_v001.json','Emojeo_STEP3_Semantic_Inventory_1211_v013.json'].map(x=>fetch(x,{cache:'no-cache'}).then(y=>{if(!y.ok)throw new Error(`${x} load failed (${y.status})`);return y.json()})));
 U=u;R=r;O=o;U.assertions.forEach(x=>A.set(x.assertionId,x));O.relationships.forEach(x=>M.set(x.relationshipType,{domain:x.domain||'',definition:x.definition||''}));build();
 await health();
 const prior=await check().catch(()=>null);if(prior&&!active)setStatus('READY',`Previous job ${prior.state}. Start is available for a new calibrated acceptance run.`);
 startPoll();
}
$('health').onclick=()=>health().catch(e=>setStatus('RUNNER ERROR',e.message));
$('start').onclick=start;$('check').onclick=()=>check().catch(e=>setStatus('STATUS ERROR',e.message));$('download').onclick=download;
init().catch(e=>setStatus('INITIALIZATION FAILED',e.message));
})();
