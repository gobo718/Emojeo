/* Emojeo Step 4 Typed-Predicate Pilot Runner — Pass 70 */
(()=>{'use strict';

const $=id=>document.getElementById(id), clean=v=>String(v??'').trim(), clone=v=>v==null?v:structuredClone(v);
const INPUTS={universe:'Emojeo_STEP4_Assertion_Universe_v001.json',prefill:'Emojeo_STEP4_Prefill_v001.json',runSpec:'Emojeo_STEP4_RunSpec_v001.json',ontology:'Emojeo_STEP3_Semantic_Inventory_1211_v013.json'};
const DB_NAME='emojeo-step4-sparse-v2',DB_VERSION=1,JOB_STORE='jobs',SCREEN_STORE='screen',VERIFY_STORE='verify';
const JOB_ID='step4-sparse-v2:e6ce04292d86009705814c8b8a09105a58fa5709440d2c11aa3f636641b87a3b';
const SCREEN_BATCH_SIZE=6,VERIFY_BATCH_SIZE=30,CONCURRENCY=4,PILOT_ASSERTIONS=24;
let universe=null,prefill=null,runSpec=null,ontology=null,ontologySha256=null,assertionById=new Map(),assertionIndexById=new Map(),lockedStateByCell=new Map(),relationshipMetaByType=new Map();
let job=null,screenRecords=[],verifyRecords=[],running=false,stopRequested=false;

async function fetchText(url){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error(`${url} load failed (${r.status})`);return r.text()}
async function sha256Hex(text){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(JOB_STORE))db.createObjectStore(JOB_STORE,{keyPath:'id'});if(!db.objectStoreNames.contains(SCREEN_STORE)){const s=db.createObjectStore(SCREEN_STORE,{keyPath:'id'});s.createIndex('jobId','jobId',{unique:false})}if(!db.objectStoreNames.contains(VERIFY_STORE)){const s=db.createObjectStore(VERIFY_STORE,{keyPath:'id'});s.createIndex('jobId','jobId',{unique:false})}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function dbGet(store,id){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function dbPut(store,value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function dbGetByJob(store,jobId){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).index('jobId').getAll(jobId);r.onsuccess=()=>resolve(Array.isArray(r.result)?r.result:[]);r.onerror=()=>reject(r.error)})}
function cellKey(si,aid){return `${si}|${aid}`} function screenBatchId(start){return `${JOB_ID}|screen|${start}`} function verifyRecordId(si,ids){return `${JOB_ID}|verify|${si}|${ids[0]}|${ids.at(-1)}|${ids.length}`}
function setStatus(t){$('status').textContent=t} function screenRecordMap(){return new Map(screenRecords.map(r=>[r.startAssertionIndex,r]))}
function screenedAssertionIds(limit=1278){const out=new Set();for(const r of screenRecords)for(const x of (r.assertions||[])){const ai=assertionIndexById.get(x.assertionId);if(Number.isInteger(ai)&&ai<limit)out.add(x.assertionId)}return out}
function candidateCellSet(limit=1278){const out=new Set();for(const r of screenRecords)for(const x of (r.assertions||[])){const ai=assertionIndexById.get(x.assertionId);if(!Number.isInteger(ai)||ai>=limit)continue;for(const si of (x.candidateSubjectIndexes||[]))out.add(cellKey(si,x.assertionId))}return out}
function scopeComplete(limit){if(screenedAssertionIds(limit).size!==limit)return false;const c=candidateCellSet(limit),v=verifiedCellMap();for(const k of c)if(!v.has(k))return false;return true}
function render(){
  if(!job||!universe){for(const id of ['pilot','full','stop','download'])$(id).disabled=true;return}
  const screened=screenedAssertionIds().size,cand=candidateCellSet(),ver=verifiedCellMap(),pending=pendingProviderFailureMap(),historical=historicalVerifiedCellSet();
  let verified=0;for(const k of cand)if(ver.has(k))verified++;
  let pendingCount=0;for(const k of cand)if(!ver.has(k)&&pending.has(k))pendingCount++;
  let historicalCount=0;for(const k of cand)if(historical.has(k))historicalCount++;
  const p=scopeComplete(PILOT_ASSERTIONS);
  $('summary').innerHTML=`<span class="good">${screened.toLocaleString()}/1,278 assertions screened</span> · ${cand.size.toLocaleString()} sparse candidate cells · ${verified.toLocaleString()} Pass 70 verified · ${pendingCount.toLocaleString()} provider-failure pending · ${historicalCount.toLocaleString()} older cells quarantined · 4-way concurrency`;
  $('pilot').disabled=running||p;
  $('full').disabled=true;
  $('stop').disabled=!running;
  $('download').disabled=screenRecords.length===0;
}
function subjectsCompact(){return runSpec.subjects.map((s,i)=>`S${String(i).padStart(2,'0')}=${s.glyph} ${s.name}`).join('\n')}
function lockedSubjectSet(aid){const s=new Set();for(let si=0;si<79;si++)if(lockedStateByCell.has(cellKey(si,aid)))s.add(si);return s}
function seedText(a){return (a.seedSources||[]).slice(0,3).map(x=>`${x.subject?.glyph||''} ${x.subject?.name||''}=${String(x.state||'').toUpperCase()}`).join('; ')||'none'}
function relationshipMeta(a){const m=relationshipMetaByType.get(a.relationshipType);if(!m)throw new Error(`Missing ontology definition for ${a.relationshipType}`);return m}
function screeningPrompt(assertions,repair=''){
 return ['EMOJEO STEP 4 HIGH-RECALL TYPED-PREDICATE SCREEN v70','',
 'Use the normal Semantic Discovery observation structure. Produce ONE observation per fixed assertion.',
 'For each observation: phrase MUST be the assertion ID. dimension MUST be step4_sparse_screen.',
 'description MUST contain: C=[subject numbers] ; N=[subject numbers] ; R=brief rationale.',
 'C = every NONLOCKED emoji with a recognizable, defensible semantic route that could satisfy THIS EXACT RELATIONSHIP PREDICATE and tag as PRESENT or UNCERTAIN. HIGH RECALL: include legitimate conditional/sometimes-true semantic links.',
 'Do NOT include an emoji merely because you can invent a scenario in which the emoji and tag happen to coexist or interact.',
 'Do NOT bend the relationship type. A connection that really belongs under a different predicate is not support for this assertion.',
 'N = only a genuinely unjudgeable case caused by ambiguity or missing semantic information. If support would require inventing outside context, that is ABSENT, not N.',
 'Every other nonlocked emoji is treated as ABSENT. Do not list locked subjects in C or N.',
 'Ontology domain is descriptive context, not a hard applicability gate; the relationship definition controls.',
 'Use numbers 0..78 only inside C/N. Do not create/rename relationships or rewrite tags.',
 repair?`REPAIR NOTE: ${repair}`:'','SUBJECTS',subjectsCompact(),'','ASSERTIONS',
 ...assertions.map(a=>{const m=relationshipMeta(a);return `${a.assertionId}|${a.relationshipType}|${a.tag}\nDOMAIN=${m.domain||'(none)'}\nDEFINITION=${m.definition}\nLOCKED=${[...lockedSubjectSet(a.assertionId)].join(',')||'-'}\nSEEDS=${seedText(a)}`})
 ].filter(Boolean).join('\n')
}
function semanticScreenRequest(assertions,repair=''){return{schemaVersion:1,kind:'emojeo-step4-sparse-screen-v70',subject:{id:'step4-sparse-screen',glyph:'🔎',name:'Step 4 sparse screen'},domain:'Step 4 typed-predicate high-recall screen',relationshipTypes:[...new Set(assertions.map(a=>a.relationshipType))],assertionIds:assertions.map(a=>a.assertionId),prompt:screeningPrompt(assertions,repair)}}
function collectStrings(v,out=[]){if(typeof v==='string'){out.push(v);return out}if(Array.isArray(v)){for(const x of v)collectStrings(x,out);return out}if(v&&typeof v==='object')for(const [k,x] of Object.entries(v)){if(['provider','completedAt','schemaVersion','kind','subject'].includes(k))continue;collectStrings(x,out)}return out}
function collectObjects(v,out=[]){if(Array.isArray(v)){for(const x of v)collectObjects(x,out);return out}if(v&&typeof v==='object'){out.push(v);for(const x of Object.values(v))collectObjects(x,out)}return out}
function nums(s){if(!s)return[];return [...new Set((String(s).match(/\b(?:S)?(\d{1,2})\b/g)||[]).map(x=>Number(x.replace(/^S/i,''))).filter(x=>Number.isInteger(x)&&x>=0&&x<=78))].sort((a,b)=>a-b)}
function parseCN(text){
 const t=String(text||'');
 const cm=t.match(/\bC(?:ANDIDATES?)?\s*[:=]\s*\[?([^\];|\n]*)\]?/i);
 const nm=t.match(/\bN(?:OT[_ -]?EVALUATED)?\s*[:=]\s*\[?([^\];|\n]*)\]?/i);
 return {C:cm?nums(cm[1]):[],N:nm?nums(nm[1]):[],matched:Boolean(cm||nm)}
}
function parseOneAssertionFromEnvelope(envelope,a){
 const aid=a.assertionId,locked=lockedSubjectSet(aid),chunks=[];
 for(const o of collectObjects(envelope?.result??envelope,[])){
   const phrase=clean(o.phrase||o.title||o.name||o.label),desc=clean(o.description||o.summary||o.text||o.note);
   if(phrase.toUpperCase().includes(aid)||desc.toUpperCase().includes(aid))chunks.push(`${phrase}\n${desc}\n${clean(o.evidence)}`);
 }
 for(const s of collectStrings(envelope?.result??envelope,[]))if(String(s).toUpperCase().includes(aid))chunks.push(String(s));
 if(!chunks.length && a.__singleFallback)chunks.push(...collectStrings(envelope?.result??envelope,[]));
 for(const chunk of chunks){
   const p=parseCN(chunk);if(!p.matched)continue;
   const C=p.C.filter(si=>!locked.has(si)),N=p.N.filter(si=>!locked.has(si)&&!p.C.includes(si));
   return {assertionId:aid,candidateSubjectIndexes:C,notEvaluatedSubjectIndexes:N,screenRationale:clean(chunk).slice(0,700),screenParseMode:a.__singleFallback?'single-fallback':'native-observation'};
 }
 return null
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function callSemantic(payload,onRetry){const api=globalThis.GenreactrixCloudApi;if(!api?.emojeoSemanticDiscovery)throw new Error('Semantic Discovery Worker adapter unavailable.');if(!clean(api.getBaseUrl?.()))throw new Error('AI Worker URL is not configured.');if(!clean(api.getKey?.()))throw new Error('Analysis key is not configured.');let n=0;for(;;){try{return await api.emojeoSemanticDiscovery(payload)}catch(e){n++;if(n>=6)throw e;const d=Math.min(30000,2000*Math.pow(2,Math.min(n-1,4)));onRetry?.({attempt:n,delay:d,error:e});await sleep(d)}}}
async function screenSingleFallback(a){
 const one={...a,__singleFallback:true};
 const env=await callSemantic(semanticScreenRequest([one],'Previous multi-assertion screen did not yield a parseable observation for this assertion. This is a ONE-ASSERTION fallback. Put C=[...] and N=[...] in the observation description.'),r=>setStatus(`SCREEN FALLBACK NETWORK RETRY ${r.attempt}/5 · ${a.assertionId}`));
 const parsed=parseOneAssertionFromEnvelope(env,one);
 if(parsed)return parsed;
 // Fail safe: never convert an unparseable screen into false ABSENTs.
 const locked=lockedSubjectSet(a.assertionId),all=[];for(let si=0;si<79;si++)if(!locked.has(si))all.push(si);
 return {assertionId:a.assertionId,candidateSubjectIndexes:all,notEvaluatedSubjectIndexes:[],screenRationale:'Pass 65 fail-safe: individual screen remained unparseable, so every nonlocked subject was sent to deep verification.',screenParseMode:'fail-safe-all-candidates'};
}
async function screenOneBatch(start,end){
 const assertions=universe.assertions.slice(start,end);
 const env=await callSemantic(semanticScreenRequest(assertions),r=>setStatus(`SCREEN NETWORK RETRY ${r.attempt}/5 · assertions ${start+1}-${end}`));
 const rows=[],missing=[];
 for(const a of assertions){const p=parseOneAssertionFromEnvelope(env,a);if(p)rows.push(p);else missing.push(a)}
 for(const a of missing){if(stopRequested)break;rows.push(await screenSingleFallback(a))}
 if(rows.length!==assertions.length)throw new Error(`Screen ${start+1}-${end} stopped before all assertions were checkpointable.`);
 rows.sort((a,b)=>assertionIndexById.get(a.assertionId)-assertionIndexById.get(b.assertionId));
 return{id:screenBatchId(start),kind:'emojeo-step4-sparse-screen-result-v70',jobId:JOB_ID,startAssertionIndex:start,endAssertionIndexExclusive:end,assertions:rows,completedAt:new Date().toISOString()}
}
function candidateSubjectIndexesForAssertion(aid,limit){
  const ai=assertionIndexById.get(aid);if(!Number.isInteger(ai)||ai>=limit)return [];
  const out=new Set();
  for(const r of screenRecords)for(const x of (r.assertions||[]))if(x.assertionId===aid){
    for(const si of (x.candidateSubjectIndexes||[]))if(!lockedStateByCell.has(cellKey(si,aid)))out.add(si);
  }
  return [...out].sort((a,b)=>a-b);
}
function cellVerifyRecordId(si,aid){return `${JOB_ID}|verify70|${si}|${aid}`}
function isPass70VerifiedCell(v){return Boolean(v&&v.verificationParseMode==='single-cell-typed-predicate-v70'&&['present','absent','uncertain','not_evaluated'].includes(v.state))}
function verifiedCellMap(){
  const m=new Map();
  for(const r of verifyRecords){
    if(r?.kind!=='emojeo-step4-cell-verify-result-v70')continue;
    const v=r.value;if(isPass70VerifiedCell(v))m.set(cellKey(r.subjectIndex,r.assertionId),v);
  }
  return m;
}
function historicalVerifiedCellSet(){
  const out=new Set();
  for(const r of verifyRecords){
    if(r?.kind==='emojeo-step4-cell-verify-result-v70')continue;
    const vals=[];
    if(Array.isArray(r?.cells))vals.push(...r.cells);
    if(Array.isArray(r?.values))vals.push(...r.values);
    if(r?.value&&typeof r.value==='object')vals.push(r.value);
    for(const v of vals){
      const mode=clean(v?.verificationParseMode);
      if(!mode||mode==='provider-failure-fallback-uncertain'||mode==='provider-failure-pending')continue;
      const si=Number.isInteger(v?.subjectIndex)?v.subjectIndex:r.subjectIndex,aid=v?.assertionId||r.assertionId;
      if(Number.isInteger(si)&&aid)out.add(cellKey(si,aid));
    }
  }
  return out;
}
function historicalVerificationRecordCount(){return verifyRecords.filter(r=>r?.kind!=='emojeo-step4-cell-verify-result-v70').length}
function pendingProviderFailureMap(){
  const m=new Map();
  for(const r of verifyRecords){
    if(r?.kind!=='emojeo-step4-cell-verify-result-v70')continue;
    const v=r.value;if(v?.verificationParseMode==='provider-failure-pending-v70')m.set(cellKey(r.subjectIndex,r.assertionId),v);
  }
  return m;
}
function cellVerificationPrompt(subject,a,attempt){
  const meta=relationshipMeta(a);
  return [
    'EMOJEO STEP 4 PASS 70 — TYPED-PREDICATE SINGLE-CELL VERIFICATION',
    `Emoji: ${subject.glyph} ${subject.name}`,
    `Fixed assertion: ${a.assertionId}|${a.relationshipType}|${a.tag}`,
    `Relationship domain: ${meta.domain||'(none)'}`,
    `Relationship definition: ${meta.definition}`,
    `Existing Step 3 seed context: ${seedText(a)}`,
    '',
    'Seed context explains the assertion lineage but is NOT proof for this emoji.',
    'Evaluate ONLY whether this exact emoji has a legitimate semantic relationship to the exact tag THROUGH THIS SPECIFIC RELATIONSHIP TYPE.',
    'The relationship definition controls. The ontology domain is descriptive context, NOT a hard gate.',
    'Do not rewrite the relationship type. Do not rewrite, broaden, narrow, or substitute the tag.',
    '',
    'IMPORTANT RECALL RULE: If an ordinary person could recognize a real, defensible semantic connection that satisfies this predicate, it may be PRESENT even when the relationship is conditional, only sometimes true, metaphorical, symbolic, conventional, cultural, functional, contextual, or not visually depicted.',
    'PRESENT does NOT mean universally true. Example principle: a condition may HAS_SYMPTOM something even if not every instance has that symptom.',
    '',
    'HARD FAILURE RULES:',
    '- ABSENT if the only way to make the assertion work is to invent a particular outside scenario, event, owner, gift, recipient, location, or other context not inherent/conventional to the emoji.',
    '- ABSENT if the evidence establishes a different relationship type but not this exact predicate.',
    '- Do not convert a possible consequence into a setting unless the emoji actually implies that environment/context.',
    '- Do not reward a clever story. Judge the typed semantic relationship itself.',
    '',
    'STATE CALIBRATION:',
    'PRESENT = a recognizable and defensible semantic route satisfies this exact predicate.',
    'ABSENT = the exact predicate is not satisfied, including invented-scenario-only connections.',
    'UNCERTAIN = there is a genuine semantic dispute/ambiguity about whether THIS predicate is satisfied. Do not use UNCERTAIN merely because a valid relationship is non-universal.',
    'NOT_EVALUATED = the meaning truly cannot be judged because essential semantic information is unavailable or incoherent. It is NOT a fallback for invented context.',
    '',
    'Before answering, silently perform this predicate-fit check: “Does this emoji satisfy the relationship definition toward this exact tag, or am I actually proving some other relation?”',
    '',
    'Use the normal Semantic Discovery JSON structure.',
    `Return one observation whose phrase is exactly "${a.assertionId}" and dimension is "other".`,
    'The observation description MUST begin: STATE=<PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED>; CONFIDENCE=<HIGH|MEDIUM|LOW>; EVIDENCE=',
    'EVIDENCE must name the actual semantic route in one concise sentence. For ABSENT, say why the exact predicate fails.',
    '',
    `Attempt ${attempt}/3. Another program reads STATE and CONFIDENCE mechanically, so preserve those exact labels.`
  ].join('\n');
}
function parseCellVerification(env,subject,a){
  const chunks=[];
  for(const o of collectObjects(env?.result??env,[])){
    const phrase=clean(o.phrase||o.title||o.name||o.label);
    const desc=clean(o.description||o.summary||o.text||o.note);
    const evidence=Array.isArray(o.evidence)?o.evidence.join(' '):clean(o.evidence);
    if(phrase.toUpperCase().includes(a.assertionId)||desc.toUpperCase().includes(a.assertionId)||/\bSTATE\s*[:=]/i.test(desc)){
      chunks.push({text:`${phrase}\n${desc}\n${evidence}`,confidence:o.confidence});
    }
  }
  for(const s of collectStrings(env?.result??env,[])){
    if(/\bSTATE\s*[:=]\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\b/i.test(String(s))){
      chunks.push({text:String(s),confidence:null});
    }
  }
  for(const c of chunks){
    const sm=c.text.match(/\bSTATE\s*[:=]\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\b/i);
    if(!sm)continue;
    const state=sm[1].toLowerCase();
    let confidence='medium';
    if(Number.isFinite(Number(c.confidence))){
      const n=Number(c.confidence);
      confidence=n>=.80?'high':n>=.45?'medium':'low';
    }
    const cm=c.text.match(/\bCONFIDENCE\s*[:=]\s*(HIGH|MEDIUM|LOW)\b/i);
    if(cm)confidence=cm[1].toLowerCase();
    const em=c.text.match(/\bEVIDENCE\s*[:=]\s*(.+)$/is);
    const evidence=em?clean(em[1]).slice(0,900):clean(c.text).slice(0,900);
    return {
      subjectIndex:subject.subjectIndex,
      assertionId:a.assertionId,
      state,confidence,
      evidence:evidence||'Single-cell native discovery classification.',
      verificationParseMode:'single-cell-typed-predicate-v70'
    };
  }
  return null;
}
async function verifyOneCell(si,aid){
  const subject=runSpec.subjects[si],a=assertionById.get(aid);
  let lastError='unparseable response';
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const env=await callSemantic({
        schemaVersion:1,
        kind:'emojeo-step4-single-cell-verify-v70',
        subject:{id:`${subject.glyph}:${subject.name}`,glyph:subject.glyph,name:subject.name},
        domain:'Step 4 typed-predicate single-cell verification',
        relationshipTypes:[a.relationshipType],
        assertionIds:[aid],
        prompt:cellVerificationPrompt(subject,a,attempt)
      },r=>setStatus(`CELL VERIFY NETWORK RETRY ${r.attempt}/5 · ${subject.glyph} ${subject.name} · ${aid}\n${r.error?.message||r.error}`));
      const parsed=parseCellVerification(env,{...subject,subjectIndex:si},a);
      if(parsed){
        return {
          id:cellVerifyRecordId(si,aid),
          kind:'emojeo-step4-cell-verify-result-v70',
          jobId:JOB_ID,subjectIndex:si,
          subject:{glyph:subject.glyph,name:subject.name},
          assertionId:aid,value:parsed,
          completedAt:new Date().toISOString()
        };
      }
      lastError='Semantic Discovery returned valid JSON but no parseable STATE label.';
    }catch(e){
      lastError=clean(e?.message||e);
    }
  }
  return {
    id:cellVerifyRecordId(si,aid),
    kind:'emojeo-step4-cell-verify-result-v70',
    jobId:JOB_ID,subjectIndex:si,
    subject:{glyph:subject.glyph,name:subject.name},
    assertionId:aid,
    value:{
      subjectIndex:si,assertionId:aid,state:'uncertain',confidence:'low',
      evidence:`Provider failure pending manual/retry review: ${lastError}`,
      verificationParseMode:'provider-failure-pending-v70'
    },
    providerFailurePending:true,
    completedAt:new Date().toISOString()
  };
}
async function runPool(tasks,worker,label){let next=0,done=0;async function lane(i){while(true){if(stopRequested)return;const n=next++;if(n>=tasks.length)return;setStatus(`${label} · ${done}/${tasks.length} request(s) complete · lane ${i+1}/${CONCURRENCY}`);await worker(tasks[n]);done++;render()}}await Promise.all(Array.from({length:Math.min(CONCURRENCY,tasks.length)},(_,i)=>lane(i)))}
async function runScreen(limit){const have=screenRecordMap(),tasks=[];for(let start=0;start<limit;start+=SCREEN_BATCH_SIZE)if(!have.has(start))tasks.push({start,end:Math.min(limit,start+SCREEN_BATCH_SIZE)});await runPool(tasks,async t=>{const rec=await screenOneBatch(t.start,t.end);await dbPut(SCREEN_STORE,rec);screenRecords.push(rec);job.lastCompleted={stage:'screen',start:t.start,end:t.end,at:rec.completedAt};await dbPut(JOB_STORE,job)},`ROBUST SPARSE SCREEN through ${limit}`)}
async function runVerify(limit){
  const ver=verifiedCellMap(),tasks=[];
  for(let ai=0;ai<limit;ai++){
    const aid=universe.assertions[ai].assertionId;
    for(const si of candidateSubjectIndexesForAssertion(aid,limit)){
      if(!ver.has(cellKey(si,aid)))tasks.push({si,aid});
    }
  }
  if(!tasks.length)return;
  await runPool(tasks,async t=>{
    const rec=await verifyOneCell(t.si,t.aid);
    await dbPut(VERIFY_STORE,rec);
    // Replace any earlier Pass 70 record for the same cell in memory; historical Pass 68/69 records remain quarantined.
    verifyRecords=verifyRecords.filter(x=>x.id!==rec.id);
    verifyRecords.push(rec);
    job.lastCompleted={stage:'cell-verify',subjectIndex:t.si,assertionId:t.aid,at:rec.completedAt};
    await dbPut(JOB_STORE,job);
  },`PASS 70 TYPED-PREDICATE VERIFY through ${limit}`);
}
async function runScope(limit){if(running)return;running=true;stopRequested=false;job.runIntent={active:true,limit,requestedAt:new Date().toISOString()};await dbPut(JOB_STORE,job);render();try{await runScreen(limit);if(stopRequested){job.runIntent.active=false;await dbPut(JOB_STORE,job);setStatus('STOPPED · in-flight screens checkpointed.');return}await runVerify(limit);if(stopRequested){job.runIntent.active=false;await dbPut(JOB_STORE,job);setStatus('STOPPED · in-flight verification checkpointed.');return}job.runIntent={active:false,completedAt:new Date().toISOString()};await dbPut(JOB_STORE,job);if(!scopeComplete(limit)){const cand=candidateCellSet(limit),ver=verifiedCellMap(),pending=pendingProviderFailureMap();const remaining=[...cand].filter(k=>!ver.has(k)).length,pendingCount=[...cand].filter(k=>pending.has(k)).length;setStatus(`PASS 70 PILOT NEEDS RETRY · ${remaining} candidate cell(s) are still unverified, including ${pendingCount} provider-failure pending.\nTap RUN PASS 70 PILOT again; completed Pass 70 cells will be preserved and only unfinished cells will retry.`);return}setStatus(limit===24?'PASS 70 PILOT COMPLETE · 24 assertions × all 79 emoji covered. Tap DOWNLOAD PASS 70 CHECKPOINT and upload that JSON here.':'STEP 4 COMPLETE · all 1,278 assertions × 79 emoji covered. Download final checkpoint JSON.')}catch(e){job.runIntent={active:false,limit,lastError:clean(e?.message||e),lastErrorAt:new Date().toISOString()};await dbPut(JOB_STORE,job).catch(()=>{});setStatus(`STOPPED ON ERROR · ${e?.message||e}\nRefresh/reopen Pass 70 to resume.`)}finally{running=false;stopRequested=false;render()}}
function screenByAid(){const m=new Map();for(const r of screenRecords)for(const x of (r.assertions||[]))m.set(x.assertionId,x);return m}
function buildAssignments(limit){
  const ver=verifiedCellMap(),sb=screenByAid(),out=[];
  for(let ai=0;ai<limit;ai++){
    const a=universe.assertions[ai],s=sb.get(a.assertionId);if(!s)continue;
    const C=new Set(s.candidateSubjectIndexes||[]),N=new Set(s.notEvaluatedSubjectIndexes||[]);
    for(let si=0;si<79;si++){
      const key=cellKey(si,a.assertionId),subject=runSpec.subjects[si],locked=lockedStateByCell.get(key);
      if(locked){out.push({...clone(locked),subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,source:'step3-locked-prefill'});continue}
      const v=ver.get(key);
      if(v){out.push({subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,state:v.state,confidence:v.confidence,evidence:v.evidence,source:'step4-pass70-typed-predicate-verification'});continue}
      if(C.has(si))continue;
      const inventedContextBucket=N.has(si);
      out.push({subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,state:'absent',confidence:'medium',evidence:inventedContextBucket?`Pass 70 interpretation of preserved sparse screen: support would require invented outside context, so the exact predicate is ABSENT. ${s.screenRationale}`:`Preserved high-recall sparse screen found no plausible support for the exact predicate. ${s.screenRationale}`,source:'step4-pass70-sparse-screen-absent'});
    }
  }
  return out.sort((x,y)=>x.subjectIndex-y.subjectIndex||assertionIndexById.get(x.assertionId)-assertionIndexById.get(y.assertionId));
}
async function downloadCheckpoint(){
  const full=scopeComplete(1278),pilot=scopeComplete(24),limit=full?1278:(pilot?24:Math.min(24,screenedAssertionIds().size)),assignments=buildAssignments(limit),counts={present:0,absent:0,uncertain:0,not_evaluated:0};
  for(const a of assignments)counts[a.state]=(counts[a.state]||0)+1;
  const cand=candidateCellSet(limit),ver=verifiedCellMap(),historical=historicalVerifiedCellSet(),pending=pendingProviderFailureMap();
  const activeVerificationResults=verifyRecords.filter(r=>r?.kind==='emojeo-step4-cell-verify-result-v70'&&assertionIndexById.get(r.assertionId)<limit);
  const out={
    schemaVersion:1,kind:'emojeo-step4-sparse-matrix-checkpoint',runnerVersion:'pass70',createdAt:new Date().toISOString(),
    strategy:{
      screening:'Preserved Pass 65 high-recall sparse screen used only as candidate generator; Pass 70 screen semantics used if a missing screen must be regenerated',
      verification:'Pass 70 one-cell typed-predicate verification using exact ontology definition and tag',
      semanticPolicy:'err on inclusion for legitimate predicate-fitting semantic links; reject invented scenarios and predicate bending',
      legacyNPolicy:'preserved screen N/invented-context-only noncandidates become ABSENT, not NOT_EVALUATED',
      ontologyDomainPolicy:'descriptive context, not a hard applicability gate',
      concurrency:4,providerFailurePolicy:'pending-not-counted-as-verified',fullRunLocked:true
    },
    inputs:{
      assertionUniverse:{file:INPUTS.universe,sha256:runSpec.inputs.assertionUniverse.sha256},
      prefill:{file:INPUTS.prefill,sha256:runSpec.inputs.prefill.sha256},
      ontology:{file:INPUTS.ontology,sha256:ontologySha256,relationshipCount:ontology.relationshipCount}
    },
    scopeAssertionCount:limit,scopeMatrixCellCount:limit*79,scopeComplete:scopeComplete(limit),screenedAssertionCount:screenedAssertionIds(limit).size,
    sparseCandidateCellCount:cand.size,pass70VerifiedCandidateCellCount:[...cand].filter(k=>ver.has(k)).length,providerFailurePendingCellCount:[...cand].filter(k=>!ver.has(k)&&pending.has(k)).length,
    quarantinedHistoricalVerificationCellCount:[...cand].filter(k=>historical.has(k)).length,quarantinedHistoricalVerificationRecordCount:historicalVerificationRecordCount(),
    assignmentCount:assignments.length,stateCounts:counts,
    screenResults:screenRecords.filter(r=>r.startAssertionIndex<limit).sort((a,b)=>a.startAssertionIndex-b.startAssertionIndex),
    verificationResults:activeVerificationResults,assignments
  };
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`emojeo-step4-sparse-pass70-${limit}assertions-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
}
async function initialize(){
  try{
    const [ut,pt,rt,ot]=await Promise.all([fetchText(INPUTS.universe),fetchText(INPUTS.prefill),fetchText(INPUTS.runSpec),fetchText(INPUTS.ontology)]);
    universe=JSON.parse(ut);prefill=JSON.parse(pt);runSpec=JSON.parse(rt);ontology=JSON.parse(ot);
    if(universe.assertionCount!==1278||prefill.lockedAssignmentCount!==1326||runSpec.scope?.subjectCount!==79)throw new Error('Pass 62 input mismatch.');
    if(ontology.relationshipCount!==1211||!Array.isArray(ontology.relationships))throw new Error('Pass 70 ontology mismatch; expected sealed 1,211 relationship types.');
    const [ush,psh,osh]=await Promise.all([sha256Hex(ut),sha256Hex(pt),sha256Hex(ot)]);ontologySha256=osh;
    if(ush!==runSpec.inputs.assertionUniverse.sha256||psh!==runSpec.inputs.prefill.sha256)throw new Error('Pass 62 input SHA mismatch.');
    for(const row of ontology.relationships){if(row?.relationshipType)relationshipMetaByType.set(row.relationshipType,{domain:clean(row.domain),definition:clean(row.definition)})}
    universe.assertions.forEach((a,i)=>{assertionById.set(a.assertionId,a);assertionIndexById.set(a.assertionId,i);if(!relationshipMetaByType.has(a.relationshipType))throw new Error(`Assertion ${a.assertionId} relationship ${a.relationshipType} is missing from the sealed ontology.`)});
    for(const a of prefill.assignments){const k=cellKey(a.subjectIndex,a.assertionId);if(lockedStateByCell.has(k))throw new Error(`Duplicate locked ${k}`);lockedStateByCell.set(k,clone(a))}
    job=await dbGet(JOB_STORE,JOB_ID)||{id:JOB_ID,kind:'emojeo-step4-sparse-job-v2',schemaVersion:1,createdAt:new Date().toISOString(),assertionUniverseSha256:ush,prefillSha256:psh,runIntent:{active:false}};
    job.ontologySha256=osh;await dbPut(JOB_STORE,job);
    [screenRecords,verifyRecords]=await Promise.all([dbGetByJob(SCREEN_STORE,JOB_ID),dbGetByJob(VERIFY_STORE,JOB_ID)]);
    job.runIntent={active:false,restoredBy:'pass70',restoredAt:new Date().toISOString()};await dbPut(JOB_STORE,job);
    const cand=candidateCellSet(PILOT_ASSERTIONS),valid=verifiedCellMap(),pending=pendingProviderFailureMap(),historical=historicalVerifiedCellSet();
    let historicalPilot=0;for(const k of cand)if(historical.has(k))historicalPilot++;
    setStatus(`READY FOR PASS 70 · restored ${screenedAssertionIds().size}/1,278 screened assertions and ${cand.size} pilot candidate cells.\n${historicalPilot} older Pass 68/69 candidate results are preserved but quarantined. ${valid.size} Pass 70 cells are active; ${pending.size} are provider-failure pending.\nTap RUN PASS 70 PILOT to reverify the pilot with the exact ontology predicate definitions.`);
    render();
  }catch(e){job=null;setStatus(`INITIALIZATION FAILED · ${e?.message||e}`);render()}
}
$('pilot').addEventListener('click',()=>runScope(24));$('full').addEventListener('click',()=>{});$('stop').addEventListener('click',async()=>{if(!running)return;stopRequested=true;if(job){job.runIntent={active:false,stopRequestedAt:new Date().toISOString()};await dbPut(JOB_STORE,job).catch(()=>{})}setStatus('STOP REQUESTED · no new requests will start; in-flight requests will finish and checkpoint.')});$('download').addEventListener('click',()=>downloadCheckpoint().catch(e=>setStatus(`DOWNLOAD FAILED · ${e?.message||e}`)));render();initialize();
})();