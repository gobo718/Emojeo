/* Emojeo Step 4 Semantic Regression Gate Pilot Runner — Pass 72 */
(()=>{'use strict';

const $=id=>document.getElementById(id), clean=v=>String(v??'').trim(), clone=v=>v==null?v:structuredClone(v);
const INPUTS={
  universe:'Emojeo_STEP4_Assertion_Universe_v001.json',
  prefill:'Emojeo_STEP4_Prefill_v001.json',
  runSpec:'Emojeo_STEP4_RunSpec_v001.json',
  ontology:'Emojeo_STEP3_Semantic_Inventory_1211_v013.json'
};
const DB_NAME='emojeo-step4-pass72',DB_VERSION=1,JOB_STORE='jobs',SCREEN_STORE='screen',VERIFY_STORE='verify';
const JOB_ID='step4-pass72:e6ce04292d86009705814c8b8a09105a58fa5709440d2c11aa3f636641b87a3b';
const PILOT_ASSERTIONS=24,CONCURRENCY=2,SCREEN_PASSES=['direct-recall','semantic-bridge','false-negative-challenge'];
const VALID_STATES=new Set(['present','absent','uncertain','not_evaluated']);
const VALID_CONFIDENCE=new Set(['high','medium','low']);
const VALID_ROUTES=new Set([
  'DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC','FUNCTIONAL',
  'CONTEXTUAL','CONDITION_SYMPTOM','SHARED_AXIS','VENDOR_RENDERING','EXACT_REFERENCE','NONE'
]);

// Regression fixtures are quality gates, not hard-coded matrix decisions.
// Every fixture is still independently verified by the Pass 72 reviewer stack.
const REGRESSION_ANCHORS=[
  {assertionId:'A0010',subjectIndex:54,expected:'absent',label:'💔 IMPLIES_SETTING audible_crying_environment must not become a setting from a consequence'},
  {assertionId:'A0017',subjectIndex:54,expected:'present',label:'💔 HAS_SYMPTOM sobbing must remain eligible as a recognizable heartbreak→sobbing manifestation'},
  {assertionId:'A0004',subjectIndex:24,expected:'absent',label:'🥓 CONTRASTS_WITH 😊 must not pass merely because food and emotion are different domains'},
  {assertionId:'A0019',subjectIndex:38,expected:'absent',label:'🧽 HAS_OBJECT tears must not pass via a made-up tear-absorption scenario'},
  {assertionId:'A0022',subjectIndex:46,expected:'absent',label:'🔓 HAS_PART exaggerated_mouth must not reinterpret an unlocked padlock as mouth anatomy'}
];

let universe=null,prefill=null,runSpec=null,ontology=null,ontologySha256=null;
let assertionById=new Map(),assertionIndexById=new Map(),lockedStateByCell=new Map(),relationshipMetaByType=new Map();
let job=null,screenRecords=[],verifyRecords=[],running=false,stopRequested=false;

async function fetchText(url){
  const r=await fetch(url,{cache:'no-cache'});
  if(!r.ok)throw new Error(`${url} load failed (${r.status})`);
  return r.text();
}
async function sha256Hex(text){
  const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
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
function screenRecordId(ai,pass){return `${JOB_ID}|screen72|${pass}|${ai}`}
function verifyRecordId(si,aid){return `${JOB_ID}|verify72|${si}|${aid}`}
function setStatus(t){$('status').textContent=t}
function relationshipMeta(a){
  const m=relationshipMetaByType.get(a.relationshipType);
  if(!m)throw new Error(`Missing ontology definition for ${a.relationshipType}`);
  return m;
}
function lockedSubjectSet(aid){
  const s=new Set();
  for(let si=0;si<79;si++)if(lockedStateByCell.has(cellKey(si,aid)))s.add(si);
  return s;
}
function seedText(a){
  return (a.seedSources||[]).slice(0,4).map(x=>`${x.subject?.glyph||''} ${x.subject?.name||''}=${String(x.state||'').toUpperCase()}`).join('; ')||'none';
}
function subjectsCompact(){
  return runSpec.subjects.map((s,i)=>`S${String(i).padStart(2,'0')}=${s.glyph} ${s.name}`).join('\n');
}
function pass72ScreenRows(){
  return screenRecords.filter(r=>r?.kind==='emojeo-step4-sparse-screen-result-v72');
}
function screenedAssertionIds(limit=1278){
  const by=new Map();
  for(const r of pass72ScreenRows()){
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
  for(const r of pass72ScreenRows()){
    const ai=Number(r.assertionIndex);
    if(!Number.isInteger(ai)||ai<0||ai>=limit)continue;
    const aid=r.assertion?.assertionId||universe.assertions[ai]?.assertionId;
    if(!aid)continue;
    for(const si of (r.assertion?.candidateSubjectIndexes||[]))if(!lockedStateByCell.has(cellKey(si,aid)))out.add(cellKey(si,aid));
  }
  for(const a of REGRESSION_ANCHORS){
    const ai=assertionIndexById.get(a.assertionId);
    if(Number.isInteger(ai)&&ai<limit&&!lockedStateByCell.has(cellKey(a.subjectIndex,a.assertionId)))out.add(cellKey(a.subjectIndex,a.assertionId));
  }
  return out;
}
function candidateSubjectIndexesForAssertion(aid,limit){
  const ai=assertionIndexById.get(aid);
  if(!Number.isInteger(ai)||ai>=limit)return[];
  const out=new Set();
  for(const r of pass72ScreenRows()){
    if(r.assertionIndex!==ai)continue;
    for(const si of (r.assertion?.candidateSubjectIndexes||[]))if(!lockedStateByCell.has(cellKey(si,aid)))out.add(si);
  }
  for(const a of REGRESSION_ANCHORS)if(a.assertionId===aid&&!lockedStateByCell.has(cellKey(a.subjectIndex,aid)))out.add(a.subjectIndex);
  return [...out].sort((a,b)=>a-b);
}
function isVerifiedValue(v){
  return Boolean(v&&v.verificationParseMode==='pass72-gated-review'&&VALID_STATES.has(v.state));
}
function verifiedCellMap(){
  const m=new Map();
  for(const r of verifyRecords){
    if(r?.kind!=='emojeo-step4-cell-verify-result-v72')continue;
    if(isVerifiedValue(r.value))m.set(cellKey(r.subjectIndex,r.assertionId),r.value);
  }
  return m;
}
function pendingProviderFailureMap(){
  const m=new Map();
  for(const r of verifyRecords){
    if(r?.kind!=='emojeo-step4-cell-verify-result-v72')continue;
    if(r.value?.verificationParseMode==='provider-failure-pending-v72')m.set(cellKey(r.subjectIndex,r.assertionId),r.value);
  }
  return m;
}
function scopeComplete(limit){
  if(screenedAssertionIds(limit).size!==limit)return false;
  const cand=candidateCellSet(limit),ver=verifiedCellMap();
  for(const k of cand)if(!ver.has(k))return false;
  return true;
}
function regressionResults(limit=PILOT_ASSERTIONS,assignments=null){
  const rows=assignments||buildAssignments(limit),by=new Map(rows.map(x=>[cellKey(x.subjectIndex,x.assertionId),x]));
  return REGRESSION_ANCHORS.filter(a=>{
    const ai=assertionIndexById.get(a.assertionId);return Number.isInteger(ai)&&ai<limit;
  }).map(a=>{
    const row=by.get(cellKey(a.subjectIndex,a.assertionId));
    return {...a,actual:row?.state||'missing',pass:row?.state===a.expected,evidence:row?.evidence||''};
  });
}
function regressionsPass(limit=PILOT_ASSERTIONS,assignments=null){
  const r=regressionResults(limit,assignments);return r.length>0&&r.every(x=>x.pass);
}
function render(){
  if(!job||!universe){for(const id of ['pilot','full','stop','download'])$(id).disabled=true;return}
  const screened=screenedAssertionIds(PILOT_ASSERTIONS).size,cand=candidateCellSet(PILOT_ASSERTIONS),ver=verifiedCellMap(),pending=pendingProviderFailureMap();
  let verified=0,pendingCount=0;
  for(const k of cand){if(ver.has(k))verified++;else if(pending.has(k))pendingCount++}
  const complete=scopeComplete(PILOT_ASSERTIONS);
  const rr=complete?regressionResults(PILOT_ASSERTIONS):[];
  const passed=complete&&rr.every(x=>x.pass);
  $('summary').innerHTML=`<span class="${complete&&passed?'good':'warn'}">${screened}/24 assertions triple-screened</span> · ${cand.size.toLocaleString()} union candidate cells · ${verified.toLocaleString()} verified · ${pendingCount} provider-failure pending · ${complete?`${rr.filter(x=>x.pass).length}/${rr.length} semantic regression gates passed`:'pilot in progress'}`;
  $('pilot').disabled=running||(complete&&passed);
  $('full').disabled=true;
  $('stop').disabled=!running;
  $('download').disabled=screenRecords.length===0;
}

function predicateContract(a){
  const t=a.relationshipType;
  const common='Apply the exact ontology predicate to the exact tag. PRESENT may be conditional/sometimes true when the relationship itself is real. Do not require universality. But never invent a one-off scene, owner, event, quotation, pun, or lore solely to force a connection, and never substitute a neighboring relationship type.';
  const rules={
    HAS_EXPRESSION:'VISIBLE-EXPRESSION CONTRACT: only the expression visibly represented by the emoji counts. Symbolic emotion, likely behavior, or what the depicted entity might do does not satisfy HAS_EXPRESSION.',
    HAS_POSE_GESTURE:'VISIBLE-POSE CONTRACT: only a body posture or gesture visibly represented by the emoji counts. Emotion, sound, symbolism, or imagined motion is not a pose/gesture.',
    HAS_OBJECT:'VISIBLE-OBJECT CONTRACT: the exact tag must itself be a discrete visible accompanying/held/worn/used object or prop in the depicted composition. A tool that could interact with the tag elsewhere, a metaphorical comfort object, a consequence, or an associated object does NOT count.',
    HAS_PART:'VISIBLE-PART CONTRACT: the exact tag must itself be a visible constitutive/anatomical/structural part of the depicted thing. Separate props, look-alikes, metaphors, symbolic analogies, and inferred functions do NOT count.',
    CONVEYS_EMOTION:'EMOTION CONTRACT: the emoji itself must conventionally convey or be semantically associated with the exact emotion. Personal preference or a situation in which someone could feel that emotion is insufficient.',
    HAS_POSITIVE_VALENCE:'POSITIVE-VALENCE CONTRACT: positive valence must be part of the emoji’s conventional meaning/use, not merely a pleasant possible outcome or a thing some people enjoy.',
    HAS_NEGATIVE_VALENCE:'NEGATIVE-VALENCE CONTRACT: negative valence must be part of the emoji’s conventional meaning/use, not merely a hazard, emergency, or scenario that could feel bad.',
    HAS_STATE_CONDITION:'STATE CONTRACT: the emoji itself must represent or conventionally denote the exact state/condition. Merely causing, following from, or appearing near that state is insufficient.',
    HAS_FUNCTION:'FUNCTION CONTRACT: the exact tag must be a conventional function/use/affordance of the represented thing OR a direct conventional communicative function of the emoji/symbol itself. A possible creative use, an indirect consequence, or merely signaling a situation where the tag exists is insufficient.',
    HAS_SYMPTOM:'SYMPTOM CONTRACT: interpret the subject as the condition/state/experience it conventionally denotes, including emotional or metaphorical states when recognizable. The exact tag must be a recognized manifestation/symptom of that condition/state/experience; it need not be universal, diagnostic, or medically literal. Example of the intended inclusion boundary: 💔 can conventionally denote heartbreak, and sobbing can be a recognizable manifestation of heartbreak. Mere co-occurrence, another symptom with no underlying-condition route, or a scenario that could make someone sob does not count.',
    IMPLIES_SETTING:'SETTING CONTRACT: the emoji itself must conventionally imply an environment/context characterized by the exact tag. A possible consequence, activity, sound, or emotion that could happen somewhere does not become a setting. For audible_crying_environment, something that can make a person cry is not enough.',
    CONTRASTS_WITH:'CONTRAST CONTRACT: there must be a salient shared comparison axis/basis and meaningful opposition on that SAME axis. Mere category/domain difference, object-vs-emotion, neutral-vs-positive, co-occurrence, cause/effect, or different intensity/depth is not contrast by itself.',
    SIMILAR_TO:'SIMILARITY CONTRACT: there must be a salient shared property/form/state/function/role/meaning between the two concepts themselves. Merely occurring in the same setting, one comforting the other, being used together, or sharing a broad emotional context is association—not similarity.',
    SYMBOLIZES_ASSOCIATES_WITH:'ASSOCIATION CONTRACT: this intentionally permits conventional, symbolic, metaphorical, or interpretive association. The association must be recognizable without a bespoke story, niche pun, invented folklore, or ad-hoc chain. If the rationale sounds like a clever connection newly invented for this test, reject it.',
    HAS_PLATFORM_RENDERING_VARIANT:'RENDERING CONTRACT: PRESENT when the same encoded emoji has materially renderer/vendor-specific visual forms. Ordinary documented vendor styling differences count.',
    MEME_REFERENCE:'MEME CONTRACT: the emoji must itself function as or conventionally reference the exact meme/internet-culture concept. Merely appearing in memes or being joke-able online is insufficient.',
    REACTION_IMAGE_REFERENCE:'REACTION CONTRACT: the emoji must conventionally function as reusable reaction/reaction-image shorthand for the exact tag in participatory digital culture. Merely conveying an emotion is not enough.'
  };
  return `${common}\n${rules[t]||'GENERIC CONTRACT: prove this relationship type itself. Mere co-occurrence, category difference, possible use, possible consequence, or a clever story is insufficient unless the ontology definition expressly licenses that route.'}`;
}
function allowedRoutes(a){
  const t=a.relationshipType,m=relationshipMeta(a),domain=(m.domain||'').toLowerCase();
  const map={
    HAS_EXPRESSION:['DIRECT_VISUAL'],
    HAS_POSE_GESTURE:['DIRECT_VISUAL'],
    HAS_OBJECT:['DIRECT_VISUAL'],
    HAS_PART:['DIRECT_VISUAL'],
    HAS_PLATFORM_RENDERING_VARIANT:['VENDOR_RENDERING'],
    HAS_FUNCTION:['FUNCTIONAL'],
    HAS_SYMPTOM:['CONDITION_SYMPTOM'],
    IMPLIES_SETTING:['CONTEXTUAL'],
    CONTRASTS_WITH:['SHARED_AXIS'],
    SIMILAR_TO:['SHARED_AXIS'],
    MEME_REFERENCE:['EXACT_REFERENCE'],
    REACTION_IMAGE_REFERENCE:['EXACT_REFERENCE'],
    HAS_STATE_CONDITION:['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC'],
    CONVEYS_EMOTION:['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC'],
    HAS_POSITIVE_VALENCE:['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC'],
    HAS_NEGATIVE_VALENCE:['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC'],
    SYMBOLIZES_ASSOCIATES_WITH:['CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC']
  };
  if(map[t])return map[t];
  if(domain.includes('visible'))return['DIRECT_VISUAL'];
  if(domain.includes('functional'))return['FUNCTIONAL'];
  if(domain.includes('context'))return['CONTEXTUAL'];
  if(domain.includes('cross-emoji'))return['SHARED_AXIS'];
  if(domain.includes('internet'))return['EXACT_REFERENCE','CONVENTIONAL_SEMANTIC'];
  return['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC','FUNCTIONAL','CONTEXTUAL','CONDITION_SYMPTOM','SHARED_AXIS','EXACT_REFERENCE'];
}
function routeGate(a,r){
  if(!r||r.failed)return r;
  if(r.state==='absent'||r.state==='not_evaluated')return r;
  const allowed=allowedRoutes(a);
  if(!allowed.includes(r.route)){
    return {...r,state:'absent',confidence:'high',route:'NONE',evidence:`ROUTE GATE REJECTED ${r.route} for ${a.relationshipType}. Allowed route(s): ${allowed.join(', ')}. Original evidence: ${r.evidence}`.slice(0,1200)};
  }
  return r;
}

function screeningPrompt(a,screenPass,repair=''){
  const m=relationshipMeta(a),allowed=allowedRoutes(a).join(', ');
  const mode={
    'direct-recall':'DIRECT + CONVENTIONAL RECALL: include every nonlocked subject with an obvious or conventional predicate-fitting route. Do not over-prune edge cases.',
    'semantic-bridge':'SEMANTIC BRIDGE SCOUT: specifically search for legitimate NONLITERAL relationships that THIS predicate licenses. Do not confuse nonliteral with invalid. For condition→symptom, consider what condition/state/experience the emoji conventionally denotes (for example, heartbreak), not only what it visibly depicts.',
    'false-negative-challenge':'FALSE-NEGATIVE CHALLENGE: assume another screen may have been too strict. Re-examine every subject for the strongest recognizable predicate-fitting route. Include a borderline candidate if the relationship is defensible without inventing a bespoke story. Still reject mere co-occurrence, category difference, possible consequence, personal preference, and neighboring-predicate reasoning.'
  }[screenPass];
  return[
    'EMOJEO STEP 4 PASS 72 — TRIPLE HIGH-RECALL TYPED-PREDICATE SCREEN',
    `SCREEN PASS: ${screenPass}`,mode,
    'Use the normal Semantic Discovery observation structure. Produce ONE observation for this ONE fixed assertion.',
    `Observation phrase MUST be exactly "${a.assertionId}". dimension MUST be "other".`,
    'description MUST contain: C=[subject numbers] ; R=brief rationale.',
    'C = every NONLOCKED emoji that has any recognizable route to PRESENT or UNCERTAIN THROUGH THIS EXACT PREDICATE.',
    `Allowed semantic route labels for later verification: ${allowed}.`,
    'Do not list locked subjects in C. Use numbers 0..78 only.',
    'Omitting a nonlocked subject from C is a strong claim that no legitimate typed relationship is worth deep verification, so err toward inclusion when in reasonable doubt.',
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
  return{
    schemaVersion:1,kind:'emojeo-step4-sparse-screen-v72',
    subject:{id:`step4-pass72-screen-${screenPass}-${a.assertionId}`,glyph:'🔎',name:'Step 4 Pass 72 screen'},
    domain:'Step 4 Pass 72 triple high-recall typed-predicate screen',
    relationshipTypes:[a.relationshipType],assertionIds:[a.assertionId],
    prompt:screeningPrompt(a,screenPass,repair)
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
function collectObjects(v,out=[]){
  if(Array.isArray(v)){for(const x of v)collectObjects(x,out);return out}
  if(v&&typeof v==='object'){out.push(v);for(const x of Object.values(v))collectObjects(x,out)}
  return out;
}
function nums(s){
  if(!s)return[];
  return[...new Set((String(s).match(/\b(?:S)?(\d{1,2})\b/g)||[])
    .map(x=>Number(x.replace(/^S/i,''))).filter(x=>Number.isInteger(x)&&x>=0&&x<=78))].sort((a,b)=>a-b);
}
function parseCN(text){
  const t=String(text||''),cm=t.match(/\bC(?:ANDIDATES?)?\s*[:=]\s*\[?([^\];|\n]*)\]?/i);
  return{C:cm?nums(cm[1]):[],matched:Boolean(cm)};
}
function parseScreenEnvelope(envelope,a){
  const aid=a.assertionId,locked=lockedSubjectSet(aid),chunks=[];
  for(const o of collectObjects(envelope?.result??envelope,[])){
    const phrase=clean(o.phrase||o.title||o.name||o.label),desc=clean(o.description||o.summary||o.text||o.note);
    if(phrase.toUpperCase().includes(aid)||desc.toUpperCase().includes(aid))chunks.push(`${phrase}\n${desc}\n${clean(o.evidence)}`);
  }
  for(const s of collectStrings(envelope?.result??envelope,[]))if(String(s).toUpperCase().includes(aid))chunks.push(String(s));
  if(!chunks.length)chunks.push(...collectStrings(envelope?.result??envelope,[]));
  for(const chunk of chunks){
    const p=parseCN(chunk);if(!p.matched)continue;
    return{
      assertionId:aid,
      candidateSubjectIndexes:p.C.filter(si=>!locked.has(si)),
      screenRationale:clean(chunk).slice(0,1000),
      screenParseMode:'native-observation-v72'
    };
  }
  return null;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function callSemantic(payload,onRetry){
  const api=globalThis.GenreactrixCloudApi;
  if(!api?.emojeoSemanticDiscovery)throw new Error('Semantic Discovery Worker adapter unavailable.');
  if(!clean(api.getBaseUrl?.()))throw new Error('AI Worker URL is not configured.');
  if(!clean(api.getKey?.()))throw new Error('Analysis key is not configured.');
  let n=0;
  for(;;){
    try{return await api.emojeoSemanticDiscovery(payload)}
    catch(e){
      n++;if(n>=6)throw e;
      const d=Math.min(30000,2000*Math.pow(2,Math.min(n-1,4)));
      onRetry?.({attempt:n,delay:d,error:e});await sleep(d);
    }
  }
}
async function screenOneAssertion(ai,screenPass){
  const a=universe.assertions[ai];let lastError='unparseable screen';
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const env=await callSemantic(
        semanticScreenRequest(a,screenPass,attempt===1?'':`Previous response was not parseable. Return ONE observation with C=[...] exactly. Attempt ${attempt}/3.`),
        r=>setStatus(`SCREEN ${screenPass} NETWORK RETRY ${r.attempt}/5 · ${a.assertionId}\n${r.error?.message||r.error}`)
      );
      const parsed=parseScreenEnvelope(env,a);
      if(parsed)return{
        id:screenRecordId(ai,screenPass),kind:'emojeo-step4-sparse-screen-result-v72',jobId:JOB_ID,
        assertionIndex:ai,screenPass,assertion:parsed,completedAt:new Date().toISOString()
      };
      lastError='valid response contained no parseable C=[...]';
    }catch(e){lastError=clean(e?.message||e)}
  }
  // High-recall safety: parsing/provider failure can never become a false negative.
  const locked=lockedSubjectSet(a.assertionId),all=[];
  for(let si=0;si<79;si++)if(!locked.has(si))all.push(si);
  return{
    id:screenRecordId(ai,screenPass),kind:'emojeo-step4-sparse-screen-result-v72',jobId:JOB_ID,
    assertionIndex:ai,screenPass,
    assertion:{assertionId:a.assertionId,candidateSubjectIndexes:all,screenRationale:`Pass 72 fail-safe all-candidates: ${lastError}`,screenParseMode:'fail-safe-all-candidates-v72'},
    completedAt:new Date().toISOString()
  };
}

function reviewPrompt(subject,a,role,attempt,prior=null){
  const m=relationshipMeta(a),allowed=allowedRoutes(a).join(', ');
  let roleText='';
  if(role==='supporter')roleText='SUPPORTER: search hard for a legitimate route satisfying THIS exact predicate. Protect conditional/sometimes-true semantic links when they are recognizable; do not invent a bespoke scene.';
  else if(role==='falsifier')roleText='FALSIFIER: attack predicate bending. Reject co-occurrence, category difference, possible consequences, personal preference, creative use, association masquerading as similarity/contrast, and any route not licensed by the predicate. Do not reject a legitimate conditional relationship just because it is not universal.';
  else if(role==='adjudicator')roleText='ADJUDICATOR: resolve the two reviews using the exact contract. PRESENT only for a recognizable typed relationship. UNCERTAIN for a genuinely plausible but unresolved typed relationship. ABSENT for invented/context-only/neighboring-predicate reasoning.';
  else roleText='FINAL VALIDATOR: audit the provisional decision itself. If the evidence actually proves a different relationship, uses an invented scenario, relies on mere co-occurrence/category difference, or violates the allowed route, return ABSENT. If the exact predicate fit is legitimate but borderline, return UNCERTAIN. Otherwise return PRESENT.';
  const priorBlock=[];
  if(prior?.supporter){
    priorBlock.push(
      '',
      `SUPPORTER: STATE=${prior.supporter.state.toUpperCase()}; CONFIDENCE=${prior.supporter.confidence.toUpperCase()}; ROUTE=${prior.supporter.route}; BASIS=${prior.supporter.basis}; EVIDENCE=${prior.supporter.evidence}`,
      `FALSIFIER: STATE=${prior.falsifier.state.toUpperCase()}; CONFIDENCE=${prior.falsifier.confidence.toUpperCase()}; ROUTE=${prior.falsifier.route}; BASIS=${prior.falsifier.basis}; EVIDENCE=${prior.falsifier.evidence}`
    );
  }
  if(prior?.provisional){
    priorBlock.push(
      '',
      `PROVISIONAL: STATE=${prior.provisional.state.toUpperCase()}; CONFIDENCE=${prior.provisional.confidence.toUpperCase()}; ROUTE=${prior.provisional.route}; BASIS=${prior.provisional.basis}; EVIDENCE=${prior.provisional.evidence}`
    );
  }
  return[
    'EMOJEO STEP 4 PASS 72 — ROUTE-GATED TYPED-PREDICATE REVIEW',
    roleText,
    `Emoji: ${subject.glyph} ${subject.name}`,
    `Fixed assertion: ${a.assertionId}|${a.relationshipType}|${a.tag}`,
    `Relationship domain: ${m.domain||'(none)'}`,
    `Relationship definition: ${m.definition}`,
    `Allowed route labels for a non-ABSENT answer: ${allowed}`,
    `Predicate contract: ${predicateContract(a)}`,
    `Existing Step 3 seed context: ${seedText(a)}`,
    '',
    'Seed context explains lineage only; it is not proof for this emoji.',
    'Do not rewrite the relationship type or tag.',
    'STATE calibration:',
    'PRESENT = recognizable, defensible relationship through THIS predicate. It may be conditional/sometimes true.',
    'UNCERTAIN = a real predicate-fitting route is plausible but genuinely unresolved.',
    'ABSENT = no legitimate route through this predicate; this includes invented scenarios and reasoning that really proves another relationship.',
    'NOT_EVALUATED = essential information is unavailable or the response cannot be responsibly assessed.',
    '',
    'ROUTE labels:',
    'DIRECT_VISUAL = directly visible feature/composition/action/expression.',
    'CONVENTIONAL_SEMANTIC = widely recognizable conventional meaning/use.',
    'SYMBOLIC_METAPHORIC = recognizable symbolic/metaphorical meaning, not a bespoke story.',
    'FUNCTIONAL = conventional function/use/affordance.',
    'CONTEXTUAL = the emoji conventionally implies the environment/context itself.',
    'CONDITION_SYMPTOM = subject denotes a condition/state/experience for which the tag is a recognized manifestation.',
    'SHARED_AXIS = similarity/contrast grounded in a salient shared basis; contrast additionally requires opposition on that same axis.',
    'VENDOR_RENDERING = materially different renderer/vendor visual form of the same encoded emoji.',
    'EXACT_REFERENCE = exact/reusable meme, reaction, title, character, episode, or equivalent reference.',
    'NONE = predicate fails.',
    ...priorBlock,
    '',
    'Use the normal Semantic Discovery JSON structure.',
    `Return one observation whose phrase is exactly "${a.assertionId}" and dimension is "other".`,
    'The observation description MUST begin exactly with:',
    'STATE=<PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED>; CONFIDENCE=<HIGH|MEDIUM|LOW>; ROUTE=<one route label>; BASIS=<short basis>; EVIDENCE=<specific evidence>',
    'For ABSENT use ROUTE=NONE. BASIS must name the failed comparison/role, not just say "none".',
    `Attempt ${attempt}/3.`
  ].join('\n');
}
function parseReview(env,subject,a,mode){
  const chunks=[];
  for(const o of collectObjects(env?.result??env,[])){
    const phrase=clean(o.phrase||o.title||o.name||o.label),desc=clean(o.description||o.summary||o.text||o.note);
    const ev=Array.isArray(o.evidence)?o.evidence.join(' '):clean(o.evidence);
    if(phrase.toUpperCase().includes(a.assertionId)||/\bSTATE\s*[:=]/i.test(desc))chunks.push(`${phrase}\n${desc}\n${ev}`);
  }
  for(const s of collectStrings(env?.result??env,[]))if(/\bSTATE\s*[:=]\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\b/i.test(String(s)))chunks.push(String(s));
  for(const t of chunks){
    const sm=t.match(/\bSTATE\s*[:=]\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\b/i);
    const cm=t.match(/\bCONFIDENCE\s*[:=]\s*(HIGH|MEDIUM|LOW)\b/i);
    const rm=t.match(/\bROUTE\s*[:=]\s*([A-Z_]+)\b/i);
    const bm=t.match(/\bBASIS\s*[:=]\s*(.*?)(?=\s*;\s*EVIDENCE\s*[:=]|\n\s*EVIDENCE\s*[:=]|$)/is);
    const em=t.match(/\bEVIDENCE\s*[:=]\s*(.+)$/is);
    if(!sm||!cm||!rm||!bm||!em)continue;
    const state=sm[1].toLowerCase(),confidence=cm[1].toLowerCase(),route=rm[1].toUpperCase(),basis=clean(bm[1]).slice(0,500),evidence=clean(em[1]).slice(0,1400);
    if(!VALID_STATES.has(state)||!VALID_CONFIDENCE.has(confidence)||!VALID_ROUTES.has(route)||!basis||!evidence)continue;
    return{subjectIndex:subject.subjectIndex,assertionId:a.assertionId,state,confidence,route,basis,evidence,reviewMode:mode,failed:false};
  }
  return null;
}
async function runOneReview(si,aid,role,prior=null){
  const subject=runSpec.subjects[si],a=assertionById.get(aid);let lastError='unparseable response';
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const env=await callSemantic({
        schemaVersion:1,kind:`emojeo-step4-pass72-${role}`,
        subject:{id:`${subject.glyph}:${subject.name}`,glyph:subject.glyph,name:subject.name},
        domain:'Step 4 Pass 72 route-gated typed-predicate review',
        relationshipTypes:[a.relationshipType],assertionIds:[aid],
        prompt:reviewPrompt(subject,a,role,attempt,prior)
      },r=>setStatus(`${role.toUpperCase()} NETWORK RETRY ${r.attempt}/5 · ${subject.glyph} ${subject.name} · ${aid}\n${r.error?.message||r.error}`));
      const parsed=parseReview(env,{...subject,subjectIndex:si},a,role);
      if(parsed)return routeGate(a,parsed);
      lastError='Semantic Discovery returned no parseable STATE/CONFIDENCE/ROUTE/BASIS/EVIDENCE block.';
    }catch(e){lastError=clean(e?.message||e)}
  }
  return{subjectIndex:si,assertionId:aid,state:'not_evaluated',confidence:'low',route:'NONE',basis:'provider failure',evidence:`Provider/review failure: ${lastError}`,reviewMode:`${role}-provider-failure`,failed:true};
}
function combineSame(supporter,falsifier){
  if(supporter.state!==falsifier.state)return null;
  const conf=supporter.confidence===falsifier.confidence?supporter.confidence:'medium';
  const route=supporter.state==='absent'?'NONE':(supporter.route===falsifier.route?supporter.route:supporter.route);
  return{
    state:supporter.state,confidence:conf,route,
    basis:`Supporter: ${supporter.basis} | Falsifier: ${falsifier.basis}`.slice(0,700),
    evidence:`Dual reviewers agreed ${supporter.state.toUpperCase()}. Supporter: ${supporter.evidence} Falsifier: ${falsifier.evidence}`.slice(0,1600)
  };
}
async function verifyOneCell(si,aid){
  const subject=runSpec.subjects[si],a=assertionById.get(aid);
  const [supporter,falsifier]=await Promise.all([runOneReview(si,aid,'supporter'),runOneReview(si,aid,'falsifier')]);

  if(supporter.failed||falsifier.failed){
    const value={
      subjectIndex:si,assertionId:aid,state:'not_evaluated',confidence:'low',route:'NONE',basis:'required reviewer failure',
      evidence:`Required reviewer failure. Supporter: ${supporter.evidence} Falsifier: ${falsifier.evidence}`,
      verificationParseMode:'provider-failure-pending-v72',
      reviewSummary:{supporter,falsifier,adjudicator:null,validator:null}
    };
    return{id:verifyRecordId(si,aid),kind:'emojeo-step4-cell-verify-result-v72',jobId:JOB_ID,subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:aid,value,providerFailurePending:true,completedAt:new Date().toISOString()};
  }

  let provisional=combineSame(supporter,falsifier),adjudicator=null,validator=null;
  if(!provisional){
    adjudicator=await runOneReview(si,aid,'adjudicator',{supporter,falsifier});
    if(adjudicator.failed){
      const value={
        subjectIndex:si,assertionId:aid,state:'not_evaluated',confidence:'low',route:'NONE',basis:'adjudicator failure',
        evidence:adjudicator.evidence,verificationParseMode:'provider-failure-pending-v72',
        reviewSummary:{supporter,falsifier,adjudicator,validator:null}
      };
      return{id:verifyRecordId(si,aid),kind:'emojeo-step4-cell-verify-result-v72',jobId:JOB_ID,subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:aid,value,providerFailurePending:true,completedAt:new Date().toISOString()};
    }
    provisional={state:adjudicator.state,confidence:adjudicator.confidence,route:adjudicator.route,basis:adjudicator.basis,evidence:adjudicator.evidence};
  }

  let final={...provisional};
  if(final.state==='present'||final.state==='uncertain'){
    validator=await runOneReview(si,aid,'validator',{supporter,falsifier,provisional});
    if(validator.failed){
      const value={
        subjectIndex:si,assertionId:aid,state:'not_evaluated',confidence:'low',route:'NONE',basis:'validator failure',
        evidence:validator.evidence,verificationParseMode:'provider-failure-pending-v72',
        reviewSummary:{supporter,falsifier,adjudicator,validator}
      };
      return{id:verifyRecordId(si,aid),kind:'emojeo-step4-cell-verify-result-v72',jobId:JOB_ID,subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:aid,value,providerFailurePending:true,completedAt:new Date().toISOString()};
    }
    if(validator.state==='absent')final={state:'absent',confidence:validator.confidence,route:'NONE',basis:validator.basis,evidence:`FINAL VALIDATOR REJECTED provisional ${provisional.state.toUpperCase()}. ${validator.evidence}`};
    else if(validator.state==='uncertain')final={state:'uncertain',confidence:'medium',route:validator.route,basis:validator.basis,evidence:`FINAL VALIDATOR left genuine ambiguity. ${validator.evidence}`};
    else final={state:'present',confidence:provisional.confidence,route:validator.route,basis:validator.basis,evidence:`FINAL VALIDATOR CONFIRMED. ${validator.evidence}`};
  }

  const value={
    subjectIndex:si,assertionId:aid,state:final.state,confidence:final.confidence,route:final.route,basis:final.basis,evidence:final.evidence,
    verificationParseMode:'pass72-gated-review',
    reviewSummary:{supporter,falsifier,adjudicator,validator}
  };
  return{id:verifyRecordId(si,aid),kind:'emojeo-step4-cell-verify-result-v72',jobId:JOB_ID,subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:aid,value,providerFailurePending:false,completedAt:new Date().toISOString()};
}

async function runPool(tasks,worker,label){
  let next=0,done=0;
  async function lane(i){
    while(true){
      if(stopRequested)return;
      const n=next++;if(n>=tasks.length)return;
      setStatus(`${label} · ${done}/${tasks.length} complete · lane ${i+1}/${CONCURRENCY}`);
      await worker(tasks[n]);done++;render();
    }
  }
  await Promise.all(Array.from({length:Math.min(CONCURRENCY,tasks.length)},(_,i)=>lane(i)));
}
async function runScreen(limit){
  const have=new Set(pass72ScreenRows().map(r=>`${r.assertionIndex}|${r.screenPass}`)),tasks=[];
  for(let ai=0;ai<limit;ai++)for(const pass of SCREEN_PASSES)if(!have.has(`${ai}|${pass}`))tasks.push({ai,pass});
  await runPool(tasks,async t=>{
    const rec=await screenOneAssertion(t.ai,t.pass);
    await dbPut(SCREEN_STORE,rec);
    screenRecords=screenRecords.filter(x=>x.id!==rec.id);screenRecords.push(rec);
    job.lastCompleted={stage:'screen72',assertionIndex:t.ai,screenPass:t.pass,at:rec.completedAt};await dbPut(JOB_STORE,job);
  },`PASS 72 TRIPLE SCREEN through ${limit}`);
}
async function runVerify(limit){
  const ver=verifiedCellMap(),tasks=[];
  for(let ai=0;ai<limit;ai++){
    const aid=universe.assertions[ai].assertionId;
    for(const si of candidateSubjectIndexesForAssertion(aid,limit))if(!ver.has(cellKey(si,aid)))tasks.push({si,aid});
  }
  await runPool(tasks,async t=>{
    const rec=await verifyOneCell(t.si,t.aid);
    await dbPut(VERIFY_STORE,rec);
    verifyRecords=verifyRecords.filter(x=>x.id!==rec.id);verifyRecords.push(rec);
    job.lastCompleted={stage:'verify72',subjectIndex:t.si,assertionId:t.aid,at:rec.completedAt};await dbPut(JOB_STORE,job);
  },`PASS 72 GATED VERIFY through ${limit}`);
}
async function runScope(limit){
  if(running)return;
  running=true;stopRequested=false;job.runIntent={active:true,limit,requestedAt:new Date().toISOString()};await dbPut(JOB_STORE,job);render();
  try{
    await runScreen(limit);
    if(stopRequested){setStatus('STOPPED · completed screens are checkpointed.');return}
    await runVerify(limit);
    if(stopRequested){setStatus('STOPPED · completed verification is checkpointed.');return}
    job.runIntent={active:false,completedAt:new Date().toISOString()};await dbPut(JOB_STORE,job);

    const cand=candidateCellSet(limit),ver=verifiedCellMap(),pending=pendingProviderFailureMap();
    const remaining=[...cand].filter(k=>!ver.has(k)).length,pendingCount=[...cand].filter(k=>!ver.has(k)&&pending.has(k)).length;
    if(remaining){
      setStatus(`PASS 72 PILOT NEEDS RETRY · ${remaining} candidate cell(s) remain unverified, including ${pendingCount} provider-failure pending.\nTap RUN PASS 72 PILOT again; completed work is preserved and only unfinished cells retry.`);
      return;
    }
    const assignments=buildAssignments(limit),rr=regressionResults(limit,assignments),failed=rr.filter(x=>!x.pass);
    if(failed.length){
      setStatus(`PASS 72 MECHANICALLY COMPLETE BUT SEMANTIC REGRESSION FAILED · ${rr.length-failed.length}/${rr.length} gates passed.\n${failed.map(x=>`FAIL ${x.label}: expected ${x.expected.toUpperCase()}, got ${x.actual.toUpperCase()}`).join('\n')}\nDownload the checkpoint and upload it here. FULL remains locked.`);
      return;
    }
    setStatus(`PASS 72 PILOT COMPLETE · all candidate cells verified and ${rr.length}/${rr.length} semantic regression gates passed.\nTap DOWNLOAD PASS 72 CHECKPOINT and upload that JSON here.`);
  }catch(e){
    job.runIntent={active:false,limit,lastError:clean(e?.message||e),lastErrorAt:new Date().toISOString()};await dbPut(JOB_STORE,job).catch(()=>{});
    setStatus(`STOPPED ON ERROR · ${e?.message||e}\nRefresh/reopen Pass 72 to resume.`);
  }finally{
    if(job?.runIntent?.active){job.runIntent.active=false;await dbPut(JOB_STORE,job).catch(()=>{})}
    running=false;stopRequested=false;render();
  }
}

function screensByAid(){
  const m=new Map();
  for(const r of pass72ScreenRows()){
    const aid=r.assertion?.assertionId;if(!aid)continue;
    if(!m.has(aid))m.set(aid,[]);m.get(aid).push(r);
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
    for(const x of REGRESSION_ANCHORS)if(x.assertionId===a.assertionId)C.add(x.subjectIndex);
    const screenEvidence=screens.map(r=>`${r.screenPass}: ${clean(r.assertion?.screenRationale).slice(0,250)}`).join(' | ');
    for(let si=0;si<79;si++){
      const key=cellKey(si,a.assertionId),subject=runSpec.subjects[si],locked=lockedStateByCell.get(key);
      if(locked){
        out.push({...clone(locked),subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,source:'step3-locked-prefill'});
        continue;
      }
      const v=ver.get(key);
      if(v){
        out.push({subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,state:v.state,confidence:v.confidence,route:v.route,basis:v.basis,evidence:v.evidence,reviewSummary:v.reviewSummary||null,source:'step4-pass72-gated-verification'});
        continue;
      }
      if(C.has(si))continue;
      out.push({subjectIndex:si,subject:{glyph:subject.glyph,name:subject.name},assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag,state:'absent',confidence:'medium',route:'NONE',basis:'omitted by all three high-recall screens',evidence:`All three independent Pass 72 high-recall screens omitted this cell under the exact predicate contract. ${screenEvidence}`.slice(0,1400),source:'step4-pass72-triple-screen-absent'});
    }
  }
  return out.sort((x,y)=>x.subjectIndex-y.subjectIndex||assertionIndexById.get(x.assertionId)-assertionIndexById.get(y.assertionId));
}
async function downloadCheckpoint(){
  const limit=PILOT_ASSERTIONS,assignments=buildAssignments(limit),counts={present:0,absent:0,uncertain:0,not_evaluated:0};
  for(const a of assignments)counts[a.state]=(counts[a.state]||0)+1;
  const cand=candidateCellSet(limit),ver=verifiedCellMap(),pending=pendingProviderFailureMap();
  const active=verifyRecords.filter(r=>r?.kind==='emojeo-step4-cell-verify-result-v72'&&assertionIndexById.get(r.assertionId)<limit);
  let agreement=0,adjudicated=0,validated=0;
  for(const r of active){
    const s=r.value?.reviewSummary;if(!s)continue;
    if(s.adjudicator)adjudicated++;else agreement++;
    if(s.validator)validated++;
  }
  const rr=regressionResults(limit,assignments);
  const out={
    schemaVersion:1,kind:'emojeo-step4-sparse-matrix-checkpoint',runnerVersion:'pass72',createdAt:new Date().toISOString(),
    strategy:{
      screening:'Three independent one-assertion high-recall typed-predicate screens: direct recall, semantic bridge, false-negative challenge; candidate set is their union plus explicit regression fixtures',
      verification:'Two independent single-cell reviewers; disagreements go to adjudicator; every provisional PRESENT/UNCERTAIN goes through a final validator; all required stages must parse successfully or the cell remains provider-failure pending',
      semanticPolicy:'include legitimate conditional/sometimes-true typed relationships; reject invented scenarios, category difference/co-occurrence, consequence drift, neighboring-predicate substitution, and route types not licensed by the exact relationship',
      routeGate:'Each non-ABSENT review carries an explicit semantic route label and is deterministically rejected if that route is not allowed for the relationship type',
      symptomPolicy:'condition/state/experience may be conventionally or metaphorically denoted; symptom need not be universal or diagnostic; recognizable condition→manifestation is sufficient',
      visiblePredicatePolicy:'HAS_EXPRESSION, HAS_POSE_GESTURE, HAS_OBJECT, HAS_PART require DIRECT_VISUAL route only',
      regressionGate:'Known semantic regressions are verified as ordinary cells and must match expected states before the pilot is considered semantically complete',
      ontologyDomainPolicy:'descriptive context, not a hard applicability gate',
      providerFailurePolicy:'pending-not-counted-as-verified',
      fullRunLocked:true,cellConcurrency:2,maxParallelProviderRequests:4
    },
    inputs:{
      assertionUniverse:{file:INPUTS.universe,sha256:runSpec.inputs.assertionUniverse.sha256},
      prefill:{file:INPUTS.prefill,sha256:runSpec.inputs.prefill.sha256},
      ontology:{file:INPUTS.ontology,sha256:ontologySha256,relationshipCount:ontology.relationshipCount}
    },
    scopeAssertionCount:limit,scopeMatrixCellCount:limit*79,scopeComplete:scopeComplete(limit),
    screenedAssertionCount:screenedAssertionIds(limit).size,
    sparseCandidateCellCount:cand.size,pass72VerifiedCandidateCellCount:[...cand].filter(k=>ver.has(k)).length,
    providerFailurePendingCellCount:[...cand].filter(k=>!ver.has(k)&&pending.has(k)).length,
    dualReviewerAgreementCellCount:agreement,adjudicatedCellCount:adjudicated,validatorCellCount:validated,
    semanticRegressionPass:rr.every(x=>x.pass),semanticRegressionResults:rr,
    assignmentCount:assignments.length,stateCounts:counts,
    screenResults:pass72ScreenRows().filter(r=>r.assertionIndex<limit).sort((a,b)=>a.assertionIndex-b.assertionIndex||String(a.screenPass).localeCompare(String(b.screenPass))),
    verificationResults:active,assignments
  };
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`emojeo-step4-sparse-pass72-${limit}assertions-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);
}

async function initialize(){
  try{
    const [ut,pt,rt,ot]=await Promise.all([fetchText(INPUTS.universe),fetchText(INPUTS.prefill),fetchText(INPUTS.runSpec),fetchText(INPUTS.ontology)]);
    universe=JSON.parse(ut);prefill=JSON.parse(pt);runSpec=JSON.parse(rt);ontology=JSON.parse(ot);
    if(universe.assertionCount!==1278||prefill.lockedAssignmentCount!==1326||runSpec.scope?.subjectCount!==79)throw new Error('Pass 62 input mismatch.');
    if(ontology.relationshipCount!==1211||!Array.isArray(ontology.relationships))throw new Error('Pass 72 ontology mismatch; expected sealed 1,211 relationship types.');
    const [ush,psh,osh]=await Promise.all([sha256Hex(ut),sha256Hex(pt),sha256Hex(ot)]);ontologySha256=osh;
    if(ush!==runSpec.inputs.assertionUniverse.sha256||psh!==runSpec.inputs.prefill.sha256)throw new Error('Pass 62 input SHA mismatch.');
    for(const row of ontology.relationships)if(row?.relationshipType)relationshipMetaByType.set(row.relationshipType,{domain:clean(row.domain),definition:clean(row.definition)});
    universe.assertions.forEach((a,i)=>{assertionById.set(a.assertionId,a);assertionIndexById.set(a.assertionId,i);if(!relationshipMetaByType.has(a.relationshipType))throw new Error(`Assertion ${a.assertionId} relationship ${a.relationshipType} is missing from the sealed ontology.`)});
    for(const a of prefill.assignments){const k=cellKey(a.subjectIndex,a.assertionId);if(lockedStateByCell.has(k))throw new Error(`Duplicate locked ${k}`);lockedStateByCell.set(k,clone(a))}
    job=await dbGet(JOB_STORE,JOB_ID)||{id:JOB_ID,kind:'emojeo-step4-pass72-job',schemaVersion:1,createdAt:new Date().toISOString(),assertionUniverseSha256:ush,prefillSha256:psh,runIntent:{active:false}};
    job.ontologySha256=osh;await dbPut(JOB_STORE,job);
    [screenRecords,verifyRecords]=await Promise.all([dbGetByJob(SCREEN_STORE,JOB_ID),dbGetByJob(VERIFY_STORE,JOB_ID)]);
    job.runIntent={active:false,restoredBy:'pass72',restoredAt:new Date().toISOString()};await dbPut(JOB_STORE,job);
    const cand=candidateCellSet(PILOT_ASSERTIONS),valid=verifiedCellMap(),pending=pendingProviderFailureMap();
    setStatus(`READY FOR PASS 72 · ${screenedAssertionIds(PILOT_ASSERTIONS).size}/24 assertions have all three screens.\n${cand.size} union candidate cells currently known; ${valid.size} verified and ${pending.size} provider-failure pending.\nTap RUN PASS 72 PILOT. Missing screens run first, then only candidate cells are verified.`);
    render();
  }catch(e){job=null;setStatus(`INITIALIZATION FAILED · ${e?.message||e}`);render()}
}

$('pilot').addEventListener('click',()=>runScope(PILOT_ASSERTIONS));
$('full').addEventListener('click',()=>{});
$('stop').addEventListener('click',async()=>{
  if(!running)return;stopRequested=true;
  if(job){job.runIntent={active:false,stopRequestedAt:new Date().toISOString()};await dbPut(JOB_STORE,job).catch(()=>{})}
  setStatus('STOP REQUESTED · no new requests will start; in-flight requests finish and checkpoint.');
});
$('download').addEventListener('click',()=>downloadCheckpoint().catch(e=>setStatus(`DOWNLOAD FAILED · ${e?.message||e}`)));

render();initialize();
})();