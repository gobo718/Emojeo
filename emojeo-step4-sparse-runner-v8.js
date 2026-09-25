/* Emojeo Step 4 Dual-Screen Adversarial Predicate Pilot Runner — Pass 71 */
(()=>{'use strict';

const $=id=>document.getElementById(id), clean=v=>String(v??'').trim(), clone=v=>v==null?v:structuredClone(v);
const INPUTS={universe:'Emojeo_STEP4_Assertion_Universe_v001.json',prefill:'Emojeo_STEP4_Prefill_v001.json',runSpec:'Emojeo_STEP4_RunSpec_v001.json',ontology:'Emojeo_STEP3_Semantic_Inventory_1211_v013.json'};
const DB_NAME='emojeo-step4-pass71',DB_VERSION=1,JOB_STORE='jobs',SCREEN_STORE='screen',VERIFY_STORE='verify';
const JOB_ID='step4-pass71:e6ce04292d86009705814c8b8a09105a58fa5709440d2c11aa3f636641b87a3b';
const SCREEN_BATCH_SIZE=1,CONCURRENCY=2,PILOT_ASSERTIONS=24,SCREEN_PASSES=['recall-a','recall-b'];
let universe=null,prefill=null,runSpec=null,ontology=null,ontologySha256=null,assertionById=new Map(),assertionIndexById=new Map(),lockedStateByCell=new Map(),relationshipMetaByType=new Map();
let job=null,screenRecords=[],verifyRecords=[],running=false,stopRequested=false;

async function fetchText(url){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error(`${url} load failed (${r.status})`);return r.text()}
async function sha256Hex(text){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(JOB_STORE))db.createObjectStore(JOB_STORE,{keyPath:'id'});if(!db.objectStoreNames.contains(SCREEN_STORE)){const s=db.createObjectStore(SCREEN_STORE,{keyPath:'id'});s.createIndex('jobId','jobId',{unique:false})}if(!db.objectStoreNames.contains(VERIFY_STORE)){const s=db.createObjectStore(VERIFY_STORE,{keyPath:'id'});s.createIndex('jobId','jobId',{unique:false})}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function dbGet(store,id){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function dbPut(store,value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function dbGetByJob(store,jobId){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),r=tx.objectStore(store).index('jobId').getAll(jobId);r.onsuccess=()=>resolve(Array.isArray(r.result)?r.result:[]);r.onerror=()=>reject(r.error)})}

function cellKey(si,aid){return `${si}|${aid}`}
function screenRecordId(ai,pass){return `${JOB_ID}|screen71|${pass}|${ai}`}
function setStatus(t){$('status').textContent=t}
function pass71ScreenRows(){return screenRecords.filter(r=>r?.kind==='emojeo-step4-sparse-screen-result-v71')}
function screenedAssertionIds(limit=1278){
  const by=new Map();
  for(const r of pass71ScreenRows()){
    const ai=Number(r.assertionIndex);
    if(!Number.isInteger(ai)||ai<0||ai>=limit)continue;
    if(!by.has(ai))by.set(ai,new Set());
    by.get(ai).add(r.screenPass);
  }
  const out=new Set();
  for(const [ai,passes] of by)if(SCREEN_PASSES.every(p=>passes.has(p)))out.add(universe.assertions[ai].assertionId);
  return out;
}
function candidateCellSet(limit=1278){
  const out=new Set();
  for(const r of pass71ScreenRows()){
    const ai=Number(r.assertionIndex);
    if(!Number.isInteger(ai)||ai<0||ai>=limit)continue;
    const aid=r.assertion?.assertionId||universe.assertions[ai]?.assertionId;
    if(!aid)continue;
    for(const si of (r.assertion?.candidateSubjectIndexes||[]))out.add(cellKey(si,aid));
  }
  return out;
}
function scopeComplete(limit){if(screenedAssertionIds(limit).size!==limit)return false;const c=candidateCellSet(limit),v=verifiedCellMap();for(const k of c)if(!v.has(k))return false;return true}

function render(){
  if(!job||!universe){for(const id of ['pilot','full','stop','download'])$(id).disabled=true;return}
  const screened=screenedAssertionIds().size,cand=candidateCellSet(),ver=verifiedCellMap(),pending=pendingProviderFailureMap();
  let verified=0;for(const k of cand)if(ver.has(k))verified++;
  let pendingCount=0;for(const k of cand)if(!ver.has(k)&&pending.has(k))pendingCount++;
  const p=scopeComplete(PILOT_ASSERTIONS);
  $('summary').innerHTML=`<span class="good">${screened.toLocaleString()}/1,278 assertions dual-screened</span> · ${cand.size.toLocaleString()} union candidate cells · ${verified.toLocaleString()} Pass 71 verified · ${pendingCount.toLocaleString()} provider-failure pending · 2-cell / up to 4-provider concurrency`;
  $('pilot').disabled=running||p;
  $('full').disabled=true;
  $('stop').disabled=!running;
  $('download').disabled=screenRecords.length===0;
}
function subjectsCompact(){return runSpec.subjects.map((s,i)=>`S${String(i).padStart(2,'0')}=${s.glyph} ${s.name}`).join('\n')}
function lockedSubjectSet(aid){const s=new Set();for(let si=0;si<79;si++)if(lockedStateByCell.has(cellKey(si,aid)))s.add(si);return s}
function seedText(a){return (a.seedSources||[]).slice(0,3).map(x=>`${x.subject?.glyph||''} ${x.subject?.name||''}=${String(x.state||'').toUpperCase()}`).join('; ')||'none'}
function relationshipMeta(a){const m=relationshipMetaByType.get(a.relationshipType);if(!m)throw new Error(`Missing ontology definition for ${a.relationshipType}`);return m}

function predicateContract(a){
  const t=a.relationshipType,tag=a.tag;
  const common='Apply the exact ontology predicate to the exact tag. Semantic inference is allowed only when THIS predicate licenses it. A recognizable conditional relationship may count; an invented scenario may not.';
  const rules={
    HAS_EXPRESSION:'VISIBLE-EXPRESSION CONTRACT: the expression itself must be visually represented by the emoji. Symbolic emotion, likely behavior, or what a depicted entity might do does not satisfy HAS_EXPRESSION.',
    HAS_POSE_GESTURE:'VISIBLE-POSE CONTRACT: the body posture or gesture itself must be represented. Emotion, symbolism, motion that is not a body pose/gesture, or an imagined action does not count.',
    HAS_OBJECT:'VISIBLE-OBJECT CONTRACT: the exact tag must be a discrete visible accompanying/held/worn/used object or prop. Body parts, expressions, effects, metaphors, and inferred associations are not objects.',
    HAS_PART:'VISIBLE-PART CONTRACT: the exact tag must be a visible constitutive/anatomical/structural part of the depicted thing. Separate props, consequences, metaphorical features, and contextual associations do not count.',
    CONVEYS_EMOTION:'EMOTION CONTRACT: the emoji itself must conventionally convey or be semantically associated with the exact emotion. “Someone could feel this emotion while using/seeing/receiving this thing” is an invented scenario and does not count.',
    HAS_POSITIVE_VALENCE:'VALENCE CONTRACT: positive valence must be part of the emoji’s conventional meaning/use, not merely a possible pleasant outcome, personal preference, or situation in which the emoji could be enjoyed.',
    HAS_NEGATIVE_VALENCE:'VALENCE CONTRACT: negative valence must be part of the emoji’s conventional meaning/use, not merely a possible bad outcome, hazard, or situation in which distress could occur.',
    HAS_STATE_CONDITION:'STATE CONTRACT: the emoji itself must represent or encode the exact state/condition. Merely causing, correlating with, following from, or appearing near that state does not count.',
    HAS_FUNCTION:'FUNCTION CONTRACT: the exact tag must describe a conventional function, use, or affordance of what the emoji represents. Symbolizing the tag, causing it, comforting someone who has it, or being creatively usable for it in a special scenario is not the same as having that function.',
    HAS_SYMPTOM:'SYMPTOM CONTRACT: the emoji must represent a condition/state for which the exact tag is a recognized manifestation or symptom. Mere co-occurrence, a response that could happen, or the emoji itself depicting a different symptom does not count.',
    IMPLIES_SETTING:'SETTING CONTRACT: the emoji itself must conventionally imply an environment/context characterized by the exact tag. A possible consequence, event, sound, emotion, or activity that could occur somewhere does not become a setting. For an audible-crying environment specifically, the emoji must imply a context characterized by audible crying, not merely something that can make a person cry.',
    CONTRASTS_WITH:'CONTRAST CONTRACT: there must be a salient shared comparison axis/basis AND a meaningful opposition or contrast on that axis. Mere difference, different semantic domains, object-vs-emotion, neutral-vs-positive, “one can lead to the other,” or two positive concepts with different intensity/depth are NOT contrast by themselves.',
    SIMILAR_TO:'SIMILARITY CONTRACT: there must be a salient shared basis of similarity beyond simply both being emoji, both belonging to a broad category, or being usable together.',
    SYMBOLIZES_ASSOCIATES_WITH:'ASSOCIATION CONTRACT: this predicate intentionally allows conventional, symbolic, metaphorical, or interpretive association. The association must still be recognizable and tag-specific without inventing a particular owner/event/location/story.',
    HAS_PLATFORM_RENDERING_VARIANT:'RENDERING CONTRACT: PRESENT when the same encoded emoji has materially renderer/vendor-specific visual forms. Vendor styling differences count; unrelated semantic variants, skin-tone/gender sequences, or imagined device differences are not required.',
    MEME_REFERENCE:'MEME CONTRACT: the emoji must itself function as or conventionally reference the exact meme/internet-culture concept. Merely appearing in memes, belonging to a popular franchise, or being an object people joke about online is not enough.',
    REACTION_IMAGE_REFERENCE:'REACTION CONTRACT: the emoji must conventionally function as a reusable reaction/reaction-image shorthand for the exact tag in digital/participatory culture. Merely conveying an emotion or being meme-able is not enough.'
  };
  return `${common}\n${rules[t]||'GENERIC CONTRACT: prove this relationship type itself, not a neighboring relation. Mere co-occurrence, category difference, possible use, possible consequence, or a clever story is insufficient unless the ontology definition expressly licenses that semantic route.'}`;
}

function screeningPrompt(a,screenPass,repair=''){
  const m=relationshipMeta(a),modeRule=screenPass==='recall-b'
    ?'FALSE-NEGATIVE AUDIT MODE: actively look for legitimate conventional/symbolic/functional/contextual routes that another screen might overlook, BUT only when the predicate contract licenses them.'
    :'PRIMARY HIGH-RECALL MODE: include every defensible typed-predicate candidate; when genuinely in reasonable semantic doubt, include it for deep verification.';
  return ['EMOJEO STEP 4 HIGH-RECALL TYPED-PREDICATE SCREEN v71','',
    `SCREEN PASS: ${screenPass}`,
    modeRule,
    'Use the normal Semantic Discovery observation structure. Produce ONE observation for this ONE fixed assertion.',
    `Observation phrase MUST be exactly ${a.assertionId}. dimension MUST be "other".`,
    'description MUST contain: C=[subject numbers] ; R=brief rationale.',
    'C = every NONLOCKED emoji that has any recognizable, defensible route to PRESENT or UNCERTAIN THROUGH THIS EXACT PREDICATE.',
    'Do not include a cell because two concepts can coexist, because one could cause the other in a made-up event, because they differ, or because a clever story can connect them.',
    'Do not list locked subjects in C. Every nonlocked emoji omitted from C is a screen-negative, not yet a deep-verification decision.',
    'Use numbers 0..78 only inside C. Do not create/rename relationships or rewrite tags.',
    '',
    `ASSERTION=${a.assertionId}|${a.relationshipType}|${a.tag}`,
    `DOMAIN=${m.domain||'(none)'}`,
    `DEFINITION=${m.definition}`,
    `PREDICATE CONTRACT:\n${predicateContract(a)}`,
    `LOCKED=${[...lockedSubjectSet(a.assertionId)].join(',')||'-'}`,
    `SEEDS=${seedText(a)}`,
    repair?`REPAIR NOTE: ${repair}`:'',
    '',
    'SUBJECTS',subjectsCompact()
  ].filter(Boolean).join('\n');
}
function semanticScreenRequest(a,screenPass,repair=''){
  return{schemaVersion:1,kind:'emojeo-step4-sparse-screen-v71',
    subject:{id:`step4-screen-${screenPass}-${a.assertionId}`,glyph:'🔎',name:'Step 4 typed-predicate screen'},
    domain:'Step 4 dual high-recall typed-predicate screen',
    relationshipTypes:[a.relationshipType],assertionIds:[a.assertionId],
    prompt:screeningPrompt(a,screenPass,repair)};
}
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

async function screenOneAssertion(ai,screenPass){
  const a=universe.assertions[ai];
  let lastError='unparseable screen';
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const env=await callSemantic(
        semanticScreenRequest(a,screenPass,attempt===1?'':`Previous screen was not parseable. Return one observation with C=[...] only. Attempt ${attempt}/3.`),
        r=>setStatus(`SCREEN ${screenPass} NETWORK RETRY ${r.attempt}/5 · ${a.assertionId}\n${r.error?.message||r.error}`)
      );
      const probe={...a,__singleFallback:true};
      const parsed=parseOneAssertionFromEnvelope(env,probe);
      if(parsed){
        return{
          id:screenRecordId(ai,screenPass),
          kind:'emojeo-step4-sparse-screen-result-v71',jobId:JOB_ID,
          assertionIndex:ai,screenPass,
          assertion:{...parsed,notEvaluatedSubjectIndexes:[]},
          completedAt:new Date().toISOString()
        };
      }
      lastError='valid response contained no parseable C=[...]';
    }catch(e){lastError=clean(e?.message||e)}
  }
  // High-recall fail-safe: if screening cannot be parsed, send every nonlocked cell to deep verification.
  const locked=lockedSubjectSet(a.assertionId),all=[];
  for(let si=0;si<79;si++)if(!locked.has(si))all.push(si);
  return{
    id:screenRecordId(ai,screenPass),kind:'emojeo-step4-sparse-screen-result-v71',jobId:JOB_ID,
    assertionIndex:ai,screenPass,
    assertion:{assertionId:a.assertionId,candidateSubjectIndexes:all,notEvaluatedSubjectIndexes:[],
      screenRationale:`Pass 71 high-recall fail-safe after unparseable screen: ${lastError}`,
      screenParseMode:'fail-safe-all-candidates-v71'},
    completedAt:new Date().toISOString()
  };
}

