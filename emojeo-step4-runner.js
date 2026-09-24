/* Emojeo Step 4 Assertion Matrix Runner — Pass 63
   Sealed inputs: Pass 62 assertion universe + locked Step 3 prefill + run spec.
   Uses the existing /api/emojeo/semantic-discovery cloud boundary.
   Exact assertion IDs are classified; relationship types/tags are never rewritten. */
(()=>{'use strict';

const $=id=>document.getElementById(id);
const clean=v=>String(v??'').trim();
const clone=v=>v==null?v:structuredClone(v);

const INPUTS={
  universe:'Emojeo_STEP4_Assertion_Universe_v001.json',
  prefill:'Emojeo_STEP4_Prefill_v001.json',
  runSpec:'Emojeo_STEP4_RunSpec_v001.json'
};
const DB_NAME='emojeo-step4-runner-v1';
const DB_VERSION=1;
const JOB_STORE='jobs';
const SHARD_STORE='shards';
const JOB_ID='step4-v001:e6ce04292d86009705814c8b8a09105a58fa5709440d2c11aa3f636641b87a3b';

let universe=null,prefill=null,runSpec=null;
let assertionById=new Map(),lockedBySubject=new Map();
let job=null,shardRecords=[],running=false,stopRequested=false;

async function fetchText(url){
  const r=await fetch(url,{cache:'no-cache'});
  if(!r.ok)throw new Error(`${url} load failed (${r.status})`);
  return r.text();
}
async function sha256Hex(text){
  const bytes=new TextEncoder().encode(text);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function openDb(){
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,DB_VERSION);
    r.onupgradeneeded=()=>{
      const db=r.result;
      if(!db.objectStoreNames.contains(JOB_STORE))db.createObjectStore(JOB_STORE,{keyPath:'id'});
      if(!db.objectStoreNames.contains(SHARD_STORE)){
        const s=db.createObjectStore(SHARD_STORE,{keyPath:'id'});
        s.createIndex('jobId','jobId',{unique:false});
      }
    };
    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
  });
}
async function dbGet(store,id){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).get(id);
    r.onsuccess=()=>resolve(r.result||null);
    r.onerror=()=>reject(r.error);
  });
}
async function dbPut(store,value){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
async function dbGetShards(jobId){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(SHARD_STORE,'readonly');
    const store=tx.objectStore(SHARD_STORE),index=store.index('jobId'),r=index.getAll(jobId);
    r.onsuccess=()=>resolve(Array.isArray(r.result)?r.result:[]);
    r.onerror=()=>reject(r.error);
  });
}
function shardRecordId(subjectIndex,shardId){return `${JOB_ID}|${subjectIndex}|${shardId}`}
function lockedSet(subjectIndex){
  if(!lockedBySubject.has(subjectIndex))lockedBySubject.set(subjectIndex,new Set());
  return lockedBySubject.get(subjectIndex);
}
function pendingIds(subjectIndex,shard){
  const locked=lockedSet(subjectIndex);
  return shard.assertionIds.filter(id=>!locked.has(id));
}
function recordMap(){
  const m=new Map();
  for(const r of shardRecords)m.set(`${r.subjectIndex}|${r.shardId}`,r);
  return m;
}
function isShardComplete(subjectIndex,shard,records=recordMap()){
  const pending=pendingIds(subjectIndex,shard);
  if(!pending.length)return true;
  const r=records.get(`${subjectIndex}|${shard.shardId}`);
  return Boolean(r&&Array.isArray(r.values)&&r.values.length===pending.length);
}
function completedSubjects(){
  const records=recordMap();
  let done=0;
  for(let si=0;si<runSpec.subjects.length;si++){
    if(runSpec.shards.every(sh=>isShardComplete(si,sh,records)))done++;
    else break;
  }
  return done;
}
function evaluatedCellCount(){
  return shardRecords.reduce((n,r)=>n+(Array.isArray(r.values)?r.values.length:0),0);
}
function stateCounts(){
  const c={present:0,absent:0,uncertain:0,not_evaluated:0};
  for(const a of prefill.assignments)c[a.state]=(c[a.state]||0)+1;
  for(const r of shardRecords)for(const v of (r.values||[]))c[v.state]=(c[v.state]||0)+1;
  return c;
}
function render(){
  if(!runSpec||!job){
    for(const id of ['run1','run3','run10','runall','stop','download'])$(id).disabled=true;
    return;
  }
  const done=completedSubjects();
  const evaluated=evaluatedCellCount();
  const completed=prefill.lockedAssignmentCount+evaluated;
  const total=runSpec.progress.totalMatrixCells;
  const counts=stateCounts();
  $('summary').innerHTML=
    `<span class="good">${done}/79 subjects complete</span> · `+
    `${completed.toLocaleString()}/${total.toLocaleString()} matrix cells covered · `+
    `${evaluated.toLocaleString()} new Step 4 evaluations saved · `+
    `P ${counts.present.toLocaleString()} / A ${counts.absent.toLocaleString()} / U ${counts.uncertain.toLocaleString()} / N ${counts.not_evaluated.toLocaleString()}`;

  $('run1').disabled=running||done>=79||done>=1;
  $('run3').disabled=running||done<1||done>=3;
  $('run10').disabled=running||done<3||done>=10;
  $('runall').disabled=running||done<10||done>=79;
  $('stop').disabled=!running;
  $('download').disabled=running&&evaluated===0;
}
function setStatus(t){$('status').textContent=t}

