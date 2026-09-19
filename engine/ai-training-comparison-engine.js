/* Genreactrix AI Training Comparison Engine v1
   Compares canonical AI, prompt-evaluation candidates, Director decisions, and
   community consensus without replacing any canonical classification. */
(()=>{
'use strict';
const DB='genreactrix-ai-training-comparison-v1', VERSION=1;
const STORES={benchmarks:'benchmarks',runs:'runs'};
const now=()=>new Date().toISOString();
const uid=p=>`${p}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0,8)}`;
const clone=v=>v==null?v:structuredClone(v);
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORES.benchmarks)){const s=db.createObjectStore(STORES.benchmarks,{keyPath:'id'});s.createIndex('createdAt','createdAt');s.createIndex('name','name')}if(!db.objectStoreNames.contains(STORES.runs)){const s=db.createObjectStore(STORES.runs,{keyPath:'id'});s.createIndex('createdAt','createdAt');s.createIndex('benchmarkId','benchmarkId')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function all(store){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(store),r=t.objectStore(store).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);t.oncomplete=()=>db.close()})}
async function put(store,value){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite'),r=t.objectStore(store).put(clone(value));r.onsuccess=()=>resolve(value);r.onerror=()=>reject(r.error);t.oncomplete=()=>db.close()})}
async function remove(store,id){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite'),r=t.objectStore(store).delete(id);r.onsuccess=()=>resolve(true);r.onerror=()=>reject(r.error);t.oncomplete=()=>db.close()})}
const arr=v=>Array.isArray(v)?v.filter(x=>x!=null):v==null?[]:[v];
const label=x=>typeof x==='string'?x:String(x?.name||x?.label||x?.id||x?.reaction||x?.theme||x?.value||'');
const values=v=>arr(v).map(label).map(x=>x.trim()).filter(Boolean);
const setEq=(a,b)=>{const A=new Set(a),B=new Set(b);return A.size===B.size&&[...A].every(x=>B.has(x))};
const jaccard=(a,b)=>{const A=new Set(a),B=new Set(b),u=new Set([...A,...B]);if(!u.size)return null;let i=0;for(const x of A)if(B.has(x))i++;return i/u.size};
function componentFromOutput(output,component){
 const root=output?.components||output?.result?.components||output||{};
 const raw=root?.[component]??output?.[component];
 if(component==='reactions'||component==='themes'){
  if(Array.isArray(raw))return values(raw);
  if(raw&&typeof raw==='object')return Object.entries(raw).filter(([,v])=>{const n=typeof v==='number'?v:Number(v?.percentage??v?.confidence??v?.score??1);return !Number.isFinite(n)||n>=50}).map(([k])=>k);
  return values(raw);
 }
 if(component==='primfusion')return values(raw?.label||raw?.name||raw?.id||raw);
 return values(raw);
}
function directorValues(record,component){const d=record?.analysis?.director||{};if(component==='reactions')return values(d.reactions||d.selectedReactions);if(component==='themes')return values(d.themes);if(component==='primfusion')return values(d.primFusion);return []}
function canonicalCandidate(record){const ai=record?.analysis?.ai;if(!ai)return null;const model=String(ai.model||ai.provider?.model||ai.provider?.name||'Canonical AI');const prompts=ai.promptVersions||ai.promptRefs||{};return {id:`canonical:${model}`,name:model,kind:'canonical',model,promptVersions:prompts,provider:ai.provider||{},runtimeMs:ai.runtimeMs||null,output:ai};}
function selectRecords(scope={type:'all'},limit=0){let rows=window.genreactrixImageRecordEngine?.all?.()||[];if(scope.type==='saved')rows=rows.filter(r=>r.attributes?.saved);else if(scope.type==='flagged')rows=rows.filter(r=>r.attributes?.flagged);else if(scope.type==='current-batch'){const id=window.genreactrixBatchEngine?.activeIdCached||null;rows=id?rows.filter(r=>(r.batchIds||[]).includes(id)):[]}else if(scope.type==='selected'){const ids=new Set((scope.imageIds||[]).map(String));rows=rows.filter(r=>ids.has(String(r.id)))}if(limit>0)rows=rows.slice(0,limit);return rows}
async function createBenchmark(data={}){const rows=selectRecords(data.scope||{type:'all'},Number(data.limit)||0);if(!rows.length)throw new Error('No eligible images for this benchmark');const b={id:uid('benchmark'),schemaVersion:1,name:String(data.name||`Benchmark ${new Date().toLocaleString()}`),description:String(data.description||''),createdAt:now(),scope:clone(data.scope||{type:'all'}),imageIds:rows.map(r=>r.id),components:(data.components||['reactions','themes','primfusion']).filter(x=>['reactions','themes','primfusion'].includes(x)),groundTruth:data.groundTruth==='consensus'?'consensus':'director'};await put(STORES.benchmarks,b);emit();return clone(b)}
async function consensusMap(){const rows=await window.genreactrixConsensusEngine?.allRecords?.()||[];return new Map(rows.map(r=>[`${r.imageId}::${r.voteType}`,r]))}
function promptCandidates(){const out=[];for(const run of window.genreactrixPromptEvaluationEngine?.list?.()||[]){for(const ref of run.promptRefs||[]){const id=`prompt:${ref.id}@${ref.version}`;if(!out.some(x=>x.id===id))out.push({id,name:`${ref.name||ref.id} v${ref.version}`,kind:'prompt',promptId:ref.id,promptVersion:ref.version,category:ref.category})}}return out}
function candidateCatalog(){const map=new Map();for(const rec of window.genreactrixImageRecordEngine?.all?.()||[]){const c=canonicalCandidate(rec);if(c&&!map.has(c.id))map.set(c.id,{id:c.id,name:c.name,kind:'canonical'})}for(const c of promptCandidates())map.set(c.id,c);return [...map.values()]}
function promptResult(candidate,imageId){const [idVer]=candidate.id.replace(/^prompt:/,'').split(':');const at=idVer.lastIndexOf('@'),promptId=idVer.slice(0,at),version=Number(idVer.slice(at+1));for(const run of window.genreactrixPromptEvaluationEngine?.list?.()||[]){const r=(run.results||[]).find(x=>x.imageId===imageId&&x.promptId===promptId&&Number(x.promptVersion)===version&&x.state==='complete');if(r)return r}return null}
function scoreResult(predicted,truth){const p=values(predicted),t=values(truth),jac=jaccard(p,t);return {predicted:p,truth:t,exact:setEq(p,t),jaccard:jac,hasPrediction:p.length>0,hasTruth:t.length>0}}
function summarizeRows(rows){const valid=rows.filter(r=>r.score.hasTruth);const attempted=valid.filter(r=>r.score.hasPrediction);const exact=attempted.filter(r=>r.score.exact).length;const jacs=attempted.map(r=>r.score.jaccard).filter(Number.isFinite);const runtimes=rows.map(r=>Number(r.runtimeMs)).filter(Number.isFinite);return {images:rows.length,truthAvailable:valid.length,attempted:attempted.length,exactMatches:exact,exactAgreementRate:attempted.length?exact/attempted.length:0,averageJaccard:jacs.length?jacs.reduce((a,b)=>a+b,0)/jacs.length:null,failures:rows.filter(r=>r.state==='failed').length,missing:rows.filter(r=>r.state==='missing').length,averageRuntimeMs:runtimes.length?runtimes.reduce((a,b)=>a+b,0)/runtimes.length:null}}
async function runComparison(config={}){
 const benchmarks=await all(STORES.benchmarks),benchmark=benchmarks.find(b=>b.id===config.benchmarkId);if(!benchmark)throw new Error('Benchmark not found');
 const candidateIds=(config.candidateIds||[]).filter(Boolean);if(!candidateIds.length)throw new Error('Choose at least one AI candidate');
 const catalog=new Map(candidateCatalog().map(c=>[c.id,c])),consensus=await consensusMap();
 const records=new Map((window.genreactrixImageRecordEngine?.all?.()||[]).map(r=>[String(r.id),r]));
 const run={id:uid('training-run'),schemaVersion:1,name:String(config.name||`AI comparison ${new Date().toLocaleString()}`),benchmarkId:benchmark.id,benchmarkName:benchmark.name,createdAt:now(),completedAt:null,state:'running',candidateIds:[...candidateIds],components:[...benchmark.components],groundTruth:benchmark.groundTruth,imageIds:[...benchmark.imageIds],rows:[],metrics:{},notes:String(config.notes||'')};
 await put(STORES.runs,run);emit();
 for(const imageId of benchmark.imageIds){const record=records.get(String(imageId));if(!record)continue;for(const candidateId of candidateIds){const candidate=catalog.get(candidateId);if(!candidate)continue;let source=null,state='complete',error='',runtimeMs=null;
   if(candidate.kind==='canonical'){const c=canonicalCandidate(record);if(c&&c.id===candidateId){source=c.output;runtimeMs=c.runtimeMs}else state='missing'}
   else {const r=promptResult(candidate,imageId);if(r){source=r.output;runtimeMs=r.runtimeMs}else state='missing'}
   for(const component of benchmark.components){let truth=[];if(benchmark.groundTruth==='consensus'){const c=consensus.get(`${imageId}::${component==='primfusion'?'primfusion':component.slice(0,-1)}`);truth=c?.topValue?[c.topValue]:[]}else truth=directorValues(record,component);
    const predicted=source?componentFromOutput(source,component):[];const score=scoreResult(predicted,truth);run.rows.push({id:uid('comparison-row'),imageId:String(imageId),candidateId,candidateName:candidate.name,candidateKind:candidate.kind,component,state,error,runtimeMs,score});
   }
  }
 }
 for(const candidateId of candidateIds){run.metrics[candidateId]={};for(const component of benchmark.components)run.metrics[candidateId][component]=summarizeRows(run.rows.filter(r=>r.candidateId===candidateId&&r.component===component));run.metrics[candidateId].overall=summarizeRows(run.rows.filter(r=>r.candidateId===candidateId))}
 run.state='completed';run.completedAt=now();await put(STORES.runs,run);
 try{await window.genreactrixHistoryEngine?.append?.({eventType:'ai-training-comparison',actor:'system',sourceEngine:'ai-training-comparison',summary:`Compared ${candidateIds.length} AI candidates across ${benchmark.imageIds.length} benchmark images`,createdAt:run.completedAt,payload:{runId:run.id,benchmarkId:benchmark.id,candidateIds}})}catch{}
 emit();return clone(run)
}
async function queueReanalysis(runId,candidateId){const run=(await all(STORES.runs)).find(r=>r.id===runId);if(!run)throw new Error('Comparison run not found');const components={};for(const [id] of window.genreactrixAiAnalysisEngine?.components||[])components[id]={enabled:run.components.includes(id),behavior:'reanalyze'};const target='selected';const job=await window.genreactrixAiAnalysisEngine?.createJob?.({target,imageIds:[...run.imageIds],quantity:run.imageIds.length,quantityMode:'all',order:'oldest',components,promptRefs:{}});if(!job?.id)throw new Error('No eligible images could be queued for reanalysis');return job}
async function listBenchmarks(){return (await all(STORES.benchmarks)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))}
async function listRuns(){return (await all(STORES.runs)).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))}
async function getRun(id){return clone((await all(STORES.runs)).find(r=>r.id===id)||null)}
async function deleteBenchmark(id){const runs=await all(STORES.runs);if(runs.some(r=>r.benchmarkId===id))throw new Error('Delete comparison runs using this benchmark first');return remove(STORES.benchmarks,id)}
async function deleteRun(id){return remove(STORES.runs,id)}
async function summary(){const benchmarks=await listBenchmarks(),runs=await listRuns();const latest=runs[0]||null;return {benchmarks:benchmarks.length,runs:runs.length,candidates:candidateCatalog().length,latest}}
async function verify(){const benchmarks=await all(STORES.benchmarks),runs=await all(STORES.runs),issues=[],benchmarkIds=new Set(benchmarks.map(b=>b.id)),recordIds=new Set((window.genreactrixImageRecordEngine?.all?.()||[]).map(r=>String(r.id)));for(const b of benchmarks){if(!b.imageIds?.length)issues.push({severity:'attention',type:'benchmark-empty',id:b.id});for(const id of b.imageIds||[])if(!recordIds.has(String(id)))issues.push({severity:'attention',type:'benchmark-missing-image',id:b.id,imageId:id})}for(const r of runs){if(!benchmarkIds.has(r.benchmarkId))issues.push({severity:'critical',type:'comparison-missing-benchmark',id:r.id});if(!Array.isArray(r.rows))issues.push({severity:'critical',type:'comparison-rows-missing',id:r.id})}return {checked:benchmarks.length+runs.length,issues}}
function emit(){window.dispatchEvent(new CustomEvent('genreactrix:ai-training-comparison'))}
window.genreactrixAiTrainingComparisonEngine={createBenchmark,runComparison,queueReanalysis,listBenchmarks,listRuns,getRun,deleteBenchmark,deleteRun,candidateCatalog,summary,verify};
})();
