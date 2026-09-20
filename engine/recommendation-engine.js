(()=>{
'use strict';
const DB='genreactrix-recommendation-engine-v1',VER=1,STORE='recommendations';let dbp=null;
const now=()=>new Date().toISOString();const uid=()=>`rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
function openDb(){if(dbp)return dbp;dbp=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:'id'});s.createIndex('status','status');s.createIndex('score','score');s.createIndex('createdAt','createdAt')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbp}
async function put(x){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE,'readwrite').objectStore(STORE).put(x);r.onsuccess=()=>resolve(x);r.onerror=()=>reject(r.error)})}
async function all(){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>(b.score||0)-(a.score||0)||String(b.createdAt).localeCompare(String(a.createdAt))));r.onerror=()=>reject(r.error)})}
const records=()=>window.genreactrixImageRecordEngine?.all?.()||[];
function candidate(type,title,score,confidence,evidence,target,related={}){return {id:uid(),schemaVersion:1,type,title,score:Number(score.toFixed(3)),confidence:Number(confidence.toFixed(3)),evidence,actionTarget:target,related,status:'active',createdAt:now(),updatedAt:now()}}
async function calculate(){
 const rows=records(), out=[];
 const blocked=rows.filter(r=>r.attributes?.failed||r.attributes?.missingSource||r.workflow?.stage==='blocked');
 const partial=rows.filter(r=>String(r.director?.completion||r.analysis?.director?.completion||r.workflow?.directorStatus||'').toLowerCase()==='partial');
 const incomplete=rows.filter(r=>!['complete','ready'].includes(String(r.director?.completion||r.analysis?.director?.completion||r.workflow?.directorStatus||'').toLowerCase()));
 const flagged=rows.filter(r=>r.attributes?.flagged);
 const findings=await window.genreactrixFindingLibraryEngine?.all?.().catch?.(()=>[])||[];
 const newFindings=findings.filter(f=>f.status==='new');
 const metrics=await window.genreactrixPredictionEvaluationEngine?.metrics?.().catch?.(()=>null)||{};
 if(blocked.length)out.push(candidate('blocked','Resolve blocked images',0.98,0.99,[`${blocked.length} images cannot progress`],'maintenance',{imageIds:blocked.map(x=>x.id)}));
 if(partial.length)out.push(candidate('partial','Finish partial classifications',0.9,0.95,[`${partial.length} partial Director records`],'director',{imageIds:partial.map(x=>x.id)}));
 if(incomplete.length)out.push(candidate('coverage','Increase classification coverage',Math.min(.88,.5+incomplete.length/Math.max(1,rows.length)*.4),.9,[`${incomplete.length} images remain incomplete`],'director',{imageIds:incomplete.map(x=>x.id)}));
 if(flagged.length)out.push(candidate('review','Review flagged evidence',.82,.88,[`${flagged.length} flagged images`],'images',{imageIds:flagged.map(x=>x.id)}));
 if(newFindings.length)out.push(candidate('finding','Review new correlation findings',.86,.9,[`${newFindings.length} findings await review`],'correlation',{findingIds:newFindings.map(x=>x.id)}));
 if((metrics.reviewed||0)<20)out.push(candidate('prediction','Build prediction benchmark evidence',.72,.78,[`${metrics.reviewed||0} prediction reviews recorded`],'prediction',{}));
 const uniq=new Map();for(const r of out){const key=r.type;const prior=uniq.get(key);if(!prior||r.score>prior.score)uniq.set(key,r)}
 const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');const s=tx.objectStore(STORE);const c=s.clear();c.onerror=()=>reject(c.error);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
 for(const r of uniq.values())await put(r);
 window.dispatchEvent(new CustomEvent('genreactrix:recommendations-updated',{detail:{count:uniq.size}}));return all();
}
async function updateStatus(id,status){const rows=await all();const r=rows.find(x=>x.id===id);if(!r)throw new Error('Recommendation not found');r.status=status;r.updatedAt=now();await put(r);return r}
async function integrityCheck(){const rows=await all(),issues=[];for(const r of rows){if(!r.id||!r.type)issues.push({type:'recommendation.invalid',severity:'warning',id:r.id});if(r.score<0||r.score>1)issues.push({type:'recommendation.invalid-score',severity:'warning',id:r.id})}return issues}
window.genreactrixRecommendationEngine={calculate,all,updateStatus,integrityCheck};
})();
