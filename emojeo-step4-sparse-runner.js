/* Emojeo Step 4 Sparse/Transpose Runner — Pass 64 */
(()=>{'use strict';

const $=id=>document.getElementById(id);
const clean=v=>String(v??'').trim();
const clone=v=>v==null?v:structuredClone(v);

const INPUTS={
  universe:'Emojeo_STEP4_Assertion_Universe_v001.json',
  prefill:'Emojeo_STEP4_Prefill_v001.json',
  runSpec:'Emojeo_STEP4_RunSpec_v001.json'
};
const DB_NAME='emojeo-step4-sparse-v1';
const DB_VERSION=1;
const JOB_STORE='jobs',SCREEN_STORE='screen',VERIFY_STORE='verify';
const JOB_ID='step4-sparse-v001:e6ce04292d86009705814c8b8a09105a58fa5709440d2c11aa3f636641b87a3b';
const SCREEN_BATCH_SIZE=12,VERIFY_BATCH_SIZE=30,CONCURRENCY=4,PILOT_ASSERTIONS=24;

let universe=null,prefill=null,runSpec=null;
let assertionById=new Map(),assertionIndexById=new Map(),lockedStateByCell=new Map();
let job=null,screenRecords=[],verifyRecords=[],running=false,stopRequested=false;

async function fetchText(url){
  const r=await fetch(url,{cache:'no-cache'});
  if(!r.ok)throw new Error(`${url} load failed (${r.status})`);
  return r.text();
}
async function sha256Hex(text){
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function openDb(){
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,DB_VERSION);
    r.onupgradeneeded=()=>{
      const db=r.result;
      if(!db.objectStoreNames.contains(JOB_STORE))db.createObjectStore(JOB_STORE,{keyPath:'id'});
      if(!db.objectStoreNames.contains(SCREEN_STORE)){
        const s=db.createObjectStore(SCREEN_STORE,{keyPath:'id'});s.createIndex('jobId','jobId',{unique:false});
      }
      if(!db.objectStoreNames.contains(VERIFY_STORE)){
        const s=db.createObjectStore(VERIFY_STORE,{keyPath:'id'});s.createIndex('jobId','jobId',{unique:false});
      }
    };
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  });
}
async function dbGet(store,id){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).get(id);
    r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);
  });
}
async function dbPut(store,value){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });
}
async function dbGetByJob(store,jobId){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).index('jobId').getAll(jobId);
    r.onsuccess=()=>resolve(Array.isArray(r.result)?r.result:[]);r.onerror=()=>reject(r.error);
  });
}

