(()=>{
'use strict';
const DB='genreactrix-correlation-engine-v1',STORE='runs',VERSION=1;
const now=()=>new Date().toISOString();
const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const clone=v=>v==null?v:structuredClone(v);
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:'id'});s.createIndex('createdAt','createdAt')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function saveRun(run){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE,'readwrite').objectStore(STORE).put(run);r.onsuccess=()=>resolve(run);r.onerror=()=>reject(r.error)})}
async function allRuns(){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))));r.onerror=()=>reject(r.error)})}
const records=()=>window.genreactrixImageRecordEngine?.all?.()||[];
const director=r=>r.analysis?.director||r.director||{};
const reactions=r=>[...new Set((director(r).reactions||director(r).selectedReactions||[]).filter(Boolean).map(String))];
const themes=r=>[...new Set((director(r).themes||[]).filter(Boolean).map(x=>String(typeof x==='string'?x:(x.label||x.id||''))).filter(Boolean))];
const primFusion=r=>{const p=director(r).primFusion;return String(typeof p==='string'?p:(p?.label||p?.id||''))};
function aiAgreement(r){const d=new Set(reactions(r));const raw=r.analysis?.ai?.components?.reactions||r.analysis?.ai?.reactions||{};const map={};if(Array.isArray(raw))for(const x of raw){const k=x.name||x.id||x.reaction;if(k)map[k]=Number(x.percentage??x.confidence??x.score)}else for(const [k,v] of Object.entries(raw))map[k]=typeof v==='number'?v:Number(v?.percentage??v?.confidence??v?.score);const keys=[...new Set([...d,...Object.keys(map)])].filter(k=>Number.isFinite(map[k]));if(!keys.length)return null;return keys.filter(k=>d.has(k)===(map[k]>=50)).length/keys.length}
function assoc(a,b,total,aCount,bCount,both){if(!total||!aCount||!bCount)return 0;const expected=(aCount*bCount)/total;return expected?Math.log2((both+0.5)/(expected+0.5)):0}
function discover(options={}){const rows=records(),minCount=Math.max(1,Number(options.minCount)||3),minStrength=Math.max(0,Number(options.minStrength)||0.5);const total=rows.length;const reactionCounts={},themeCounts={},pairCounts={},themeReaction={},batchStats={},sourceStats={};
 for(const r of rows){const rs=reactions(r),ts=themes(r),batch=String(r.batchId||r.batch?.id||r.source?.batchId||'Unassigned'),source=String(r.source?.type||r.sourceType||r.source?.domain||'Unknown');const ag=aiAgreement(r);
  for(const x of rs)reactionCounts[x]=(reactionCounts[x]||0)+1;for(const t of ts)themeCounts[t]=(themeCounts[t]||0)+1;
  for(let i=0;i<rs.length;i++)for(let j=i;j<rs.length;j++){const k=[rs[i],rs[j]].sort().join(' × ');pairCounts[k]=(pairCounts[k]||0)+1}
  for(const t of ts)for(const x of rs){const k=`${t}|||${x}`;themeReaction[k]=(themeReaction[k]||0)+1}
  const bs=batchStats[batch]||(batchStats[batch]={count:0,agreement:0,agreementN:0});bs.count++;if(ag!=null){bs.agreement+=ag;bs.agreementN++}
  const ss=sourceStats[source]||(sourceStats[source]={count:0,agreement:0,agreementN:0});ss.count++;if(ag!=null){ss.agreement+=ag;ss.agreementN++}
 }
 const findings=[];
 for(const [k,both] of Object.entries(themeReaction)){if(both<minCount)continue;const [theme,reaction]=k.split('|||');const strength=assoc(theme,reaction,total,themeCounts[theme],reactionCounts[reaction],both);if(Math.abs(strength)>=minStrength)findings.push({kind:'theme-reaction',title:`${theme} ↔ ${reaction}`,description:`${both} images contain both. Association strength ${strength.toFixed(2)}.`,strength,count:both,theme,reaction})}
 for(const [pair,count] of Object.entries(pairCounts)){if(count<=2)findings.push({kind:'rare-pair',title:`Rare pair: ${pair}`,description:`Observed ${count} time${count===1?'':'s'}.`,strength:count===0?-1:-0.5,count,pair})}
 const batchRows=Object.entries(batchStats).filter(([,v])=>v.agreementN>=minCount).map(([name,v])=>({name,avg:v.agreement/v.agreementN,count:v.count}));if(batchRows.length>1){const mean=batchRows.reduce((s,x)=>s+x.avg,0)/batchRows.length;for(const x of batchRows){const delta=x.avg-mean;if(Math.abs(delta)>=0.15)findings.push({kind:'batch-outlier',title:`Batch agreement outlier: ${x.name}`,description:`Agreement ${(x.avg*100).toFixed(1)}%, ${(delta*100).toFixed(1)} points from the batch mean.`,strength:delta,count:x.count,batch:x.name})}}
 const sourceRows=Object.entries(sourceStats).filter(([,v])=>v.agreementN>=minCount).map(([name,v])=>({name,avg:v.agreement/v.agreementN,count:v.count}));if(sourceRows.length>1){const mean=sourceRows.reduce((s,x)=>s+x.avg,0)/sourceRows.length;for(const x of sourceRows){const delta=x.avg-mean;if(Math.abs(delta)>=0.15)findings.push({kind:'source-shift',title:`Source agreement shift: ${x.name}`,description:`Agreement ${(x.avg*100).toFixed(1)}%, ${(delta*100).toFixed(1)} points from the source mean.`,strength:delta,count:x.count,source:x.name})}}
 findings.sort((a,b)=>Math.abs(b.strength)-Math.abs(a.strength)||b.count-a.count);
 return {id:uid('correlation-run'),schemaVersion:1,createdAt:now(),recordCount:total,options:{minCount,minStrength},findings:findings.slice(0,500),summaries:{reactionCounts,themeCounts,pairCounts,batchStats,sourceStats}}}
async function run(options={}){const result=discover(options);await saveRun(result);window.dispatchEvent(new CustomEvent('genreactrix:correlation-run',{detail:{id:result.id,count:result.findings.length}}));return clone(result)}
window.genreactrixCorrelationEngine={run,discover,allRuns};
})();
