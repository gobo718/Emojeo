/* Emojeo Step 3 Delta Backfill — Pass 55
   Pass 54 generated useful fresh raw notes but the Semantic Discovery route's
   structured schema is observations/rawNotes, not relationship assertions.
   Pass 55 preserves those shard calls, then normalizes/reconciles each emoji's
   12 new-note shards through the proven /api/emojeo/step3-recovery/subject route.
   Existing IndexedDB Pass 54 discovery checkpoints are reused. */
(()=>{'use strict';

const $=id=>document.getElementById(id);
const clean=v=>String(v??'').trim();
const clone=v=>v==null?v:structuredClone(v);
const DB_NAME='emojeo-step3-delta-backfill-v1'; // intentionally unchanged: resume Pass 54
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
function normalizeDiscoveryResult(raw,subject,shard){
  const body=parseJsonish(raw?.rawDiscovery||raw?.result||raw);
  return {
    schemaVersion:1,
    kind:'emojeo-step3-delta-backfill-discovery-shard',
    subject:clone(subject),
    shardId:shard.id,
    shardDomain:shard.domain,
    relationshipTypes:shard.relationships.map(x=>x.relationshipType),
    observations:Array.isArray(body.observations)?body.observations:[],
    summary:clean(body.summary),
    ambiguities:Array.isArray(body.ambiguities)?body.ambiguities:[],
    rawNotes:Array.isArray(body.rawNotes)?body.rawNotes:(Array.isArray(body.notes)?body.notes:[]),
    provider:raw?.provider||null,
    completedAt:new Date().toISOString()
  };
}
function prompt(subject,shard){
  const allowed=shard.relationships.map(x=>x.definition?`${x.relationshipType} — ${x.definition}`:x.relationshipType);
  return [
    'EMOJEO STEP 3 V013 DELTA BACKFILL DISCOVERY v2',
    `Subject: ${subject.glyph} ${subject.name}`,
    `Relationship shard: ${shard.domain}`,
    '',
    'This is a fresh DELTA-ONLY discovery pass.',
    'Explore whether this emoji has meaningful connections covered by the NEW relationship types listed below.',
    'Do not reevaluate or replace the old 857 relationship types.',
    'The tag vocabulary is open: identify exact semantic targets/values that would matter if a listed relationship applies.',
    'Preserve broad and narrow true possibilities, odd specific possibilities, ambiguity, and evidence-bearing notes.',
    'Do not force a connection where none exists.',
    'These raw notes will be normalized and reconciled in a separate mapper stage, so preserve useful evidence rather than trying to make the notes look canonical.',
    '',
    'NEW relationship types to investigate:',
    ...allowed.map(x=>`- ${x}`)
  ].join('\n');
}
function request(subject,shard){
  return {
    schemaVersion:1,
    kind:'emojeo-step3-delta-backfill-discovery',
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
async function callRecoveryMapper(subject,units,signal){
  const api=globalThis.GenreactrixCloudApi;
  const b=clean(api?.getBaseUrl?.()),k=clean(api?.getKey?.());
  if(!b)throw new Error('AI Worker URL is not configured in this browser');
  if(!k)throw new Error('Analysis key is not configured in this browser');
  const relationshipDomains=job.shards.map(s=>({
    domain:s.domain,
    relationshipTypes:s.relationships.map(x=>x.relationshipType)
  }));
  const r=await fetch(`${b}/api/emojeo/step3-recovery/subject`,{
    method:'POST',
    headers:{'content-type':'application/json','x-analysis-key':k},
    body:JSON.stringify({
      schemaVersion:1,
      subject:clone(subject),
      units:units.map(x=>({domain:x.shardDomain,rawNotes:Array.isArray(x.rawNotes)?x.rawNotes:[]})),
      relationshipDomains
    }),
    signal
  });
  const payload=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(payload.error||`Delta mapper request failed (${r.status})`);
  const result=payload?.result;
  if(!result||!Array.isArray(result.assertions))throw new Error('Delta mapper returned no structured assertions array.');
  return result;
}
function mappedSubjects(){return Array.isArray(job?.mapped)?job.mapped.length:0}
function discoveredShardCalls(){return Array.isArray(job?.results)?job.results.length:0}
function discoveredSubjects(){return job?Math.floor(discoveredShardCalls()/job.shards.length):0}
function setStatus(text){$('status').textContent=text}
function render(){
  if(!job){
    $('summary').textContent='Load emojeo-step3-recovered-2026-09-23T04-12-14-359Z.json.';
    for(const id of ['run1','run3','run10','runall','stop','download'])$(id).disabled=true;
    return;
  }
  const done=mappedSubjects(),subjectTotal=job.subjects.length;
  const shardDone=discoveredShardCalls(),shardTotal=subjectTotal*job.shards.length;
  const present=(job.mapped||[]).reduce((n,r)=>n+(r?.assertions||[]).filter(x=>x?.state==='present').length,0);
  $('summary').innerHTML=`<span class="good">${done}/${subjectTotal} old emoji backfilled</span> · ${shardDone}/${shardTotal} discovery shards saved · ${present} accepted PRESENT assertions · ${job.relationshipCount} new relationships`;
  $('run1').disabled=running||done>=subjectTotal;
  $('run3').disabled=running||done<1||done>=3||done>=subjectTotal;
  $('run10').disabled=running||done<3||done>=10||done>=subjectTotal;
  $('runall').disabled=running||done<10||done>=subjectTotal;
  $('stop').disabled=!running;
  $('download').disabled=!done;
}
async function ensureDiscoveryForSubject(si){
  const subject=job.subjects[si];
  const start=si*job.shards.length,end=(si+1)*job.shards.length;
  if(job.results.length<start)throw new Error(`Discovery checkpoint gap before subject ${si+1}.`);
  while(job.results.length<end){
    if(aborter.signal.aborted)throw new DOMException('Aborted','AbortError');
    const di=job.results.length-start,shard=job.shards[di];
    setStatus(`DISCOVERY · ${si+1}/${job.subjects.length} · ${subject.glyph} ${subject.name}\nShard ${di+1}/${job.shards.length} · ${shard.relationships.length} new relationships…`);
    const envelope=await callWithRetry(request(subject,shard),aborter.signal,r=>{
      setStatus(`DISCOVERY RETRY ${r.attempt}/5 in ${Math.round(r.delay/1000)}s · ${subject.glyph} ${subject.name} · shard ${di+1}/${job.shards.length}\n${r.error?.message||r.error}`);
    });
    job.results.push(normalizeDiscoveryResult(envelope?.result||envelope,subject,shard));
    job.updatedAt=new Date().toISOString();
    await dbPut(job);render();
  }
  return job.results.slice(start,end);
}
async function runTo(target){
  if(running||!job)return;
  const totalSubjects=job.subjects.length,startDone=mappedSubjects();
  const stopSubject=target==='all'?totalSubjects:Math.min(totalSubjects,target==='next'?startDone+1:Number(target));
  if(!Number.isFinite(stopSubject)||stopSubject<=startDone)return;
  running=true;aborter=new AbortController();render();
  try{
    for(let si=startDone;si<stopSubject;si++){
      const subject=job.subjects[si];
      const units=await ensureDiscoveryForSubject(si);
      if(aborter.signal.aborted)break;
      setStatus(`MAPPER + RECONCILIATION · ${si+1}/${totalSubjects} · ${subject.glyph} ${subject.name}\nNormalizing the 12 fresh delta-note shards against the 354 approved relationship types…`);
      const mapped=await callRecoveryMapper(subject,units,aborter.signal);
      job.mapped.push(mapped);
      job.updatedAt=new Date().toISOString();
      await dbPut(job);render();
    }
    if(mappedSubjects()===totalSubjects)setStatus('DELTA BACKFILL COMPLETE · 79/79 · Download the backfilled JSON.');
    else if(aborter.signal.aborted)setStatus('STOPPED · every completed discovery shard and mapped subject is saved.');
    else setStatus(`CHECKPOINT REACHED · ${mappedSubjects()}/${totalSubjects} subjects backfilled · download and inspect before the next gate.`);
  }catch(e){
    if(e?.name==='AbortError')setStatus('STOPPED · every completed discovery shard and mapped subject is saved.');
    else setStatus(`STOPPED · ${e?.message||e}`);
  }finally{
    running=false;render();
  }
}
function stop(){aborter?.abort()}
function download(){
  if(!job||!input)return;
  const present=(job.mapped||[]).reduce((n,r)=>n+(r?.assertions||[]).filter(x=>x?.state==='present').length,0);
  const out={
    ...input,
    deltaBackfillSchemaVersion:2,
    deltaBackfillKind:'emojeo-step3-v013-ontology-delta-backfill',
    deltaBackfillCreatedAt:new Date().toISOString(),
    deltaBackfillRelationshipCount:job.relationshipCount,
    deltaBackfillShardCount:job.shards.length,
    deltaBackfillCompletedDiscoveryShardCalls:job.results.length,
    deltaBackfillSubjectCount:job.subjects.length,
    deltaBackfillCompletedSubjects:mappedSubjects(),
    deltaBackfillPresentAssertionCount:present,
    deltaBackfillStrategy:`Pass 55 two-stage delta backfill: fresh Semantic Discovery over only ${job.relationshipCount} v013 additions in ${job.shards.length} deterministic shards, then proven Step 3 recovery mapper/reconciliation over those fresh raw notes; original results and recoveryResults preserved; IndexedDB checkpointing; gated 1 -> 3 -> 10 -> 79`,
    deltaBackfillDiscoveryResults:job.results,
    deltaBackfillResults:job.mapped
  };
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`emojeo-step3-delta-backfilled-pass55-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
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
  const shards=buildShards(relationships),id=fingerprint(input,file),prior=await dbGet(id);
  if(prior&&(prior.relationshipCount!==354||prior.shards?.length!==shards.length))throw new Error('Saved checkpoint does not match the current v013 delta RunSpec.');
  job=prior||{
    id,schemaVersion:2,kind:'emojeo-step3-delta-backfill-job',
    batchId:spec.batchId,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    relationshipCount:354,candidateEvaluationCount:27966,subjects,shards,results:[],mapped:[]
  };
  job.schemaVersion=2;
  job.subjects=subjects;job.shards=shards;job.relationshipCount=354;
  job.results=Array.isArray(job.results)?job.results:[];
  job.mapped=Array.isArray(job.mapped)?job.mapped:[];
  // Pass 54 rows used a different kind but already contain the fresh rawNotes we need.
  job.results=job.results.map((r,i)=>({
    ...r,
    kind:'emojeo-step3-delta-backfill-discovery-shard',
    observations:Array.isArray(r.observations)?r.observations:[],
    summary:clean(r.summary),
    ambiguities:Array.isArray(r.ambiguities)?r.ambiguities:[],
    rawNotes:Array.isArray(r.rawNotes)?r.rawNotes:[]
  }));
  await dbPut(job);
  if(job.mapped.length){
    setStatus(`RESUMED · ${job.mapped.length}/79 subjects fully backfilled · ${job.results.length}/${79*shards.length} fresh discovery shards saved.`);
  }else if(job.results.length){
    setStatus(`PASS 54 CHECKPOINT RECOVERED · ${job.results.length}/${79*shards.length} fresh discovery shards already saved.\nNo discovery work will be repeated. Press RUN NEXT 1 to normalize/reconcile the first emoji.`);
  }else{
    setStatus(`READY · 79 old emoji · 354 new relationships · ${shards.length} discovery shards/emoji · 27,966 candidate relationship evaluations.\nFirst gate: RUN NEXT 1.`);
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