function cellKey(si,aid){return `${si}|${aid}`}
function screenBatchId(start){return `${JOB_ID}|screen|${start}`}
function verifyRecordId(si,ids){return `${JOB_ID}|verify|${si}|${ids[0]}|${ids.at(-1)}|${ids.length}`}
function setStatus(t){$('status').textContent=t}
function screenRecordMap(){return new Map(screenRecords.map(r=>[r.startAssertionIndex,r]))}
function verifiedCellMap(){
  const m=new Map();
  for(const r of verifyRecords)for(const v of (r.values||[]))m.set(cellKey(r.subjectIndex,v.assertionId),v);
  return m;
}
function screenedAssertionIds(limit=1278){
  const out=new Set();
  for(const r of screenRecords)for(const x of (r.assertions||[])){
    const ai=assertionIndexById.get(x.assertionId);
    if(Number.isInteger(ai)&&ai<limit)out.add(x.assertionId);
  }
  return out;
}
function screenedAssertionCount(){return screenedAssertionIds(1278).size}
function candidateCellSet(limit=1278){
  const out=new Set();
  for(const r of screenRecords)for(const x of (r.assertions||[])){
    const ai=assertionIndexById.get(x.assertionId);
    if(!Number.isInteger(ai)||ai>=limit)continue;
    for(const si of (x.candidateSubjectIndexes||[]))out.add(cellKey(si,x.assertionId));
  }
  return out;
}
function notEvaluatedCellSet(limit=1278){
  const out=new Set();
  for(const r of screenRecords)for(const x of (r.assertions||[])){
    const ai=assertionIndexById.get(x.assertionId);
    if(!Number.isInteger(ai)||ai>=limit)continue;
    for(const si of (x.notEvaluatedSubjectIndexes||[]))out.add(cellKey(si,x.assertionId));
  }
  return out;
}
function scopeComplete(limit){
  if(screenedAssertionIds(limit).size!==limit)return false;
  const cand=candidateCellSet(limit),ver=verifiedCellMap();
  for(const k of cand)if(!ver.has(k))return false;
  return true;
}
function render(){
  if(!job||!universe){
    for(const id of ['pilot','full','stop','download'])$(id).disabled=true;
    return;
  }
  const screened=screenedAssertionCount(),cand=candidateCellSet(1278),ver=verifiedCellMap();
  let verifiedCandidates=0;for(const k of cand)if(ver.has(k))verifiedCandidates++;
  const pilotDone=scopeComplete(PILOT_ASSERTIONS),fullDone=scopeComplete(1278);
  $('summary').innerHTML=
    `<span class="good">${screened.toLocaleString()}/1,278 assertions screened</span> · `+
    `${cand.size.toLocaleString()} sparse candidate cells · ${verifiedCandidates.toLocaleString()} deeply verified · `+
    `4-way concurrency · 107 max screening calls`;
  $('pilot').disabled=running||pilotDone;
  $('full').disabled=running||!pilotDone||fullDone;
  $('stop').disabled=!running;
  $('download').disabled=screenRecords.length===0;
}
function subjectsCompact(){
  return runSpec.subjects.map((s,i)=>`S${String(i).padStart(2,'0')}=${s.glyph} ${s.name}`).join('\n');
}
function lockedForAssertion(aid){
  const rows=[];
  for(let si=0;si<79;si++){
    const v=lockedStateByCell.get(cellKey(si,aid));
    if(v)rows.push(`S${String(si).padStart(2,'0')}=${String(v.state).toUpperCase()}`);
  }
  return rows;
}
function lockedSubjectSet(aid){
  const s=new Set();for(let si=0;si<79;si++)if(lockedStateByCell.has(cellKey(si,aid)))s.add(si);return s;
}
function screeningPrompt(assertions,repairNote=''){
  const blocks=assertions.map(a=>{
    const locked=lockedForAssertion(a.assertionId);
    return `${a.assertionId}|${a.relationshipType}|${a.tag}\nLOCKED:${locked.length?locked.join(','):'none'}`;
  }).join('\n\n');
  return [
    'EMOJEO STEP 4 SPARSE HIGH-RECALL SCREEN v1','',
    'For each fixed assertion, screen all 79 emoji but consider ONLY nonlocked subjects.','',
    'C = CANDIDATE FOR DEEP VERIFICATION. Include any subject with ANY plausible inherent, conventional, established, symbolic, metaphorical, cultural, or genuinely ambiguous support that could reasonably end as PRESENT or UNCERTAIN. THIS IS HIGH RECALL. When in doubt, use C.',
    'N = NOT_EVALUATED. Use only when the exact assertion cannot responsibly be assessed for that emoji without inventing external context.',
    'OMITTED = confidently ABSENT for the exact fixed relationshipType + tag.','',
    'Do not create or rename relationships. Do not rewrite tags. Do not place LOCKED subjects in C or N.',
    'Do not use merely hypothetical emoji combinations as support.','',
    'OUTPUT exactly one line per assertion and nothing else:',
    'ASSERTION_ID|C:comma-separated subject numbers or -|N:comma-separated subject numbers or -|R:brief rationale',
    'Use subject numbers 0 through 78, without S prefixes.',
    repairNote?`FORMAT REPAIR NOTE: ${repairNote}`:'','',
    'SUBJECTS',subjectsCompact(),'','ASSERTIONS',blocks
  ].filter(Boolean).join('\n');
}
function semanticScreenRequest(assertions,repairNote=''){
  return {
    schemaVersion:1,kind:'emojeo-step4-sparse-screen',
    subject:{id:'step4-sparse-screen',glyph:'🔎',name:'Step 4 sparse screen'},
    domain:'Step 4 sparse high-recall screen',
    relationshipTypes:[...new Set(assertions.map(a=>a.relationshipType))],
    assertionIds:assertions.map(a=>a.assertionId),
    prompt:screeningPrompt(assertions,repairNote)
  };
}
function collectStrings(v,out=[]){
  if(typeof v==='string'){out.push(v);return out}
  if(Array.isArray(v)){for(const x of v)collectStrings(x,out);return out}
  if(v&&typeof v==='object')for(const [k,x] of Object.entries(v)){
    if(['provider','completedAt','schemaVersion','kind','subject'].includes(k))continue;
    collectStrings(x,out);
  }
  return out;
}
function parseIndexList(s){
  s=clean(s);if(!s||s==='-')return [];
  const parts=s.split(',');const out=parts.map(x=>Number(clean(x)));
  if(out.some(x=>!Number.isInteger(x)))throw new Error(`Invalid subject list "${s}"`);
  for(const n of out)if(n<0||n>78)throw new Error(`Subject index ${n} outside 0..78`);
  return [...new Set(out)].sort((a,b)=>a-b);
}
function parseScreen(envelope,assertions){
  const expected=new Map(assertions.map(a=>[a.assertionId,a])),strings=collectStrings(envelope?.result??envelope,[]),parsed=[];
  for(const s of strings)for(let line of String(s).split(/\r?\n/)){
    line=line.trim().replace(/^[-*•]\s*/,'').replace(/^`+|`+$/g,'').trim();
    const m=line.match(/^(A\d{4})\s*\|\s*C:([^|]*)\|\s*N:([^|]*)\|\s*R:(.+)$/i);
    if(!m)continue;
    const aid=m[1].toUpperCase();if(!expected.has(aid))throw new Error(`Unknown assertion ID ${aid}`);
    const C=parseIndexList(m[2]),N=parseIndexList(m[3]),reason=clean(m[4]);
    if(C.some(x=>N.includes(x)))throw new Error(`${aid} has a subject in both C and N`);
    const locked=lockedSubjectSet(aid),illegal=[...C,...N].filter(si=>locked.has(si));
    if(illegal.length)throw new Error(`${aid} returned locked subject(s): ${illegal.join(',')}`);
    if(!reason)throw new Error(`${aid} missing rationale`);
    parsed.push({assertionId:aid,candidateSubjectIndexes:C,notEvaluatedSubjectIndexes:N,screenRationale:reason});
  }
  const seen=new Set();
  for(const x of parsed){if(seen.has(x.assertionId))throw new Error(`Duplicate screen line ${x.assertionId}`);seen.add(x.assertionId)}
  const missing=assertions.map(a=>a.assertionId).filter(id=>!seen.has(id));
  if(missing.length)throw new Error(`Screen omitted ${missing.length} assertion(s): ${missing.join(',')}`);
  parsed.sort((a,b)=>assertionIndexById.get(a.assertionId)-assertionIndexById.get(b.assertionId));
  return parsed;
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
      attempt++;if(attempt>=6)throw e;
      const delay=Math.min(30000,2000*Math.pow(2,Math.min(attempt-1,4)));
      onRetry?.({attempt,delay,error:e});await sleep(delay);
    }
  }
}
async function screenOneBatch(start,end){
  const assertions=universe.assertions.slice(start,end);let lastError='';
  for(let formatAttempt=1;formatAttempt<=3;formatAttempt++){
    const envelope=await callSemantic(
      semanticScreenRequest(assertions,lastError),
      r=>setStatus(`SCREEN NETWORK RETRY ${r.attempt}/5 · assertions ${start+1}-${end}\n${r.error?.message||r.error}`)
    );
    try{
      return {
        id:screenBatchId(start),kind:'emojeo-step4-sparse-screen-result',jobId:JOB_ID,
        startAssertionIndex:start,endAssertionIndexExclusive:end,
        assertions:parseScreen(envelope,assertions),
        provider:envelope?.result?.provider||envelope?.provider||null,completedAt:new Date().toISOString()
      };
    }catch(e){lastError=e?.message||String(e);if(formatAttempt===3)throw new Error(`Screen ${start+1}-${end} failed: ${lastError}`)}
  }
}
function candidateIdsForSubject(si,limit){
  const out=[];
  for(const r of screenRecords)for(const x of (r.assertions||[])){
    const ai=assertionIndexById.get(x.assertionId);
    if(Number.isInteger(ai)&&ai<limit&&(x.candidateSubjectIndexes||[]).includes(si)&&!lockedStateByCell.has(cellKey(si,x.assertionId)))out.push(x.assertionId);
  }
  return [...new Set(out)].sort((a,b)=>assertionIndexById.get(a)-assertionIndexById.get(b));
}
function verificationPrompt(subject,candidates,repairNote=''){
  return [
    'EMOJEO STEP 4 SPARSE CANDIDATE VERIFICATION v1',
    `Subject: ${subject.glyph} ${subject.name}`,'',
    'These exact cells survived a high-recall sparse screen. Classify each precisely.',
    'Do not create/rename relationships or rewrite tags.','',
    'PRESENT = exact fixed assertion is directly supported by inherent, conventional, well-established, symbolic, metaphorical, or cultural semantics.',
    'ABSENT = exact assertion does not apply after detailed review.',
    'UNCERTAIN = genuine plausible support exists but ambiguity/conflict/context-dependence prevents a reliable PRESENT/ABSENT decision.',
    'NOT_EVALUATED = exact assertion cannot responsibly be assessed from the emoji itself without inventing context.','',
    'Return exactly one line per candidate:',
    'ASSERTION_ID|STATE|CONFIDENCE|EVIDENCE',
    'STATE: PRESENT, ABSENT, UNCERTAIN, NOT_EVALUATED',
    'CONFIDENCE: HIGH, MEDIUM, LOW',
    repairNote?`FORMAT REPAIR NOTE: ${repairNote}`:'','',
    'CANDIDATES',...candidates.map(c=>`${c.assertionId}|${c.relationshipType}|${c.tag}`)
  ].filter(Boolean).join('\n');
}
function parseVerification(envelope,candidates){
  const expected=new Map(candidates.map(c=>[c.assertionId,c])),strings=collectStrings(envelope?.result??envelope,[]),rows=[];
  for(const s of strings)for(let line of String(s).split(/\r?\n/)){
    line=line.trim().replace(/^[-*•]\s*/,'').replace(/^`+|`+$/g,'').trim();
    const m=line.match(/^(A\d{4})\s*\|\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\s*\|\s*(HIGH|MEDIUM|LOW)\s*\|\s*(.+)$/i);
    if(!m)continue;
    const aid=m[1].toUpperCase();if(!expected.has(aid))throw new Error(`Unknown assertion ID ${aid}`);
    rows.push({assertionId:aid,state:m[2].toLowerCase(),confidence:m[3].toLowerCase(),evidence:clean(m[4])});
  }
  const seen=new Set();
  for(const r of rows){if(seen.has(r.assertionId))throw new Error(`Duplicate verification ${r.assertionId}`);seen.add(r.assertionId);if(!r.evidence)throw new Error(`${r.assertionId} empty evidence`)}
  const missing=candidates.map(c=>c.assertionId).filter(id=>!seen.has(id));
  if(missing.length)throw new Error(`Verification omitted ${missing.length} assertion(s): ${missing.slice(0,8).join(',')}`);
  rows.sort((a,b)=>assertionIndexById.get(a.assertionId)-assertionIndexById.get(b.assertionId));
  return rows;
}
async function verifyOneBatch(si,ids){
  const subject=runSpec.subjects[si],candidates=ids.map(id=>assertionById.get(id));let lastError='';
  for(let formatAttempt=1;formatAttempt<=3;formatAttempt++){
    const envelope=await callSemantic({
      schemaVersion:1,kind:'emojeo-step4-sparse-verify',
      subject:{id:`${subject.glyph}:${subject.name}`,glyph:subject.glyph,name:subject.name},
      domain:'Step 4 sparse candidate verification',
      relationshipTypes:[...new Set(candidates.map(c=>c.relationshipType))],assertionIds:ids,
      prompt:verificationPrompt(subject,candidates,lastError)
    },r=>setStatus(`VERIFY NETWORK RETRY ${r.attempt}/5 · ${subject.glyph} ${subject.name}\n${r.error?.message||r.error}`));
    try{
      return {
        id:verifyRecordId(si,ids),kind:'emojeo-step4-sparse-verify-result',jobId:JOB_ID,
        subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionIds:[...ids],
        values:parseVerification(envelope,candidates),
        provider:envelope?.result?.provider||envelope?.provider||null,completedAt:new Date().toISOString()
      };
    }catch(e){lastError=e?.message||String(e);if(formatAttempt===3)throw new Error(`Verify ${subject.glyph} ${subject.name} failed: ${lastError}`)}
  }
}
async function runPool(tasks,worker,label){
  let next=0,completed=0;
  async function lane(laneId){
    while(true){
      if(stopRequested)return;
      const i=next++;if(i>=tasks.length)return;
      setStatus(`${label} · ${completed}/${tasks.length} request(s) complete · lane ${laneId+1}/${CONCURRENCY}`);
      await worker(tasks[i]);completed++;render();
    }
  }
  await Promise.all(Array.from({length:Math.min(CONCURRENCY,tasks.length)},(_,i)=>lane(i)));
}
async function runScreen(limit){
  const have=screenRecordMap(),tasks=[];
  for(let start=0;start<limit;start+=SCREEN_BATCH_SIZE)if(!have.has(start))tasks.push({start,end:Math.min(limit,start+SCREEN_BATCH_SIZE)});
  if(!tasks.length)return;
  await runPool(tasks,async t=>{
    const rec=await screenOneBatch(t.start,t.end);await dbPut(SCREEN_STORE,rec);screenRecords.push(rec);
    job.updatedAt=new Date().toISOString();job.lastCompleted={stage:'screen',start:t.start,end:t.end,at:rec.completedAt};await dbPut(JOB_STORE,job);
  },`SPARSE SCREEN through assertion ${limit}`);
}
async function runVerify(limit){
  const ver=verifiedCellMap(),tasks=[];
  for(let si=0;si<79;si++){
    const ids=candidateIdsForSubject(si,limit).filter(id=>!ver.has(cellKey(si,id)));
    for(let i=0;i<ids.length;i+=VERIFY_BATCH_SIZE)tasks.push({si,ids:ids.slice(i,i+VERIFY_BATCH_SIZE)});
  }
  if(!tasks.length)return;
  await runPool(tasks,async t=>{
    const rec=await verifyOneBatch(t.si,t.ids);await dbPut(VERIFY_STORE,rec);verifyRecords.push(rec);
    job.updatedAt=new Date().toISOString();job.lastCompleted={stage:'verify',subjectIndex:t.si,assertionIds:t.ids,at:rec.completedAt};await dbPut(JOB_STORE,job);
  },`DEEP VERIFY through assertion ${limit}`);
}
async function runScope(limit){
  if(running||!job)return;
  running=true;stopRequested=false;job.runIntent={active:true,limit,requestedAt:new Date().toISOString()};await dbPut(JOB_STORE,job);render();
  try{
    await runScreen(limit);
    if(stopRequested){job.runIntent={...(job.runIntent||{}),active:false,stoppedAt:new Date().toISOString()};await dbPut(JOB_STORE,job);setStatus('STOPPED · in-flight screening requests finished and checkpointed.');return}
    await runVerify(limit);
    if(stopRequested){job.runIntent={...(job.runIntent||{}),active:false,stoppedAt:new Date().toISOString()};await dbPut(JOB_STORE,job);setStatus('STOPPED · in-flight verification requests finished and checkpointed.');return}
    job.runIntent={...(job.runIntent||{}),active:false,completedAt:new Date().toISOString()};await dbPut(JOB_STORE,job);
    setStatus(limit===PILOT_ASSERTIONS?'PILOT COMPLETE · 24 assertions × all 79 emoji complete. Download checkpoint JSON.':'STEP 4 SPARSE MATRIX COMPLETE · all 1,278 assertions × 79 emoji covered. Download final checkpoint JSON.');
  }catch(e){
    job.runIntent={...(job.runIntent||{}),active:true,lastError:clean(e?.message||e),lastErrorAt:new Date().toISOString()};await dbPut(JOB_STORE,job).catch(()=>{});
    setStatus(`STOPPED ON ERROR · ${e?.message||e}\nRefresh/reopen Pass 64 to resume.`);
  }finally{running=false;stopRequested=false;render()}
}
function screenRowByAid(){
  const m=new Map();for(const r of screenRecords)for(const x of (r.assertions||[]))m.set(x.assertionId,x);return m;
}
function buildAssignments(limit){
  const ver=verifiedCellMap(),screenByAid=screenRowByAid(),out=[];
  for(let ai=0;ai<limit;ai++){
    const a=universe.assertions[ai],srow=screenByAid.get(a.assertionId);if(!srow)continue;
    const C=new Set(srow.candidateSubjectIndexes||[]),N=new Set(srow.notEvaluatedSubjectIndexes||[]);
    for(let si=0;si<79;si++){
      const key=cellKey(si,a.assertionId),subject=runSpec.subjects[si],locked=lockedStateByCell.get(key);
      if(locked){
        out.push({...clone(locked),subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,source:'step3-locked-prefill'});continue;
      }
      const v=ver.get(key);
      if(v){
        out.push({subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,state:v.state,confidence:v.confidence,evidence:v.evidence,source:'step4-sparse-deep-verification'});continue;
      }
      if(C.has(si))continue;
      if(N.has(si)){
        out.push({subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,state:'not_evaluated',confidence:'medium',evidence:`Sparse high-recall screen: ${srow.screenRationale}`,source:'step4-sparse-screen'});
      }else{
        out.push({subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,state:'absent',confidence:'medium',evidence:`Sparse high-recall screen omitted this subject from the plausible-support queue. ${srow.screenRationale}`,source:'step4-sparse-screen'});
      }
    }
  }
  return out.sort((x,y)=>x.subjectIndex-y.subjectIndex||assertionIndexById.get(x.assertionId)-assertionIndexById.get(y.assertionId));
}
async function downloadCheckpoint(){
  const full=scopeComplete(1278),pilot=scopeComplete(PILOT_ASSERTIONS);
  const limit=full?1278:(pilot?PILOT_ASSERTIONS:Math.min(PILOT_ASSERTIONS,screenedAssertionCount()));
  const assignments=buildAssignments(limit),counts={present:0,absent:0,uncertain:0,not_evaluated:0};
  for(const a of assignments)counts[a.state]=(counts[a.state]||0)+1;
  const cand=candidateCellSet(limit),ver=verifiedCellMap();
  const out={
    schemaVersion:1,kind:'emojeo-step4-sparse-matrix-checkpoint',runnerVersion:'pass64',createdAt:new Date().toISOString(),jobId:JOB_ID,
    strategy:{name:'transpose sparse high-recall screening + deep verification',screenBatchSize:SCREEN_BATCH_SIZE,verifyBatchSize:VERIFY_BATCH_SIZE,concurrency:CONCURRENCY,omittedNonlockedScreenSubjectsBecome:'absent',explicitScreenNBecomes:'not_evaluated',screenCandidatesRequireDeepVerification:true},
    inputs:{assertionUniverse:{file:INPUTS.universe,sha256:runSpec.inputs.assertionUniverse.sha256},prefill:{file:INPUTS.prefill,sha256:runSpec.inputs.prefill.sha256},runSpec:{file:INPUTS.runSpec,version:runSpec.version},step3Canonical:clone(runSpec.inputs.step3Canonical)},
    subjectCount:79,totalAssertionCount:1278,scopeAssertionCount:limit,scopeMatrixCellCount:limit*79,scopeComplete:scopeComplete(limit),
    screenedAssertionCount:screenedAssertionIds(limit).size,sparseCandidateCellCount:cand.size,
    deeplyVerifiedCandidateCellCount:[...cand].filter(k=>ver.has(k)).length,assignmentCount:assignments.length,stateCounts:counts,
    screenResults:screenRecords.filter(r=>r.startAssertionIndex<limit).sort((a,b)=>a.startAssertionIndex-b.startAssertionIndex),
    verificationResults:verifyRecords,assignments
  };
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`emojeo-step4-sparse-pass64-${limit}assertions-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
}
async function initialize(){
  try{
    const [ut,pt,rt]=await Promise.all([fetchText(INPUTS.universe),fetchText(INPUTS.prefill),fetchText(INPUTS.runSpec)]);
    universe=JSON.parse(ut);prefill=JSON.parse(pt);runSpec=JSON.parse(rt);
    if(universe.kind!=='emojeo-step4-assertion-universe'||universe.assertionCount!==1278)throw new Error('Assertion universe mismatch.');
    if(prefill.kind!=='emojeo-step4-prefill'||prefill.lockedAssignmentCount!==1326)throw new Error('Prefill mismatch.');
    if(runSpec.kind!=='emojeo-step4-run-spec'||runSpec.scope?.subjectCount!==79||runSpec.scope?.assertionCount!==1278)throw new Error('RunSpec mismatch.');
    const [ush,psh]=await Promise.all([sha256Hex(ut),sha256Hex(pt)]);
    if(ush!==runSpec.inputs.assertionUniverse.sha256)throw new Error('Assertion universe SHA256 mismatch.');
    if(psh!==runSpec.inputs.prefill.sha256)throw new Error('Prefill SHA256 mismatch.');

    assertionById=new Map();assertionIndexById=new Map();
    universe.assertions.forEach((a,i)=>{assertionById.set(a.assertionId,a);assertionIndexById.set(a.assertionId,i)});
    if(assertionById.size!==1278)throw new Error('Duplicate assertion IDs.');

    lockedStateByCell=new Map();
    for(const a of prefill.assignments){
      if(!assertionById.has(a.assertionId))throw new Error(`Prefill unknown assertion ${a.assertionId}`);
      const k=cellKey(a.subjectIndex,a.assertionId);if(lockedStateByCell.has(k))throw new Error(`Duplicate locked cell ${k}`);
      lockedStateByCell.set(k,clone(a));
    }

    job=await dbGet(JOB_STORE,JOB_ID)||{id:JOB_ID,kind:'emojeo-step4-sparse-job',schemaVersion:1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),assertionUniverseSha256:ush,prefillSha256:psh,runIntent:{active:false}};
    if(job.assertionUniverseSha256!==ush||job.prefillSha256!==psh)throw new Error('Saved sparse job does not match Pass 62 inputs.');
    await dbPut(JOB_STORE,job);
    [screenRecords,verifyRecords]=await Promise.all([dbGetByJob(SCREEN_STORE,JOB_ID),dbGetByJob(VERIFY_STORE,JOB_ID)]);

    setStatus(`READY · same 100,962-cell matrix, sparse strategy.\nScreening: 107 maximum calls instead of 3,397 subject-shard calls; 4 run concurrently.\nDeep verification is limited to plausible-positive/ambiguous candidate cells.\n${job.runIntent?.active?`AUTO-RESUME · continuing through ${job.runIntent.limit} assertions…`:'First gate: RUN PILOT 24 ASSERTIONS.'}`);
    render();

    const activeLimit=Number(job.runIntent?.limit||0);
    if(job.runIntent?.active&&activeLimit&&!scopeComplete(activeLimit))setTimeout(()=>runScope(activeLimit),700);
    else if(job.runIntent?.active){job.runIntent={...(job.runIntent||{}),active:false,completedAt:new Date().toISOString()};await dbPut(JOB_STORE,job)}
  }catch(e){job=null;setStatus(`INITIALIZATION FAILED · ${e?.message||e}`);render()}
}

$('pilot').addEventListener('click',()=>runScope(PILOT_ASSERTIONS));
$('full').addEventListener('click',()=>runScope(1278));
$('stop').addEventListener('click',async()=>{
  if(!running)return;stopRequested=true;
  if(job){job.runIntent={...(job.runIntent||{}),active:false,stopRequestedAt:new Date().toISOString()};await dbPut(JOB_STORE,job).catch(()=>{})}
  setStatus(`STOP REQUESTED · no new requests will start. Up to ${CONCURRENCY} in-flight requests will finish and checkpoint.`);
});
$('download').addEventListener('click',()=>downloadCheckpoint().catch(e=>setStatus(`DOWNLOAD FAILED · ${e?.message||e}`)));

render();initialize();
})();