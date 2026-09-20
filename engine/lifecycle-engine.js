/* Genreactrix Lifecycle Engine v1
   Canonical image lifecycle/state spine. Places own images; engines perform work. */
(()=>{'use strict';
 const STAGES=Object.freeze({
  IMPORT_FAILED:'import-failed',
  SOURCE_RETRY:'origin-source-retry',
  QUEUE_WAITING:'queued',
  AI_PROCESSING:'ai-processing',
  AI_PARTIAL:'ai-partial',
  STAGED:'staged',
  INBOX_WORKING:'inbox-working',
  POST_PROCESSING:'post-processing',
  PURGATORY:'purgatory',
  QUARANTINE:'quarantine',
  DEFECTIVE:'defective',
  BATCHED:'batched',
  RED_EXCLUDED:'red-excluded',
  HOT_EXCLUDED:'hot-magenta-excluded',
  ARCHIVED:'archived'
 });
 const PRIMARY=['aiReactions','aiThemes','aiDescription'];
 const CANONICAL_STAGES=new Set(Object.values(STAGES));
 const COMPAT_FINAL_STAGES=new Set(['ai-failure-exported']);
 const now=()=>new Date().toISOString();
 const clone=v=>v==null?v:structuredClone(v);
 function records(){return window.genreactrixImageRecordEngine?.all?.()||[];}
 function get(id){return window.genreactrixImageRecordEngine?.get?.(String(id),{touch:false})||null;}
 function membershipIds(record){
  const ext=record?.metadata?.extended||{};
  const current=[...(Array.isArray(ext.inboxBundleIds)?ext.inboxBundleIds:[]),...(Array.isArray(ext.inboxPackIds)?ext.inboxPackIds:[])];
  const history=[...(Array.isArray(ext.inboxHistoryBundleIds)?ext.inboxHistoryBundleIds:[]),...(Array.isArray(ext.inboxHistoryPackIds)?ext.inboxHistoryPackIds:[])];
  return {current:[...new Set(current.map(String))],history:[...new Set(history.map(String))]};
 }
 function inInbox(record){return membershipIds(record).current.length>0||record?.workflow?.stage===STAGES.INBOX_WORKING;}
 function primaryState(record){
  const statuses=PRIMARY.map(key=>record?.components?.[key]||'missing');
  const current=statuses.filter(v=>v==='current').length;
  const processing=statuses.filter(v=>v==='processing').length;
  const failed=statuses.filter(v=>['failed','partial','stale'].includes(v)).length;
  const complete=current===PRIMARY.length;
  return {statuses,current,processing,failed,complete,hasData:current>0};
 }
 function stageAfterAi(record){
  if(inInbox(record))return STAGES.INBOX_WORKING;
  const p=primaryState(record);
  if(p.complete)return STAGES.STAGED;
  if(p.processing)return STAGES.AI_PROCESSING;
  if(p.hasData)return STAGES.AI_PARTIAL;
  return STAGES.QUEUE_WAITING;
 }
 function update(id,patch,reason){return window.genreactrixImageRecordEngine?.update?.(String(id),patch,reason)||null;}
 function setStage(id,stage,reason='lifecycle-stage-changed',extra={}){
  const record=get(id);if(!record)return null;
  const previous=record.workflow?.stage||null;
  if(previous===stage&&!Object.keys(extra).length)return record;
  const next=update(id,{workflow:{stage},metadata:{extended:{...extra,lifecycleStageChangedAt:now(),lifecyclePriorStage:previous}}},reason);
  window.dispatchEvent(new CustomEvent('genreactrix:lifecycle',{detail:{imageId:String(id),previous,stage,reason,record:clone(next)}}));
  return next;
 }
 function markQueueWaiting(id,reason='queue-waiting'){return setStage(id,STAGES.QUEUE_WAITING,reason);}
 function markAiProcessing(id,{jobId=null,attemptId=null}={}){const record=get(id);if(!record||[STAGES.QUARANTINE,STAGES.DEFECTIVE].includes(record.workflow?.stage))return record;return setStage(id,STAGES.AI_PROCESSING,'ai-processing-started',{activeAiJobId:jobId,activeAiAttemptId:attemptId});}
 function neighboringRecords(record){const rows=records().filter(r=>!r.attributes?.archived).sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||''))||String(a.id).localeCompare(String(b.id))),index=rows.findIndex(r=>String(r.id)===String(record.id));return{rows,index,previous:index>0?rows[index-1]:null,next:index>=0&&index<rows.length-1?rows[index+1]:null};}
 function normalSurroundings(record){const {rows,index,previous,next}=neighboringRecords(record);if(index<0)return null;let peers=[];if(previous&&next)peers=[previous,next];else if(index===0)peers=rows.slice(1,3);else if(index===rows.length-1)peers=rows.slice(Math.max(0,index-2),index).reverse();if(peers.length<2||peers.some(r=>!primaryState(r).complete))return null;return peers;}
 function evaluateIsolatedFailure(id,context={}){
  let record=get(id);if(!record)return null;const p=primaryState(record),ext=record.metadata?.extended||{};
  if([STAGES.QUARANTINE,STAGES.DEFECTIVE].includes(record.workflow?.stage))return record;
  if(p.complete){if(Number(ext.isolatedAiFailureStreak)||0)record=update(id,{metadata:{extended:{isolatedAiFailureStreak:0,isolatedAiFailureEvidence:[]}}},'ai-isolated-failure-streak-reset')||record;return record;}
  const failed=PRIMARY.some(key=>record.components?.[key]==='failed');if(!failed)return record;
  const attemptId=String(context.attemptId||ext.lastAiAttemptId||'');if(!attemptId||ext.lastIsolationCountedAttemptId===attemptId)return record;
  const globalFailure=Boolean(context.globalFailure??ext.lastAiFailureGlobal);if(globalFailure)return record;
  const surroundings=normalSurroundings(record);if(!surroundings)return record;
  const at=now(),error=String(context.error||ext.lastAiFailureMessage||''),jobId=context.jobId||ext.lastAiJobId||null,priorEvidence=Array.isArray(ext.isolatedAiFailureEvidence)?ext.isolatedAiFailureEvidence:[],evidence=[...priorEvidence.filter(x=>String(x.attemptId)!==attemptId),{attemptId,jobId,error,at}].slice(-20),streak=(Number(ext.isolatedAiFailureStreak)||0)+1;
  record=update(id,{metadata:{extended:{isolatedAiFailureStreak:streak,isolatedAiFailureEvidence:evidence,lastIsolationCountedAttemptId:attemptId,lastIsolatedAiFailureAt:at,problemImage:streak>=3}}},'ai-isolated-failure-recorded')||record;
  if(streak>=3){
    record=setStage(id,STAGES.QUARANTINE,'ai-quarantined',{quarantineReason:'three-isolated-ai-failures',quarantinedAt:at,problemImage:true})||record;
    const c=window.genreactrixQuarantineEngine?.openCase?.({imageId:id,attemptId,jobId,error,streak,evidence:{kind:'isolated-ai-failures',neighborImageIds:surroundings.map(r=>r.id)},attempts:evidence});
    if(c)record=update(id,{metadata:{extended:{quarantineCaseId:c.id}}},'quarantine-case-linked')||record;
  }
  return record;
 }
 function reevaluateNeighborFailures(id){const current=get(id);if(!current)return;const rows=records().filter(r=>!r.attributes?.archived).sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||''))||String(a.id).localeCompare(String(b.id))),index=rows.findIndex(r=>String(r.id)===String(id));for(const candidate of [rows[index-2],rows[index-1],rows[index+1],rows[index+2]])if(candidate){const ext=candidate.metadata?.extended||{};evaluateIsolatedFailure(candidate.id,{attemptId:ext.lastAiAttemptId||null,jobId:ext.lastAiJobId||null,error:ext.lastAiFailureMessage||'',globalFailure:Boolean(ext.lastAiFailureGlobal)});}}
 function reconcileAfterAi(id,{jobId=null,attemptId=null,error='',globalFailure=false}={}){
  const record=get(id);if(!record)return null;if([STAGES.QUARANTINE,STAGES.DEFECTIVE].includes(record.workflow?.stage))return record;
  const stage=stageAfterAi(record),reason=stage===STAGES.STAGED?'ai-staged':stage===STAGES.AI_PARTIAL?'ai-partial':'ai-returned-to-queue',failureMessage=String(error||'');
  let next=setStage(id,stage,reason,{activeAiJobId:null,activeAiAttemptId:null,lastAiJobId:jobId||record.metadata?.extended?.lastAiJobId||null,lastAiAttemptId:attemptId||record.metadata?.extended?.lastAiAttemptId||null,lastAiFailureMessage:failureMessage||null,lastAiFailureGlobal:Boolean(globalFailure)});
  next=evaluateIsolatedFailure(id,{jobId,attemptId,error:failureMessage,globalFailure})||next;reevaluateNeighborFailures(id);return next;
 }
 function markInbox(id,bundleId){return setStage(id,STAGES.INBOX_WORKING,'bundle-entered-inbox',{lastInboxBundleId:bundleId||null});}
 function markPostProcessing(id,batchId){return setStage(id,STAGES.POST_PROCESSING,'post-processing-started',{activeBatchId:batchId||null});}
 function markPurgatory(id,batchId){return setStage(id,STAGES.PURGATORY,'post-processing-purgatory',{activeBatchId:batchId||null});}
 function migrateRecord(record){
  const ext=record?.metadata?.extended||{},members=membershipIds(record),raw=String(record?.workflow?.stage||'imported');
  const patch={metadata:{extended:{lifecycleSchemaVersion:2}}};
  let changed=false;
  if(!Array.isArray(ext.inboxBundleIds)&&members.current.length){patch.metadata.extended.inboxBundleIds=members.current;changed=true;}
  if(!Array.isArray(ext.inboxHistoryBundleIds)&&members.history.length){patch.metadata.extended.inboxHistoryBundleIds=members.history;changed=true;}
  if(!ext.lastInboxBundleId&&ext.lastInboxPackId){patch.metadata.extended.lastInboxBundleId=String(ext.lastInboxPackId);changed=true;}
  let stage=raw;
  if(['available','imported'].includes(raw))stage=STAGES.QUEUE_WAITING;
  else if(['ready-for-director','ready-director','ai-complete'].includes(raw))stage=members.current.length?STAGES.INBOX_WORKING:stageAfterAi(record);
  else if(raw==='rejected-hold')stage=String(ext.rejectPriorStage||STAGES.INBOX_WORKING);
  else if(['director-complete','complete','partial','unclassified','blocked'].includes(raw)&&(members.current.length||record.analysis?.director||record.timestamps?.processedAt))stage=STAGES.INBOX_WORKING;
  else if(raw==='queued'&&primaryState(record).complete&&!members.current.length)stage=STAGES.STAGED;
  if(members.current.length&&![STAGES.POST_PROCESSING,STAGES.PURGATORY,STAGES.QUARANTINE,STAGES.DEFECTIVE,STAGES.BATCHED,STAGES.RED_EXCLUDED,STAGES.HOT_EXCLUDED,STAGES.ARCHIVED].includes(stage))stage=STAGES.INBOX_WORKING;
  if(stage!==raw){patch.workflow={stage};patch.metadata.extended.preLifecycleV2Stage=ext.preLifecycleV2Stage||raw;changed=true;}
  if(Number(ext.lifecycleSchemaVersion||0)!==2)changed=true;
  if(!changed)return null;
  return update(record.id,patch,'lifecycle-v1-migration');
 }
 function migrateAll(){let changed=0;for(const record of records())if(migrateRecord(record))changed++;window.dispatchEvent(new CustomEvent('genreactrix:lifecycle-migrated',{detail:{changed}}));return changed;}
 function snapshot(){
  const rows=records(),count=stage=>rows.filter(r=>r.workflow?.stage===stage).length;
  return {total:rows.length,queueWaiting:count(STAGES.QUEUE_WAITING),aiProcessing:count(STAGES.AI_PROCESSING),partial:count(STAGES.AI_PARTIAL),staged:count(STAGES.STAGED),inbox:count(STAGES.INBOX_WORKING),quarantine:count(STAGES.QUARANTINE),postProcessing:count(STAGES.POST_PROCESSING),purgatory:count(STAGES.PURGATORY)};
 }
 function verify(){
  const issues=[];
  for(const record of records()){
   const stage=String(record?.workflow?.stage||'');
   if(!CANONICAL_STAGES.has(stage)&&!COMPAT_FINAL_STAGES.has(stage))issues.push({type:'noncanonical-lifecycle-stage',severity:'attention',imageId:record.id,stage,summary:`Image ${record.id} has noncanonical lifecycle stage ${stage||'(blank)'}.`});
   const terminals=[record?.attributes?.flagged,record?.attributes?.depot,record?.attributes?.rejectionFlagged,record?.attributes?.rejected].filter(Boolean).length;
   if(terminals>1)issues.push({type:'multiple-inbox-terminals',severity:'critical',imageId:record.id,summary:`Image ${record.id} has more than one Inbox terminal state.`});
   const members=membershipIds(record).current;
   if(members.length&&![STAGES.INBOX_WORKING,STAGES.POST_PROCESSING,STAGES.PURGATORY].includes(stage))issues.push({type:'bundle-membership-owner-mismatch',severity:'attention',imageId:record.id,stage,bundleIds:members,summary:`Image ${record.id} has active Bundle membership outside Inbox/Post-processing.`});
  }
  return{checkedAt:now(),recordCount:records().length,issueCount:issues.length,issues};
 }
 const api={STAGES,PRIMARY,CANONICAL_STAGES,membershipIds,inInbox,primaryState,stageAfterAi,setStage,markQueueWaiting,markAiProcessing,reconcileAfterAi,evaluateIsolatedFailure,markInbox,markPostProcessing,markPurgatory,migrateAll,snapshot,verify};
 window.genreactrixLifecycleEngine=api;
 window.addEventListener('DOMContentLoaded',()=>{try{migrateAll();window.genreactrixMaintenanceEngine?.registerChecker?.('lifecycle',verify,{quick:true,label:'Lifecycle Spine'})}catch(error){console.error('Lifecycle migration failed',error)}});
})();
