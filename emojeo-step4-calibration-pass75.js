(()=>{'use strict';
const $=id=>document.getElementById(id),clean=v=>String(v??'').trim();
const INPUTS={u:'Emojeo_STEP4_Assertion_Universe_v001.json',r:'Emojeo_STEP4_RunSpec_v001.json',o:'Emojeo_STEP3_Semantic_Inventory_1211_v013.json'};
const KEY='emojeo-step4-pass75-calibration-results-v1';
const LEGACY_KEY='emojeo-step4-pass74-calibration-results-v1';
const FIX=[
{id:'P01',si:3, aid:'A0003',exp:'present',mode:'hard',label:'🥳 CONVEYS_EMOTION → happiness'},
{id:'P02',si:3, aid:'A0007',exp:'present',mode:'hard',label:'🥳 HAS_POSITIVE_VALENCE → positive'},
{id:'P03',si:54,aid:'A0014',exp:'present',mode:'hard',label:'💔 HAS_NEGATIVE_VALENCE → distress'},
{id:'P04',si:54,aid:'A0017',exp:'present',mode:'hard',label:'💔 HAS_SYMPTOM → sobbing'},
{id:'P05',si:0, aid:'A0001',exp:'present',mode:'hard',label:'😀 HAS_EXPRESSION → grin'},
{id:'P06',si:1, aid:'A0021',exp:'present',mode:'hard',label:'😭 SIMILAR_TO → 😢 crying face'},
{id:'N01',si:54,aid:'A0010',exp:'absent',mode:'hard',label:'💔 IMPLIES_SETTING → audible_crying_environment'},
{id:'I01',si:24,aid:'A0004',exp:null,mode:'interpretive',label:'🥓 CONTRASTS_WITH → 😊'},
{id:'N03',si:38,aid:'A0019',exp:'absent',mode:'hard',label:'🧽 HAS_OBJECT → tears'},
{id:'N04',si:46,aid:'A0022',exp:'absent',mode:'hard',label:'🔓 HAS_PART → exaggerated_mouth'},
{id:'N05',si:29,aid:'A0011',exp:'absent',mode:'hard',label:'🎸 HAS_FUNCTION → express_distress'},
{id:'I02',si:72,aid:'A0017',exp:null,mode:'interpretive',label:'💦 HAS_SYMPTOM → sobbing'}];
const STATES=new Set(['present','absent','uncertain','not_evaluated']);
const CONFS=new Set(['high','medium','low']);
const ROUTES=new Set(['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC','FUNCTIONAL','CONTEXTUAL','CONDITION_SYMPTOM','SHARED_AXIS','VENDOR_RENDERING','EXACT_REFERENCE','NONE','UNSPECIFIED']);
let U,R,O,A=new Map(),M=new Map(),results=[],running=false,stop=false;

function routes(a){
 const x={
 HAS_EXPRESSION:['DIRECT_VISUAL'],HAS_POSE_GESTURE:['DIRECT_VISUAL'],HAS_OBJECT:['DIRECT_VISUAL'],HAS_PART:['DIRECT_VISUAL'],
 HAS_PLATFORM_RENDERING_VARIANT:['VENDOR_RENDERING'],HAS_FUNCTION:['FUNCTIONAL'],HAS_SYMPTOM:['CONDITION_SYMPTOM','CONVENTIONAL_SEMANTIC'],
 IMPLIES_SETTING:['CONTEXTUAL','CONVENTIONAL_SEMANTIC'],CONTRASTS_WITH:['SHARED_AXIS','CONVENTIONAL_SEMANTIC'],SIMILAR_TO:['SHARED_AXIS','CONVENTIONAL_SEMANTIC'],MEME_REFERENCE:['EXACT_REFERENCE','CONVENTIONAL_SEMANTIC'],
 REACTION_IMAGE_REFERENCE:['EXACT_REFERENCE','CONVENTIONAL_SEMANTIC'],HAS_STATE_CONDITION:['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC'],
 CONVEYS_EMOTION:['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC'],
 HAS_POSITIVE_VALENCE:['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC'],
 HAS_NEGATIVE_VALENCE:['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC'],
 SYMBOLIZES_ASSOCIATES_WITH:['CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC']};
 return x[a.relationshipType]||['DIRECT_VISUAL','CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC','FUNCTIONAL','CONTEXTUAL','CONDITION_SYMPTOM','SHARED_AXIS','EXACT_REFERENCE'];
}
function guard(a){
 const x={
 HAS_EXPRESSION:'The expression itself must be visibly represented.',
 HAS_OBJECT:'The tag must itself be a discrete visible accompanying/held/worn/used object in the depicted composition. A hypothetical interaction is not enough.',
 HAS_PART:'The tag must itself be a visible constitutive/anatomical/structural part. Look-alikes or metaphorical substitutions do not count.',
 HAS_FUNCTION:'The tag must be a conventional function/use/affordance of the represented thing or a conventional communicative function of the emoji. A possible creative use is not enough.',
 HAS_SYMPTOM:'Interpret the subject as the condition/state/experience it conventionally denotes. The tag may be a recognizable manifestation even if not universal, diagnostic, or medically literal. Do not accept mere co-occurrence alone, but do not reject a recognizable conventional manifestation merely because it is non-universal.',
 IMPLIES_SETTING:'The emoji must imply the environment/context itself. A consequence, activity, sound, or emotion that could occur somewhere does not become a setting.',
 CONTRASTS_WITH:'Look for a defensible shared comparison axis with meaningful opposition. Mere difference is not enough, but a non-canonical contrast can still be real; UNCERTAIN is allowed.',
 SIMILAR_TO:'Require a salient shared property/form/state/function/role/meaning between the concepts themselves. Co-occurrence alone is not similarity, but shared state/function/meaning can support it.',
 HAS_PLATFORM_RENDERING_VARIANT:'Use the sealed definition literally: the same encoded emoji has renderer-specific visual forms. Do not add a “material divergence” threshold.',
 CONVEYS_EMOTION:'The sealed predicate includes emotion conveyed OR semantically associated. Do not require literal facial expression or universality.',
 HAS_POSITIVE_VALENCE:'Do not use the ontology domain as a hard gate. Conventional positive valence need not be universal.',
 HAS_NEGATIVE_VALENCE:'Do not use the ontology domain as a hard gate. Conventional negative valence need not be universal.'
 };
 return x[a.relationshipType]||'Use the sealed ontology definition as authority. Do not add requirements that are not in it.';
}
function seeds(a){return(a.seedSources||[]).map(x=>`${x.subject?.glyph||''} ${x.subject?.name||''}=${String(x.state||'').toUpperCase()}: ${x.evidence||''}`).join(' | ')||'none'}
function prompt(f,n,repair=false){
 const s=R.subjects[f.si],a=A.get(f.aid),m=M.get(a.relationshipType),rt=routes(a).join(', ');
 const verdictFormat=`${f.id}|STATE=<PRESENT|ABSENT|UNCERTAIN>|ROUTE=<DIRECT_VISUAL|CONVENTIONAL_SEMANTIC|SYMBOLIC_METAPHORIC|FUNCTIONAL|CONTEXTUAL|CONDITION_SYMPTOM|SHARED_AXIS|VENDOR_RENDERING|EXACT_REFERENCE|NONE>`;
 const repairLines=repair?[
   '',
   'FORMAT REPAIR: The previous response could not be read by the runner.',
   `Put the verdict token in BOTH summary and observations[0].phrase using exactly this pattern: ${verdictFormat}`,
   'Do not put the verdict only in prose.'
 ]:[];
 return[
 'EMOJEO STEP 4 PASS 75 — NATIVE-SCHEMA CALIBRATION',
 'Judge ONE emoji against ONE exact assertion.',
 'The SEALED ONTOLOGY DEFINITION is authoritative. Anti-drift guidance may block clearly invalid reasoning but MUST NOT narrow the ontology.',
 'The ontology domain is descriptive context, NOT a hard applicability gate.',
 'Do NOT require the relationship to be universal, necessary, diagnostic, or true in every use.',
 'If a recognizable and defensible relationship satisfies the exact predicate, favor surfacing it as PRESENT even when conditional or only sometimes true.',
 'Use UNCERTAIN freely when PRESENT and ABSENT are both understandable readings. UNCERTAIN is a valid discovery result, not a failure.',
 'ABSENT is for invented scenarios, possible-consequence-only reasoning, co-occurrence-only reasoning, category difference, or reasoning that clearly proves another predicate.',
 'Do not try to match a hidden expected answer. There is no expected answer in this prompt.',
 `SUBJECT=${s.glyph} ${s.name}`,
 `ASSERTION=${a.assertionId}|${a.relationshipType}|${a.tag}`,
 `ONTOLOGY_DOMAIN=${m.domain||'(none)'}`,
 `ONTOLOGY_DEFINITION=${m.definition}`,
 `PREFERRED_ROUTE_LABELS=${rt}`,
 `ANTI_DRIFT=${guard(a)}`,
 `STEP3_SEED_CONTEXT=${seeds(a)}`,
 'Seed context gives lineage only; it does not force this subject to match.',
 'A non-preferred route is allowed if the exact predicate is still defensible; explain why.',
 '',
 'IMPORTANT: The Worker already forces a native Semantic Discovery JSON schema.',
 'Return exactly ONE observation.',
 `Set rawDiscovery.summary to this verdict-token pattern: ${verdictFormat}`,
 `Set observations[0].phrase to the SAME verdict-token pattern: ${verdictFormat}`,
 'Set observations[0].dimension to "other".',
 'Put your normal reasoning in observations[0].description.',
 'Put concrete support in observations[0].evidence.',
 'Use the native numeric observations[0].confidence field (0.0 to 1.0).',
 'Do NOT try to create state/confidence/route JSON fields; they are not part of the Worker schema.',
 ...repairLines,
 `Attempt ${n}/3.`
 ].join('\n');
}
function strings(v,o=[]){if(typeof v==='string'){o.push(v);return o}if(Array.isArray(v)){v.forEach(x=>strings(x,o));return o}if(v&&typeof v==='object')Object.entries(v).forEach(([k,x])=>{if(!['provider','completedAt','schemaVersion','kind','subject'].includes(k))strings(x,o)});return o}
function objects(v,o=[]){if(Array.isArray(v)){v.forEach(x=>objects(x,o));return o}if(v&&typeof v==='object'){o.push(v);Object.values(v).forEach(x=>objects(x,o))}return o}
function confLevel(v){
 const n=Number(v);
 if(!Number.isFinite(n))return'low';
 if(n>=0.80)return'high';
 if(n>=0.55)return'medium';
 return'low';
}
function verdictToken(text,f){
 const t=String(text||'');
 const escaped=f.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const state=(t.match(/\bSTATE\s*[:=]\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\b/i)||[])[1]
   ||(t.match(new RegExp(`${escaped}\\s*[|:/-]\\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\\b`,'i'))||[])[1];
 if(!state)return null;
 const route=(t.match(/\bROUTE\s*[:=]\s*([A-Z_]+)\b/i)||[])[1]||'UNSPECIFIED';
 const normalizedRoute=route.toUpperCase();
 return{state:state.toLowerCase(),route:ROUTES.has(normalizedRoute)?normalizedRoute:'UNSPECIFIED'};
}
function rawDiscoveryOf(env){
 return env?.result?.rawDiscovery||env?.rawDiscovery||env?.result?.result?.rawDiscovery||null;
}
function rawSnapshot(env){
 try{return JSON.stringify(env).slice(0,12000)}catch{return String(env).slice(0,12000)}
}
function parse(env,f){
 const raw=rawDiscoveryOf(env);
 if(raw&&typeof raw==='object'){
   const obs=Array.isArray(raw.observations)
     ?(raw.observations.find(o=>String(o?.phrase||'').includes(f.id))||raw.observations[0])
     :null;
   const token=
     verdictToken(raw.summary,f)||
     verdictToken(obs?.phrase,f)||
     verdictToken(obs?.description,f)||
     (Array.isArray(raw.rawNotes)?raw.rawNotes.map(x=>verdictToken(x,f)).find(Boolean):null)||
     (Array.isArray(raw.ambiguities)?raw.ambiguities.map(x=>verdictToken(x,f)).find(Boolean):null);
   if(token&&STATES.has(token.state)){
     const evidence=Array.isArray(obs?.evidence)?obs.evidence.join(' | '):clean(obs?.evidence);
     const basis=clean(obs?.description||raw.summary||'Native Semantic Discovery verdict').slice(0,700);
     return{
       state:token.state,
       confidence:confLevel(obs?.confidence),
       route:token.route,
       basis:basis||'Native Semantic Discovery verdict',
       evidence:(evidence||clean(obs?.description)||clean(raw.summary)||'No separate evidence returned.').slice(0,2400),
       parseMode:'native-rawDiscovery-token',
       nativeConfidence:Number.isFinite(Number(obs?.confidence))?Number(obs.confidence):null
     };
   }
 }

 for(const o of objects(env?.result??env,[])){
  const st=o.state||o.STATE,cf=o.confidence||o.CONFIDENCE,rt=o.route||o.ROUTE,bs=o.basis||o.BASIS,ev=Array.isArray(o.evidence)?o.evidence.join(' '):(o.evidence||o.EVIDENCE);
  if(st&&cf&&bs&&ev){
    const route=clean(rt||'UNSPECIFIED').toUpperCase();
    const r={state:clean(st).toLowerCase(),confidence:clean(cf).toLowerCase(),route:ROUTES.has(route)?route:'UNSPECIFIED',basis:clean(bs).slice(0,700),evidence:clean(ev).slice(0,2400),parseMode:'legacy-structured'};
    if(STATES.has(r.state)&&CONFS.has(r.confidence)&&r.basis&&r.evidence)return r;
  }
 }

 let c=[];
 for(const o of objects(env?.result??env,[])){
   const p=clean(o.phrase||o.title||o.name||o.label),d=clean(o.description||o.summary||o.text||o.note),e=Array.isArray(o.evidence)?o.evidence.join(' '):clean(o.evidence);
   if(p.toUpperCase().includes(f.id)||/\bSTATE\s*[:=]/i.test(d))c.push(`${p}\n${d}\n${e}`);
 }
 strings(env?.result??env,[]).forEach(s=>{if(/\bSTATE\s*[:=]\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\b/i.test(s))c.push(s)});
 for(const t of c){
  const sm=t.match(/\bSTATE\s*[:=]\s*(PRESENT|ABSENT|UNCERTAIN|NOT_EVALUATED)\b/i);
  const cm=t.match(/\bCONFIDENCE\s*[:=]\s*(HIGH|MEDIUM|LOW)\b/i);
  const rm=t.match(/\bROUTE\s*[:=]\s*([A-Z_]+)\b/i);
  const bm=t.match(/\bBASIS\s*[:=]\s*(.*?)(?=\s*;\s*EVIDENCE\s*[:=]|\n\s*EVIDENCE\s*[:=]|$)/is);
  const em=t.match(/\bEVIDENCE\s*[:=]\s*(.+)$/is);
  if(!sm||!bm||!em)continue;
  const route=clean(rm?.[1]||'UNSPECIFIED').toUpperCase();
  const r={state:sm[1].toLowerCase(),confidence:clean(cm?.[1]||'LOW').toLowerCase(),route:ROUTES.has(route)?route:'UNSPECIFIED',basis:clean(bm[1]).slice(0,700),evidence:clean(em[1]).slice(0,2400),parseMode:'legacy-text'};
  if(STATES.has(r.state)&&CONFS.has(r.confidence)&&r.basis&&r.evidence)return r;
 }
 return null;
}
function gate(f,r){
 if(!r)return r;
 const a=A.get(f.aid),ok=routes(a);
 return{
   ...r,
   routeWarning:r.state!=='absent'&&r.route!=='UNSPECIFIED'&&!ok.includes(r.route),
   routeMissing:r.state!=='absent'&&r.route==='UNSPECIFIED',
   preferredRoutes:ok
 };
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function pause(ms){const end=Date.now()+ms;while(Date.now()<end){if(stop)return false;await sleep(Math.min(500,end-Date.now()))}return true}
async function call(payload,onRetry){const api=globalThis.GenreactrixCloudApi;if(!api?.emojeoSemanticDiscovery)throw new Error('Semantic Discovery adapter unavailable.');if(!clean(api.getBaseUrl?.())||!clean(api.getKey?.()))throw new Error('Worker URL/key not configured.');let n=0;for(;;){try{return await api.emojeoSemanticDiscovery(payload)}catch(e){n++;if(n>=6)throw e;const d=Math.min(30000,2000*Math.pow(2,Math.min(n-1,4)));onRetry?.(n,e);if(!(await pause(d)))throw new Error('Stopped by user')}}}
async function evalOne(f){
 const s=R.subjects[f.si],a=A.get(f.aid);
 let err='No parseable native verdict token.';
 const diagnostics=[];
 for(let n=1;n<=3;n++){
  try{
   const env=await call({
     schemaVersion:1,
     kind:'emojeo-step4-pass75-calibration',
     subject:{id:`${s.glyph}:${s.name}`,glyph:s.glyph,name:s.name},
     domain:'Step 4 Pass 75 calibration',
     relationshipTypes:[a.relationshipType],
     assertionIds:[a.assertionId],
     prompt:prompt(f,n,n>1)
   },(i,e)=>status(`NETWORK RETRY ${i}/5 · ${f.id} ${f.label}\n${e?.message||e}`));

   const p=parse(env,f);
   if(p){
     const g=gate(f,p),match=f.mode==='hard'?g.state===f.exp:null;
     return{
       id:f.id,fixture:f,subject:s,
       assertion:{assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag},
       ...g,
       matchesExpected:match,
       reviewRequired:f.mode==='interpretive'||match===false,
       providerFailure:false,
       parserAttempts:n,
       parseDiagnostics:diagnostics,
       completedAt:new Date().toISOString()
     };
   }
   diagnostics.push({attempt:n,reason:'no-verdict-token',rawResponse:rawSnapshot(env)});
   err='Provider returned native Semantic Discovery JSON, but no readable verdict token was found.';
  }catch(e){
   err=clean(e?.message||e);
   diagnostics.push({attempt:n,reason:'request-error',error:err,responsePayload:e?.responsePayload?rawSnapshot(e.responsePayload):null});
  }
 }
 return{
   id:f.id,fixture:f,subject:s,
   assertion:{assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag},
   state:'not_evaluated',confidence:'low',route:'NONE',
   basis:'provider/parser failure',evidence:err,
   matchesExpected:null,reviewRequired:false,
   providerFailure:true,
   parserAttempts:3,
   parseDiagnostics:diagnostics,
   completedAt:new Date().toISOString()
 };
}
function save(){localStorage.setItem(KEY,JSON.stringify(results))}
function map(){return new Map(results.map(x=>[x.id,x]))}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function status(t){$('status').textContent=t}
function render(){
 if(!U){$('run').disabled=true;$('stop').disabled=true;$('download').disabled=true;return}
 const m=map(),done=FIX.filter(f=>m.has(f.id)&&!m.get(f.id).providerFailure),pending=FIX.filter(f=>!m.has(f.id)||m.get(f.id).providerFailure),hard=FIX.filter(f=>f.mode==='hard'),matched=hard.filter(f=>m.get(f.id)&&!m.get(f.id).providerFailure&&m.get(f.id).matchesExpected===true),review=FIX.filter(f=>m.get(f.id)&&!m.get(f.id).providerFailure&&m.get(f.id).reviewRequired);
 $('summary').innerHTML=`${done.length}/${FIX.length} completed · ${pending.length} pending · <span class="${matched.length===hard.length&&pending.length===0?'good':'warn'}">${matched.length}/${hard.length} hard expectations matched</span> · ${review.length} Billy-review item${review.length===1?'':'s'}`;
 $('run').disabled=running||pending.length===0;$('stop').disabled=!running;$('download').disabled=results.length===0;
 $('cases').innerHTML=FIX.map(f=>{const r=m.get(f.id);let cls='pending',v='PENDING';if(r&&!r.providerFailure){if(f.mode==='interpretive'){cls='interpretive';v='INTERPRETIVE · ASK BILLY'}else if(r.matchesExpected){cls='pass';v='MATCH'}else{cls='review';v='REVIEW · ASK BILLY'}}else if(r?.providerFailure)v='AUTO-RETRY PENDING';const exp=f.mode==='hard'?`Expected ${f.exp.toUpperCase()}`:'No forced expected state',actual=r&&!r.providerFailure?`${r.state.toUpperCase()} / ${r.confidence.toUpperCase()} / ${r.route}`:'NOT COMPLETED';return`<div class="case ${cls}"><strong>${f.id} ${f.label}</strong><br>${f.mode.toUpperCase()} · ${exp} · ${v}<br>Actual: ${actual}${r?.routeWarning?`<div class="small warn">Route note: ${esc(r.route)} is outside the preferred route list, but Pass 74 does not override the semantic state.</div>`:''}${r&&!r.providerFailure?`<div class="small">${esc(r.evidence)}</div>`:''}</div>`}).join('');
}
function retryDelay(round){return Math.min(30000,2000*Math.pow(2,Math.max(0,round-1)))}
async function run(){
 if(running)return;running=true;stop=false;render();let round=0;
 try{
  for(;;){
   if(stop){status('STOPPED · completed results are preserved. Tap RUN to resume automatic retries.');return}
   const m=map(),pending=FIX.filter(f=>!m.has(f.id)||m.get(f.id).providerFailure);if(!pending.length)break;round++;
   status(`AUTO-RETRY ROUND ${round} · ${pending.length} remaining\nCompleted items stay checkpointed. The runner will continue until all 12 complete or you press STOP.`);
   const tasks=pending.slice();let done=0;
   async function lane(i){while(!stop){const f=tasks.shift();if(!f)return;status(`AUTO-RETRY ROUND ${round} · ${done}/${pending.length} attempted this round\nLane ${i+1}/2 · ${f.id} ${f.label}`);const r=await evalOne(f);results=results.filter(x=>x.id!==r.id);results.push(r);save();done++;render()}}
   await Promise.all([lane(0),lane(1)]);if(stop)continue;
   const rm=map(),still=FIX.filter(f=>!rm.has(f.id)||rm.get(f.id).providerFailure);if(!still.length)break;
   const d=retryDelay(round);for(let sec=Math.ceil(d/1000);sec>0;sec--){status(`AUTO-RETRY ROUND ${round} finished · ${still.length} still incomplete\nNext automatic retry in ${sec}s. No tapping needed.`);if(!(await pause(1000)))break}
  }
  if(stop){status('STOPPED · completed results are preserved. Tap RUN to resume automatic retries.');return}
  const rm=map(),hard=FIX.filter(f=>f.mode==='hard'),bad=hard.filter(f=>rm.get(f.id)?.matchesExpected===false),interpretive=FIX.filter(f=>f.mode==='interpretive');
  status(`CALIBRATION COMPLETE · 12/12 evaluated.\n${hard.length-bad.length}/${hard.length} hard expectations matched. ${bad.length+interpretive.length} item${bad.length+interpretive.length===1?'':'s'} should be reviewed with Billy individually.\nDownload the checkpoint and upload it here.`);
 }catch(e){status(`STOPPED ON ERROR · ${e?.message||e}\nCompleted results remain saved.`)}
 finally{running=false;stop=false;render()}
}
function download(){
 const m=map(),rows=FIX.map(f=>m.get(f.id)||{id:f.id,fixture:f,state:'not_evaluated',matchesExpected:null,reviewRequired:false,providerFailure:true,evidence:'not run'}),hard=rows.filter(x=>x.fixture?.mode==='hard'),review=rows.filter(x=>!x.providerFailure&&(x.fixture?.mode==='interpretive'||x.matchesExpected===false));
 const out={schemaVersion:1,kind:'emojeo-step4-calibration-checkpoint',runnerVersion:'pass75',createdAt:new Date().toISOString(),philosophy:{ontologyAuthority:'sealed definition is authoritative',inclusionBias:'surface recognizable defensible exact-predicate relationships even when conditional',uncertaintyPolicy:'UNCERTAIN is valid when multiple readings are reasonable',rejectionBoundary:'invented scenario / possible consequence only / co-occurrence only / category difference only / clearly neighboring predicate',domainPolicy:'descriptive, not hard gate',routePolicy:'diagnostic only; non-preferred or missing routes do not override semantic state',humanReviewPolicy:'interpretive fixtures and hard mismatches are brought to Billy individually'},autoRetry:{enabled:true,behavior:'provider/parser-pending fixtures automatically rerun until complete or STOP',maxRounds:null,backoffCapMs:30000,completedItemsRerun:false},parser:{nativeWorkerSchema:true,verdictTokenInSummaryAndPhrase:true,repairPromptAfterFirstMiss:true,rawFailureCapture:true,legacyParserFallback:true},fixtureCount:FIX.length,hardFixtureCount:hard.length,interpretiveFixtureCount:rows.filter(x=>x.fixture?.mode==='interpretive').length,completedCount:rows.filter(x=>!x.providerFailure).length,providerFailureCount:rows.filter(x=>x.providerFailure).length,hardExpectationMatchCount:hard.filter(x=>x.matchesExpected===true).length,hardMismatchCount:hard.filter(x=>x.matchesExpected===false).length,reviewRequiredCount:review.length,automaticCalibrationComplete:rows.every(x=>!x.providerFailure),results:rows};
 const b=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`emojeo-step4-pass75-calibration-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1200)
}
async function init(){try{const [u,r,o]=await Promise.all([fetch(INPUTS.u,{cache:'no-cache'}).then(x=>x.json()),fetch(INPUTS.r,{cache:'no-cache'}).then(x=>x.json()),fetch(INPUTS.o,{cache:'no-cache'}).then(x=>x.json())]);U=u;R=r;O=o;if(U.assertionCount!==1278||R.scope?.subjectCount!==79||O.relationshipCount!==1211)throw new Error('Sealed input count mismatch.');U.assertions.forEach(x=>A.set(x.assertionId,x));O.relationships.forEach(x=>M.set(x.relationshipType,{domain:clean(x.domain),definition:clean(x.definition)}));for(const f of FIX){if(!R.subjects[f.si]||!A.has(f.aid)||!M.has(A.get(f.aid).relationshipType))throw new Error(`Fixture ${f.id} input missing`)}try{
 const current=JSON.parse(localStorage.getItem(KEY)||'null');
 if(Array.isArray(current))results=current;
 else{
   const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'[]');
   results=Array.isArray(legacy)?legacy.filter(x=>x&&!x.providerFailure):[];
   if(results.length)save();
 }
}catch{results=[]}status('READY · Tap once. Pass 74 automatically retries only unfinished provider/parser cases until all 12 complete or you press STOP.');render()}catch(e){status(`INITIALIZATION FAILED · ${e?.message||e}`)}}
$('run').onclick=run;$('stop').onclick=()=>{if(running){stop=true;status('STOP REQUESTED · no new fixtures will start; in-flight requests may finish and remain checkpointed.')}};$('download').onclick=download;render();init();
})();