function candidateSubjectIndexesForAssertion(aid,limit){
  const ai=assertionIndexById.get(aid);if(!Number.isInteger(ai)||ai>=limit)return [];
  const out=new Set();
  for(const r of pass71ScreenRows()){
    if(r.assertionIndex!==ai)continue;
    const x=r.assertion||{};
    for(const si of (x.candidateSubjectIndexes||[]))if(!lockedStateByCell.has(cellKey(si,aid)))out.add(si);
  }
  return [...out].sort((a,b)=>a-b);
}
function cellVerifyRecordId(si,aid){return `${JOB_ID}|verify71|${si}|${aid}`}
function isPass71VerifiedCell(v){return Boolean(v&&v.verificationParseMode==='dual-review-typed-predicate-v71'&&['present','absent','uncertain','not_evaluated'].includes(v.state))}
function verifiedCellMap(){
  const m=new Map();
  for(const r of verifyRecords){
    if(r?.kind!=='emojeo-step4-cell-verify-result-v71')continue;
    const v=r.value;if(isPass71VerifiedCell(v))m.set(cellKey(r.subjectIndex,r.assertionId),v);
  }
  return m;
}

function historicalVerifiedCellSet(){return new Set()}
function historicalVerificationRecordCount(){return 0}
function pendingProviderFailureMap(){
  const m=new Map();
  for(const r of verifyRecords){
    if(r?.kind!=='emojeo-step4-cell-verify-result-v71')continue;
    const v=r.value;if(v?.verificationParseMode==='provider-failure-pending-v71')m.set(cellKey(r.subjectIndex,r.assertionId),v);
  }
  return m;
}

