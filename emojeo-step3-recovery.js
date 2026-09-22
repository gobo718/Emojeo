/* Emojeo Step 3 Recovery Mapper — Pass 48
   Browser orchestration only. AI normalization runs on the Worker, three providers in parallel.
   Original imported JSON is never mutated; recovered data is appended under recoveryResults.
   Safety gate: 1 subject -> 3 total -> 10 total -> full run. */
(()=>{'use strict';
const $=id=>document.getElementById(id),clean=v=>String(v??'').trim();
const BASE_KEY='genreactrix-ai-worker-base',KEY_KEY='genreactrix-ai-analysis-key';
const DB_NAME='emojeo-step3-recovery-v4',STORE='jobs';
let input=null,spec=null,job=null,aborter=null,running=false;
function base(){return clean(localStorage.getItem(BASE_KEY)||window.GENREACTRIX_AI_WORKER_BASE||'').replace(/\/+$/,'')}
function key(){return clean(localStorage.getItem(KEY_KEY)||'')}
function fingerprint(data,file){const last=data?.results?.at?.(-1)||{};return [data?.batchId||'step3',data?.completedUnits||0,data?.totalUnits||0,last?.subject?.glyph||'',last?.domain||'',file?.size||0].join('|')}
function groupSubjects(data){const map=new Map();for(const row of (Array.isArray(data?.results)?data.results:[])){const s=row?.subject||{},k=`${s.glyph||''}\u0000${s.name||''}`;if(!map.has(k))map.set(k,{subject:{glyph:s.glyph||'',name:s.name||''},units:[]});map.get(k).units.push({domain:row.domain||'Unclassified',rawNotes:row.rawNotes??[]});}return [...map.values()]}
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function dbGet(id){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function dbPut(value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
function setStatus(text){$('status').textContent=text}
function render(){
  if(!job){$('summary').textContent='Load the completed Step 3 JSON export.';for(const id of ['run1','run3','run10','runall','stop','download'])$(id).disabled=true;return}
  const total=job.subjects.length,done=job.recovered.length;const originalUnits=input?.completedUnits||input?.results?.length||0;const noteUnits=(input?.results||[]).filter(r=>Array.isArray(r.rawNotes)?r.rawNotes.length:clean(r.rawNotes)).length;
  $('summary').textContent=`${done}/${total} subjects recovered · ${originalUnits} original units · ${noteUnits} units contain raw notes · 3 AI providers in parallel per subject`;
  $('run1').disabled=running||done>=total;
  $('run3').disabled=running||done<1||done>=3||done>=total;
  $('run10').disabled=running||done<3||done>=10||done>=total;
  $('runall').disabled=running||done<10||done>=total;
  $('stop').disabled=!running;
  $('download').disabled=!done;
}
async function callSubject(packet){const b=base(),k=key();if(!b)throw new Error('Worker URL is not configured in this browser');if(!k)throw new Error('Analysis key is not configured in this browser');const r=await fetch(`${b}/api/emojeo/step3-recovery/subject`,{method:'POST',headers:{'content-type':'application/json','x-analysis-key':k},body:JSON.stringify({schemaVersion:1,subject:packet.subject,units:packet.units,relationshipDomains:spec.relationshipDomains}),signal:aborter.signal});const payload=await r.json().catch(()=>({}));if(!r.ok)throw new Error(payload.error||`Recovery request failed (${r.status})`);return payload.result}
async function runTo(target){
  if(running||!job)return;
  const total=job.subjects.length,startDone=job.recovered.length;
  const stopAt=target==='all'?total:Math.min(total,target==='next'?startDone+1:Number(target));
  if(!Number.isFinite(stopAt)||stopAt<=startDone)return;
  running=true;aborter=new AbortController();render();
  try{
    for(let i=job.recovered.length;i<stopAt;i++){
      if(aborter.signal.aborted)break;
      const p=job.subjects[i];
      setStatus(`Recovering ${i+1}/${job.subjects.length} · ${p.subject.glyph} ${p.subject.name} · Mistral + GPT-4.1 mini + Qwen 3.7 Plus in parallel…`);
      const result=await callSubject(p);
      job.recovered.push(result);job.updatedAt=new Date().toISOString();await dbPut(job);render();
    }
    if(job.recovered.length===job.subjects.length)setStatus('RECOVERY COMPLETE · Download the enriched snapshot.');
    else if(aborter.signal.aborted)setStatus('STOPPED · saved after the last completed subject.');
    else setStatus(`CHECKPOINT REACHED · ${job.recovered.length}/${job.subjects.length} subjects recovered · download and inspect before the next gate.`);
  }catch(e){if(e?.name==='AbortError')setStatus('STOPPED · saved after the last completed subject.');else setStatus(`STOPPED · ${e?.message||e}`)}finally{running=false;render()}
}
function stop(){aborter?.abort()}
function download(){if(!job||!input)return;const out={...input,recoverySchemaVersion:4,recoveryKind:'emojeo-step3-raw-notes-recovery',recoveryCreatedAt:new Date().toISOString(),recoveryStrategy:'one subject per wave; 857 relationships sharded across Mistral / GPT-4.1 mini / Qwen 3.7 Plus concurrently; notes-only normalization; exact relationship-name protocol; suspicious mapper shards auto-repaired; final semantic reconciliation preserves rejected/reassigned candidates; strict PRESENT/UNCERTAIN parser; negative rows omitted; existing relationship proposals separated from genuinely new types; original results preserved; gated 1 -> 3 -> 10 -> full',recoveryResults:job.recovered};const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`emojeo-step3-recovered-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
async function loadFile(file){input=JSON.parse(await file.text());if(!Array.isArray(input?.results))throw new Error('Selected file has no Step 3 results array');if(Number(input.completedUnits)!==Number(input.totalUnits))throw new Error(`This recovery pass expects a completed Step 3 export; file is ${input.completedUnits||0}/${input.totalUnits||0}`);spec=await fetch('Emojeo_STEP3_Diverse_Batch_001_RunSpec.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(`RunSpec load failed (${r.status})`);return r.json()});const id=fingerprint(input,file),prior=await dbGet(id),subjects=groupSubjects(input);job=prior&&Array.isArray(prior.recovered)?{...prior,subjects}:{id,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),subjects,recovered:[]};await dbPut(job);setStatus(prior?`Loaded saved recovery checkpoint · ${job.recovered.length}/${subjects.length} subjects already recovered.`:`Ready · completed Step 3 export verified · ${subjects.length} subjects found · first gate is exactly 1 subject.`);render()}
$('file').addEventListener('change',async e=>{try{const f=e.target.files?.[0];if(!f)return;await loadFile(f)}catch(err){job=null;setStatus(`LOAD FAILED · ${err?.message||err}`);render()}});
$('run1').addEventListener('click',()=>runTo('next'));
$('run3').addEventListener('click',()=>runTo(3));
$('run10').addEventListener('click',()=>runTo(10));
$('runall').addEventListener('click',()=>runTo('all'));
$('stop').addEventListener('click',stop);$('download').addEventListener('click',download);render();
})();
