(()=>{
'use strict';
const DB='genreactrix-prediction-engine-v1',VER=1,RUNS='runs';
const now=()=>new Date().toISOString();
const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
let dbp=null;
function openDb(){if(dbp)return dbp;dbp=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(RUNS)){const s=db.createObjectStore(RUNS,{keyPath:'id'});s.createIndex('imageId','imageId');s.createIndex('createdAt','createdAt')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbp}
async function put(run){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(RUNS,'readwrite').objectStore(RUNS).put(run);r.onsuccess=()=>resolve(run);r.onerror=()=>reject(r.error)})}
async function allRuns(){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(RUNS).objectStore(RUNS).getAll();r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))));r.onerror=()=>reject(r.error)})}
const records=()=>window.genreactrixImageRecordEngine?.all?.()||[];
const d=r=>r.analysis?.director||r.director||{};
const list=(v,key)=>[...new Set((Array.isArray(v)?v:[]).map(x=>String(typeof x==='string'?x:(x?.[key]||x?.label||x?.id||''))).filter(Boolean))];
const reactions=r=>list(d(r).reactions||d(r).selectedReactions,'reaction');
const themes=r=>list(d(r).themes,'theme');
const prim=r=>String(typeof d(r).primFusion==='string'?d(r).primFusion:(d(r).primFusion?.label||d(r).primFusion?.id||''));
const aiMap=r=>{const raw=r.analysis?.ai?.components?.reactions||r.analysis?.ai?.reactions||{};const out={};if(Array.isArray(raw))for(const x of raw){const k=x.name||x.id||x.reaction;if(k)out[k]=Number(x.percentage??x.confidence??x.score)}else for(const [k,v] of Object.entries(raw))out[k]=typeof v==='number'?v:Number(v?.percentage??v?.confidence??v?.score);return out};
function normalizeScores(map,total){return Object.entries(map).map(([id,n])=>({id,probability:total?Math.min(.99,n/total):0,support:n})).sort((a,b)=>b.probability-a.probability||b.support-a.support)}
function predict(imageId,options={}){
 const rows=records(); const target=rows.find(r=>String(r.id)===String(imageId))||null;
 const source=String(target?.source?.type||target?.sourceType||''); const batch=String(target?.batchId||target?.batch?.id||'');
 const candidates=rows.filter(r=>String(r.id)!==String(imageId)&&reactions(r).length);
 const weighted=[];
 for(const r of candidates){let w=1;const rs=String(r.source?.type||r.sourceType||''),rb=String(r.batchId||r.batch?.id||'');if(source&&rs===source)w+=.5;if(batch&&rb===batch)w+=.35;const ai=aiMap(target||{});const rr=reactions(r);if(Object.keys(ai).length){const overlap=rr.reduce((s,x)=>s+(Number(ai[x])||0)/100,0);w+=Math.min(1.5,overlap)}weighted.push({r,w})}
 const reactionCounts={},themeCounts={},primCounts={};let totalWeight=0;
 for(const {r,w} of weighted){totalWeight+=w;for(const x of reactions(r))reactionCounts[x]=(reactionCounts[x]||0)+w;for(const x of themes(r))themeCounts[x]=(themeCounts[x]||0)+w;const p=prim(r);if(p)primCounts[p]=(primCounts[p]||0)+w}
 const topReactions=normalizeScores(reactionCounts,totalWeight).slice(0,6),topThemes=normalizeScores(themeCounts,totalWeight).slice(0,6),topPrimFusion=normalizeScores(primCounts,totalWeight).slice(0,4);
 const ai=aiMap(target||{});for(const x of topReactions){if(Number.isFinite(ai[x.id]))x.probability=Math.min(.99,(x.probability*0.65)+(ai[x.id]/100*0.35));x.confidence=Math.min(.99,Math.sqrt(x.support/Math.max(1,totalWeight))*0.75+0.15);x.evidence=[`${x.support.toFixed(1)} weighted historical matches`,source?'same-source evidence available':'cross-source history',Number.isFinite(ai[x.id])?`AI signal ${ai[x.id].toFixed(0)}%`:'no current AI signal']}
 for(const x of [...topThemes,...topPrimFusion]){x.confidence=Math.min(.95,Math.sqrt(x.support/Math.max(1,totalWeight))*0.75+0.1);x.evidence=[`${x.support.toFixed(1)} weighted historical matches`]}
 const expectedAgreement=topReactions.length?topReactions.reduce((s,x)=>s+(Number.isFinite(ai[x.id])?1-Math.abs(x.probability-ai[x.id]/100):.5),0)/topReactions.length:null;
 return {id:uid('prediction'),schemaVersion:1,imageId:imageId||null,createdAt:now(),sampleSize:candidates.length,source,batch,predictions:{reactions:topReactions,themes:topThemes,primFusion:topPrimFusion,expectedAgreement},options};
}
async function run(imageId,options={}){const result=predict(imageId,options);await put(result);window.dispatchEvent(new CustomEvent('genreactrix:prediction-run',{detail:{id:result.id,imageId:result.imageId}}));return structuredClone(result)}
async function integrityCheck(){const runs=await allRuns(),issues=[];for(const r of runs){if(!r.id||!r.createdAt)issues.push({type:'prediction.invalid',severity:'warning',id:r.id});if(r.imageId&&!records().some(x=>String(x.id)===String(r.imageId)))issues.push({type:'prediction.missing-image',severity:'warning',id:r.id,imageId:r.imageId})}return issues}
window.genreactrixPredictionEngine={run,predict,allRuns,integrityCheck};
})();
