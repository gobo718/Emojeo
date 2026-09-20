/* Genreactrix Home Count Engine v1
   Authoritative active-processing accounting. Counts image populations by current owner/location.
   Group, storage/history, and process telemetry are exposed separately and are never added to Active. */
(()=>{'use strict';
 const FINAL_STAGES=new Set(['batched','red-excluded','hot-magenta-excluded','defective','archived','import-failed','ai-failure-exported']);
 const QUEUE_STAGES=new Set(['queued','ai-processing','ai-partial','staged']);
 const clone=v=>v==null?v:structuredClone(v);
 let cached=null,importJobsCache=[],importJobsLoaded=false,importJobsLoad=null;
 function records(){return window.genreactrixImageRecordEngine?.all?.()||[]}
 function lifecycle(){return window.genreactrixLifecycleEngine}
 function terminal(record){if(record?.attributes?.rejected)return'reject';if(record?.attributes?.rejectionFlagged)return'delete';if(record?.attributes?.depot)return'depot';if(record?.attributes?.flagged)return'review';return'working'}
 function isFinal(record){const stage=String(record?.workflow?.stage||'');return Boolean(record?.attributes?.archived||record?.attributes?.inRecycleBin||FINAL_STAGES.has(stage))}
 function isInbox(record){if(isFinal(record))return false;const stage=String(record?.workflow?.stage||'');if(stage==='post-processing'||stage==='purgatory'||stage==='quarantine'||QUEUE_STAGES.has(stage))return false;try{if(lifecycle()?.inInbox?.(record))return true}catch{}return stage==='inbox-working'}
 function owner(record){
   if(!record||isFinal(record))return null;
   const stage=String(record.workflow?.stage||'');
   if(stage==='origin-source-retry')return'originActive';
   if(stage==='post-processing')return'postProcessing';
   if(stage==='purgatory')return'purgatory';
   if(stage==='quarantine')return'quarantine';
   if(isInbox(record))return'inbox';
   if(stage==='queued')return'queueWaiting';
   if(stage==='ai-processing')return'aiProcessing';
   if(stage==='ai-partial')return'partial';
   if(stage==='staged')return'staged';
   return null;
 }
 function compute(rows,{originActive=0}={}){
   const out={originActive:Math.max(0,Number(originActive)||0),queueWaiting:0,aiProcessing:0,partial:0,staged:0,quarantine:0,inbox:{total:0,working:0,review:0,depot:0,delete:0,reject:0,keep:0},postProcessing:0,purgatory:0,unaccounted:0,unaccountedIds:[]};
   for(const record of rows||[]){const place=owner(record);if(!place){if(!isFinal(record)){out.unaccounted++;out.unaccountedIds.push(String(record.id||''))}continue}if(place==='inbox'){const t=terminal(record);out.inbox.total++;out.inbox[t]=(out.inbox[t]||0)+1;if(record.attributes?.saved)out.inbox.keep++;continue}out[place]=(out[place]||0)+1}
   out.queueTotal=out.queueWaiting+out.aiProcessing+out.partial+out.staged;
   out.activeImageTotal=out.originActive+out.queueTotal+out.quarantine+out.inbox.total+out.postProcessing+out.purgatory;
   out.identity={active:out.activeImageTotal,parts:out.originActive+out.queueTotal+out.quarantine+out.inbox.total+out.postProcessing+out.purgatory,balanced:true};
   return out;
 }
 async function importJobs(){
   if(importJobsLoaded)return importJobsCache;
   if(!importJobsLoad)importJobsLoad=Promise.resolve(window.genreactrixImportJobEngine?.all?.()||[]).then(rows=>{importJobsCache=Array.isArray(rows)?rows.map(clone):[];importJobsLoaded=true;return importJobsCache}).catch(()=>{importJobsCache=[];importJobsLoaded=true;return importJobsCache});
   return importJobsLoad;
 }
 function cacheImportJob(job){if(!job?.id)return;const i=importJobsCache.findIndex(x=>String(x.id)===String(job.id));if(i>=0)importJobsCache[i]=clone(job);else importJobsCache.push(clone(job));importJobsLoaded=true;cached=null}
 async function originActiveCount(){
   try{const jobs=await importJobs(),rows=records(),gateRows=await window.genreactrixOriginGateEngine?.all?.()||[];let total=0;for(const job of jobs){if(!['running','paused'].includes(String(job.status||'')))continue;const found=Math.max(0,Number(job.found)||Number(job.requested)||0),linked=rows.filter(r=>String(r.source?.importJobId||'')===String(job.id||'')).length,jobGates=gateRows.filter(g=>String(g.importJobId||'')===String(job.id||'')).length,skipped=Math.max(0,Number(job.skipped)||0),reported=Math.max(0,(Number(job.imported)||0)+skipped+(Number(job.failed)||0)),resolved=Math.max(reported,linked+jobGates);total+=Math.max(0,found-resolved)}total+=gateRows.filter(g=>g.status==='pending-review').length;return total}catch{return 0}
 }
 function groupSnapshot(){const b=window.genreactrixBundleEngine?.snapshot?.()||{};const batch=window.genreactrixBatchEngine?.snapshotCached||{};return{activeBundles:Number(b.activeBundles)||0,totalBundles:Number(b.totalBundles)||0,bundleSize:Number(b.bundleSize)||0,activeBatch:batch.activeBatchId?1:0,batchHistory:Array.isArray(batch.reports)?batch.reports.length:0}}
 function processSnapshot(){const ai=window.genreactrixAiAnalysisEngine?.snapshotCached?.()||{};return{aiFailures:Array.isArray(window.genreactrixCurrentAiFailureRecords?.())?window.genreactrixCurrentAiFailureRecords().length:0,bufferTarget:Number(ai.bufferTarget)||Number(localStorage.getItem('genreactrix-ai-buffer-target'))||25}}
 async function snapshot(){const active=compute(records(),{originActive:await originActiveCount()});const result={...active,groups:groupSnapshot(),process:processSnapshot(),checkedAt:new Date().toISOString()};cached=result;return clone(result)}
 function snapshotCached(){return clone(cached)}
 async function verify(){const s=await snapshot(),issues=[];if(!s.identity.balanced)issues.push({type:'home-active-count-identity',severity:'critical',summary:'Active processing count does not reconcile.'});if(s.unaccounted)issues.push({type:'home-unaccounted-images',severity:'attention',summary:`${s.unaccounted} active image${s.unaccounted===1?' is':'s are'} outside the authoritative count spine.`,affectedIds:s.unaccountedIds});return{checkedAt:s.checkedAt,activeImageTotal:s.activeImageTotal,unaccounted:s.unaccounted,issueCount:issues.length,issues}}
 const api={compute,owner,snapshot,snapshotCached,verify};window.genreactrixHomeCountEngine=api;
 window.addEventListener('genreactrix:import-job',event=>cacheImportJob(event.detail?.job));
 window.addEventListener('genreactrix:origin-gate',()=>{cached=null});
 window.addEventListener('DOMContentLoaded',()=>{window.genreactrixMaintenanceEngine?.registerChecker?.('home-counts',verify,{quick:true,label:'Home Counts'});snapshot().catch(console.warn)});
})();