function reviewPrompt(subject,a,role,attempt,prior=null){
  const meta=relationshipMeta(a);
  const roleText=role==='recall'
    ?'RECALL REVIEWER: Look hard for a legitimate semantic route that satisfies THIS predicate. Err toward inclusion when the relationship itself is real even if conditional/sometimes true, but never invent a scene or switch predicates.'
    :role==='critic'
      ?'PREDICATE CRITIC: Try to falsify the relationship. Reject category-difference tricks, possible-consequence chains, co-occurrence, personal preference, made-up scenarios, and reasoning that really proves another predicate. Do not reject a legitimate conditional relationship merely because it is not universal.'
      :'FINAL ADJUDICATOR: Resolve the two reviewer outputs using the predicate contract. Prefer PRESENT when there is a recognizable legitimate typed relationship; prefer ABSENT when support depends on invented context, mere difference/co-occurrence, or another predicate. UNCERTAIN is only for a genuine unresolved semantic ambiguity.';
  const priorBlock=prior?[
    '',
    'REVIEWER A (RECALL):',`STATE=${prior.recall.state.toUpperCase()}; CONFIDENCE=${prior.recall.confidence.toUpperCase()}; EVIDENCE=${prior.recall.evidence}`,
    'REVIEWER B (CRITIC):',`STATE=${prior.critic.state.toUpperCase()}; CONFIDENCE=${prior.critic.confidence.toUpperCase()}; EVIDENCE=${prior.critic.evidence}`
  ]:[];
  return [
    'EMOJEO STEP 4 PASS 71 — DUAL-REVIEW TYPED-PREDICATE VERIFICATION',
    roleText,
    `Emoji: ${subject.glyph} ${subject.name}`,
    `Fixed assertion: ${a.assertionId}|${a.relationshipType}|${a.tag}`,
    `Relationship domain: ${meta.domain||'(none)'}`,
    `Relationship definition: ${meta.definition}`,
    `Predicate contract: ${predicateContract(a)}`,
    `Existing Step 3 seed context: ${seedText(a)}`,
    '',
    'Seed context explains lineage only; it is not proof for this emoji.',
    'Do not rewrite the relationship type or tag.',
    'Do not require visual literalness when the predicate itself licenses semantic, symbolic, conventional, functional, contextual, or metaphorical inference.',
    'But do not transfer that permission to a predicate that does NOT license it.',
    '',
    'STATE CALIBRATION:',
    'PRESENT = a recognizable, defensible semantic route satisfies this exact predicate and exact tag.',
    'ABSENT = the exact predicate is not satisfied, including scenario-only, category-difference-only, co-occurrence-only, or neighboring-predicate reasoning.',
    'UNCERTAIN = genuine semantic ambiguity remains after applying the predicate contract.',
    'NOT_EVALUATED = essential semantic information is unavailable or incoherent.',
    ...priorBlock,
    '',
    'Use the normal Semantic Discovery JSON structure.',
    `Return one observation whose phrase is exactly "${a.assertionId}" and dimension is "other".`,
    'The observation description MUST begin: STATE=<PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED>; CONFIDENCE=<HIGH|MEDIUM|LOW>; EVIDENCE=',
    'EVIDENCE must name the predicate-fitting route or explain precisely why the predicate fails.',
    `Attempt ${attempt}/3. Preserve the STATE and CONFIDENCE labels exactly.`
  ].join('\n');
}
function parseReview(env,subject,a,mode){
  const chunks=[];
  for(const o of collectObjects(env?.result??env,[])){
    const phrase=clean(o.phrase||o.title||o.name||o.label),desc=clean(o.description||o.summary||o.text||o.note);
    const evidence=Array.isArray(o.evidence)?o.evidence.join(' '):clean(o.evidence);
    if(phrase.toUpperCase().includes(a.assertionId)||desc.toUpperCase().includes(a.assertionId)||/\bSTATE\s*[:=]/i.test(desc))chunks.push({text:`${phrase}\n${desc}\n${evidence}`,confidence:o.confidence});
  }
  for(const s of collectStrings(env?.result??env,[]))if(/\bSTATE\s*[:=]\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\b/i.test(String(s)))chunks.push({text:String(s),confidence:null});
  for(const c of chunks){
    const sm=c.text.match(/\bSTATE\s*[:=]\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\b/i);if(!sm)continue;
    const state=sm[1].toLowerCase();let confidence='medium';
    if(Number.isFinite(Number(c.confidence))){const n=Number(c.confidence);confidence=n>=.80?'high':n>=.45?'medium':'low'}
    const cm=c.text.match(/\bCONFIDENCE\s*[:=]\s*(HIGH|MEDIUM|LOW)\b/i);if(cm)confidence=cm[1].toLowerCase();
    const em=c.text.match(/\bEVIDENCE\s*[:=]\s*(.+)$/is),evidence=em?clean(em[1]).slice(0,1000):clean(c.text).slice(0,1000);
    return{subjectIndex:subject.subjectIndex,assertionId:a.assertionId,state,confidence,evidence:evidence||'Pass 71 typed-predicate review.',reviewMode:mode};
  }
  return null;
}
async function runOneReview(si,aid,role,prior=null){
  const subject=runSpec.subjects[si],a=assertionById.get(aid);let lastError='unparseable response';
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const env=await callSemantic({
        schemaVersion:1,kind:`emojeo-step4-${role}-review-v71`,
        subject:{id:`${subject.glyph}:${subject.name}`,glyph:subject.glyph,name:subject.name},
        domain:'Step 4 Pass 71 dual-review typed-predicate verification',
        relationshipTypes:[a.relationshipType],assertionIds:[aid],
        prompt:reviewPrompt(subject,a,role,attempt,prior)
      },r=>setStatus(`${role.toUpperCase()} NETWORK RETRY ${r.attempt}/5 · ${subject.glyph} ${subject.name} · ${aid}\n${r.error?.message||r.error}`));
      const parsed=parseReview(env,{...subject,subjectIndex:si},a,role);if(parsed)return parsed;
      lastError='Semantic Discovery returned no parseable STATE label.';
    }catch(e){lastError=clean(e?.message||e)}
  }
  return{subjectIndex:si,assertionId:aid,state:'not_evaluated',confidence:'low',evidence:`Provider/review failure: ${lastError}`,reviewMode:`${role}-provider-failure`};
}
function chooseWithoutAdjudicator(recall,critic){
  if(recall.state===critic.state)return{...recall,confidence:(recall.confidence===critic.confidence?recall.confidence:'medium'),evidence:`Dual reviewers agreed ${recall.state.toUpperCase()}. Recall: ${recall.evidence} Critic: ${critic.evidence}`.slice(0,1200)};
  return null;
}
async function verifyOneCell(si,aid){
  const subject=runSpec.subjects[si],a=assertionById.get(aid);
  const [recall,critic]=await Promise.all([runOneReview(si,aid,'recall'),runOneReview(si,aid,'critic')]);
  let final=chooseWithoutAdjudicator(recall,critic),adjudicator=null;
  if(!final){
    adjudicator=await runOneReview(si,aid,'adjudicator',{recall,critic});
    final=adjudicator;
  }
  const failed=[recall,critic,adjudicator].filter(Boolean).some(x=>String(x.reviewMode||'').includes('provider-failure'));
  const value={
    subjectIndex:si,assertionId:aid,state:final.state,confidence:final.confidence,
    evidence:final.evidence,
    verificationParseMode:failed&&final.state==='not_evaluated'?'provider-failure-pending-v71':'dual-review-typed-predicate-v71',
    reviewSummary:{recall:{state:recall.state,confidence:recall.confidence,evidence:recall.evidence},critic:{state:critic.state,confidence:critic.confidence,evidence:critic.evidence},adjudicator:adjudicator?{state:adjudicator.state,confidence:adjudicator.confidence,evidence:adjudicator.evidence}:null}
  };
  return{id:cellVerifyRecordId(si,aid),kind:'emojeo-step4-cell-verify-result-v71',jobId:JOB_ID,subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:aid,value,providerFailurePending:value.verificationParseMode==='provider-failure-pending-v71',completedAt:new Date().toISOString()};
}
async function runPool(tasks,worker,label){let next=0,done=0;async function lane(i){while(true){if(stopRequested)return;const n=next++;if(n>=tasks.length)return;setStatus(`${label} · ${done}/${tasks.length} request(s) complete · lane ${i+1}/${CONCURRENCY}`);await worker(tasks[n]);done++;render()}}await Promise.all(Array.from({length:Math.min(CONCURRENCY,tasks.length)},(_,i)=>lane(i)))}

