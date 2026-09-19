/* Genreactrix Post-processing Engine v1
   Batch-committed per-image finalization journal.
   Item completion is all-or-nothing: unresolved plans remain in Purgatory. */
(()=>{'use strict';
const DB='genreactrix-post-processing-engine-v1',VERSION=1,PLANS='plans';
const AUTOMATIC_ATTEMPTS=3;
const now=()=>new Date().toISOString(),clone=v=>v==null?v:structuredClone(v);
function localDateFor(value=null){const d=value?new Date(value):new Date();if(Number.isNaN(d.getTime()))return'';const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return`${y}-${m}-${day}`}
function isDailyAttemptForDay(attempt,day){if(attempt?.kind!=='daily')return false;const recorded=String(attempt.dailyDate||localDateFor(attempt.startedAt));return recorded===String(day||'')}
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(PLANS)){const s=db.createObjectStore(PLANS,{keyPath:'id'});s.createIndex('batchId','batchId');s.createIndex('imageId','imageId');s.createIndex('status','status');s.createIndex('submissionToken','submissionToken');s.createIndex('updatedAt','updatedAt')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||new Error('Could not open Post-processing journal'))})}
async function withStore(mode,work){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(PLANS,mode),store=tx.objectStore(PLANS);let result;try{result=work(store)}catch(error){db.close();reject(error);return}tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=()=>{db.close();reject(tx.error||new Error('Post-processing journal transaction failed'))};tx.onabort=()=>{db.close();reject(tx.error||new Error('Post-processing journal transaction aborted'))}})}
async function get(id){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(PLANS,'readonly'),r=tx.objectStore(PLANS).get(id);r.onsuccess=()=>resolve(clone(r.result||null));r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close()})}
async function all(){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(PLANS,'readonly'),r=tx.objectStore(PLANS).getAll();r.onsuccess=()=>resolve((r.result||[]).map(clone));r.onerror=()=>reject(r.error);tx.oncomplete=()=>db.close()})}
async function put(value){const row={...value,updatedAt:now()};await withStore('readwrite',s=>s.put(clone(row)));return clone(row)}
function planId(submissionToken,imageId){return `post::${submissionToken}::${String(imageId)}`}
function cleanError(error){return{message:String(error?.message||error||'Unknown Post-processing error'),name:String(error?.name||'Error'),cleanupErrors:Array.isArray(error?.postProcessingCleanupErrors)?[...error.postProcessingCleanupErrors]:[],stack:String(error?.stack||'').slice(0,4000)}}
function decision(input={}){return{imageId:String(input.imageId||''),terminal:String(input.terminal||''),keep:Boolean(input.keep),route:String(input.route||''),finalStage:String(input.finalStage||''),sourceStorageMode:String(input.sourceStorageMode||''),recordUpdatedAt:input.recordUpdatedAt||null,evaluationVersion:input.evaluationVersion||null}}
async function freezeBatchPlans({batchId,submissionToken,submissionVersion=1,items=[]}={}){
  if(!batchId||!submissionToken)throw new Error('Batch Post-processing identity is incomplete');
  const frozen=[];
  for(const raw of items){const d=decision(raw);if(!d.imageId)continue;const id=planId(submissionToken,d.imageId),existing=await get(id);if(existing){frozen.push(existing);continue}const ctx=window.genreactrixProjectRuntimeEngine,row={id,schemaVersion:2,projectId:ctx?.projectId?.()||'',runtimeId:ctx?.runtimeId?.()||null,batchId:String(batchId),submissionToken:String(submissionToken),submissionVersion:Number(submissionVersion)||1,imageId:d.imageId,decision:d,status:'planned',createdAt:now(),updatedAt:now(),completedAt:null,purgatoryAt:null,lastAttemptAt:null,lastSuccessAt:null,lastError:null,attempts:[],result:null};await put(row);frozen.push(row)}
  return frozen;
}
async function plansForSubmission(submissionToken){return (await all()).filter(p=>p.submissionToken===String(submissionToken)).sort((a,b)=>String(a.imageId).localeCompare(String(b.imageId)))}
async function plansForBatch(batchId){return (await all()).filter(p=>p.batchId===String(batchId)).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)))}
async function purgatoryPlans(){return (await all()).filter(p=>p.status==='purgatory').sort((a,b)=>String(a.purgatoryAt||a.updatedAt).localeCompare(String(b.purgatoryAt||b.updatedAt)))}
function automaticUsed(plan){return(plan.attempts||[]).filter(a=>a.kind==='automatic').length}
async function markStage(plan,stage){try{if(stage==='post-processing')return window.genreactrixLifecycleEngine?.markPostProcessing?.(plan.imageId,plan.batchId);if(stage==='purgatory')return window.genreactrixLifecycleEngine?.markPurgatory?.(plan.imageId,plan.batchId)}catch(error){console.warn('Lifecycle stage update failed during Post-processing',error)}return null}
async function appendHistory(plan,eventType,payload){try{return await window.genreactrixHistoryEngine?.append?.({imageId:plan.imageId,eventType,actor:'system',sourceEngine:'post-processing',batchId:plan.batchId,summary:eventType.replaceAll('-',' '),payload})}catch(error){console.warn('Post-processing history append failed',error);return null}}
async function runAttempt(id,{kind='manual',dailyDate=null}={}){
  let plan=await get(id);if(!plan)throw new Error('Post-processing plan not found');if(plan.status==='completed')return plan;
  const attemptNumber=(plan.attempts?.length||0)+1,startedAt=now(),attempt={attemptNumber,kind,startedAt,status:'running',...(kind==='daily'?{dailyDate:String(dailyDate||localDateFor(startedAt))}:{})};
  plan=await put({...plan,status:'processing',lastAttemptAt:startedAt,attempts:[...(plan.attempts||[]),attempt]});
  await markStage(plan,'post-processing');
  await appendHistory(plan,'post-processing-attempt-started',{planId:plan.id,attemptNumber,kind,decision:clone(plan.decision)});
  try{
    const result=await window.genreactrixImagesEngine?.finalizePostProcessingPlan?.({id:plan.id,batchId:plan.batchId,imageId:plan.imageId,...clone(plan.decision)});if(!result)throw new Error('Images Engine did not return a Post-processing result');
    const completedAt=now(),attempts=[...(plan.attempts||[])];Object.assign(attempts[attempts.length-1],{completedAt,status:'complete'});
    plan=await put({...plan,status:'completed',completedAt,purgatoryAt:null,lastSuccessAt:completedAt,lastError:null,attempts,result:{recycled:Boolean(result.recycled),kept:Boolean(result.kept),idempotent:Boolean(result.idempotent)}});
    await appendHistory(plan,'post-processing-completed',{planId:plan.id,attemptNumber,kind,result:clone(plan.result)});
    window.dispatchEvent(new CustomEvent('genreactrix:post-processing',{detail:{type:'completed',plan:clone(plan)}}));return plan;
  }catch(error){
    const failedAt=now(),err=cleanError(error),attempts=[...(plan.attempts||[])];Object.assign(attempts[attempts.length-1],{completedAt:failedAt,status:'failed',error:err});
    plan=await put({...plan,status:'purgatory',purgatoryAt:plan.purgatoryAt||failedAt,lastError:err,attempts});
    await markStage(plan,'purgatory');
    await appendHistory(plan,'post-processing-failed',{planId:plan.id,attemptNumber,kind,error:err,decision:clone(plan.decision)});
    window.dispatchEvent(new CustomEvent('genreactrix:post-processing',{detail:{type:'purgatory',plan:clone(plan)}}));return plan;
  }
}
async function processAutomatic(id){let plan=await get(id);if(!plan)throw new Error('Post-processing plan not found');while(plan.status!=='completed'&&automaticUsed(plan)<AUTOMATIC_ATTEMPTS){plan=await runAttempt(id,{kind:'automatic'})}if(plan.status!=='completed'&&automaticUsed(plan)>=AUTOMATIC_ATTEMPTS){window.genreactrixNotificationsEngine?.createOrUpdate?.({severity:'attention',title:'Post-processing needs attention',message:`${plan.imageId} remains in Purgatory after ${AUTOMATIC_ATTEMPTS} automatic attempts.`,ownerEngine:'post-processing',actionTarget:'maintenance',actionLabel:'Retry',dedupeKey:`purgatory:${plan.id}`,resolved:false})}return plan}
async function processSubmission(submissionToken){const plans=await plansForSubmission(submissionToken);return Promise.all(plans.map(p=>processAutomatic(p.id)))}
async function retryPlan(id,{kind='manual',dailyDate=null}={}){const plan=await get(id);if(!plan)throw new Error('Post-processing plan not found');if(plan.status==='completed')return plan;const result=await runAttempt(id,{kind,dailyDate});if(result.status==='completed')window.genreactrixNotificationsEngine?.createOrUpdate?.({severity:'info',title:'Post-processing recovered',message:`${result.imageId} completed successfully.`,ownerEngine:'post-processing',actionTarget:'maintenance',actionLabel:'Maintenance',dedupeKey:`purgatory:${result.id}`,resolved:true});return result}
async function retryForImage(imageId){const plans=(await all()).filter(p=>p.imageId===String(imageId)&&p.status==='purgatory').sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));if(!plans.length)throw new Error('No unresolved Purgatory plan exists for this image');return retryPlan(plans[0].id,{kind:'manual'})}
async function retryAll({kind='manual'}={}){const plans=await purgatoryPlans();return Promise.all(plans.map(p=>retryPlan(p.id,{kind})))}
async function retryDaily({date=null}={}){const day=String(date||localDateFor()),plans=await purgatoryPlans(),eligible=plans.filter(p=>!(p.attempts||[]).some(a=>isDailyAttemptForDay(a,day)));const results=[];for(const p of eligible)results.push(await retryPlan(p.id,{kind:'daily',dailyDate:day}));return{date:day,eligible:eligible.length,results}}
async function inferCompleted(plan){
  const record=window.genreactrixImageRecordEngine?.get?.(plan.imageId,{touch:false});if(!record)return null;
  const d=plan.decision||{},expectedStage=d.finalStage||(d.terminal==='red'?'red-excluded':d.terminal==='hot'?'hot-magenta-excluded':'batched');
  if(record.workflow?.stage!==expectedStage||!record.timestamps?.batchedAt)return null;
  const images=window.genreactrixImagesEngine;
  if(d.keep){
    const blob=images?.keptBlobGet?await images.keptBlobGet(plan.imageId).catch(()=>null):null;
    const idRecord=images?.keptIdGet?await images.keptIdGet(plan.imageId).catch(()=>null):null;
    if(record.storage?.mode!=='kept'||!record.attributes?.saved||!blob||!idRecord)return null;
  }else if(d.route==='recycle'&&(!record.attributes?.inRecycleBin||record.storage?.mode!=='recycle'))return null;
  if(d.terminal==='red'){const exclusion=images?.exclusionRecordGet?await images.exclusionRecordGet('red',plan.imageId).catch(()=>null):null;if(!exclusion)return null;}
  if(d.terminal==='hot'){const exclusion=images?.exclusionRecordGet?await images.exclusionRecordGet('hot',plan.imageId).catch(()=>null):null;if(!exclusion)return null;}
  const completedAt=record.timestamps.batchedAt||now();
  return put({...plan,status:'completed',completedAt,purgatoryAt:null,lastSuccessAt:completedAt,lastError:null,result:{legacyInferred:true,recycled:Boolean(record.attributes?.inRecycleBin),kept:record.storage?.mode==='kept'}});
}
async function markInterrupted(plan){if(plan.status!=='processing')return plan;const attempts=[...(plan.attempts||[])],last=attempts.at(-1);if(last?.status==='running'){const interruptedAt=now();last.completedAt=interruptedAt;last.status='interrupted';last.error={message:'Browser or session ended before this Post-processing attempt reported completion.',name:'InterruptedAttempt',cleanupErrors:[],stack:''};plan=await put({...plan,status:'purgatory',purgatoryAt:plan.purgatoryAt||interruptedAt,lastError:last.error,attempts});await markStage(plan,'purgatory');await appendHistory(plan,'post-processing-interrupted',{planId:plan.id,attemptNumber:last.attemptNumber,kind:last.kind,error:last.error})}return plan}
async function reconcileSubmission(submissionToken){const rows=await plansForSubmission(submissionToken),out=[];for(let p of rows){if(p.status!=='completed'){const inferred=await inferCompleted(p);if(inferred)p=inferred;else p=await markInterrupted(p)}out.push(p)}return out}
async function verify(){const issues=[],plans=await all();for(const p of plans){const record=window.genreactrixImageRecordEngine?.get?.(p.imageId,{touch:false});if(!record){issues.push({type:'post-processing-missing-image',severity:'critical',imageId:p.imageId,batchId:p.batchId,summary:'Post-processing plan references a missing image',technicalDetails:p.id});continue}if(p.status==='purgatory')issues.push({type:'purgatory-item',severity:'attention',imageId:p.imageId,batchId:p.batchId,summary:'Image is unresolved in Purgatory',technicalDetails:p.lastError?.message||'Post-processing did not complete',availableRepairs:['retry-purgatory']});if(p.status==='completed'&&record.workflow?.stage==='purgatory')issues.push({type:'post-processing-state-mismatch',severity:'attention',imageId:p.imageId,batchId:p.batchId,summary:'Completed Post-processing plan still has Purgatory lifecycle state',availableRepairs:['retry-purgatory']})}const unresolved=plans.filter(p=>p.status==='purgatory');if(unresolved.length)issues.push({type:'purgatory-retry-all',severity:'attention',batchId:'all-purgatory',summary:unresolved.length===1?'1 Purgatory item is ready to retry':`${unresolved.length} Purgatory items can be retried together`,technicalDetails:'Retry All performs exactly one new non-AI Post-processing attempt per unresolved item.',availableRepairs:['retry-all-purgatory'],dedupeKey:'post-processing:purgatory-retry-all'});return{planCount:plans.length,purgatoryCount:unresolved.length,issueCount:issues.length,issues}}
function registerMaintenance(){const m=window.genreactrixMaintenanceEngine;if(!m)return;m.registerChecker?.('post-processing',verify,{quick:true,label:'Post-processing'});m.registerRepair?.('retry-purgatory',async issue=>{const imageId=issue.affectedIds?.find(id=>id!=='all-purgatory');if(!imageId)throw new Error('Purgatory image is unavailable');return retryForImage(imageId)},{label:'Retry'});m.registerRepair?.('retry-all-purgatory',async()=>retryAll({kind:'manual'}),{label:'Retry All'})}
const api={AUTOMATIC_ATTEMPTS,freezeBatchPlans,plansForSubmission,plansForBatch,purgatoryPlans,processAutomatic,processSubmission,retryPlan,retryForImage,retryAll,retryDaily,reconcileSubmission,verify};window.genreactrixPostProcessingEngine=api;
window.addEventListener('DOMContentLoaded',registerMaintenance);
})();
