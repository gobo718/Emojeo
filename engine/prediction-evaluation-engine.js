(()=>{
'use strict';
const DB='genreactrix-prediction-evaluation-v1',VER=1,STORE='evaluations';let dbp=null;
const now=()=>new Date().toISOString();const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
function openDb(){if(dbp)return dbp;dbp=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:'id'});s.createIndex('predictionId','predictionId');s.createIndex('createdAt','createdAt')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbp}
async function put(x){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE,'readwrite').objectStore(STORE).put(x);r.onsuccess=()=>resolve(x);r.onerror=()=>reject(r.error)})}
async function all(){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))));r.onerror=()=>reject(r.error)})}
async function record(predictionId,imageId,decision,details={}){const valid=['accepted','rejected','partial','false-positive','false-negative','unreviewed'];if(!valid.includes(decision))throw new Error('Unknown prediction review decision');const x={id:uid('prediction-review'),schemaVersion:1,predictionId,imageId:imageId||null,decision,details,createdAt:now()};await put(x);window.dispatchEvent(new CustomEvent('genreactrix:prediction-evaluated',{detail:x}));return x}
async function metrics(){const rows=await all();const reviewed=rows.filter(x=>x.decision!=='unreviewed');const counts={};for(const r of reviewed)counts[r.decision]=(counts[r.decision]||0)+1;const accepted=(counts.accepted||0)+(counts.partial||0)*.5;return {total:rows.length,reviewed:reviewed.length,counts,acceptanceRate:reviewed.length?accepted/reviewed.length:null,rejectionRate:reviewed.length?(counts.rejected||0)/reviewed.length:null}}
window.genreactrixPredictionEvaluationEngine={record,all,metrics};
})();