async function runScreen(limit){
  const have=new Set(pass71ScreenRows().map(r=>`${r.assertionIndex}|${r.screenPass}`)),tasks=[];
  for(let ai=0;ai<limit;ai++)for(const pass of SCREEN_PASSES)if(!have.has(`${ai}|${pass}`))tasks.push({ai,pass});
  await runPool(tasks,async t=>{
    const rec=await screenOneAssertion(t.ai,t.pass);
    await dbPut(SCREEN_STORE,rec);
    screenRecords=screenRecords.filter(x=>x.id!==rec.id);screenRecords.push(rec);
    job.lastCompleted={stage:'screen71',assertionIndex:t.ai,screenPass:t.pass,at:rec.completedAt};
    await dbPut(JOB_STORE,job);
  },`PASS 71 DUAL SCREEN through ${limit}`);
}
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
    // Replace any earlier Pass 71 record for the same cell in memory. Pass 71 uses a fresh IndexedDB namespace.
    verifyRecords=verifyRecords.filter(x=>x.id!==rec.id);
    verifyRecords.push(rec);
    job.lastCompleted={stage:'cell-verify',subjectIndex:t.si,assertionId:t.aid,at:rec.completedAt};
    await dbPut(JOB_STORE,job);
  },`PASS 71 DUAL-REVIEW VERIFY through ${limit}`);
}
async function runScope(limit){if(running)return;running=true;stopRequested=false;job.runIntent={active:true,limit,requestedAt:new Date().toISOString()};await dbPut(JOB_STORE,job);render();try{await runScreen(limit);if(stopRequested){job.runIntent.active=false;await dbPut(JOB_STORE,job);setStatus('STOPPED · in-flight screens checkpointed.');return}await runVerify(limit);if(stopRequested){job.runIntent.active=false;await dbPut(JOB_STORE,job);setStatus('STOPPED · in-flight verification checkpointed.');return}job.runIntent={active:false,completedAt:new Date().toISOString()};await dbPut(JOB_STORE,job);if(!scopeComplete(limit)){const cand=candidateCellSet(limit),ver=verifiedCellMap(),pending=pendingProviderFailureMap();const remaining=[...cand].filter(k=>!ver.has(k)).length,pendingCount=[...cand].filter(k=>pending.has(k)).length;setStatus(`PASS 71 PILOT NEEDS RETRY · ${remaining} candidate cell(s) are still unverified, including ${pendingCount} provider-failure pending.\nTap RUN PASS 71 PILOT again; completed Pass 71 cells will be preserved and only unfinished cells will retry.`);return}setStatus(limit===24?'PASS 71 PILOT COMPLETE · dual screens and dual-review verification finished for the 24-assertion pilot. Tap DOWNLOAD PASS 71 CHECKPOINT and upload that JSON here.':'STEP 4 COMPLETE · all 1,278 assertions × 79 emoji covered. Download final checkpoint JSON.')}catch(e){job.runIntent={active:false,limit,lastError:clean(e?.message||e),lastErrorAt:new Date().toISOString()};await dbPut(JOB_STORE,job).catch(()=>{});setStatus(`STOPPED ON ERROR · ${e?.message||e}\nRefresh/reopen Pass 71 to resume.`)}finally{running=false;stopRequested=false;render()}}

