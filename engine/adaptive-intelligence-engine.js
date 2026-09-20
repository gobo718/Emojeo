(()=>{
'use strict';
const DB='genreactrix-adaptive-intelligence-v1',VER=1,SNAP='snapshots';let dbp=null;
const now=()=>new Date().toISOString();
function openDb(){if(dbp)return dbp;dbp=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(SNAP)){const s=db.createObjectStore(SNAP,{keyPath:'id'});s.createIndex('createdAt','createdAt')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbp}
async function put(x){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(SNAP,'readwrite').objectStore(SNAP).put(x);r.onsuccess=()=>resolve(x);r.onerror=()=>reject(r.error)})}
async function all(){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(SNAP).objectStore(SNAP).getAll();r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))));r.onerror=()=>reject(r.error)})}
const records=()=>window.genreactrixImageRecordEngine?.all?.()||[];
async function metrics(){
 const rows=records();
 const evals=await window.genreactrixPredictionEvaluationEngine?.metrics?.().catch?.(()=>null)||{};
 const findings=await window.genreactrixFindingLibraryEngine?.all?.().catch?.(()=>[])||[];
 const prompts=await window.genreactrixPromptEvaluationEngine?.allRuns?.().catch?.(()=>[])||[];
 const directorComplete=rows.filter(r=>['complete','ready'].includes(String(r.director?.completion||r.analysis?.director?.completion||r.workflow?.directorStatus||'').toLowerCase())).length;
 const flagged=rows.filter(r=>r.attributes?.flagged).length;
 const blocked=rows.filter(r=>r.attributes?.failed||r.attributes?.missingSource||r.workflow?.stage==='blocked').length;
 const acceptedFindings=findings.filter(f=>f.status==='accepted').length;
 const reviewedFindings=findings.filter(f=>['reviewed','accepted','rejected'].includes(f.status)).length;
 const predictionAccuracy=Number.isFinite(evals.acceptanceRate)?evals.acceptanceRate:null;
 const promptAccepted=prompts.filter(r=>r.status==='accepted'||r.decision==='accepted').length;
 return {createdAt:now(),images:rows.length,directorComplete,flagged,blocked,predictionAccuracy,predictionReviewed:evals.reviewed||0,findings:findings.length,acceptedFindings,reviewedFindings,promptRuns:prompts.length,promptAccepted,coverage:rows.length?directorComplete/rows.length:0};
}
async function snapshot(){const m=await metrics();const x={id:`adaptive-${Date.now().toString(36)}`,schemaVersion:1,...m};await put(x);window.dispatchEvent(new CustomEvent('genreactrix:adaptive-snapshot',{detail:x}));return x}
async function trends(){const rows=await all();const latest=rows[0]||await snapshot();const prior=rows[1]||null;const delta=(k)=>prior?Number(latest[k]||0)-Number(prior[k]||0):0;return {latest,prior,delta:{coverage:delta('coverage'),predictionAccuracy:delta('predictionAccuracy'),acceptedFindings:delta('acceptedFindings'),blocked:delta('blocked')}}}
async function integrityCheck(){const rows=await all(),issues=[];for(const x of rows){if(!x.id||!x.createdAt)issues.push({type:'adaptive.invalid-snapshot',severity:'warning',id:x.id});if(Number(x.coverage)<0||Number(x.coverage)>1)issues.push({type:'adaptive.invalid-coverage',severity:'warning',id:x.id})}return issues}
window.genreactrixAdaptiveIntelligenceEngine={metrics,snapshot,trends,all,integrityCheck};
})();
