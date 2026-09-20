/* Genreactrix Bundle Engine v1
   Queue -> Inbox grouping process. Bundle is distinct from Origin Pack and end-stage Batch. */
(()=>{'use strict';
 const KEY='genreactrix-bundles-v1',LEGACY_KEY='genreactrix-landscape-inbox-v1';
 const now=()=>new Date().toISOString(),clone=v=>v==null?v:structuredClone(v),uid=()=>`bundle-${crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
 function normalize(row={},legacy=false){
  if(!row?.id)return null;
  const number=Number(row.number)||null,originalLabel=String(row.label||'');
  const label=legacy||/^Pack\b/i.test(originalLabel)?`Bundle ${number||''}`.trim():String(row.label||`Bundle ${number||''}`).trim();
  return {id:String(row.id),schemaVersion:2,projectId:row.projectId||window.genreactrixProjectRuntimeEngine?.projectId?.()||'',runtimeId:row.runtimeId||null,number,label,legacyLabel:legacy?originalLabel||null:row.legacyLabel||null,legacyPackId:legacy?String(row.id):row.legacyPackId||null,sourceLabel:String(row.sourceLabel||''),imageIds:[...new Set((row.imageIds||[]).map(String))],createdAt:row.createdAt||now(),analyzedAt:row.analyzedAt||row.completedAt||null,bundledAt:row.bundledAt||row.pushedAt||row.createdAt||now(),mode:row.mode|| (legacy?'legacy-migrated':'manual')};
 }
 function read(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch{return[]}}
 let cache=(()=>{const current=read(KEY).map(x=>normalize(x,false)).filter(Boolean);if(current.length)return current;const legacy=read(LEGACY_KEY).map(x=>normalize(x,true)).filter(Boolean);if(legacy.length)localStorage.setItem(KEY,JSON.stringify(legacy));return legacy;})();
 function persist(){localStorage.setItem(KEY,JSON.stringify(cache));}
 persist();
 function all(){return cache.map(clone);}
 function byId(id){return clone(cache.find(b=>b.id===String(id))||null);}
 function records(){return window.genreactrixImageRecordEngine?.all?.()||[];}
 function record(id){return window.genreactrixImageRecordEngine?.get?.(String(id),{touch:false})||null;}
 function activeBundles(){const active=new Set(records().filter(r=>r.workflow?.stage==='inbox-working').map(r=>String(r.id)));return cache.filter(b=>(b.imageIds||[]).some(id=>active.has(String(id)))).map(clone);}
 function stagedRecords(){return records().filter(r=>r.workflow?.stage==='staged'&&!r.attributes?.inRecycleBin&&!r.attributes?.archived&&!r.attributes?.rejected&&!r.metadata?.extended?.themeSweepHold).sort((a,b)=>String(a.updatedAt||a.createdAt||'').localeCompare(String(b.updatedAt||b.createdAt||'')));}
 function numberNext(){return Math.max(0,...cache.map(x=>Number(x.number)||0))+1;}
 function setting(id,fallback){try{return window.genreactrixSettingsEngine?.get?.(id,fallback)??fallback}catch{return fallback}}
 function bundleSize(){return Math.max(1,Number(setting('queue.bundle.size',50))||50);}
 function autoFlowEnabled(){return Boolean(setting('queue.flow.enabled',true));}
 function emit(type,bundle,detail={}){window.dispatchEvent(new CustomEvent('genreactrix:bundle',{detail:{type,bundle:clone(bundle),...detail}}));window.renderPortraitControlStation?.();}
 function migrateRecordMemberships(){let changed=0;for(const r of records()){const ext=r.metadata?.extended||{},legacy=Array.isArray(ext.inboxPackIds)?ext.inboxPackIds:[],history=Array.isArray(ext.inboxHistoryPackIds)?ext.inboxHistoryPackIds:[];const current=Array.isArray(ext.inboxBundleIds)?ext.inboxBundleIds:legacy,hist=Array.isArray(ext.inboxHistoryBundleIds)?ext.inboxHistoryBundleIds:history;if(!Array.isArray(ext.inboxBundleIds)&&current.length||!Array.isArray(ext.inboxHistoryBundleIds)&&hist.length||(!ext.lastInboxBundleId&&ext.lastInboxPackId)){window.genreactrixImageRecordEngine.update(r.id,{metadata:{extended:{inboxBundleIds:[...new Set(current.map(String))],inboxHistoryBundleIds:[...new Set(hist.map(String))],lastInboxBundleId:ext.lastInboxBundleId||ext.lastInboxPackId||null}}},'bundle-membership-migrated');changed++;}}return changed;}
 async function create(imageIds,{mode='manual',sourceLabel='Queue Bundle'}={}){
  const unique=[...new Set((imageIds||[]).map(String))],rows=unique.map(record).filter(Boolean).filter(r=>r.workflow?.stage==='staged'&&!r.metadata?.extended?.themeSweepHold);if(!rows.length)return null;
  const ctx=window.genreactrixProjectRuntimeEngine,number=numberNext(),createdAt=now(),bundle={id:uid(),schemaVersion:2,projectId:ctx?.projectId?.()||'',runtimeId:ctx?.runtimeId?.()||null,number,label:`Bundle ${number}`,legacyLabel:null,legacyPackId:null,sourceLabel,imageIds:rows.map(r=>String(r.id)),createdAt,analyzedAt:rows.map(r=>r.analysis?.ai?.recordedAt||'').filter(Boolean).sort().at(-1)||createdAt,bundledAt:createdAt,mode};
  cache.push(bundle);persist();
  for(const r of rows){const current=Array.isArray(r.metadata?.extended?.inboxBundleIds)?r.metadata.extended.inboxBundleIds:[];window.genreactrixImageRecordEngine.update(r.id,{workflow:{stage:'inbox-working'},metadata:{extended:{inboxBundleIds:[...new Set([...current,bundle.id])],inboxBundledAt:createdAt,lastInboxBundleId:bundle.id}}},'bundle-entered-inbox');}
  emit('created',bundle,{imageIds:bundle.imageIds});return clone(bundle);
 }
 async function bundleStaged({limit=null,automatic=false,completeAvailable=false,sourceLabel=null}={}){
  const rows=stagedRecords();if(!rows.length)return null;const size=Math.max(1,Number(limit)||bundleSize());if(automatic&&rows.length<size&&!completeAvailable)return null;const take=automatic?Math.min(size,rows.length):(limit?Math.min(size,rows.length):Math.min(bundleSize(),rows.length));return create(rows.slice(0,take).map(r=>r.id),{mode:automatic?'automatic':'manual',sourceLabel:sourceLabel|| (automatic?'Automatic flow':'Manual Bundle')});
 }
 async function bundleWhateverAvailable(){const rows=stagedRecords();if(!rows.length)return null;return create(rows.map(r=>r.id),{mode:'manual-remainder',sourceLabel:'Complete whatever is available'});}
 async function maybeAutoBundle(){return[];}
 function contains(imageId){return activeBundles().some(b=>b.imageIds.includes(String(imageId)));}
 function bundleIdsForImage(imageId){return cache.filter(b=>b.imageIds.includes(String(imageId))).map(b=>b.id);}
 async function finalizeBatchImages(imageIds,{batchId=null,submittedAt=null}={}){const when=submittedAt||now();let changed=0;for(const id of [...new Set((imageIds||[]).map(String))]){const r=record(id);if(!r)continue;const current=Array.isArray(r.metadata?.extended?.inboxBundleIds)?r.metadata.extended.inboxBundleIds:bundleIdsForImage(id);const history=Array.isArray(r.metadata?.extended?.inboxHistoryBundleIds)?r.metadata.extended.inboxHistoryBundleIds:[];window.genreactrixImageRecordEngine.update(id,{metadata:{extended:{inboxBundleIds:[],inboxHistoryBundleIds:[...new Set([...history,...current])],inboxBatchedAt:when,lastInboxBatchId:batchId||r.metadata?.extended?.lastInboxBatchId||null}}},'inbox-batch-finalized');changed++;}emit('batch-finalized',null,{imageIds:[...new Set((imageIds||[]).map(String))],batchId});return{removedImages:changed,remainingBundles:activeBundles().length};}
 function snapshot(){return{bundleSize:bundleSize(),autoFlow:autoFlowEnabled(),staged:stagedRecords().length,activeBundles:activeBundles().length,totalBundles:cache.length};}
 function verify(){const issues=[],rows=records(),recordIds=new Set(rows.map(r=>String(r.id))),bundleIds=new Set(cache.map(b=>String(b.id)));for(const b of cache){if(!b.projectId)issues.push({type:'bundle-missing-project',severity:'attention',recordId:b.id,bundleId:b.id});for(const id of b.imageIds||[])if(!recordIds.has(String(id)))issues.push({type:'bundle-missing-image',severity:'attention',bundleId:b.id,imageId:id})}for(const r of rows){const ext=r.metadata?.extended||{},current=Array.isArray(ext.inboxBundleIds)?ext.inboxBundleIds.map(String):[];for(const id of current)if(!bundleIds.has(id))issues.push({type:'image-missing-bundle-record',severity:'attention',imageId:r.id,bundleId:id});if(current.length&&!['inbox-working','post-processing','purgatory'].includes(String(r.workflow?.stage||'')))issues.push({type:'bundle-owner-stage-mismatch',severity:'attention',imageId:r.id,bundleIds:current,stage:r.workflow?.stage||''});if(r.workflow?.stage==='inbox-working'&&!current.length)issues.push({type:'inbox-image-missing-active-bundle',severity:'warning',imageId:r.id})}return{checkedAt:now(),bundleCount:cache.length,issueCount:issues.length,issues}}
 const api={all,byId,activeBundles,stagedRecords,bundleSize,autoFlowEnabled,create,bundleStaged,bundleWhateverAvailable,maybeAutoBundle,contains,bundleIdsForImage,finalizeBatchImages,migrateRecordMemberships,snapshot,verify};
 window.genreactrixBundleEngine=api;
 window.addEventListener('DOMContentLoaded',()=>{try{migrateRecordMemberships();window.genreactrixMaintenanceEngine?.registerChecker?.('bundles',verify,{quick:true,label:'Bundles'});emit('ready',null,{snapshot:snapshot()});}catch(error){console.error('Bundle engine initialization failed',error)}});
})();
