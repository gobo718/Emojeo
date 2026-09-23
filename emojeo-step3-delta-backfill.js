/* Emojeo Step 3 Delta Backfill — Pass 54
   Fresh discovery against only the 354 v013 ontology additions.
   Existing Step 3 results and recoveryResults are never mutated.
   Every completed shard is checkpointed in IndexedDB.
   Safety gate: 1 subject -> 3 total -> 10 total -> full 79. */
(()=>{'use strict';

const $=id=>document.getElementById(id);
const clean=v=>String(v??'').trim();
const clone=v=>v==null?v:structuredClone(v);
const DB_NAME='emojeo-step3-delta-backfill-v1';
const STORE='jobs';
const SHARD_SIZE=30;

let input=null,spec=null,job=null,running=false,aborter=null;

async function loadJson(url){
  const r=await fetch(url,{cache:'no-cache'});
  if(!r.ok)throw new Error(`${url} load failed (${r.status})`);
  return r.json();
}
function normalizeName(v){return clean(v).toLowerCase().normalize('NFKC').replace(/\s+/g,' ')}
function subjectKey(s){return `${clean(s?.glyph)}\u0000${normalizeName(s?.name)}`}
function fingerprint(data,file){
  const last=data?.recoveryResults?.at?.(-1)?.subject||{};
  return [
    data?.batchId||'step3',
    data?.completedUnits||0,
    data?.totalUnits||0,
    data?.recoveryResults?.length||0,
    last?.glyph||'',
    last?.name||'',
    file?.size||0,
    spec?.batchId||'delta'
  ].join('|');
}
function buildShards(relationships){
  const rows=(Array.isArray(relationships)?relationships:[]).map(x=>({
    relationshipType:clean(x?.relationshipType),
    definition:clean(x?.definition),
    domain:clean(x?.domain)
  })).filter(x=>x.relationshipType);
  const out=[];
  for(let i=0;i<rows.length;i+=SHARD_SIZE){
    out.push({
      id:`delta-${String(out.length+1).padStart(2,'0')}`,
      domain:`v013 ontology delta shard ${String(out.length+1).padStart(2,'0')}`,
      relationships:rows.slice(i,i+SHARD_SIZE)
    });
  }
  return out;
}
function parseJsonish(v){
  if(v&&typeof v==='object')return v;
  return JSON.parse(clean(v).replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
}
function normalizeResult(raw,subject,shard){
  const body=parseJsonish(raw?.rawDiscovery||raw?.result||raw);
  const assertions=Array.isArray(body.assertions)?body.assertions:[];
  return {
    schemaVersion:1,
    kind:'emojeo-step3-delta-backfill-shard',
    subject:clone(subject),
    shardId:shard.id,
    shardDomain:shard.domain,
    relationshipTypes:shard.relationships.map(x=>x.relationshipType),
    assertions:assertions.map(x=>({
      relationshipType:clean(x.relationshipType),
      tag:clean(x.tag),
      state:['present','absent','uncertain','not_evaluated'].includes(clean(x.state))?clean(x.state):'uncertain',
      confidence:clean(x.confidence)||null,
      evidence:clean(x.evidence)
    })).filter(x=>x.relationshipType&&x.tag),
    newTags:[...new Set((body.newTags||[]).map(clean).filter(Boolean))],
    newRelationshipNeeded:(body.newRelationshipNeeded||[]).map(x=>({
      proposedRelationshipType:clean(x.proposedRelationshipType),
      tag:clean(x.tag),
      reason:clean(x.reason)
    })).filter(x=>x.proposedRelationshipType),
    rawNotes:body.rawNotes??null,
    provider:raw?.provider||null,
    completedAt:new Date().toISOString()
  };
}
function prompt(subject,shard){
  const allowed=shard.relationships.map(x=>x.definition?`${x.relationshipType} — ${x.definition}`:x.relationshipType);
  return [
    'EMOJEO STEP 3 V013 DELTA BACKFILL v1',
    `Subject: ${subject.glyph} ${subject.name}`,
    `Relationship shard: ${shard.domain}`,
    '',
    'This is a DELTA-ONLY discovery pass.',
    'Evaluate this emoji against EVERY relationship type listed below.',
    'Do not reevaluate, replace, or summarize the old 857 relationship types.',
    'The tag vocabulary is open: discover exact semantic tag values freely.',
    'FIND → ADD → PRESERVE. MULTIPLE TRUE → KEEP ALL.',
    'Broad and narrow true assertions may coexist.',
    'Relationship = how the emoji connects. Tag = exact referent/value.',
    'Do not force a connection. Use absent when evaluated and false, uncertain when evidence is insufficient, and not_evaluated only when genuinely not assessed.',
    'If a meaningful true connection cannot be expressed by the listed new relationship types, preserve it under newRelationshipNeeded for later review rather than forcing it.',
    '',
    'Allowed NEW relationship types:',
    ...allowed.map(x=>`- ${x}`),
    '',
    'Return JSON only:',
    '{"assertions":[{"relationshipType":"...","tag":"...","state":"present|absent|uncertain|not_evaluated","confidence":"high|medium|low","evidence":"brief evidence"}],"newTags":["..."],"newRelationshipNeeded":[{"proposedRelationshipType":"...","tag":"...","reason":"..."}],"rawNotes":[]}'
  ].join('\n');
}
function request(subject,shard){
  return {
    schemaVersion:1,
    kind:'emojeo-step3-delta-backfill-assertion',
    subject:{id:`${subject.glyph}:${subject.name}`,glyph:subject.glyph,name:subject.name},
    domain:shard.domain,
    relationshipTypes:shard.relationships.map(x=>x.relationshipType),
    prompt:prompt(subject,shard)
  };
}
function openDb(){
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};
    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
  });
}
async function dbGet(id){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).get(id);
    r.onsuccess=()=>resolve(r.result||null);
    r.onerror=()=>reject(r.error);
  });
}
async function dbPut(value){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put(value);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
const sleep=(ms,signal)=>new Promise((resolve,reject)=>{
  const id=setTimeout(resolve,ms);
  signal?.addEventListener('abort',()=>{clearTimeout(id);reject(new DOMException('Aborted','AbortError'))},{once:true});
});
async function callWithRetry(payload,signal,onRetry){
  const api=globalThis.GenreactrixCloudApi;
  if(!api?.emojeoSemanticDiscovery)throw new Error('Semantic Discovery Worker adapter unavailable.');
  let attempt=0;
  for(;;){
    if(signal?.aborted)throw new DOMException('Aborted','AbortError');
    try{return await api.emojeoSemanticDiscovery(payload,undefined,{signal})}
    catch(e){
      if(signal?.aborted||e?.name==='AbortError')throw e;
      attempt++;
      if(attempt>=6)throw e;
      const delay=Math.min(30000,2000*Math.pow(2,Math.min(attempt-1,4)));
      onRetry?.({attempt,delay,error:e});
      await sleep(delay,signal);
    }
  }
}
function completedSubjects(){
  if(!job)return 0;
  return Math.floor(job.results.length/job.shards.length);
}
function currentSubjectIndex(){
  if(!job)return 0;
  return Math.floor(job.results.length/job.shards.length);
}
function currentShardIndex(){
  if(!job)return 0;
  return job.results.length%job.shards.length;
}
function setStatus(text){$('status').textContent=text}
function render(){
  if(!job){
    $('summary').textContent='Load emojeo-step3-recovered-2026-09-23T04-12-14-359Z.json.';
    for(const id of ['run1','run3','run10','runall','stop','download'])$(id).disabled=true;
    return;
  }
  const subjectDone=completedSubjects(),subjectTotal=job.subjects.length;
  const callDone=job.results.length,callTotal=subjectTotal*job.shards.length;
  const pct=callTotal?(callDone/callTotal*100).toFixed(2):'0.00';
  $('summary').innerHTML=`<span class="good">${subjectDone}/${subjectTotal} old emoji backfilled</span> · ${callDone}/${callTotal} shard calls saved · ${pct}% · ${job.relationshipCount} new relationships`;
  $('run1').disabled=running||subjectDone>=subjectTotal;
  $('run3').disabled=running||subjectDone<1||subjectDone>=3||subjectDone>=subjectTotal;
  $('run10').disabled=running||subjectDone<3||subjectDone>=10||subjectDone>=subjectTotal;
  $('runall').disabled=running||subjectDone<10||subjectDone>=subjectTotal;
  $('stop').disabled=!running;
  $('download').disabled=!job.results.length;
}
async function runTo(target){
  if(running||!job)return;
  const totalSubjects=job.subjects.length,startDone=completedSubjects();
  const stopSubject=target==='all'?totalSubjects:Math.min(totalSubjects,target==='next'?startDone+1:Number(target));
  if(!Number.isFinite(stopSubject)||stopSubject<=startDone)return;
  running=true;aborter=new AbortController();render();
  try{
    const stopCalls=stopSubject*job.shards.length;
    while(job.results.length<stopCalls){
      if(aborter.signal.aborted)break;
      const si=currentSubjectIndex(),di=currentShardIndex(),subject=job.subjects[si],shard=job.shards[di];
      setStatus(`Backfilling ${si+1}/${totalSubjects} · ${subject.glyph} ${subject.name}\nShard ${di+1}/${job.shards.length} · ${shard.relationships.length} new relationships…`);
      const envelope=await callWithRetry(request(subject,shard),aborter.signal,r=>{
        setStatus(`Retry ${r.attempt}/5 in ${Math.round(r.delay/1000)}s · ${subject.glyph} ${subject.name} · shard ${di+1}/${job.shards.length}\n${r.error?.message||r.error}`);
      });
      const result=normalizeResult(envelope?.result||envelope,subject,shard);
      job.results.push(result);
      job.updatedAt=new Date().toISOString();
      await dbPut(job);
      render();
    }
    if(completedSubjects()===totalSubjects)setStatus('DELTA BACKFILL COMPLETE · 79/79 · Download the backfilled JSON.');
    else if(aborter.signal.aborted)setStatus('STOPPED · every completed shard is saved.');
    else setStatus(`CHECKPOINT REACHED · ${completedSubjects()}/${totalSubjects} subjects complete · download and inspect before the next gate.`);
  }catch(e){
    if(e?.name==='AbortError')setStatus('STOPPED · every completed shard is saved.');
    else setStatus(`STOPPED · ${e?.message||e}`);
  }finally{
    running=false;render();
  }
}
function stop(){aborter?.abort()}
function download(){
  if(!job||!input)return;
  const present=job.results.flatMap(x=>x.assertions||[]).filter(x=>x.state==='present').length;
  const out={
    ...input,
    deltaBackfillSchemaVersion:1,
    deltaBackfillKind:'emojeo-step3-v013-ontology-delta-backfill',
    deltaBackfillCreatedAt:new Date().toISOString(),
    deltaBackfillRelationshipCount:job.relationshipCount,
    deltaBackfillShardCount:job.shards.length,
    deltaBackfillCompletedShardCalls:job.results.length,
    deltaBackfillSubjectCount:job.subjects.length,
    deltaBackfillCompletedSubjects:completedSubjects(),
    deltaBackfillPresentAssertionCount:present,
    deltaBackfillStrategy:`fresh Semantic Discovery; only ${job.relationshipCount} v013 additions; ${job.shards.length} deterministic shards of at most ${SHARD_SIZE}; original results and recoveryResults preserved; item-level IndexedDB checkpointing; gated 1 -> 3 -> 10 -> 79`,
    deltaBackfillResults:job.results
  };
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`emojeo-step3-delta-backfilled-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
  document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
}
async function loadFile(file){
  input=JSON.parse(await file.text());
  if(Number(input?.completedUnits)!==Number(input?.totalUnits)||Number(input?.completedUnits)!==6399)throw new Error(`Expected completed 6399/6399 Step 3 JSON; file is ${input?.completedUnits||0}/${input?.totalUnits||0}`);
  if(!Array.isArray(input?.recoveryResults)||input.recoveryResults.length!==79)throw new Error(`Expected the completed recovered JSON with 79 recoveryResults; found ${input?.recoveryResults?.length||0}`);
  spec=await loadJson('Emojeo_STEP3_Delta_Backfill_v013_RunSpec.json');
  const relationships=Array.isArray(spec?.relationshipDelta)?spec.relationshipDelta:[];
  if(relationships.length!==354)throw new Error(`RunSpec relationship delta mismatch: expected 354, found ${relationships.length}`);
  const subjects=(spec.subjects||[]).map(s=>({glyph:clean(s.glyph),name:clean(s.name)}));
  if(subjects.length!==79)throw new Error(`RunSpec subject mismatch: expected 79, found ${subjects.length}`);
  const recoveredSubjects=input.recoveryResults.map(x=>x.subject||{});
  for(let i=0;i<79;i++){
    if(subjectKey(subjects[i])!==subjectKey(recoveredSubjects[i]))throw new Error(`Subject order mismatch at ${i+1}: RunSpec ${subjects[i].glyph} ${subjects[i].name} vs recovered JSON ${recoveredSubjects[i]?.glyph||''} ${recoveredSubjects[i]?.name||''}`);
  }
  const shards=buildShards(relationships);
  const id=fingerprint(input,file);
  const prior=await dbGet(id);
  if(prior&&(prior.relationshipCount!==354||prior.shards?.length!==shards.length))throw new Error('Saved checkpoint does not match the current v013 delta RunSpec.');
  job=prior||{
    id,
    schemaVersion:1,
    kind:'emojeo-step3-delta-backfill-job',
    batchId:spec.batchId,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    relationshipCount:354,
    candidateEvaluationCount:27966,
    subjects,
    shards,
    results:[]
  };
  job.subjects=subjects;job.shards=shards;job.relationshipCount=354;job.results=Array.isArray(job.results)?job.results:[];
  await dbPut(job);
  if(job.results.length){
    setStatus(`RESUMED · ${completedSubjects()}/79 subjects complete · ${job.results.length}/${79*shards.length} shard calls already saved.`);
  }else{
    setStatus(`READY · 79 old emoji · 354 new relationships · ${shards.length} shards/emoji · 27,966 candidate relationship evaluations.\nFirst gate: RUN NEXT 1.`);
  }
  render();
}

$('file').addEventListener('change',async e=>{
  try{
    const f=e.target.files?.[0];if(!f)return;
    await loadFile(f);
  }catch(err){
    input=null;spec=null;job=null;
    setStatus(`LOAD FAILED · ${err?.message||err}`);
    render();
  }
});
$('run1').addEventListener('click',()=>runTo('next'));
$('run3').addEventListener('click',()=>runTo(3));
$('run10').addEventListener('click',()=>runTo(10));
$('runall').addEventListener('click',()=>runTo('all'));
$('stop').addEventListener('click',stop);
$('download').addEventListener('click',download);
render();

})();