function screensByAid(){
  const m=new Map();
  for(const r of pass71ScreenRows()){
    const aid=r.assertion?.assertionId;if(!aid)continue;
    if(!m.has(aid))m.set(aid,[]);
    m.get(aid).push(r);
  }
  return m;
}
function buildAssignments(limit){
  const ver=verifiedCellMap(),sb=screensByAid(),out=[];
  for(let ai=0;ai<limit;ai++){
    const a=universe.assertions[ai],screens=sb.get(a.assertionId)||[];
    if(!SCREEN_PASSES.every(p=>screens.some(r=>r.screenPass===p)))continue;
    const C=new Set();
    for(const r of screens)for(const si of (r.assertion?.candidateSubjectIndexes||[]))C.add(si);
    const screenEvidence=screens.map(r=>`${r.screenPass}: ${clean(r.assertion?.screenRationale).slice(0,320)}`).join(' | ');
    for(let si=0;si<79;si++){
      const key=cellKey(si,a.assertionId),subject=runSpec.subjects[si],locked=lockedStateByCell.get(key);
      if(locked){out.push({...clone(locked),subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,source:'step3-locked-prefill'});continue}
      const v=ver.get(key);
      if(v){out.push({subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,state:v.state,confidence:v.confidence,evidence:v.evidence,reviewSummary:v.reviewSummary||null,source:'step4-pass71-dual-review-verification'});continue}
      if(C.has(si))continue;
      out.push({subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,state:'absent',confidence:'medium',evidence:`Both independent Pass 71 high-recall screens omitted this cell under the exact predicate contract. ${screenEvidence}`.slice(0,1200),source:'step4-pass71-dual-screen-absent'});
    }
  }
  return out.sort((x,y)=>x.subjectIndex-y.subjectIndex||assertionIndexById.get(x.assertionId)-assertionIndexById.get(y.assertionId));
}

