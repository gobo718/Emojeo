/* Emojeo Step 3 Recovery Mapper — Pass 51
   Browser orchestration only. AI normalization runs on the Worker, three providers in parallel.
   Original imported JSON is never mutated; recovered data is appended under recoveryResults.
   Safety gate: 1 subject -> 3 total -> 10 total -> full run. */
(()=>{'use strict';
const $=id=>document.getElementById(id),clean=v=>String(v??'').trim();
const BASE_KEY='genreactrix-ai-worker-base',KEY_KEY='genreactrix-ai-analysis-key';
const DB_NAME='emojeo-step3-recovery-v5',STORE='jobs';
let input=null,spec=null,job=null,aborter=null,running=false;
function base(){return clean(localStorage.getItem(BASE_KEY)||window.GENREACTRIX_AI_WORKER_BASE||'').replace(/\/+$/,'')}
function key(){return clean(localStorage.getItem(KEY_KEY)||'')}
function fingerprint(data,file){const last=data?.results?.at?.(-1)||{};return [data?.batchId||'step3',data?.completedUnits||0,data?.totalUnits||0,last?.subject?.glyph||'',last?.domain||'',file?.size||0].join('|')}
function groupSubjects(data){const map=new Map();for(const row of (Array.isArray(data?.results)?data.results:[])){const s=row?.subject||{},k=`${s.glyph||''}\u0000${s.name||''}`;if(!map.has(k))map.set(k,{subject:{glyph:s.glyph||'',name:s.name||''},units:[]});map.get(k).units.push({domain:row.domain||'Unclassified',rawNotes:row.rawNotes??[]});}return [...map.values()]}
const TARGET_SHAPE_VALIDATOR_VERSION=1;
const EMOJI_PEER_RELATIONSHIPS=new Set(['SIMILAR_TO','CONTRASTS_WITH','IS_IN_SAME_UNICODE_GROUP_AS','IS_IN_SAME_UNICODE_SUBGROUP_AS']);
const COLOR_WORDS=new Set('black white gray grey red orange yellow green blue purple violet indigo pink brown cyan magenta teal turquoise aqua navy maroon olive lime gold silver beige tan coral salmon crimson scarlet amber ochre chartreuse lavender lilac mauve burgundy fuchsia plum peach mint cream ivory khaki'.split(' '));
const COLOR_MODIFIERS=new Set('light medium dark pale deep bright vivid muted soft dusty neon pastel electric warm cool earthy neutral rich strong dull saturated desaturated metallic fluorescent'.split(' '));
let emojiPeerNames=null;
function normalizePeerLabel(v){return clean(v).toLowerCase().normalize('NFKC').replace(/[_-]+/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim()}
function isPureColorLiteral(v){const raw=clean(v).toLowerCase();if(!raw)return false;if(/^#(?:[0-9a-f]{3,8})$/i.test(raw)||/^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\(/i.test(raw))return true;const tokens=normalizePeerLabel(raw).split(' ').filter(Boolean);return !!tokens.length&&tokens.some(t=>COLOR_WORDS.has(t))&&tokens.every(t=>COLOR_WORDS.has(t)||COLOR_MODIFIERS.has(t))}
async function loadEmojiPeerNames(){if(emojiPeerNames)return;const r=await fetch('data/unicode/18.0/emoji-test.txt',{cache:'no-cache'});if(!r.ok)throw new Error(`Unicode peer catalog load failed (${r.status})`);const text=await r.text(),names=new Set();for(const line of text.split(/\r?\n/)){const m=line.match(/;\s*(?:fully-qualified|component)\s*#\s*\S+\s+E[0-9.]+\s+(.+?)\s*$/);if(m)names.add(normalizePeerLabel(m[1]))}emojiPeerNames=names}
function isEmojiPeerTarget(v){const raw=clean(v);if(!raw)return false;if(/\p{Extended_Pictographic}/u.test(raw))return true;if(/^U\+[0-9A-F]{4,6}(?:\s+U\+[0-9A-F]{4,6})*$/i.test(raw))return true;return !!emojiPeerNames?.has(normalizePeerLabel(raw))}
function targetShapeReason(a){const rel=clean(a?.relationshipType),tag=clean(a?.tag);if(!rel||!tag)return '';if(rel==='HAS_SAME_COLOR_AS'&&isPureColorLiteral(tag))return `HAS_SAME_COLOR_AS requires a counterpart entity, not the color literal “${tag}”`;if(EMOJI_PEER_RELATIONSHIPS.has(rel)&&!isEmojiPeerTarget(tag))return `${rel} requires another emoji peer; “${tag}” does not resolve to an official emoji identity`;return ''}
function validationKey(a){return [clean(a?.relationshipType),clean(a?.domain),clean(a?.tag),clean(a?.evidence)].join('\u0000')}
function validateRecoveryResult(result){if(!result||result?.targetShapeValidation?.version===TARGET_SHAPE_VALIDATOR_VERSION)return result;const source=Array.isArray(result.assertions)?result.assertions:[],kept=[],invalid=[];for(const a of source){const reason=targetShapeReason(a);if(reason)invalid.push({...a,reconciliationReason:`Target-shape validator: ${reason}`,targetShapeValidator:`client-v${TARGET_SHAPE_VALIDATOR_VERSION}`});else kept.push(a)}const rejected=Array.isArray(result.rejectedCandidates)?[...result.rejectedCandidates]:[],seen=new Set(rejected.map(validationKey));for(const a of invalid){const k=validationKey(a);if(!seen.has(k)){rejected.push(a);seen.add(k)}}const invalidTags=new Set(invalid.map(a=>clean(a.tag))),keptTags=new Set(kept.map(a=>clean(a.tag)));const newTags=(Array.isArray(result.newTags)?result.newTags:[]).filter(t=>!invalidTags.has(clean(t))||keptTags.has(clean(t)));const audit={version:TARGET_SHAPE_VALIDATOR_VERSION,mode:'client-post-reconciliation',checkedAt:new Date().toISOString(),checkedAssertionCount:source.length,rejectedCount:invalid.length,rejectedRelationships:[...new Set(invalid.map(a=>a.relationshipType))]};return {...result,assertions:kept,newTags,rejectedCandidates:rejected,targetShapeRejectedAssertions:invalid,targetShapeValidation:audit,reconciliation:{...(result.reconciliation||{}),targetShapeValidation:audit}}}
function compatibleRecoveryPrefix(list,subjects){const rows=Array.isArray(list)?list:[];if(rows.length>subjects.length)return false;for(let i=0;i<rows.length;i++){const a=rows[i]?.subject||{},b=subjects[i]?.subject||{};if(clean(a.glyph)!==clean(b.glyph)||normalizePeerLabel(a.name)!==normalizePeerLabel(b.name))return false}return true}
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
      const result=validateRecoveryResult(await callSubject(p));
      job.recovered.push(result);job.updatedAt=new Date().toISOString();await dbPut(job);render();
    }
    if(job.recovered.length===job.subjects.length)setStatus('RECOVERY COMPLETE · Download the enriched snapshot.');
    else if(aborter.signal.aborted)setStatus('STOPPED · saved after the last completed subject.');
    else setStatus(`CHECKPOINT REACHED · ${job.recovered.length}/${job.subjects.length} subjects recovered · download and inspect before the next gate.`);
  }catch(e){if(e?.name==='AbortError')setStatus('STOPPED · saved after the last completed subject.');else setStatus(`STOPPED · ${e?.message||e}`)}finally{running=false;render()}
}
function stop(){aborter?.abort()}
function download(){if(!job||!input)return;const out={...input,recoverySchemaVersion:5,recoveryKind:'emojeo-step3-raw-notes-recovery',recoveryCreatedAt:new Date().toISOString(),targetShapeValidatorVersion:TARGET_SHAPE_VALIDATOR_VERSION,recoveryStrategy:'one subject per wave; 857 relationships sharded across Mistral / GPT-4.1 mini / Qwen 3.7 Plus concurrently; domain-bound raw-note normalization; exact relationship-name protocol; same-domain evidence only; Unclassified generic forcing blocked; suspicious mapper shards auto-repaired; strict final semantic reconciliation preserves rejected/reassigned candidates; post-reconciliation target-shape validation rejects malformed peer/property targets while preserving them for audit; strict PRESENT/UNCERTAIN parser; negative rows omitted; existing relationship proposals separated from genuinely new types; original results preserved; gated 1 -> 3 -> 10 -> full',recoveryResults:job.recovered};const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`emojeo-step3-recovered-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
async function loadFile(file){input=JSON.parse(await file.text());if(!Array.isArray(input?.results))throw new Error('Selected file has no Step 3 results array');if(Number(input.completedUnits)!==Number(input.totalUnits))throw new Error(`This recovery pass expects a completed Step 3 export; file is ${input.completedUnits||0}/${input.totalUnits||0}`);spec=await fetch('Emojeo_STEP3_Diverse_Batch_001_RunSpec.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(`RunSpec load failed (${r.status})`);return r.json()});await loadEmojiPeerNames();const id=fingerprint(input,file),prior=await dbGet(id),subjects=groupSubjects(input),embedded=Array.isArray(input?.recoveryResults)?input.recoveryResults:[],priorRecovered=prior&&Array.isArray(prior.recovered)?prior.recovered:[];if(embedded.length&&!compatibleRecoveryPrefix(embedded,subjects))throw new Error('Embedded recoveryResults do not match the Step 3 subject order in this file');const useEmbedded=embedded.length>priorRecovered.length,seed=useEmbedded?embedded:priorRecovered,source=useEmbedded?'embedded recovered JSON':priorRecovered.length?'saved browser checkpoint':'none';job=prior?{...prior,id,subjects,recovered:seed.map(validateRecoveryResult),updatedAt:new Date().toISOString()}:{id,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),subjects,recovered:seed.map(validateRecoveryResult)};await dbPut(job);const rejected=job.recovered.reduce((n,r)=>n+Number(r?.targetShapeValidation?.rejectedCount||0),0);if(job.recovered.length)setStatus(`Loaded ${source} · ${job.recovered.length}/${subjects.length} subjects recovered · target-shape validator audit: ${rejected} malformed accepted assertion(s) rejected and preserved for review.`);else setStatus(`Ready · completed Step 3 export verified · ${subjects.length} subjects found · no embedded recovery checkpoint found · first gate is exactly 1 subject.`);render()}
$('file').addEventListener('change',async e=>{try{const f=e.target.files?.[0];if(!f)return;await loadFile(f)}catch(err){job=null;setStatus(`LOAD FAILED · ${err?.message||err}`);render()}});
$('run1').addEventListener('click',()=>runTo('next'));
$('run3').addEventListener('click',()=>runTo(3));
$('run10').addEventListener('click',()=>runTo(10));
$('runall').addEventListener('click',()=>runTo('all'));
$('stop').addEventListener('click',stop);$('download').addEventListener('click',download);render();
})();
