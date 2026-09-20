/* Emojeo Reclassification — Pass 7
   Evaluates every emoji against the complete established trait vocabulary.
   Official Unicode traits remain authoritative facts; curated Emojeo traits are
   evaluated consistently across the whole universe. Results are explicit
   present/absent/uncertain decisions with evidence and provenance. */
(()=>{'use strict';
const clean=v=>String(v??'').trim(), clone=v=>v==null?v:structuredClone(v);
const refKey=(subject,tag)=>`${subject.type}:${subject.id}::${tag.type}:${tag.id}`;
function establishedVocabulary({tagEngine=globalThis.reusableTagEngine||globalThis.window?.reusableTagEngine}={}){
 if(!tagEngine)throw new Error('StringBoard tag engine is required.');
 return tagEngine.tags().filter(t=>t.authority==='official'||t.authority==='curated').map(clone);
}
function createPlan(records=[],options={}){
 const vocabulary=options.vocabulary||establishedVocabulary(options);
 const official=vocabulary.filter(t=>t.authority==='official');
 const curated=vocabulary.filter(t=>t.authority==='curated');
 const subjects=records.map(r=>({type:'emoji',id:r.id,emoji:r.emoji,name:r.names?.cldr||r.name||''}));
 const cells=[];
 for(const subject of subjects)for(const tag of curated)cells.push({subject:clone(subject),tag:{type:tag.type,id:tag.id,label:tag.label},status:'unreviewed'});
 return {schemaVersion:1,kind:'emojeo-reclassification-plan',subjects,vocabulary,officialTraitCount:official.length,curatedTraitCount:curated.length,totalEvaluations:cells.length,cells};
}
function normalizeDecision(input={},cell){
 const status=clean(input.status||input.decision).toLowerCase();
 if(!['present','absent','uncertain'].includes(status))throw new Error('Reclassification decision must be present, absent, or uncertain.');
 const confidence=Number.isFinite(Number(input.confidence))?Math.max(0,Math.min(1,Number(input.confidence))):null;
 return {...clone(cell),status,confidence,evidence:clone(input.evidence||[]),source:clone(input.source||{}),rationale:clean(input.rationale),runId:clean(input.runId),metadata:clone(input.metadata||{}),decidedAt:input.decidedAt||new Date().toISOString()};
}
function createSession(plan,{assignments=globalThis.reusableTagAssignments||globalThis.window?.reusableTagAssignments}={}){
 if(!assignments)throw new Error('StringBoard tag assignment engine is required.');
 const cells=new Map((plan?.cells||[]).map(c=>[refKey(c.subject,c.tag),clone(c)]));
 const decide=(subject,tag,input={})=>{const key=refKey(subject,tag),cell=cells.get(key);if(!cell)throw new Error('Trait/emoji pair is not in this reclassification plan.');const next=normalizeDecision(input,cell);cells.set(key,next);if(next.status==='present')assignments.assign({subject:next.subject,tag:next.tag,source:next.source?.id?next.source:{id:'emojeo-reclassification'},confidence:next.confidence,status:'active',evidence:next.evidence,metadata:{...clone(next.metadata),authority:'curated',reclassified:true,runId:next.runId}});return clone(next)};
 const ingest=(rows=[])=>rows.map(r=>decide(r.subject,r.tag,r));
 const list=(q={})=>[...cells.values()].filter(c=>(!q.status||c.status===q.status)&&(!q.subjectId||c.subject.id===q.subjectId)&&(!q.tagType||c.tag.type===q.tagType)&&(!q.tagId||c.tag.id===q.tagId)).map(clone);
 const summary=()=>{const out={total:cells.size,unreviewed:0,present:0,absent:0,uncertain:0};for(const c of cells.values())out[c.status]++;return out};
 const snapshot=()=>({schemaVersion:1,kind:'emojeo-reclassification-session',plan:{...clone(plan),cells:undefined},cells:list(),summary:summary()});
 return Object.freeze({decide,ingest,list,summary,snapshot});
}
function buildEvaluationPrompt(subject,traits=[]){return {system:'Evaluate only the supplied emoji against every supplied trait. Do not invent new traits. Return present, absent, or uncertain for each trait, with concise observable/conceptual evidence. Treat Unicode facts as context, not as automatic evidence for unrelated curated traits.',subject:clone(subject),traits:traits.map(t=>({type:t.type,id:t.id,label:t.label,metadata:clone(t.metadata||{})})),requiredStatuses:['present','absent','uncertain']};}
const api=Object.freeze({establishedVocabulary,createPlan,createSession,buildEvaluationPrompt});if(typeof window!=='undefined')window.emojeoReclassification=api;if(typeof globalThis!=='undefined')globalThis.emojeoReclassification=api;
})();
