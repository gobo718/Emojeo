/* Emojeo Step 3 Population Runner — Pass 41 resume repair */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v),clean=v=>String(v??'').trim();
const CHECKPOINT='emojeo-step3-population-checkpoint-v1';
async function loadJson(url){const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error(`${url} (${r.status})`);return r.json()}
function parseJsonish(v){if(v&&typeof v==='object')return v;return JSON.parse(clean(v).replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''))}
function normalizeResult(raw,subject,domain){const body=parseJsonish(raw?.rawDiscovery||raw?.result||raw),assertions=Array.isArray(body.assertions)?body.assertions:[];return{subject:clone(subject),domain,assertions:assertions.map(x=>({relationshipType:clean(x.relationshipType),tag:clean(x.tag),state:['present','absent','uncertain','not_evaluated'].includes(clean(x.state))?clean(x.state):'uncertain',confidence:clean(x.confidence)||null,evidence:clean(x.evidence)})).filter(x=>x.relationshipType&&x.tag),newTags:[...new Set((body.newTags||[]).map(clean).filter(Boolean))],newRelationshipNeeded:(body.newRelationshipNeeded||[]).map(x=>({proposedRelationshipType:clean(x.proposedRelationshipType),tag:clean(x.tag),reason:clean(x.reason)})).filter(x=>x.proposedRelationshipType),rawNotes:body.rawNotes??null,provider:raw?.provider||null}}
function prompt(subject,bucket){return['EMOJEO STEP 3 POPULATION ASSERTION v1',`Subject: ${subject.glyph} ${subject.name}`,`Relationship domain: ${bucket.domain}`,`Allowed relationship types for this domain: ${bucket.relationshipTypes.join(', ')}`,'','Evaluate this emoji against EVERY relationship type above.','Discover exact tag values freely; the tag vocabulary is open.','FIND → ADD → PRESERVE. MULTIPLE TRUE → KEEP ALL.','Broad and narrow true assertions coexist. Never suppress one because another overlaps.','Relationship = how the emoji connects. Tag = exact referent/value.','Do not guess. Use absent only when evaluated and false; use uncertain when evidence is insufficient; use not_evaluated only when genuinely not assessed.','If a meaningful true connection cannot be expressed by the allowed relationship types, return it under newRelationshipNeeded. Do not force it into the nearest type.','Preserve raw notes.','','Return JSON only:','{"assertions":[{"relationshipType":"...","tag":"...","state":"present|absent|uncertain|not_evaluated","confidence":"high|medium|low","evidence":"brief evidence"}],"newTags":["..."],"newRelationshipNeeded":[{"proposedRelationshipType":"...","tag":"...","reason":"..."}],"rawNotes":[]}'].join('\n')}
function request(subject,bucket){return{schemaVersion:1,kind:'emojeo-step3-population-assertion',subject:{id:`${subject.glyph}:${subject.name}`,glyph:subject.glyph,name:subject.name},domain:bucket.domain,relationshipTypes:bucket.relationshipTypes,prompt:prompt(subject,bucket)}}
function saveCheckpoint(cp){localStorage.setItem(CHECKPOINT,JSON.stringify(cp))}
function loadCheckpoint(batchId){try{const x=JSON.parse(localStorage.getItem(CHECKPOINT)||'null');return x?.batchId===batchId?x:null}catch{return null}}
function clearCheckpoint(){localStorage.removeItem(CHECKPOINT)}
async function run(options={}){
 const api=options.api||globalThis.GenreactrixCloudApi;if(!api?.emojeoSemanticDiscovery)throw new Error('Semantic discovery Worker adapter unavailable.');
 const batch=options.batch||await loadJson('Emojeo_STEP3_Diverse_Batch_001_79.json'),spec=options.spec||await loadJson('Emojeo_STEP3_Diverse_Batch_001_RunSpec.json'),domains=spec.relationshipDomains||[],subjects=batch.subjects||[];
 const prior=options.resume===false?null:loadCheckpoint(batch.batchId);
 const out=prior||{schemaVersion:1,kind:'emojeo-step3-population-run',batchId:batch.batchId,subjectCount:subjects.length,relationshipCount:spec.relationshipCount,completedUnits:0,totalUnits:subjects.length*domains.length,results:[],startedAt:new Date().toISOString()};
 out.results=Array.isArray(out.results)?out.results:[];out.totalUnits=subjects.length*domains.length;
 /* Results are the durable source of truth. This repairs older checkpoints whose
    completedUnits cursor was stale or malformed. */
 out.completedUnits=Math.min(out.totalUnits,out.results.length);
 for(let cursor=out.completedUnits;cursor<out.totalUnits;cursor++){
  if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');
  const si=Math.floor(cursor/domains.length),di=cursor%domains.length,subject=subjects[si],bucket=domains[di];
  options.onStage?.({subject,index:si+1,total:subjects.length,domain:bucket.domain,domainIndex:di+1,domainTotal:domains.length,completedUnits:out.completedUnits,totalUnits:out.totalUnits});
  const envelope=await api.emojeoSemanticDiscovery(request(subject,bucket),undefined,{signal:options.signal});
  out.results.push(normalizeResult(envelope?.result||envelope,subject,bucket.domain));
  out.completedUnits=out.results.length;saveCheckpoint(out);options.onResult?.(out.results.at(-1),out);
 }
 out.completedAt=new Date().toISOString();clearCheckpoint();return out;
}
globalThis.emojeoStep3Population=Object.freeze({run,prompt,request,normalizeResult,loadCheckpoint,clearCheckpoint});
})();