async function downloadCheckpoint(){
  const pilot=scopeComplete(24),limit=pilot?24:Math.min(24,screenedAssertionIds().size),assignments=buildAssignments(limit),counts={present:0,absent:0,uncertain:0,not_evaluated:0};
  for(const a of assignments)counts[a.state]=(counts[a.state]||0)+1;
  const cand=candidateCellSet(limit),ver=verifiedCellMap(),pending=pendingProviderFailureMap();
  const activeVerificationResults=verifyRecords.filter(r=>r?.kind==='emojeo-step4-cell-verify-result-v71'&&assertionIndexById.get(r.assertionId)<limit);
  let agreement=0,adjudicated=0;
  for(const r of activeVerificationResults){
    const s=r.value?.reviewSummary;if(!s)continue;
    if(s.adjudicator)adjudicated++;else agreement++;
  }
  const out={
    schemaVersion:1,kind:'emojeo-step4-sparse-matrix-checkpoint',runnerVersion:'pass71',createdAt:new Date().toISOString(),
    strategy:{
      screening:'Two independent one-assertion high-recall typed-predicate screens; candidate set is their union',
      verification:'Two independent single-cell reviewers (recall + predicate critic); disagreements go to a third adjudicator',
      semanticPolicy:'include legitimate conditional/sometimes-true relationships when the exact predicate licenses them; reject invented scenarios, mere category difference/co-occurrence, possible consequence drift, and neighboring-predicate substitutions',
      predicateContracts:'Pass 71 operational contracts supplement but do not rename or alter the sealed ontology types',
      ontologyDomainPolicy:'descriptive context, not a hard applicability gate',
      screenNegativePolicy:'ABSENT only when both independent high-recall screens omit the nonlocked cell',
      cellConcurrency:2,maxParallelProviderRequests:4,providerFailurePolicy:'pending-not-counted-as-verified',fullRunLocked:true
    },
    inputs:{
      assertionUniverse:{file:INPUTS.universe,sha256:runSpec.inputs.assertionUniverse.sha256},
      prefill:{file:INPUTS.prefill,sha256:runSpec.inputs.prefill.sha256},
      ontology:{file:INPUTS.ontology,sha256:ontologySha256,relationshipCount:ontology.relationshipCount}
    },
    scopeAssertionCount:limit,scopeMatrixCellCount:limit*79,scopeComplete:scopeComplete(limit),
    screenedAssertionCount:screenedAssertionIds(limit).size,
    sparseCandidateCellCount:cand.size,pass71VerifiedCandidateCellCount:[...cand].filter(k=>ver.has(k)).length,
    providerFailurePendingCellCount:[...cand].filter(k=>!ver.has(k)&&pending.has(k)).length,
    dualReviewerAgreementCellCount:agreement,adjudicatedCellCount:adjudicated,
    assignmentCount:assignments.length,stateCounts:counts,
    screenResults:pass71ScreenRows().filter(r=>r.assertionIndex<limit).sort((a,b)=>a.assertionIndex-b.assertionIndex||String(a.screenPass).localeCompare(String(b.screenPass))),
    verificationResults:activeVerificationResults,assignments
  };
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`emojeo-step4-sparse-pass71-${limit}assertions-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
}

async function initialize(){
  try{
    const [ut,pt,rt,ot]=await Promise.all([fetchText(INPUTS.universe),fetchText(INPUTS.prefill),fetchText(INPUTS.runSpec),fetchText(INPUTS.ontology)]);
    universe=JSON.parse(ut);prefill=JSON.parse(pt);runSpec=JSON.parse(rt);ontology=JSON.parse(ot);
    if(universe.assertionCount!==1278||prefill.lockedAssignmentCount!==1326||runSpec.scope?.subjectCount!==79)throw new Error('Pass 62 input mismatch.');
    if(ontology.relationshipCount!==1211||!Array.isArray(ontology.relationships))throw new Error('Pass 71 ontology mismatch; expected sealed 1,211 relationship types.');
    const [ush,psh,osh]=await Promise.all([sha256Hex(ut),sha256Hex(pt),sha256Hex(ot)]);ontologySha256=osh;
    if(ush!==runSpec.inputs.assertionUniverse.sha256||psh!==runSpec.inputs.prefill.sha256)throw new Error('Pass 62 input SHA mismatch.');
    for(const row of ontology.relationships)if(row?.relationshipType)relationshipMetaByType.set(row.relationshipType,{domain:clean(row.domain),definition:clean(row.definition)});
    universe.assertions.forEach((a,i)=>{assertionById.set(a.assertionId,a);assertionIndexById.set(a.assertionId,i);if(!relationshipMetaByType.has(a.relationshipType))throw new Error(`Assertion ${a.assertionId} relationship ${a.relationshipType} is missing from the sealed ontology.`)});
    for(const a of prefill.assignments){const k=cellKey(a.subjectIndex,a.assertionId);if(lockedStateByCell.has(k))throw new Error(`Duplicate locked ${k}`);lockedStateByCell.set(k,clone(a))}
    job=await dbGet(JOB_STORE,JOB_ID)||{id:JOB_ID,kind:'emojeo-step4-pass71-job',schemaVersion:1,createdAt:new Date().toISOString(),assertionUniverseSha256:ush,prefillSha256:psh,runIntent:{active:false}};
    job.ontologySha256=osh;await dbPut(JOB_STORE,job);
    [screenRecords,verifyRecords]=await Promise.all([dbGetByJob(SCREEN_STORE,JOB_ID),dbGetByJob(VERIFY_STORE,JOB_ID)]);
    job.runIntent={active:false,restoredBy:'pass71',restoredAt:new Date().toISOString()};await dbPut(JOB_STORE,job);
    const cand=candidateCellSet(PILOT_ASSERTIONS),valid=verifiedCellMap(),pending=pendingProviderFailureMap();
    setStatus(`READY FOR PASS 71 · ${screenedAssertionIds().size}/24 pilot assertions have both screen passes.\n${cand.size} union candidate cells are currently known; ${valid.size} have completed dual-review verification and ${pending.size} are provider-failure pending.\nTap RUN PASS 71 PILOT. It will complete missing dual screens first, then verify only the union candidates.`);
    render();
  }catch(e){job=null;setStatus(`INITIALIZATION FAILED · ${e?.message||e}`);render()}
}
$('pilot').addEventListener('click',()=>runScope(24));$('full').addEventListener('click',()=>{});$('stop').addEventListener('click',async()=>{if(!running)return;stopRequested=true;if(job){job.runIntent={active:false,stopRequestedAt:new Date().toISOString()};await dbPut(JOB_STORE,job).catch(()=>{})}setStatus('STOP REQUESTED · no new requests will start; in-flight requests will finish and checkpoint.')});$('download').addEventListener('click',()=>downloadCheckpoint().catch(e=>setStatus(`DOWNLOAD FAILED · ${e?.message||e}`)));render();initialize();
})();