function promptFor(subject,candidates,repairNote=''){
  return [
    'EMOJEO STEP 4 FIXED ASSERTION EVALUATION v1',
    `Subject: ${subject.glyph} ${subject.name}`,
    '',
    'Classify EVERY fixed candidate below for this emoji.',
    'Do not invent a different relationship type. Do not rewrite, broaden, narrow, normalize, or substitute the tag.',
    'Do not create new relationship types. These candidates are sealed.',
    '',
    'STATE CONTRACT',
    'PRESENT = the exact fixed relationshipType + tag is directly supported by inherent, conventional, or well-established semantics of this emoji.',
    'ABSENT = the exact assertion is meaningfully evaluable and does not apply.',
    'UNCERTAIN = genuine plausible support exists, but ambiguity/conflicting evidence/context-dependence prevents a reliable PRESENT/ABSENT decision.',
    'NOT_EVALUATED = the exact assertion cannot be responsibly assessed from the emoji itself without inventing context or outside assumptions.',
    '',
    'EVIDENCE RULES',
    '- PRESENT requires direct or established support. Mere possible combinations, jokes, hypothetical scenarios, niche invented uses, and "could/might" speculation are not PRESENT.',
    '- Use UNCERTAIN only for real ambiguity, not as a softer ABSENT.',
    '- Use NOT_EVALUATED when the fixed assertion depends on context the emoji itself does not provide.',
    '- Give one concise evidence/reason sentence per candidate.',
    '',
    'OUTPUT FORMAT — mandatory',
    'Return one rawNotes entry per candidate and NOTHING ELSE in rawNotes.',
    'Each rawNotes entry must be exactly:',
    'ASSERTION_ID|STATE|CONFIDENCE|EVIDENCE',
    'STATE must be PRESENT, ABSENT, UNCERTAIN, or NOT_EVALUATED.',
    'CONFIDENCE must be HIGH, MEDIUM, or LOW.',
    'Keep the assertion ID exactly as supplied.',
    repairNote?`FORMAT REPAIR NOTE: ${repairNote}`:'',
    '',
    'FIXED CANDIDATES',
    ...candidates.map(c=>`${c.assertionId}|${c.relationshipType}|${c.tag}`)
  ].filter(Boolean).join('\n');
}
function semanticRequest(subject,candidates,repairNote=''){
  return {
    schemaVersion:1,
    kind:'emojeo-step4-fixed-assertion-evaluation',
    subject:{id:`${subject.glyph}:${subject.name}`,glyph:subject.glyph,name:subject.name},
    domain:'Step 4 fixed assertion matrix',
    relationshipTypes:[...new Set(candidates.map(c=>c.relationshipType))],
    assertionIds:candidates.map(c=>c.assertionId),
    prompt:promptFor(subject,candidates,repairNote)
  };
}
function collectStrings(v,out=[]){
  if(typeof v==='string'){out.push(v);return out}
  if(Array.isArray(v)){for(const x of v)collectStrings(x,out);return out}
  if(v&&typeof v==='object'){
    for(const [k,x] of Object.entries(v)){
      if(['provider','completedAt','schemaVersion','kind','subject'].includes(k))continue;
      collectStrings(x,out);
    }
  }
  return out;
}
function parseEvaluation(envelope,candidates){
  const expected=new Map(candidates.map(c=>[c.assertionId,c]));
  const body=envelope?.result??envelope;
  const strings=collectStrings(body,[]);
  const rows=[];
  for(const s of strings){
    for(let line of String(s).split(/\r?\n/)){
      line=line.trim().replace(/^[-*•]\s*/,'').replace(/^`+|`+$/g,'').trim();
      const m=line.match(/^(A\d{4})\s*\|\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\s*\|\s*(HIGH|MEDIUM|LOW)\s*\|\s*(.+)$/i);
      if(!m)continue;
      const id=m[1].toUpperCase();
      if(!expected.has(id))throw new Error(`AI returned unknown assertion ID ${id}`);
      rows.push({
        assertionId:id,
        state:m[2].toLowerCase(),
        confidence:m[3].toLowerCase(),
        evidence:clean(m[4])
      });
    }
  }
  const seen=new Set();
  for(const r of rows){
    if(seen.has(r.assertionId))throw new Error(`AI returned duplicate assertion ID ${r.assertionId}`);
    seen.add(r.assertionId);
    if(!r.evidence)throw new Error(`AI returned empty evidence for ${r.assertionId}`);
  }
  const missing=candidates.map(c=>c.assertionId).filter(id=>!seen.has(id));
  if(missing.length)throw new Error(`AI omitted ${missing.length} assertion ID(s): ${missing.slice(0,8).join(', ')}`);
  if(rows.length!==candidates.length)throw new Error(`Expected ${candidates.length} rows, parsed ${rows.length}`);
  rows.sort((a,b)=>candidates.findIndex(c=>c.assertionId===a.assertionId)-candidates.findIndex(c=>c.assertionId===b.assertionId));
  return rows;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function callSemantic(payload,onRetry){
  const api=globalThis.GenreactrixCloudApi;
  if(!api?.emojeoSemanticDiscovery)throw new Error('Semantic Discovery Worker adapter unavailable.');
  if(!clean(api.getBaseUrl?.()))throw new Error('AI Worker URL is not configured in this browser.');
  if(!clean(api.getKey?.()))throw new Error('Analysis key is not configured in this browser.');
  let attempt=0;
  for(;;){
    try{return await api.emojeoSemanticDiscovery(payload)}
    catch(e){
      attempt++;
      if(attempt>=6)throw e;
      const delay=Math.min(30000,2000*Math.pow(2,Math.min(attempt-1,4)));
      onRetry?.({attempt,delay,error:e});
      await sleep(delay);
    }
  }
}
async function evaluateShard(subjectIndex,shard){
  const subject=runSpec.subjects[subjectIndex];
  const ids=pendingIds(subjectIndex,shard);
  const candidates=ids.map(id=>{
    const row=assertionById.get(id);
    if(!row)throw new Error(`Unknown assertion ID ${id}`);
    return row;
  });
  if(!candidates.length)return null;

  let lastError='';
  for(let formatAttempt=1;formatAttempt<=3;formatAttempt++){
    setStatus(
      `STEP 4 · subject ${subjectIndex+1}/79 · ${subject.glyph} ${subject.name}\n`+
      `${shard.shardId} · ${candidates.length} fixed assertion(s) · format attempt ${formatAttempt}/3`
    );
    const envelope=await callSemantic(
      semanticRequest(subject,candidates,lastError),
      r=>setStatus(
        `STEP 4 NETWORK RETRY ${r.attempt}/5 in ${Math.round(r.delay/1000)}s\n`+
        `${subject.glyph} ${subject.name} · ${shard.shardId}\n${r.error?.message||r.error}`
      )
    );
    try{
      const values=parseEvaluation(envelope,candidates);
      return {
        id:shardRecordId(subjectIndex,shard.shardId),
        kind:'emojeo-step4-shard-result',
        jobId:JOB_ID,
        subjectIndex,
        subject:{glyph:subject.glyph,name:subject.name},
        shardId:shard.shardId,
        pendingAssertionCount:candidates.length,
        values,
        provider:envelope?.result?.provider||envelope?.provider||null,
        completedAt:new Date().toISOString()
      };
    }catch(e){
      lastError=e?.message||String(e);
      if(formatAttempt===3)throw new Error(`${shard.shardId} format validation failed after 3 attempts: ${lastError}`);
    }
  }
}
async function refreshShardRecords(){
  shardRecords=await dbGetShards(JOB_ID);
  shardRecords.sort((a,b)=>a.subjectIndex-b.subjectIndex||a.shardId.localeCompare(b.shardId));
}
async function runTo(stopSubject){
  if(running||!job)return;
  const startDone=completedSubjects();
  stopSubject=Math.min(79,Math.max(startDone+1,Number(stopSubject)||startDone+1));
  job.runIntent={active:true,stopSubject,requestedAt:new Date().toISOString()};
  job.updatedAt=new Date().toISOString();
  await dbPut(JOB_STORE,job);

  running=true;stopRequested=false;render();
  try{
    for(let si=startDone;si<stopSubject;si++){
      const records=recordMap();
      for(const shard of runSpec.shards){
        if(isShardComplete(si,shard,records))continue;
        const rec=await evaluateShard(si,shard);
        if(rec){
          await dbPut(SHARD_STORE,rec);
          shardRecords.push(rec);
          records.set(`${si}|${shard.shardId}`,rec);
          job.updatedAt=new Date().toISOString();
          job.lastCompleted={subjectIndex:si,shardId:shard.shardId,completedAt:rec.completedAt};
          await dbPut(JOB_STORE,job);
          render();
        }
        if(stopRequested){
          job.runIntent={...(job.runIntent||{}),active:false,stoppedAt:new Date().toISOString()};
          await dbPut(JOB_STORE,job);
          setStatus('STOPPED · the current request finished and its validated result was saved.');
          return;
        }
      }
      setStatus(`SUBJECT COMPLETE · ${si+1}/79 · ${runSpec.subjects[si].glyph} ${runSpec.subjects[si].name}`);
      render();
    }
    job.runIntent={...(job.runIntent||{}),active:false,completedAt:new Date().toISOString()};
    await dbPut(JOB_STORE,job);
    const done=completedSubjects();
    if(done===79)setStatus('STEP 4 COMPLETE · 79/79 subjects · download the final checkpoint JSON.');
    else setStatus(`CHECKPOINT REACHED · ${done}/79 subjects complete · download and inspect before the next gate.`);
  }catch(e){
    job.runIntent={...(job.runIntent||{}),active:true,lastError:clean(e?.message||e),lastErrorAt:new Date().toISOString()};
    await dbPut(JOB_STORE,job).catch(()=>{});
    setStatus(`STOPPED ON ERROR · ${e?.message||e}\nRefresh/reopen the page to resume the saved gate.`);
  }finally{
    running=false;stopRequested=false;render();
  }
}
async function downloadCheckpoint(){
  const records=[...shardRecords].sort((a,b)=>a.subjectIndex-b.subjectIndex||a.shardId.localeCompare(b.shardId));
  const evaluated=records.flatMap(r=>r.values.map(v=>({
    subjectIndex:r.subjectIndex,
    subject:clone(r.subject),
    assertionId:v.assertionId,
    relationshipType:assertionById.get(v.assertionId)?.relationshipType||'',
    tag:assertionById.get(v.assertionId)?.tag||'',
    state:v.state,
    confidence:v.confidence,
    evidence:v.evidence,
    source:'step4-evaluation',
    shardId:r.shardId,
    completedAt:r.completedAt
  })));
  const locked=prefill.assignments.map(a=>({...clone(a),source:'step3-locked-prefill'}));
  const assignments=[...locked,...evaluated].sort((a,b)=>a.subjectIndex-b.subjectIndex||a.assertionId.localeCompare(b.assertionId));
  const counts={present:0,absent:0,uncertain:0,not_evaluated:0};
  for(const a of assignments)counts[a.state]=(counts[a.state]||0)+1;
  const out={
    schemaVersion:1,
    kind:'emojeo-step4-assertion-matrix-checkpoint',
    runnerVersion:'pass63',
    createdAt:new Date().toISOString(),
    jobId:JOB_ID,
    inputs:{
      assertionUniverse:{file:INPUTS.universe,sha256:runSpec.inputs.assertionUniverse.sha256},
      prefill:{file:INPUTS.prefill,sha256:runSpec.inputs.prefill.sha256},
      runSpec:{file:INPUTS.runSpec,version:runSpec.version},
      step3Canonical:clone(runSpec.inputs.step3Canonical)
    },
    subjectCount:runSpec.scope.subjectCount,
    assertionCount:runSpec.scope.assertionCount,
    totalMatrixCells:runSpec.scope.matrixCellCount,
    lockedPrefillCellCount:prefill.lockedAssignmentCount,
    evaluatedStep4CellCount:evaluated.length,
    coveredCellCount:assignments.length,
    completedSubjects:completedSubjects(),
    completedShardResults:records.length,
    stateCounts:counts,
    assignments
  };
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`emojeo-step4-matrix-pass63-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
  document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
}
async function initialize(){
  try{
    const [ut,pt,rt]=await Promise.all([
      fetchText(INPUTS.universe),fetchText(INPUTS.prefill),fetchText(INPUTS.runSpec)
    ]);
    universe=JSON.parse(ut);prefill=JSON.parse(pt);runSpec=JSON.parse(rt);

    if(universe.kind!=='emojeo-step4-assertion-universe'||universe.assertionCount!==1278)throw new Error('Assertion universe is not Pass 62 v001 / 1,278 assertions.');
    if(prefill.kind!=='emojeo-step4-prefill'||prefill.lockedAssignmentCount!==1326)throw new Error('Prefill is not Pass 62 v001 / 1,326 locked cells.');
    if(runSpec.kind!=='emojeo-step4-run-spec'||runSpec.scope?.subjectCount!==79||runSpec.scope?.assertionCount!==1278)throw new Error('RunSpec is not Pass 62 v001 / 79 × 1,278.');

    const [ush,psh]=await Promise.all([sha256Hex(ut),sha256Hex(pt)]);
    if(ush!==runSpec.inputs.assertionUniverse.sha256)throw new Error('Assertion universe SHA256 does not match the sealed RunSpec.');
    if(psh!==runSpec.inputs.prefill.sha256)throw new Error('Prefill SHA256 does not match the sealed RunSpec.');

    assertionById=new Map(universe.assertions.map(x=>[x.assertionId,x]));
    if(assertionById.size!==1278)throw new Error('Assertion universe contains duplicate assertion IDs.');

    lockedBySubject=new Map();
    const seenLocked=new Set();
    for(const a of prefill.assignments){
      const key=`${a.subjectIndex}|${a.assertionId}`;
      if(seenLocked.has(key))throw new Error(`Duplicate locked cell ${key}`);
      seenLocked.add(key);
      if(!assertionById.has(a.assertionId))throw new Error(`Prefill references unknown assertion ID ${a.assertionId}`);
      lockedSet(a.subjectIndex).add(a.assertionId);
    }

    const saved=await dbGet(JOB_STORE,JOB_ID);
    job=saved||{
      id:JOB_ID,
      kind:'emojeo-step4-job',
      schemaVersion:1,
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
      assertionUniverseSha256:ush,
      prefillSha256:psh,
      runIntent:{active:false}
    };
    if(job.assertionUniverseSha256!==ush||job.prefillSha256!==psh)throw new Error('Saved Step 4 job does not match the sealed Pass 62 inputs.');
    await dbPut(JOB_STORE,job);
    await refreshShardRecords();

    setStatus(
      `READY · 79 subjects × 1,278 assertions = 100,962 cells.\n`+
      `1,326 Step 3 cells locked · 99,636 Step 4 evaluations pending · 43 shards/subject.\n`+
      (job.runIntent?.active?`AUTO-RESUME · continuing interrupted gate through subject ${job.runIntent.stopSubject}…`:'First gate: RUN PILOT 1.')
    );
    render();

    const done=completedSubjects();
    if(job.runIntent?.active&&done<Number(job.runIntent.stopSubject||0)){
      setTimeout(()=>runTo(job.runIntent.stopSubject),700);
    }else if(job.runIntent?.active){
      job.runIntent={...(job.runIntent||{}),active:false,completedAt:new Date().toISOString()};
      await dbPut(JOB_STORE,job);
    }
  }catch(e){
    setStatus(`INITIALIZATION FAILED · ${e?.message||e}`);
    job=null;render();
  }
}

$('run1').addEventListener('click',()=>runTo(1));
$('run3').addEventListener('click',()=>runTo(3));
$('run10').addEventListener('click',()=>runTo(10));
$('runall').addEventListener('click',()=>runTo(79));
$('stop').addEventListener('click',async()=>{
  if(!running)return;
  stopRequested=true;
  if(job){
    job.runIntent={...(job.runIntent||{}),active:false,stopRequestedAt:new Date().toISOString()};
    await dbPut(JOB_STORE,job).catch(()=>{});
  }
  setStatus('STOP REQUESTED · finishing the current AI request, validating it, saving it, then stopping.');
});
$('download').addEventListener('click',()=>downloadCheckpoint().catch(e=>setStatus(`DOWNLOAD FAILED · ${e?.message||e}`)));

render();
initialize();

})();