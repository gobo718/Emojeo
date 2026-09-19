/* Genreactrix AI Analysis Engine v1
   Persistent modular jobs, adapted from Billy Labs job/provider patterns and connected
   to Genreactrix Image Record + History engines. No synthetic AI results are produced. */
(()=>{'use strict';
 const DB='genreactrix-ai-analysis',VERSION=1,JOBS='jobs',ITEMS='items';
 const COMPONENTS=[
  ['reactions','Reactions','aiReactions'],['themes','Themes','aiThemes'],['description','Description','aiDescription'],
  ['reactionReasons','Reactions Info','aiReactionReasons'],['genreReasons','Themes Info','aiGenreReasons']
 ];
 const LIVE_JOBS=new Map();
 const THEME_REPORT_SIDECAR_QUEUE=[],THEME_REPORT_SIDECAR_KEYS=new Set();
 let themeReportSidecarPumpPromise=null;
 const LIVE_PROVIDER_LABELS={mistral:'Mistral',secondary:'GPT-4.1 mini',qwen:'Qwen 3.7 Plus','mistral-direct':'Mistral','openai-via-cloudflare-ai-gateway':'GPT-4.1 mini','cloudflare-workers-ai-qwen':'Qwen 3.7 Plus'};
 const LIVE_STAGE_LABELS={request:'Worker request',reactions:'Theme-derived Reactions','fresh-theme-whole-run':'Fresh Theme whole run','preliminary-theme-selection':'Preliminary Theme selection','theme-aware-description':'Theme-aware Description','theme-association-final':'Final Theme selection','theme-decision-audit':'Theme decision audit','theme-reporting-diagnostic':'Theme report diagnostic','theme-rerun-human-vote-selection':'Theme rerun selection'};
 let liveTicker=null;
 const clone=v=>v==null?v:structuredClone(v),now=()=>new Date().toISOString(),id=p=>`${p}_${Date.now().toString(36)}_${crypto.randomUUID().slice(0,8)}`;
 function slopKind(a){if(a?.detected)return'detected';if(a?.warning===true||String(a?.status||'').toLowerCase()==='warning'||String(a?.kind||'').toLowerCase()==='warning')return'warning';return'none'}
 function effectiveSlopAssessment(previous,incoming,review){if(!incoming)return previous||null;const priorDismissed=review?.decision==='not-slop'&&String(review?.assessmentId||'')===String(previous?.assessmentId||'');if(slopKind(incoming)==='warning'&&slopKind(previous)==='detected'&&!priorDismissed)return clone(previous);return clone(incoming)}
 const REACTION_PRIM_IDS=Array.from({length:14},(_,index)=>`P${String(index+1).padStart(2,'0')}`);
 const THEME_REACTION_SLOT_WEIGHT=100/6;
 function themePrimIds(theme){const code=String(theme?.code||theme?.id||theme?.value||'').trim().toUpperCase(),m=code.match(/^PFM(\d{2})(\d{2})$/);if(!m)return[];const ids=[`P${m[1]}`,`P${m[2]}`];return ids.every(pid=>REACTION_PRIM_IDS.includes(pid))?ids:[];}
 function buildThemeDerivedReactions(components){
  const themes=Array.isArray(components?.themes)?components.themes.slice(0,3):[];
  if(themes.length!==3)return null;
  const reactions=Object.fromEntries(REACTION_PRIM_IDS.map(pid=>[pid,0])),slots=[];
  for(const theme of themes){
   const ids=themePrimIds(theme);if(ids.length!==2)return null;
   const code=String(theme?.code||theme?.id||theme?.value||'').trim().toUpperCase();
   for(const pid of ids){reactions[pid]+=THEME_REACTION_SLOT_WEIGHT;slots.push({themeCode:code,primId:pid,weight:THEME_REACTION_SLOT_WEIGHT});}
  }
  const diagnostics={schemaVersion:1,method:'theme-derived-six-equal-slots-v1',aiScan:false,themeOrderSignificant:false,slotCount:6,slotWeight:THEME_REACTION_SLOT_WEIGHT,total:100,themeCodes:themes.map(theme=>String(theme?.code||theme?.id||theme?.value||'').trim().toUpperCase()),slots};
  return{reactions,diagnostics};
 }
 function applyThemeDerivedReactions(components){const built=buildThemeDerivedReactions(components);if(!built)return components;components.reactions=built.reactions;components.reactionDiagnostics=built.diagnostics;components.reactionReasons={schemaVersion:1,protocol:'theme-derived-six-equal-slots-v1',aiScan:false,themeCodes:[...built.diagnostics.themeCodes],slots:clone(built.diagnostics.slots),summary:'Three selected Themes contribute six equal Prim slots; duplicate Prims accumulate.'};delete components.directReactions;delete components.reactionHybridDiagnostics;return components;}
 const openDb=()=>new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(JOBS)){const s=db.createObjectStore(JOBS,{keyPath:'id'});s.createIndex('state','state');s.createIndex('createdAt','createdAt')}if(!db.objectStoreNames.contains(ITEMS)){const s=db.createObjectStore(ITEMS,{keyPath:'id'});s.createIndex('jobId','jobId');s.createIndex('state','state');s.createIndex('imageId','imageId')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
 const tx=(store,mode,fn)=>openDb().then(db=>new Promise((resolve,reject)=>{const t=db.transaction(store,mode),s=t.objectStore(store);let out;try{out=fn(s,t)}catch(e){db.close();reject(e);return}t.oncomplete=()=>{db.close();resolve(out)};t.onerror=()=>{db.close();reject(t.error)}}));
 const put=(store,value)=>tx(store,'readwrite',s=>s.put(clone(value)));
 const all=store=>openDb().then(db=>new Promise((resolve,reject)=>{const t=db.transaction(store,'readonly'),r=t.objectStore(store).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);t.oncomplete=()=>db.close()}));
 const byIndex=(store,index,value)=>openDb().then(db=>new Promise((resolve,reject)=>{const t=db.transaction(store,'readonly'),r=t.objectStore(store).index(index).getAll(value);r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);t.oncomplete=()=>db.close()}));
 const componentMap=()=>Object.fromEntries(COMPONENTS.map(([id])=>[id,{enabled:false,behavior:'analyze'}]));
 const portraitKey=id=>({'reaction-reasons':'reactionReasons','genre-reasons':'genreReasons'}[id]||id);
 function savedComponentDefaults(){try{return window.genreactrixSettingsEngine?.get?.('ai.components.default',{})||{}}catch{return {}}}
 function syncComponentChecksFromDefaults(){const saved=savedComponentDefaults();document.querySelectorAll('[data-ai-component]').forEach(row=>{const input=row.querySelector('input'),select=row.querySelector('select'),key=portraitKey(row.dataset.aiComponent);if(input&&Object.prototype.hasOwnProperty.call(saved,key))input.checked=Boolean(saved[key]);if(select)select.value='analyze'})}
 function saveComponentDefaultsFromGrid(){const next={...savedComponentDefaults()};document.querySelectorAll('[data-ai-component]').forEach(row=>{const input=row.querySelector('input'),key=portraitKey(row.dataset.aiComponent);if(input)next[key]=Boolean(input.checked)});window.genreactrixSettingsEngine?.set?.('ai.components.default',next);document.querySelectorAll('[data-portrait-ai-output]').forEach(input=>{if(Object.prototype.hasOwnProperty.call(next,input.dataset.portraitAiOutput))input.checked=Boolean(next[input.dataset.portraitAiOutput])});return next}
 const q=()=>window.genreactrixQueueEngine;
 const runtimeWindow=/** @type {any} */(window);
 const isThemeRerunConfig=config=>Boolean(config?.themeRerun);
 function themeRerunLifecycleGuardFor(record){
  const ext=record?.metadata?.extended||{},storage=record?.storage||{},attributes=record?.attributes||{};
  return{
   stage:String(record?.workflow?.stage||''),batchIds:[...(record?.batchIds||[])].map(String),
   inboxBundleIds:[...(Array.isArray(ext.inboxBundleIds)?ext.inboxBundleIds:[])].map(String),
   inboxHistoryBundleIds:[...(Array.isArray(ext.inboxHistoryBundleIds)?ext.inboxHistoryBundleIds:[])].map(String),
   lastInboxBundleId:ext.lastInboxBundleId||null,
   storage:{mode:storage.mode||null,temporaryKey:storage.temporaryKey??null,referenceKey:storage.referenceKey??null,hyperlink:storage.hyperlink||'',thumbnailKey:storage.thumbnailKey??null},
   attributes:{inRecycleBin:Boolean(attributes.inRecycleBin),archived:Boolean(attributes.archived),rejected:Boolean(attributes.rejected)},
   failureMeta:{isolatedAiFailureStreak:Number(ext.isolatedAiFailureStreak)||0,isolatedAiFailureEvidence:Array.isArray(ext.isolatedAiFailureEvidence)?clone(ext.isolatedAiFailureEvidence):[],lastIsolationCountedAttemptId:ext.lastIsolationCountedAttemptId||null,lastIsolatedAiFailureAt:ext.lastIsolatedAiFailureAt||null,problemImage:Boolean(ext.problemImage),quarantineCaseId:ext.quarantineCaseId||null,quarantineReason:ext.quarantineReason||null,quarantinedAt:ext.quarantinedAt||null}
  };
 }
 const sameGuardValue=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function restoreThemeRerunLifecycle(item,reason='theme-rerun-lifecycle-guard-restored'){
  const guard=item?.themeRerunLifecycleGuard,engine=runtimeWindow.genreactrixImageRecordEngine;if(!guard||!engine?.get||!engine?.update)return{changed:false,record:null};
  const current=engine.get(item.imageId,{touch:false});if(!current)return{changed:false,record:null};
  const ext=current.metadata?.extended||{},storage=current.storage||{},attributes=current.attributes||{},patch={};
  if(String(current.workflow?.stage||'')!==String(guard.stage||''))patch.workflow={stage:guard.stage};
  if(!sameGuardValue((current.batchIds||[]).map(String),guard.batchIds||[]))patch.batchIds=[...(guard.batchIds||[])];
  const guardedExtended={};
  if(!sameGuardValue((Array.isArray(ext.inboxBundleIds)?ext.inboxBundleIds:[]).map(String),guard.inboxBundleIds||[]))guardedExtended.inboxBundleIds=[...(guard.inboxBundleIds||[])];
  if(!sameGuardValue((Array.isArray(ext.inboxHistoryBundleIds)?ext.inboxHistoryBundleIds:[]).map(String),guard.inboxHistoryBundleIds||[]))guardedExtended.inboxHistoryBundleIds=[...(guard.inboxHistoryBundleIds||[])];
  if((ext.lastInboxBundleId||null)!==(guard.lastInboxBundleId||null))guardedExtended.lastInboxBundleId=guard.lastInboxBundleId||null;
  const failureMeta=guard.failureMeta||{};
  for(const key of ['isolatedAiFailureStreak','isolatedAiFailureEvidence','lastIsolationCountedAttemptId','lastIsolatedAiFailureAt','problemImage','quarantineCaseId','quarantineReason','quarantinedAt']){const wanted=failureMeta[key]??(key==='isolatedAiFailureStreak'?0:key==='isolatedAiFailureEvidence'?[]:key==='problemImage'?false:null),actual=ext[key]??(key==='isolatedAiFailureStreak'?0:key==='isolatedAiFailureEvidence'?[]:key==='problemImage'?false:null);if(!sameGuardValue(actual,wanted))guardedExtended[key]=clone(wanted);}
  if(Object.keys(guardedExtended).length)patch.metadata={extended:guardedExtended};
  const guardedStorage={};for(const key of ['mode','temporaryKey','referenceKey','hyperlink','thumbnailKey'])if((storage[key]??null)!==(guard.storage?.[key]??null))guardedStorage[key]=guard.storage?.[key]??null;if(Object.keys(guardedStorage).length)patch.storage=guardedStorage;
  const guardedAttributes={};for(const key of ['inRecycleBin','archived','rejected'])if(Boolean(attributes[key])!==Boolean(guard.attributes?.[key]))guardedAttributes[key]=Boolean(guard.attributes?.[key]);if(Object.keys(guardedAttributes).length)patch.attributes=guardedAttributes;
  if(!Object.keys(patch).length)return{changed:false,record:current};
  return{changed:true,record:engine.update(item.imageId,patch,reason)};
 }
 async function repairLegacyThemeRerunLifecycleDrift(){
  const history=runtimeWindow.genreactrixHistoryEngine,engine=runtimeWindow.genreactrixImageRecordEngine;if(!history?.timeline||!engine?.get)return 0;
  const [jobs,items]=await Promise.all([all(JOBS),all(ITEMS)]),themeJobs=new Map(jobs.filter(job=>isThemeRerunConfig(job.config)).map(job=>[String(job.id),job])),byImage=new Map();
  for(const item of items){if(!themeJobs.has(String(item.jobId)))continue;const key=String(item.imageId||'');if(!key)continue;if(!byImage.has(key))byImage.set(key,new Set());byImage.get(key).add(String(item.jobId));}
  let repaired=0;
  for(const [imageId,jobIds] of byImage){const record=engine.get(imageId,{touch:false});if(!record)continue;const timeline=await history.timeline(imageId).catch(()=>[]),workflowEvents=timeline.filter(entry=>entry.payload?.patch?.workflow?.stage);if(!workflowEvents.length)continue;
   const themeEventJobId=entry=>String(entry.payload?.current?.metadata?.extended?.activeAiJobId||entry.payload?.current?.metadata?.extended?.lastAiJobId||'');
   const isThemeLifecycleEvent=entry=>jobIds.has(themeEventJobId(entry))&&String(entry.eventType||'').startsWith('ai-');
   const latest=workflowEvents.at(-1);if(!latest||!isThemeLifecycleEvent(latest)||!['ai-staged','ai-partial','ai-returned-to-queue','ai-quarantined'].includes(String(latest.eventType||'')))continue;
   let boundary=-1;for(let index=workflowEvents.length-1;index>=0;index--){if(isThemeLifecycleEvent(workflowEvents[index]))continue;boundary=index;break;}
   const rerunSequence=workflowEvents.slice(boundary+1),firstProcessing=rerunSequence.find(entry=>entry.eventType==='ai-processing-started'&&jobIds.has(String(entry.payload?.current?.metadata?.extended?.activeAiJobId||'')));if(!firstProcessing?.payload?.before)continue;
   const priorGuard=themeRerunLifecycleGuardFor(firstProcessing.payload.before),result=restoreThemeRerunLifecycle({imageId,themeRerunLifecycleGuard:priorGuard},'theme-rerun-lifecycle-recovered');
   if(String(latest.eventType)==='ai-quarantined')runtimeWindow.genreactrixQuarantineEngine?.removeThemeRerunEvidence?.(imageId,[...jobIds]);
   if(result.changed)repaired++;
  }
  if(repaired){console.warn(`Recovered lifecycle placement for ${repaired} image${repaired===1?'':'s'} altered by legacy Theme Rerun jobs.`);runtimeWindow.renderPortraitControlStation?.();runtimeWindow.rehydrateLandscapeFeed?.().catch?.(console.warn);}
  return repaired;
 }
 function priorStageBeforeThemeRerun(timeline,themeJobIds){
  const wanted=new Set([...themeJobIds].map(String));
  for(const entry of timeline||[]){
   if(String(entry?.eventType||'')!=='ai-processing-started')continue;
   const currentJob=String(entry?.payload?.current?.metadata?.extended?.activeAiJobId||entry?.payload?.current?.metadata?.extended?.lastAiJobId||'');
   if(!wanted.has(currentJob))continue;
   const prior=String(entry?.payload?.before?.workflow?.stage||'');
   if(prior&&!['ai-processing','ai-partial','staged','quarantine','defective'].includes(prior))return prior;
  }
  return 'inbox-working';
 }
 async function notifyThemeRerunRecoveryProblem(imageId,message){
  try{await runtimeWindow.genreactrixNotificationsEngine?.createOrUpdate?.({severity:'attention',title:'Theme Rerun recovery needs attention',message,ownerEngine:'maintenance',actionTarget:'maintenance',actionLabel:'Maintenance',dedupeKey:`theme-rerun-recovery:${imageId}`,persistent:true,resolved:false});}catch{}
 }
 async function reconcileThemeRerunPlacementIntegrity(){
  const history=runtimeWindow.genreactrixHistoryEngine,engine=runtimeWindow.genreactrixImageRecordEngine,qEngine=runtimeWindow.genreactrixQuarantineEngine,images=runtimeWindow.genreactrixImagesEngine;
  if(!engine?.get||!engine?.all||!history?.timeline||!qEngine?.all)return{repaired:0,payloadMissing:0,checked:0};
  const [jobs,items]=await Promise.all([all(JOBS),all(ITEMS)]),themeJobIds=new Set(jobs.filter(job=>isThemeRerunConfig(job.config)).map(job=>String(job.id))),jobsByImage=new Map();
  for(const item of items){const jobId=String(item?.jobId||''),imageId=String(item?.imageId||'');if(!themeJobIds.has(jobId)||!imageId)continue;if(!jobsByImage.has(imageId))jobsByImage.set(imageId,new Set());jobsByImage.get(imageId).add(jobId);}
  let repaired=0,payloadMissing=0,checked=0;
  // First repair Quarantine placement polluted by Theme Rerun attempts. This also completes a
  // v0.9.40.120 partial recovery if the case was already voided but the record stayed in Quarantine.
  for(const qCase of qEngine.all().filter(row=>row?.status==='open'||row?.resolution?.action==='void-theme-rerun-evidence')){
   const imageId=String(qCase.imageId||''),record=engine.get(imageId,{touch:false});if(!record||String(record.workflow?.stage||'')!=='quarantine')continue;
   const caseThemeJobs=new Set((qCase.attempts||[]).map(a=>String(a?.jobId||'')).filter(id=>themeJobIds.has(id))),alreadyVoided=qCase?.resolution?.action==='void-theme-rerun-evidence';
   const imageThemeJobs=jobsByImage.get(imageId)||new Set(),recoveryThemeJobs=caseThemeJobs.size?caseThemeJobs:imageThemeJobs;
   if(!recoveryThemeJobs.size&&!alreadyVoided)continue;checked++;
   const remaining=alreadyVoided?(qCase.attempts||[]):(qCase.attempts||[]).filter(a=>!caseThemeJobs.has(String(a?.jobId||'')));
   if(!alreadyVoided&&remaining.length>=3)continue; // Legitimate non-rerun isolation evidence still independently justifies Quarantine.
   const blob=await images?.fullBlobForOriginCheck?.(imageId).catch?.(()=>null) || null;
   if(!blob){payloadMissing++;await notifyThemeRerunRecoveryProblem(imageId,`Image ${record.name||imageId} has a surviving Image Record but its full-resolution payload is missing. Automatic Theme Rerun recovery did not move it back into Batch.`);continue;}
   const timeline=await history.timeline(imageId).catch(()=>[]),priorStage=priorStageBeforeThemeRerun(timeline,recoveryThemeJobs),ext=record.metadata?.extended||{};
   if(!alreadyVoided&&caseThemeJobs.size)qEngine.removeThemeRerunEvidence(imageId,[...caseThemeJobs]);
   const filteredEvidence=(Array.isArray(ext.isolatedAiFailureEvidence)?ext.isolatedAiFailureEvidence:[]).filter(e=>!recoveryThemeJobs.has(String(e?.jobId||''))),last=remaining.at(-1)||null;
   engine.update(imageId,{workflow:{stage:priorStage},error:'',metadata:{extended:{isolatedAiFailureStreak:remaining.length,isolatedAiFailureEvidence:filteredEvidence,lastIsolationCountedAttemptId:last?.attemptId||null,lastIsolatedAiFailureAt:last?.at||null,problemImage:false,quarantineCaseId:null,quarantineReason:null,quarantinedAt:null,themeRerunPlacementRecoveredAt:new Date().toISOString()}}},'theme-rerun-quarantine-recovered');
   repaired++;
  }
  // Then repair any non-final Theme-Rerun image that is outside every authoritative active owner after legacy drift.
  const home=runtimeWindow.genreactrixHomeCountEngine;
  for(const record of engine.all()){
   const imageId=String(record?.id||'');if(!jobsByImage.has(imageId)||String(record?.workflow?.stage||'')==='quarantine')continue;
   const owner=home?.owner?.(record);if(owner)continue;
   if(record?.attributes?.archived||record?.attributes?.inRecycleBin||record?.attributes?.rejected||['batched','red-excluded','hot-magenta-excluded','defective','archived','import-failed','ai-failure-exported'].includes(String(record?.workflow?.stage||'')))continue;
   checked++;
   const blob=await images?.fullBlobForOriginCheck?.(imageId).catch?.(()=>null) || null;
   if(!blob){payloadMissing++;await notifyThemeRerunRecoveryProblem(imageId,`Image ${record.name||imageId} is outside the active lifecycle and its full-resolution payload is missing. Automatic recovery left the record untouched for inspection.`);continue;}
   const timeline=await history.timeline(imageId).catch(()=>[]),priorStage=priorStageBeforeThemeRerun(timeline,jobsByImage.get(imageId));
   engine.update(imageId,{workflow:{stage:priorStage},metadata:{extended:{themeRerunPlacementRecoveredAt:new Date().toISOString()}}},'theme-rerun-unaccounted-recovered');repaired++;
  }
  if(repaired){console.warn(`Theme Rerun integrity reconciliation restored ${repaired} image${repaired===1?'':'s'} to its active placement.`);runtimeWindow.renderPortraitControlStation?.();runtimeWindow.rehydrateLandscapeFeed?.().catch?.(console.warn);}
  return{repaired,payloadMissing,checked};
 }
 let snapshotCache={pending:0,available:0,output:0,bufferTarget:25,jobs:[],items:[]};
 let maintainBufferPromise=null,maintainFlowPromise=null;
 let cycleRunning=false,cycleStopRequested=false,cycleCurrentJobId=null;
 const CYCLE_MAX_PASSES=3;
 function eligibleRecords(config){
  let rows=window.genreactrixImageRecordEngine?.all?.()||[];
  rows=rows.filter(r=>!['quarantine','defective'].includes(String(r.workflow?.stage||''))); // Quarantine is manual-only; Defective is final.
  if(config.target==='flagged')rows=rows.filter(r=>r.attributes.flagged);
  else if(config.target==='saved')rows=rows.filter(r=>r.attributes.saved);
  else if(config.target==='failed')rows=rows.filter(r=>r.attributes.failed||Object.values(r.components||{}).includes('failed'));
  else if(config.target==='current')rows=rows.filter(r=>['queued','ai-partial'].includes(r.workflow?.stage)&&!r.attributes?.inRecycleBin&&!r.attributes?.archived&&!r.attributes?.rejected);
  else if(config.target==='selected'){const ids=new Set((config.imageIds||[]).map(String));rows=rows.filter(r=>ids.has(String(r.id)));}
  const partialScore=r=>['aiReactions','aiThemes','aiDescription'].filter(key=>r.components?.[key]==='current').length;
  if(config.order==='oldest')rows.sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
  else if(config.order==='newest')rows.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  else if(config.order==='random')rows.sort(()=>Math.random()-.5);
  else if(config.order==='queue')rows.sort((a,b)=>{const ap=a.workflow?.stage==='ai-partial',bp=b.workflow?.stage==='ai-partial';if(ap!==bp)return ap?-1:1;if(ap&&bp){const d=partialScore(b)-partialScore(a);if(d)return d;}return String(a.createdAt||'').localeCompare(String(b.createdAt||''));});
  if(config.quantityMode==='random')rows.sort(()=>Math.random()-.5);
  return rows;
 }
 function applyQuantity(rows,config){if(config.quantityMode==='all')return rows;return rows.slice(0,Math.max(1,Number(config.quantity)||100));}
 function shouldRun(record,component,behavior){const field=COMPONENTS.find(([id])=>id===component)?.[2];const status=record.components?.[field]||'missing';return behavior==='reanalyze'||['missing','stale','failed','partial'].includes(status)}
 const AI_TRANSPORT_MAX_DIMENSION=1280,AI_TRANSPORT_JPEG_QUALITY=0.82;
 async function blobDataUrl(blob){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=()=>reject(fr.error);fr.readAsDataURL(blob)})}
 async function normalizeAiImageBlob(blob){
  let bitmap=null;
  try{
   bitmap=await createImageBitmap(blob);
   const sourceWidth=Math.max(1,bitmap.width||1),sourceHeight=Math.max(1,bitmap.height||1),scale=Math.min(1,AI_TRANSPORT_MAX_DIMENSION/Math.max(sourceWidth,sourceHeight)),width=Math.max(1,Math.round(sourceWidth*scale)),height=Math.max(1,Math.round(sourceHeight*scale));
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas unavailable for AI image preparation');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.drawImage(bitmap,0,0,width,height);
   const prepared=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Could not prepare AI image')),'image/jpeg',AI_TRANSPORT_JPEG_QUALITY));
   return{blob:prepared,sourceBytes:blob.size||0,transportBytes:prepared.size||0,sourceWidth,sourceHeight,width,height};
  }finally{try{bitmap?.close?.()}catch{}}
 }
 async function validateAiSource(record){
  if(record.storage?.hyperlink)return{ok:true,kind:'linked',mimeType:record.storage?.mimeType||''};
  const blob=await window.imageBlobGet?.(record.id).catch(()=>null);if(!blob)return{ok:false,reason:'Image source is unavailable',mimeType:record.storage?.mimeType||''};
  const mimeType=String(blob.type||record.storage?.mimeType||'').toLowerCase();if(mimeType&&!mimeType.startsWith('image/'))return{ok:false,reason:`Not an image MIME type (${mimeType})`,mimeType};
  let bitmap=null;try{bitmap=await createImageBitmap(blob);if(!(bitmap.width>0&&bitmap.height>0))throw new Error('Image has no decodable dimensions');return{ok:true,kind:'local',mimeType,width:bitmap.width,height:bitmap.height};}catch(error){return{ok:false,reason:`Unsupported or undecodable image${mimeType?` (${mimeType})`:''}: ${String(error?.message||error)}`,mimeType};}finally{try{bitmap?.close?.()}catch{}}
 }
 async function imageInput(record){if(record.storage?.hyperlink)return{imageUrl:record.storage.hyperlink};const blob=await window.imageBlobGet?.(record.id).catch(()=>null);if(!blob)throw new Error('Image source is unavailable');try{const prepared=await normalizeAiImageBlob(blob),dataUrl=await blobDataUrl(prepared.blob);return{imageDataUrl:dataUrl}}catch(error){throw new Error(`AI image preparation failed: ${String(error?.message||error)}`)}}
 const themeReportFingerprint=themes=>(Array.isArray(themes)?themes:[]).slice(0,3).map(row=>String(row?.code||'').toUpperCase()).filter(Boolean).join('|');
 function enqueueThemeReportSidecar({imageId,jobId=null,themes=[],behavior='analyze',themeSweep=null}={}){
  if(!window.GenreactrixCloudApi?.themeReportDiagnostic)return false;
  const fingerprint=themeReportFingerprint(themes);if(!imageId||fingerprint.split('|').filter(Boolean).length!==3)return false;
  const key=`${String(imageId)}:${fingerprint}`;if(THEME_REPORT_SIDECAR_KEYS.has(key))return false;
  THEME_REPORT_SIDECAR_KEYS.add(key);THEME_REPORT_SIDECAR_QUEUE.push({key,imageId:String(imageId),jobId,themes:clone(themes),behavior,themeSweep:clone(themeSweep),fingerprint,queuedAt:now()});return true;
 }
 function scheduleThemeReportSidecarPump(){if(themeReportSidecarPumpPromise||!THEME_REPORT_SIDECAR_QUEUE.length)return;setTimeout(()=>pumpThemeReportSidecars().catch(error=>console.warn('Theme report sidecar pump failed',error)),0)}
 async function markThemeReportSidecarFailure(task,error){
  const engine=window.genreactrixImageRecordEngine,record=engine?.get?.(task.imageId,{touch:false});if(!record||themeReportFingerprint(record.analysis?.ai?.components?.themes)!==task.fingerprint)return;
  const ai=record.analysis?.ai||{},genre=ai.components?.genreReasons;if(!genre||typeof genre!=='object')return;
  const decision=clone(genre.diagnostic||{}),reporting={...(decision.reportingSidecar||{}),status:'failed',protocol:'human-vote-reasoning-sidecar-v1',failedAt:now(),error:String(error?.message||error).slice(0,1200)};
  engine.update(record.id,{analysis:{ai:{...ai,components:{...(ai.components||{}),genreReasons:{...genre,diagnostic:{...decision,reportingSidecar:reporting}}}}}},'ai-theme-report-diagnostic-failed');
 }
 async function runThemeReportSidecar(task){
  const engine=window.genreactrixImageRecordEngine,record=engine?.get?.(task.imageId,{touch:false});if(!record)return;
  if(themeReportFingerprint(record.analysis?.ai?.components?.themes)!==task.fingerprint)return;
  const source=await imageInput(record),artifactEngine=window.genreactrixAiArtifactEngine;let attempt=null;
  try{
   if(artifactEngine)attempt=await artifactEngine.beginAttempt({imageId:record.id,jobId:task.jobId,components:['genreReasons'],componentBehaviors:{genreReasons:task.behavior},mode:'background:theme-report-diagnostic',inputRefs:{imageId:record.id,themeCodes:task.fingerprint.split('|')},configRefs:{themeSweep:clone(task.themeSweep)}});
   const payload=await window.GenreactrixCloudApi.themeReportDiagnostic({imageId:record.id,themes:task.themes,behavior:task.behavior,themeSweep:task.themeSweep,...source},window.GenreactrixCloudApi.getKey()),result=payload?.result||payload,full=clone(result?.diagnostic||null);
   if(!full||typeof full!=='object')throw new Error('Theme report diagnostic returned no diagnostic');
   const live=engine.get(record.id,{touch:false});if(!live||themeReportFingerprint(live.analysis?.ai?.components?.themes)!==task.fingerprint){if(attempt)await artifactEngine?.finishAttempt?.(attempt.id,{status:'complete',researchConfiguration:{discardedAsStale:true}});return;}
   const ai=live.analysis?.ai||{},genre=ai.components?.genreReasons||{},decision=clone(genre.diagnostic||{}),completedAt=now();
   const mergedDiagnostic={...full,decisionAudit:decision,reportingSidecar:{...(full.reportingSidecar||{}),status:'complete',protocol:'human-vote-reasoning-sidecar-v1',decisionFingerprint:task.fingerprint,queuedAt:task.queuedAt,completedAt}};
   let nextHistory=ai.artifactHistory||null,artifact=null;
   if(artifactEngine&&attempt){
    const themeRef=ai.artifactHistory?.currentArtifacts?.themes||null;
    artifact=await artifactEngine.createArtifact({imageId:live.id,kind:'theme-report-diagnostic',attemptId:attempt.id,payload:mergedDiagnostic,dependencies:{themeArtifact:themeRef},provider:{winningProvider:full.providerCycle?.winningProvider||null,providerCycle:clone(full.providerCycle||null)},mode:'background:theme-report-diagnostic'});
    await artifactEngine.finishAttempt(attempt.id,{outputArtifactIds:[artifact.id],provider:{winningProvider:full.providerCycle?.winningProvider||null},researchConfiguration:{backgroundThemeReportDiagnostic:true,decisionFingerprint:task.fingerprint}});
    const current=ai.artifactHistory||{schemaVersion:1,store:artifactEngine.dbName,currentArtifacts:{}};nextHistory={...current,currentArtifacts:{...(current.currentArtifacts||{}),'theme-report-diagnostic':{artifactId:artifact.id,kind:artifact.kind,version:artifact.version}}};
   }
   engine.update(live.id,{analysis:{ai:{...ai,components:{...(ai.components||{}),genreReasons:{...genre,diagnostic:mergedDiagnostic}},...(nextHistory?{artifactHistory:nextHistory}:{})}}},'ai-theme-report-diagnostic-completed');
   await window.genreactrixHistoryEngine?.append?.({imageId:live.id,eventType:'ai-theme-report-diagnostic',actor:'ai',sourceEngine:'ai-analysis',jobId:task.jobId,summary:'Deferred Theme reporting diagnostic completed',payload:{attemptId:attempt?.id||null,artifactRef:artifact?{artifactId:artifact.id,kind:artifact.kind,version:artifact.version}:null,themeCodes:task.fingerprint.split('|'),providerCycle:clone(full.providerCycle||null)}}).catch(()=>{});
  }catch(error){if(attempt)await artifactEngine?.failAttempt?.(attempt.id,error).catch(()=>{});await markThemeReportSidecarFailure(task,error);throw error;}
 }
 async function pumpThemeReportSidecars(){
  if(themeReportSidecarPumpPromise)return themeReportSidecarPumpPromise;
  themeReportSidecarPumpPromise=(async()=>{while(THEME_REPORT_SIDECAR_QUEUE.length){const task=THEME_REPORT_SIDECAR_QUEUE.shift();try{await runThemeReportSidecar(task)}catch(error){console.warn('Deferred Theme reporting diagnostic failed',task?.imageId,error)}finally{if(task?.key)THEME_REPORT_SIDECAR_KEYS.delete(task.key)}}})();
  try{await themeReportSidecarPumpPromise}finally{themeReportSidecarPumpPromise=null;if(THEME_REPORT_SIDECAR_QUEUE.length)scheduleThemeReportSidecarPump()}
 }
 function resumePendingThemeReportSidecars(){
  if(!window.GenreactrixCloudApi?.isConfigured?.())return 0;
  const rows=window.genreactrixImageRecordEngine?.all?.()||[];let queued=0;
  for(const record of rows){const ai=record?.analysis?.ai||{},genre=ai.components?.genreReasons,diagnostic=genre?.diagnostic;if(String(diagnostic?.reportingSidecar?.status||'')!=='pending')continue;const themes=Array.isArray(ai.components?.themes)?ai.components.themes:(Array.isArray(genre?.themes)?genre.themes:[]);if(enqueueThemeReportSidecar({imageId:record.id,jobId:ai.jobId||null,themes,behavior:'analyze',themeSweep:null}))queued++;}
  if(queued)scheduleThemeReportSidecarPump();return queued;
 }
 const schedulePendingThemeReportResume=()=>setTimeout(()=>{try{resumePendingThemeReportSidecars()}catch(error){console.warn('Pending Theme report sidecar resume failed',error)}},0);
 if(window.genreactrixSettingsEngine?.ready)schedulePendingThemeReportResume();else window.addEventListener('genreactrix:settings-ready',schedulePendingThemeReportResume,{once:true});
 async function createJob(config){config=clone(config||{});config.autoOrchestration=config.autoOrchestration!==false;config.components=clone(config.components||{});if(config.components?.themes?.enabled){const behavior=config.components.themes.behavior||'analyze';config.components.genreReasons={enabled:true,behavior};}const selected=Object.entries(config.components||{}).filter(([,v])=>v.enabled);if(!selected.length)throw new Error('Choose at least one AI component');const selectedIds=selected.map(([id])=>id),derivationOnly=selectedIds.length>0&&selectedIds.every(id=>['reactions','reactionReasons'].includes(id));const existingItems=await all(ITEMS),activeImageIds=new Set(existingItems.filter(i=>['queued','processing'].includes(i.state)).map(i=>i.imageId));const candidates=applyQuantity(eligibleRecords(config).filter(r=>{if(activeImageIds.has(r.id))return false;if(config.skipFailed){const hasFailed=selected.some(([c])=>{const field=COMPONENTS.find(([id])=>id===c)?.[2];return field&&r.components?.[field]==='failed'});if(hasFailed)return false;}return selected.some(([c,v])=>shouldRun(r,c,v.behavior));}),config);const rows=[],sourceRejects=[];for(const record of candidates){const check=derivationOnly?{ok:true,kind:'theme-derived-no-provider'}:await validateAiSource(record);if(check.ok)rows.push(record);else sourceRejects.push({imageId:record.id,name:record.name||record.source?.originalFilename||record.id,mimeType:check.mimeType||record.storage?.mimeType||'',reason:check.reason});}if(!rows.length)return {id:null,schemaVersion:1,state:'completed',createdAt:now(),startedAt:null,completedAt:now(),config:clone(config),total:0,completed:0,failed:0,skipped:sourceRejects.length,sourceRejects,processing:0,message:sourceRejects.length?`No queueable images · ${sourceRejects.length} unsupported or undecodable`:'No eligible images',stopRequested:false};const job={id:id('ai_job'),schemaVersion:1,state:'queued',createdAt:now(),startedAt:null,completedAt:null,config:clone(config),total:rows.length,completed:0,failed:0,skipped:sourceRejects.length,sourceRejects,processing:0,message:sourceRejects.length?`Queued · ${sourceRejects.length} unsupported/undecodable skipped`:'Queued',stopRequested:false};if(selectedIds.includes('themes')&&!job.config.themeSweep&&!job.config.themeRerun&&(job.config.target!=='selected'||job.config.themeSweepRequested===true)){const sweep=window.genreactrixThemeSweepEngine?.begin?.({jobId:job.id,imageIds:rows.map(r=>r.id)});if(sweep)job.config.themeSweep={managed:true,sweepId:sweep.id,pass:1,orderMode:'canonical',orderSeed:null,rootJobId:job.id,persistDescription:selectedIds.includes('description')};}await put(JOBS,job);const queueJob=await q()?.createJob?.({id:`queue_${job.id}`,type:'ai',ownerEngine:'ai-analysis',ownerJobId:job.id,label:`AI analysis · ${rows.length} image${rows.length===1?'':'s'}`,state:'queued',total:rows.length,imageIds:rows.map(r=>r.id),batchId:null,message:'Queued'});const queueRows=[];for(const [order,record] of rows.entries()){const item={id:id('ai_item'),jobId:job.id,imageId:record.id,order,state:'queued',attempts:0,error:'',themeRerunLifecycleGuard:isThemeRerunConfig(config)?themeRerunLifecycleGuardFor(record):null,components:selected.map(([component,settings])=>({component,behavior:settings.behavior,state:'queued'}))};await put(ITEMS,item);queueRows.push({id:`queue_${item.id}`,imageId:record.id,ownerItemId:item.id,order,type:'ai',state:'queued'})}if(queueJob)await q()?.addItems?.(queueJob.id,queueRows);emit();return clone(job)}
 async function updateJob(job,patch){Object.assign(job,patch);await put(JOBS,job);emit();return job}
 const liveProviderLabel=value=>LIVE_PROVIDER_LABELS[String(value||'').toLowerCase()]||String(value||'AI');
 const liveStageLabel=value=>LIVE_STAGE_LABELS[String(value||'').toLowerCase()]||String(value||'Working').replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
 const liveRequestLabel=requested=>{const set=new Set(requested||[]);if(set.has('themes')&&set.has('description'))return'Themes + Description';if(set.has('themes'))return'Themes';if(set.has('reactions'))return set.has('reactionReasons')?'Reactions + Info':'Reactions';if(set.has('description'))return'Description';return(requested||[]).join(' + ')||'AI';};
 function beginLiveItem(job,item,record){const live={jobId:job.id,itemId:item.id,imageId:item.imageId,imageName:record?.source?.originalFilename||record?.name||record?.id||item.imageId,imageIndex:Number(item.order||0)+1,total:Number(job.total)||0,startedMs:Date.now(),phase:'Preparing image',state:'running',error:'',requests:new Map(),recent:[]};LIVE_JOBS.set(job.id,live);repaintLiveDetail(job.id);return live;}
 function setLivePhase(jobId,phase){const live=LIVE_JOBS.get(jobId);if(!live)return;live.phase=phase;repaintLiveDetail(jobId);}
 function liveRecent(live,text){const value=String(text||'').replace(/\s+/g,' ').trim();if(!value)return;live.recent.push(value);if(live.recent.length>5)live.recent.splice(0,live.recent.length-5);}
 function beginLiveRequest(jobId,key,requested,label=''){const live=LIVE_JOBS.get(jobId);if(!live)return null;const row={key,label:label||liveRequestLabel(requested),requested:[...(requested||[])],provider:'',stage:'Worker request',state:'starting',startedMs:Date.now(),updatedMs:Date.now()};live.requests.set(key,row);live.phase=`${row.label} request started`;repaintLiveDetail(jobId);return row;}
 function updateLiveProgress(jobId,key,event){const live=LIVE_JOBS.get(jobId),row=live?.requests.get(key);if(!live||!row)return;row.updatedMs=Date.now();const kind=String(event?.event||''),provider=event?.provider?liveProviderLabel(event.provider):row.provider,stage=event?.stage?liveStageLabel(event.stage):row.stage;if(provider)row.provider=provider;if(stage)row.stage=stage;if(event?.thinkingMode)row.thinkingMode=String(event.thinkingMode);
  if(['provider-attempt-start','whole-run-provider-start'].includes(kind)){row.state='running';row.startedMs=Date.now();live.phase=`${row.label}: ${row.stage}`;}
  else if(kind==='provider-attempt-success'){row.state='passed';liveRecent(live,`${provider} completed ${stage}${Number.isFinite(event?.durationMs)?` in ${(event.durationMs/1000).toFixed(1)}s`:''}`);}
  else if(kind==='provider-attempt-failure'){row.state='failed';const why=event?.failureKind||event?.failurePhase||event?.errorMessage||'failed';liveRecent(live,`${provider} failed ${stage}: ${why}`);}
  else if(kind==='whole-run-provider-success'){row.state='passed';liveRecent(live,`${provider} whole Theme run accepted${Number.isFinite(event?.durationMs)?` in ${(event.durationMs/1000).toFixed(1)}s`:''}`);}
  else if(kind==='whole-run-provider-failure'){row.state='failed';const why=event?.failureKind||event?.failurePhase||'rejected';liveRecent(live,`${provider} whole Theme run discarded: ${why}`);}
  else if(kind==='analysis-start'){row.state='waiting';row.stage='Worker request';}
  else if(kind==='analysis-complete'){row.state='complete';row.stage='Worker response complete';live.phase='Saving AI result';}
  repaintLiveDetail(jobId);
 }
 function finishLiveRequest(jobId,key,error=null){const live=LIVE_JOBS.get(jobId),row=live?.requests.get(key);if(!live||!row)return;row.updatedMs=Date.now();if(error){row.state='failed';row.stage='Request failed';liveRecent(live,`${row.label} failed: ${String(error?.message||error)}`);}else{row.state='complete';if(row.stage==='Worker request')row.stage='Worker response complete';}repaintLiveDetail(jobId);}
 function finishLiveItem(jobId,state,error=''){const live=LIVE_JOBS.get(jobId);if(!live)return;live.state=state;live.error=String(error||'');live.phase=state==='complete'?'Image complete':state==='failed'?'Image failed':'Image finished';if(live.error)liveRecent(live,live.error);repaintLiveDetail(jobId);}
 function liveDetailText(live,selected){const elapsed=Math.max(0,(Date.now()-live.startedMs)/1000).toFixed(1),lines=[`LIVE · Image ${live.imageIndex} of ${live.total}${live.imageName?` · ${live.imageName}`:''}`,`${live.phase} · ${elapsed}s`];for(const row of live.requests.values()){const provider=row.provider||'Worker',mode=row.thinkingMode==='disabled'?' · non-thinking':'',stage=row.stage||'Working',state=String(row.state||'').toUpperCase();lines.push(`${row.label}: ${provider}${mode} · ${stage} · ${state}`);}if(live.recent.length){lines.push('Recent:');for(const text of live.recent.slice(-4))lines.push(`• ${text}`);}if(live.error)lines.push(`Error: ${live.error}`);if(selected)lines.push(`Job: ${selected.state} · ${selected.message}`);return lines.join('\n');}
 function repaintLiveDetail(jobId=null){const detail=document.getElementById('aiJobDetail'),summary=document.getElementById('aiJobSummary');if(!detail||!summary)return;const selectedId=summary.dataset.jobId||'';if(jobId&&selectedId&&selectedId!==jobId)return;const live=LIVE_JOBS.get(selectedId||jobId);if(!live)return;detail.textContent=liveDetailText(live,null);}
 async function startAiRequestOutcome(specimen,runner=null){
  const startedMs=Date.now();
  try{
   const payload=runner?await runner():await window.GenreactrixCloudApi.analyzeImage(specimen,window.GenreactrixCloudApi.getKey());
   return{ok:true,payload,startedMs,endedMs:Date.now()};
  }catch(error){return{ok:false,error,startedMs,endedMs:Date.now()};}
 }

 async function processItem(job,item){
  const lifecycleIsolated=isThemeRerunConfig(job.config);
  item.state='processing';item.attempts++;item.currentAttemptId=`${item.id}:attempt:${item.attempts}`;item.error='';await put(ITEMS,item);await q()?.setItemState?.(`queue_${item.id}`,'processing',{attempts:item.attempts});if(!lifecycleIsolated)window.genreactrixLifecycleEngine?.markAiProcessing?.(item.imageId,{jobId:job.id,attemptId:item.currentAttemptId});job.processing=1;await updateJob(job,{message:`Analyzing ${job.completed+job.failed+1} of ${job.total}`});
  let record=window.genreactrixImageRecordEngine.get(item.imageId,{touch:false});if(!record)throw new Error('Image record not found');
  beginLiveItem(job,item,record);
  const pending=item.components.filter(c=>c.state==='queued'||c.state==='failed');
  for(const c of pending){const field=COMPONENTS.find(([id])=>id===c.component)?.[2];window.genreactrixImageRecordEngine.setComponent(record.id,field,'processing')}
  const derivationOnly=pending.length>0&&pending.every(c=>['reactions','reactionReasons'].includes(c.component));
  const input=derivationOnly?{}:await imageInput(record),errors=[];
  setLivePhase(job.id,derivationOnly?'Recalculating Reactions from current Themes':'Image prepared · starting AI');
  let liveRequestCounter=0;
  const runLiveRequest=async(specimen,requested,{providerRouting=undefined,label=''}={})=>{
   const key=`${item.currentAttemptId}:request:${++liveRequestCounter}`;beginLiveRequest(job.id,key,requested,label);const onProgress=event=>updateLiveProgress(job.id,key,event);
   try{let payload;if(providerRouting!==undefined&&window.GenreactrixCloudApi.analyzeImageWithRoutingProgress)payload=await window.GenreactrixCloudApi.analyzeImageWithRoutingProgress(specimen,window.GenreactrixCloudApi.getKey(),providerRouting,onProgress);else if(providerRouting!==undefined)payload=await window.GenreactrixCloudApi.analyzeImageWithRouting(specimen,window.GenreactrixCloudApi.getKey(),providerRouting);else if(window.GenreactrixCloudApi.analyzeImageWithProgress)payload=await window.GenreactrixCloudApi.analyzeImageWithProgress(specimen,window.GenreactrixCloudApi.getKey(),onProgress);else payload=await window.GenreactrixCloudApi.analyzeImage(specimen,window.GenreactrixCloudApi.getKey());finishLiveRequest(job.id,key);return payload;}catch(error){finishLiveRequest(job.id,key,error);throw error;}
  };

  // Reactions are deterministic outputs of the three selected Themes. There is no
  // independent Reaction provider family. Fresh Theme/Description work and its
  // derived Reaction outputs travel as one logical family; Reaction-only reruns
  // are recalculated locally from the current three Theme codes.
  const groups=[];
  const take=(keys)=>{const rows=pending.filter(c=>keys.includes(c.component));if(rows.length)groups.push(rows)};
  const hasThemePending=pending.some(c=>['themes','genreReasons'].includes(c.component));
  if(!job.config.themeRerun&&!job.config.descriptionRerun){
    if(hasThemePending)take(['themes','genreReasons','description','reactions','reactionReasons']);
    else{take(['description']);take(['reactions','reactionReasons']);}
  }else{take(['themes','genreReasons','reactions','reactionReasons']);take(['description']);}
  for(const c of pending)if(!groups.some(group=>group.includes(c)))groups.push([c]);

  const buildGroupContext=(group,sourceRecord)=>{
    const requested=group.map(c=>c.component);
    const componentBehaviors=Object.fromEntries(group.map(c=>[c.component,c.behavior]));
    const previous=sourceRecord.analysis?.ai||{},guidance=String(job.config.analysisGuidance||'').trim().slice(0,6000);
    const existingDescription=String(previous.components?.description||previous.description||'').trim();
    const descriptionRerun=requested.includes('description')&&job.config.descriptionRerun?clone(job.config.descriptionRerun):null;
    const themeRerun=requested.includes('themes')&&job.config.themeRerun?clone(job.config.themeRerun):null;
    const existingDescriptionDiagnostics=previous.components?.descriptionDiagnostics&&typeof previous.components.descriptionDiagnostics==='object'?previous.components.descriptionDiagnostics:null;
    const usePreservedMistralDescription=requested.includes('themes')&&!requested.includes('description')&&Boolean(existingDescription)&&existingDescriptionDiagnostics?.thirdProviderUsed===true;
    const specimen={imageId:sourceRecord.id,components:requested,componentBehaviors,promptRefs:job.config.promptRefs||{},directorGuidance:guidance,themeUseAnalysis:Boolean(job.config.themeUseAnalysis),themeAnalysisContext:job.config.themeUseAnalysis?existingDescription.slice(0,6000):'',preservedDescriptionContext:usePreservedMistralDescription?existingDescription.slice(0,12000):'',preservedDescriptionDiagnostics:usePreservedMistralDescription?clone(existingDescriptionDiagnostics):null,descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun),themeSweep:clone(job.config.themeSweep||null),...input};
    return{requested,componentBehaviors,previous,guidance,existingDescription,descriptionRerun,themeRerun,existingDescriptionDiagnostics,usePreservedMistralDescription,specimen};
  };

  for(const group of groups){
    const context=buildGroupContext(group,record);
    const {requested,componentBehaviors,previous:requestPrevious,guidance,descriptionRerun,themeRerun,specimen}=context;
    const artifactEngine=window.genreactrixAiArtifactEngine;
    let artifactAttempt=null,artifactAttemptCompleted=false;
    try{
      if(!artifactEngine)throw new Error('AI Attempt/Artifact history engine is unavailable');
      await artifactEngine.ensureImageReady?.(record.id);
      record=window.genreactrixImageRecordEngine.get(record.id,{touch:false})||record;
      const previous=record.analysis?.ai||requestPrevious;
      const baseMode=artifactEngine.attemptMode({requested,componentBehaviors,themeUseAnalysis:Boolean(job.config.themeUseAnalysis),directReactionUseAnalysis:Boolean(job.config.directReactionUseAnalysis),reactionRerunSources:clone(job.config.reactionRerunSources||null),directorGuidance:guidance});
      const mode=descriptionRerun?.operation?`rerun:description-${String(descriptionRerun.operation)}`:(themeRerun?'rerun:themes-director-workspace':baseMode);
      artifactAttempt=await artifactEngine.beginAttempt({imageId:record.id,jobId:job.id,itemId:item.id,itemAttemptId:item.currentAttemptId,components:requested,componentBehaviors,mode,directorGuidance:guidance,inputRefs:{imageId:record.id,sourceKind:derivationOnly?'theme-derived-no-provider':(input.imageUrl?'linked-url':'local-working-copy'),descriptionArtifact:previous.artifactHistory?.currentArtifacts?.description||null,priorArtifacts:clone(previous.artifactHistory?.currentArtifacts||{}),descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun),reactionRerunSources:clone(job.config.reactionRerunSources||null)},configRefs:{projectId:window.genreactrixSettingsEngine?.get?.('project.id')||'',promptRefs:clone(job.config.promptRefs||{}),configuredPromptVersion:window.genreactrixSettingsEngine?.get?.('ai.prompt.version')||'',reactionArchitecture:'theme-derived-six-equal-slots-v1',reactionAiScan:false,descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun),reactionRerunSources:clone(job.config.reactionRerunSources||null)}});
      const persistPreservedMistralDescription=async providerDiagnostic=>{
        const description=String(providerDiagnostic?.preservedDescription||'').trim();
        if(!providerDiagnostic?.mistralDescriptionPreserved||!description)return false;
        const diagnostics=clone(providerDiagnostic?.preservedDescriptionDiagnostics||{schemaVersion:1,thirdProviderUsed:true,thirdProvider:'mistral'});
        const current=window.genreactrixImageRecordEngine.get(record.id,{touch:false})||record,currentAi=current.analysis?.ai||previous;
        const partialAttempt=await artifactEngine.beginAttempt({imageId:record.id,jobId:job.id,itemId:item.id,itemAttemptId:item.currentAttemptId,components:['description'],componentBehaviors:{description:'recovery'},mode:'recovery:mistral-description-preserved',directorGuidance:guidance,inputRefs:{imageId:record.id,sourceKind:input.imageUrl?'linked-url':'local-working-copy'},configRefs:{recovery:'mistral-description-preserved'}});
        const returnedPartial={description,descriptionDiagnostics:diagnostics},mergedPartial={...(currentAi.components||{}),...returnedPartial};
        const partialResult={provider:{id:'mistral-direct',displayName:'Mistral description fallback',model:String(diagnostics.thirdProviderModel||'ministral-14b-2512')},model:String(diagnostics.thirdProviderModel||'ministral-14b-2512'),promptVersions:{description:'genreactrix-freeform-v4-preliminary-theme-aware-zazzly-exhaustive'},researchConfiguration:{mistralDescriptionPreserved:true}};
        const savedPartial=await artifactEngine.recordSuccess({record:current,attemptId:partialAttempt.id,requested:['description'],returned:returnedPartial,mergedComponents:mergedPartial,result:partialResult,mode:'recovery:mistral-description-preserved'});
        const analysisPartial={...currentAi,components:mergedPartial,provider:partialResult.provider,model:partialResult.model,promptVersions:{...(currentAi.promptVersions||{}),...partialResult.promptVersions},requested:[...new Set([...(currentAi.requested||[]),'description'])],researchConfiguration:{...(currentAi.researchConfiguration||{}),mistralDescriptionPreserved:true},artifactHistory:savedPartial.artifactHistory,recordedAt:now(),jobId:job.id};
        window.genreactrixImageRecordEngine.attachAI(record.id,analysisPartial,{aiDescription:'current'});
        const descriptionRow=group.find(c=>c.component==='description');if(descriptionRow)descriptionRow.state='complete';
        await window.genreactrixHistoryEngine.append({imageId:record.id,eventType:'ai-analysis',actor:'ai',sourceEngine:'ai-analysis',jobId:job.id,summary:'Preserved Mistral Description after downstream AI failure',payload:{attemptId:partialAttempt.id,artifactRefs:savedPartial.artifacts.map(a=>({artifactId:a.id,kind:a.kind,version:a.version})),analysis:{components:returnedPartial,provider:partialResult.provider,model:partialResult.model,promptVersions:partialResult.promptVersions,requested:['description'],jobId:job.id,artifactHistory:savedPartial.artifactHistory},componentUpdates:{aiDescription:'current'},partial:true}});
        record=window.genreactrixImageRecordEngine.get(record.id,{touch:false})||record;
        return true;
      };
      let payload,technicalRetry=null;
      const reactionDerivationOnly=requested.length>0&&requested.every(name=>['reactions','reactionReasons'].includes(name));
      try{
        if(reactionDerivationOnly){
          const built=buildThemeDerivedReactions(previous.components||{});if(!built)throw new Error('Three current PrimFusion Themes are required to derive Reactions.');
          const localComponents={reactionDiagnostics:clone(built.diagnostics)};
          if(requested.includes('reactions'))localComponents.reactions=clone(built.reactions);
          if(requested.includes('reactionReasons'))localComponents.reactionReasons={schemaVersion:1,protocol:'theme-derived-six-equal-slots-v1',aiScan:false,themeCodes:[...built.diagnostics.themeCodes],slots:clone(built.diagnostics.slots),summary:'Three selected Themes contribute six equal Prim slots; duplicate Prims accumulate.'};
          payload={result:{schemaVersion:3,imageId:record.id,provider:{id:'theme-derived',displayName:'Theme-derived deterministic'},model:'deterministic',promptVersions:{reactions:'genreactrix-reactions-theme-derived-v1',reactionReasons:'genreactrix-reaction-info-theme-derived-v1'},researchConfiguration:{reactionArchitecture:'theme-derived-six-equal-slots-v1',reactionAiScan:false},components:localComponents}};
          const live=LIVE_JOBS.get(job.id);if(live){liveRecent(live,'Reactions recalculated from the current three Themes · no AI Reaction scan');repaintLiveDetail(job.id)}
        }else payload=await runLiveRequest(specimen,requested);
      }
      catch(firstError){
        const providerDiagnostic=firstError?.providerDiagnostic||null;
        await persistPreservedMistralDescription(providerDiagnostic).catch(error=>console.warn('Could not preserve Mistral Description after downstream failure',error));
        const failureKind=String(providerDiagnostic?.failureKind||'').toLowerCase(),freshRequest=providerDiagnostic?.freshRequestRecommended===true&&failureKind==='timeout';
        if(!freshRequest)throw firstError;
        technicalRetry={at:now(),type:'diagnostic-timeout-fresh-request',firstError:String(firstError?.message||firstError),providerDiagnostic:clone(providerDiagnostic)};
        await window.genreactrixHistoryEngine?.append?.({imageId:record.id,eventType:'ai-technical-retry',actor:'system',sourceEngine:'ai-analysis',jobId:job.id,summary:'Theme diagnostic timed out; retrying in a fresh Worker request',payload:{itemAttemptId:item.currentAttemptId,components:requested,error:technicalRetry.firstError,providerDiagnostic:clone(providerDiagnostic)}}).catch(()=>{});
        try{payload=await runLiveRequest(specimen,requested,{label:'Technical retry'})}
        catch(secondError){await persistPreservedMistralDescription(secondError?.providerDiagnostic||null).catch(error=>console.warn('Could not preserve Mistral Description after retry failure',error));throw secondError}
      }
      const result=payload.result||payload.report||payload;
      if(technicalRetry&&result&&typeof result==='object'){
        result.researchConfiguration={...(result.researchConfiguration||{}),technicalRetryHistory:[...((result.researchConfiguration?.technicalRetryHistory)||[]),clone(technicalRetry)]};
        if(result.components?.themeDecisionDiagnostics)result.components.themeDecisionDiagnostics={...result.components.themeDecisionDiagnostics,technicalRetry:clone(technicalRetry)};
      }
      if(!result||typeof result!=='object')throw new Error('AI provider returned no structured result');
      for(const c of group)if(!Object.prototype.hasOwnProperty.call(result.components||{},c.component))throw new Error(`AI provider omitted ${c.component}`);

      let descriptionEdit=null;
      if(descriptionRerun&&requested.includes('description')){
        const operation=String(descriptionRerun.operation||'all'),rawGenerated=String(result.components?.description||''),generated=['add','replace'].includes(operation)?rawGenerated:rawGenerated.trim();
        if(['add','replace'].includes(operation)){
          if(!generated.trim())throw new Error('AI provider returned an empty Description edit fragment');
          const target=String(descriptionRerun.targetDescription?.text||''),start=Math.max(0,Math.min(target.length,Number(descriptionRerun.targetDescription?.start)||0)),end=operation==='replace'?Math.max(start,Math.min(target.length,Number(descriptionRerun.targetDescription?.end)||0)):start;
          descriptionEdit=generated;
          result.components.description=target.slice(0,start)+generated+target.slice(end);
        }
      }

      const returned={};
      for(const c of group){c.state='complete';returned[c.component]=result.components[c.component]}
      if(result.components?.reactionDiagnostics) returned.reactionDiagnostics=result.components.reactionDiagnostics;
      if(result.components?.descriptionDiagnostics) returned.descriptionDiagnostics=clone(result.components.descriptionDiagnostics);
      if(result.components?.themeRecovery) returned.themeRecovery=result.components.themeRecovery;
      if(result.components?.themeDecisionDiagnostics) returned.themeDecisionDiagnostics=clone(result.components.themeDecisionDiagnostics);
      if(result.components?.themeRerunDiagnostics) returned.themeRerunDiagnostics=clone(result.components.themeRerunDiagnostics);
      if(result.components?.slopAssessment) returned.slopAssessment=clone(result.components.slopAssessment);
      if(result.components?.contentRatings) returned.contentRatings=clone(result.components.contentRatings);

      record=window.genreactrixImageRecordEngine.get(record.id,{touch:false})||record;
      const latest=record.analysis?.ai||previous,latestExtended=record?.metadata?.extended||{},effectiveSlop=effectiveSlopAssessment(latest.components?.slopAssessment||latestExtended.aiSlopAssessment||null,returned.slopAssessment||null,latestExtended.slopDirectorReview||null);
      const mergedComponents=applyThemeDerivedReactions({...(latest.components||{}),...returned});
      const componentUpdates={};
      for(const c of group){const field=COMPONENTS.find(([id])=>id===c.component)?.[2];componentUpdates[field]='current'}
      if(requested.includes('themes')&&mergedComponents.reactions)componentUpdates.aiReactions='current';
      const stored=await artifactEngine.recordSuccess({record,attemptId:artifactAttempt.id,requested,returned,mergedComponents,result,mode});artifactAttemptCompleted=true;
      const analysis={...latest,components:mergedComponents,provider:result.provider||latest.provider||{},model:result.model||result.provider?.model||latest.model||'',promptVersions:{...(latest.promptVersions||{}),...(result.promptVersions||{})},requested:[...new Set([...(latest.requested||[]),...requested])],researchConfiguration:{...(latest.researchConfiguration||{}),...(result.researchConfiguration||{})},artifactHistory:stored.artifactHistory,recordedAt:now(),jobId:job.id};
      window.genreactrixImageRecordEngine.attachAI(record.id,analysis,componentUpdates);
      const directorTuningApplied=Boolean(guidance||descriptionRerun||themeRerun);
      const liveAfterAi=window.genreactrixImageRecordEngine.get(record.id,{touch:false});
      const extAfterAi=liveAfterAi?.metadata?.extended||{};
      const metadataPatch={};
      if(directorTuningApplied){metadataPatch.aiTuned=true;metadataPatch.aiTunedAt=now();metadataPatch.aiTunedCount=(Number(extAfterAi.aiTunedCount)||0)+(String(extAfterAi.aiTunedJobId||'')===String(job.id)?0:1);metadataPatch.aiTunedAttemptId=artifactAttempt.id;metadataPatch.aiTunedJobId=job.id;}
      if(result.components?.slopAssessment&&String(effectiveSlop?.assessmentId||'')===String(result.components.slopAssessment?.assessmentId||'')){metadataPatch.aiSlopAssessment=clone(result.components.slopAssessment);metadataPatch.aiSlopAssessmentAttemptId=artifactAttempt.id;metadataPatch.aiSlopAssessmentJobId=job.id;}
      if(result.components?.contentRatings?.ai){const prior=extAfterAi.contentRatings&&typeof extAfterAi.contentRatings==='object'?extAfterAi.contentRatings:{};metadataPatch.contentRatings={schemaVersion:2,ai:{...result.components.contentRatings.ai},aiReasons:{...(result.components.contentRatings.reasons||{})},aiDetails:{protocol:result.components.contentRatings.protocol||'',model:result.components.contentRatings.model||'',mode:result.components.contentRatings.mode||'',overall:result.components.contentRatings.overall||'',codes:[...(result.components.contentRatings.codes||[])],generatedAt:result.components.contentRatings.generatedAt||'',raw:result.components.contentRatings.raw||''},director:{...(prior.director||{})}};}
      if(Object.keys(metadataPatch).length)window.genreactrixImageRecordEngine.update(record.id,{metadata:{extended:metadataPatch}},directorTuningApplied?'ai-tuned-metadata':'ai-slop-advisory-metadata');
      await window.genreactrixHistoryEngine.append({imageId:record.id,eventType:'ai-analysis',actor:'ai',sourceEngine:'ai-analysis',jobId:job.id,summary:`AI analyzed ${requested.join(' + ')}`,payload:{attemptId:artifactAttempt.id,artifactRefs:stored.artifacts.map(a=>({artifactId:a.id,kind:a.kind,version:a.version})),analysis:{components:{...returned,...(descriptionEdit!==null?{descriptionEdit}:{}),...(analysis.components?.reactionDiagnostics?.method==='theme-derived-six-equal-slots-v1'?{reactions:analysis.components.reactions,reactionDiagnostics:analysis.components.reactionDiagnostics}: {})},provider:result.provider||{},model:analysis.model,promptVersions:result.promptVersions||{},requested,jobId:job.id,artifactHistory:stored.artifactHistory},componentUpdates,directorGuidance:guidance,reactionRerunSources:clone(job.config.reactionRerunSources||null),descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun),partial:false}});
      if(String(returned.genreReasons?.diagnostic?.reportingSidecar?.status||'')==='pending'){
        const sidecarThemes=Array.isArray(returned.themes)?returned.themes:(Array.isArray(returned.genreReasons?.themes)?returned.genreReasons.themes:[]);
        if(enqueueThemeReportSidecar({imageId:record.id,jobId:job.id,themes:sidecarThemes,behavior:componentBehaviors.themes||componentBehaviors.genreReasons||'analyze',themeSweep:job.config.themeSweep||null})){
          const live=LIVE_JOBS.get(job.id);if(live){liveRecent(live,'Full Theme report diagnostic queued in background');repaintLiveDetail(job.id)}
        }
      }
    }catch(error){
      const message=`${requested.join('+')}: ${String(error.message||error)}`;errors.push(message);
      if(artifactAttempt&&!artifactAttemptCompleted)await artifactEngine?.failAttempt?.(artifactAttempt.id,message).catch(()=>{});
      for(const c of group){if(c.state==='complete')continue;c.state='failed';const field=COMPONENTS.find(([id])=>id===c.component)?.[2];window.genreactrixImageRecordEngine.setComponent(record.id,field,'failed')}
      await window.genreactrixHistoryEngine.append({imageId:record.id,eventType:'ai-failed',actor:'system',sourceEngine:'ai-analysis',jobId:job.id,summary:message,payload:{attemptId:artifactAttempt?.id||null,error:message,components:requested,directorGuidance:String(job.config.analysisGuidance||'').trim().slice(0,6000),reactionRerunSources:clone(job.config.reactionRerunSources||null),descriptionRerun:clone(job.config.descriptionRerun||null),themeRerun:clone(job.config.themeRerun||null)}}).catch(()=>{});
      // A parallel sibling may already have completed successfully. Do not discard
      // that valid branch merely because this branch encountered a global-looking
      // failure; finalize the sibling, then let the item carry the failed branch.
      if(isGlobalProviderFailure(message))break;
    }
  }
  // Reaction recovery is unnecessary: Reactions are deterministically recalculated from Themes.
  for(const c of pending.filter(c=>c.state==='processing')){const field=COMPONENTS.find(([id])=>id===c.component)?.[2];c.state='failed';window.genreactrixImageRecordEngine.setComponent(record.id,field,'failed')}
  item.state=errors.length?'failed':'complete';item.error=errors.join(' | ');await put(ITEMS,item);await q()?.setItemState?.(`queue_${item.id}`,item.state,{error:item.error});if(lifecycleIsolated)restoreThemeRerunLifecycle(item);else window.genreactrixLifecycleEngine?.reconcileAfterAi?.(item.imageId,{jobId:job.id,attemptId:item.currentAttemptId||`${item.id}:attempt:${item.attempts}`,error:item.error,globalFailure:isGlobalProviderFailure(item.error)});finishLiveItem(job.id,item.state,item.error);scheduleThemeReportSidecarPump();return item.state;
 }


 let serverJobCapabilityCache={checkedAt:0,enabled:false};
 const SERVER_JOB_HANDOFFS=new Map();
 const SERVER_JOB_POLL_MS=1800;
 async function serverJobCapability(){
  if(Date.now()-serverJobCapabilityCache.checkedAt<60000)return serverJobCapabilityCache.enabled;
  try{const health=await window.GenreactrixCloudApi?.health?.();serverJobCapabilityCache={checkedAt:Date.now(),enabled:Boolean(health?.serverJobs?.enabled)};}catch{serverJobCapabilityCache={checkedAt:Date.now(),enabled:false};}
  return serverJobCapabilityCache.enabled;
 }
 function serverSingleRequestPlan(job,item,record){
  const pending=item.components.filter(c=>c.state==='queued'||c.state==='failed'||c.state==='processing');
  if(!pending.length||pending.every(c=>['reactions','reactionReasons'].includes(c.component)))return null;
  const groups=[],take=keys=>{const rows=pending.filter(c=>keys.includes(c.component));if(rows.length)groups.push(rows)},hasThemePending=pending.some(c=>['themes','genreReasons'].includes(c.component));
  if(!job.config?.themeRerun&&!job.config?.descriptionRerun){
   if(hasThemePending)take(['themes','genreReasons','description','reactions','reactionReasons']);else{take(['description']);take(['reactions','reactionReasons']);}
  }else{
   take(['themes','genreReasons','reactions','reactionReasons']);take(['description']);
  }
  for(const c of pending)if(!groups.some(group=>group.includes(c)))groups.push([c]);
  if(groups.length!==1)return null;
  const group=groups[0],requested=group.map(c=>c.component);if(!requested.some(c=>['themes','genreReasons','description'].includes(c)))return null;
  const componentBehaviors=Object.fromEntries(group.map(c=>[c.component,c.behavior])),previous=record.analysis?.ai||{},guidance=String(job.config.analysisGuidance||'').trim().slice(0,6000),existingDescription=String(previous.components?.description||previous.description||'').trim(),descriptionRerun=requested.includes('description')&&job.config?.descriptionRerun?clone(job.config.descriptionRerun):null,themeRerun=requested.includes('themes')&&job.config?.themeRerun?clone(job.config.themeRerun):null,existingDescriptionDiagnostics=previous.components?.descriptionDiagnostics&&typeof previous.components.descriptionDiagnostics==='object'?previous.components.descriptionDiagnostics:null,usePreservedMistralDescription=requested.includes('themes')&&!requested.includes('description')&&Boolean(existingDescription)&&existingDescriptionDiagnostics?.thirdProviderUsed===true,providerRouting=window.GenreactrixCloudApi?.getProviderRouting?.()||null;
  const request={imageId:record.id,components:requested,componentBehaviors,promptRefs:job.config.promptRefs||{},directorGuidance:guidance,themeUseAnalysis:Boolean(job.config.themeUseAnalysis),themeAnalysisContext:job.config.themeUseAnalysis?existingDescription.slice(0,6000):'',preservedDescriptionContext:usePreservedMistralDescription?existingDescription.slice(0,12000):'',preservedDescriptionDiagnostics:usePreservedMistralDescription?clone(existingDescriptionDiagnostics):null,descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun),themeSweep:clone(job.config.themeSweep||null),providerRouting};
  return{requested,componentBehaviors,request};
 }
 async function prepareServerJobManifest(job){
  const items=(await byIndex(ITEMS,'jobId',job.id)).sort((a,b)=>a.order-b.order),manifest=[],uploads=[];
  for(const item of items){
   if(!['queued','failed','processing'].includes(item.state))continue;
   const record=window.genreactrixImageRecordEngine?.get?.(item.imageId,{touch:false});if(!record)return null;
   const plan=serverSingleRequestPlan(job,item,record);if(!plan)return null;
   const hyperlink=String(record.storage?.hyperlink||'').trim(),sourceKind=hyperlink?'url':'upload';
   manifest.push({id:item.id,clientItemId:item.id,imageId:record.id,order:item.order,sourceKind,sourceRef:hyperlink||null,request:plan.request});
   if(sourceKind==='upload')uploads.push({item,record});
  }
  return manifest.length?{manifest,uploads}:null;
 }
 async function uploadServerLocalImages(job,serverJobId,uploads){
  let index=0;
  for(const row of uploads){
   const blob=await window.imageBlobGet?.(row.record.id).catch(()=>null);if(!blob)throw new Error(`Image source is unavailable for ${row.record.name||row.record.id}`);
   const prepared=await normalizeAiImageBlob(blob);await window.GenreactrixCloudApi.uploadServerJobImage(serverJobId,row.item.id,prepared.blob);index++;
   if(index===1||index===uploads.length||index%5===0)await updateJob(job,{message:`Handing images to server · ${index}/${uploads.length}`});
  }
 }
 async function markServerItemsInFlight(job){
  const lifecycleIsolated=isThemeRerunConfig(job.config),items=(await byIndex(ITEMS,'jobId',job.id)).sort((a,b)=>a.order-b.order);
  for(const item of items){if(!['queued','failed','processing'].includes(item.state))continue;item.state='processing';item.attempts=Math.max(1,Number(item.attempts)||0);item.currentAttemptId=item.currentAttemptId||`${item.id}:server:${item.attempts}`;for(const c of item.components||[])if(['queued','failed'].includes(c.state))c.state='processing';await put(ITEMS,item);await q()?.setItemState?.(`queue_${item.id}`,'processing',{attempts:item.attempts});const record=window.genreactrixImageRecordEngine?.get?.(item.imageId,{touch:false});for(const c of item.components||[]){const field=COMPONENTS.find(([id])=>id===c.component)?.[2];if(field&&record)window.genreactrixImageRecordEngine.setComponent(record.id,field,'processing')}if(!lifecycleIsolated)window.genreactrixLifecycleEngine?.markAiProcessing?.(item.imageId,{jobId:job.id,attemptId:item.currentAttemptId,execution:'server'});}
 }
 async function harvestServerSuccess(job,item,envelope){
  const result=envelope?.result;if(!result||typeof result!=='object')throw new Error('Server AI result envelope contains no structured result');
  const requested=Array.isArray(envelope.requested)?envelope.requested:(item.components||[]).map(c=>c.component),componentBehaviors=Object.fromEntries((item.components||[]).filter(c=>requested.includes(c.component)).map(c=>[c.component,c.behavior]));
  for(const component of requested)if(!Object.prototype.hasOwnProperty.call(result.components||{},component))throw new Error(`Server AI provider omitted ${component}`);
  let record=window.genreactrixImageRecordEngine.get(item.imageId,{touch:false});if(!record)throw new Error('Image record not found while harvesting server result');
  const artifactEngine=window.genreactrixAiArtifactEngine;if(!artifactEngine)throw new Error('AI Attempt/Artifact history engine is unavailable');await artifactEngine.ensureImageReady?.(record.id);record=window.genreactrixImageRecordEngine.get(record.id,{touch:false})||record;
  const previous=record.analysis?.ai||{},guidance=String(job.config.analysisGuidance||'').trim().slice(0,6000),descriptionRerun=requested.includes('description')&&job.config?.descriptionRerun?clone(job.config.descriptionRerun):null,themeRerun=requested.includes('themes')&&job.config?.themeRerun?clone(job.config.themeRerun):null,baseMode=artifactEngine.attemptMode({requested,componentBehaviors,themeUseAnalysis:Boolean(job.config.themeUseAnalysis),directReactionUseAnalysis:false,reactionRerunSources:null,directorGuidance:guidance}),mode=descriptionRerun?.operation?`server:rerun:description-${String(descriptionRerun.operation)}`:(themeRerun?'server:rerun:themes-director-workspace':`server:${baseMode}`);
  const attempt=await artifactEngine.beginAttempt({imageId:record.id,jobId:job.id,itemId:item.id,itemAttemptId:item.currentAttemptId,components:requested,componentBehaviors,mode,directorGuidance:guidance,inputRefs:{imageId:record.id,sourceKind:'server-job-handoff',serverJobId:job.serverJobId,serverItemId:item.id,descriptionArtifact:previous.artifactHistory?.currentArtifacts?.description||null,priorArtifacts:clone(previous.artifactHistory?.currentArtifacts||{}),descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun)},configRefs:{projectId:window.genreactrixSettingsEngine?.get?.('project.id')||'',promptRefs:clone(job.config.promptRefs||{}),configuredPromptVersion:window.genreactrixSettingsEngine?.get?.('ai.prompt.version')||'',reactionArchitecture:'theme-derived-six-equal-slots-v1',reactionAiScan:false,descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun),serverExecutionProtocol:'d1-r2-queue-v1',serverStartedAt:envelope.startedAt||null,serverCompletedAt:envelope.completedAt||null}});
  let descriptionEdit=null;
  if(descriptionRerun&&requested.includes('description')){
   const operation=String(descriptionRerun.operation||'all'),rawGenerated=String(result.components?.description||''),generated=['add','replace'].includes(operation)?rawGenerated:rawGenerated.trim();
   if(['add','replace'].includes(operation)){
    if(!generated.trim())throw new Error('AI provider returned an empty Description edit fragment');
    const target=String(descriptionRerun.targetDescription?.text||''),start=Math.max(0,Math.min(target.length,Number(descriptionRerun.targetDescription?.start)||0)),end=operation==='replace'?Math.max(start,Math.min(target.length,Number(descriptionRerun.targetDescription?.end)||0)):start;
    descriptionEdit=generated;result.components.description=target.slice(0,start)+generated+target.slice(end);
   }
  }
  const returned={};for(const component of requested)returned[component]=result.components[component];if(result.components?.reactionDiagnostics)returned.reactionDiagnostics=result.components.reactionDiagnostics;if(result.components?.descriptionDiagnostics)returned.descriptionDiagnostics=clone(result.components.descriptionDiagnostics);if(result.components?.themeRecovery)returned.themeRecovery=result.components.themeRecovery;if(result.components?.themeDecisionDiagnostics)returned.themeDecisionDiagnostics=clone(result.components.themeDecisionDiagnostics);if(result.components?.themeRerunDiagnostics)returned.themeRerunDiagnostics=clone(result.components.themeRerunDiagnostics);if(result.components?.slopAssessment)returned.slopAssessment=clone(result.components.slopAssessment);if(result.components?.contentRatings)returned.contentRatings=clone(result.components.contentRatings);
  const latest=record.analysis?.ai||previous,latestExtended=record?.metadata?.extended||{},effectiveSlop=effectiveSlopAssessment(latest.components?.slopAssessment||latestExtended.aiSlopAssessment||null,returned.slopAssessment||null,latestExtended.slopDirectorReview||null),mergedComponents=applyThemeDerivedReactions({...(latest.components||{}),...returned}),componentUpdates={};
  for(const component of requested){const field=COMPONENTS.find(([id])=>id===component)?.[2];if(field)componentUpdates[field]='current'}if(requested.includes('themes')&&mergedComponents.reactions)componentUpdates.aiReactions='current';
  const stored=await artifactEngine.recordSuccess({record,attemptId:attempt.id,requested,returned,mergedComponents,result,mode}),analysis={...latest,components:mergedComponents,provider:result.provider||latest.provider||{},model:result.model||result.provider?.model||latest.model||'',promptVersions:{...(latest.promptVersions||{}),...(result.promptVersions||{})},requested:[...new Set([...(latest.requested||[]),...requested])],researchConfiguration:{...(latest.researchConfiguration||{}),...(result.researchConfiguration||{}),serverExecutionProtocol:'d1-r2-queue-v1'},artifactHistory:stored.artifactHistory,recordedAt:now(),jobId:job.id};
  window.genreactrixImageRecordEngine.attachAI(record.id,analysis,componentUpdates);
  const directorTuningApplied=Boolean(guidance||descriptionRerun||themeRerun),liveAfterAi=window.genreactrixImageRecordEngine.get(record.id,{touch:false}),extAfterAi=liveAfterAi?.metadata?.extended||{},metadataPatch={};if(directorTuningApplied){metadataPatch.aiTuned=true;metadataPatch.aiTunedAt=now();metadataPatch.aiTunedCount=(Number(extAfterAi.aiTunedCount)||0)+(String(extAfterAi.aiTunedJobId||'')===String(job.id)?0:1);metadataPatch.aiTunedAttemptId=attempt.id;metadataPatch.aiTunedJobId=job.id;}if(result.components?.slopAssessment&&String(effectiveSlop?.assessmentId||'')===String(result.components.slopAssessment?.assessmentId||'')){metadataPatch.aiSlopAssessment=clone(result.components.slopAssessment);metadataPatch.aiSlopAssessmentAttemptId=attempt.id;metadataPatch.aiSlopAssessmentJobId=job.id;}if(result.components?.contentRatings?.ai){const prior=extAfterAi.contentRatings&&typeof extAfterAi.contentRatings==='object'?extAfterAi.contentRatings:{};metadataPatch.contentRatings={schemaVersion:2,ai:{...result.components.contentRatings.ai},aiReasons:{...(result.components.contentRatings.reasons||{})},aiDetails:{protocol:result.components.contentRatings.protocol||'',model:result.components.contentRatings.model||'',mode:result.components.contentRatings.mode||'',overall:result.components.contentRatings.overall||'',codes:[...(result.components.contentRatings.codes||[])],generatedAt:result.components.contentRatings.generatedAt||'',raw:result.components.contentRatings.raw||''},director:{...(prior.director||{})}};}if(Object.keys(metadataPatch).length)window.genreactrixImageRecordEngine.update(record.id,{metadata:{extended:metadataPatch}},directorTuningApplied?'ai-tuned-metadata':'ai-slop-advisory-metadata');
  await window.genreactrixHistoryEngine.append({imageId:record.id,eventType:'ai-analysis',actor:'ai',sourceEngine:'ai-analysis',jobId:job.id,summary:`AI analyzed ${requested.join(' + ')} on server`,payload:{attemptId:attempt.id,artifactRefs:stored.artifacts.map(a=>({artifactId:a.id,kind:a.kind,version:a.version})),analysis:{components:{...returned,...(descriptionEdit!==null?{descriptionEdit}:{}),...(analysis.components?.reactionDiagnostics?.method==='theme-derived-six-equal-slots-v1'?{reactions:analysis.components.reactions,reactionDiagnostics:analysis.components.reactionDiagnostics}: {})},provider:result.provider||{},model:analysis.model,promptVersions:result.promptVersions||{},requested,jobId:job.id,artifactHistory:stored.artifactHistory},componentUpdates,directorGuidance:guidance,descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun),serverExecution:{protocol:'d1-r2-queue-v1',serverJobId:job.serverJobId,serverItemId:item.id,startedAt:envelope.startedAt||null,completedAt:envelope.completedAt||null},partial:false}});
  if(String(returned.genreReasons?.diagnostic?.reportingSidecar?.status||'')==='pending'){const sidecarThemes=Array.isArray(returned.themes)?returned.themes:(Array.isArray(returned.genreReasons?.themes)?returned.genreReasons.themes:[]);enqueueThemeReportSidecar({imageId:record.id,jobId:job.id,themes:sidecarThemes,behavior:componentBehaviors.themes||componentBehaviors.genreReasons||'analyze',themeSweep:job.config.themeSweep||null});}
  for(const c of item.components||[])if(requested.includes(c.component))c.state='complete';item.state='complete';item.error='';await put(ITEMS,item);await q()?.setItemState?.(`queue_${item.id}`,'complete',{error:''});if(isThemeRerunConfig(job.config))restoreThemeRerunLifecycle(item);else window.genreactrixLifecycleEngine?.reconcileAfterAi?.(item.imageId,{jobId:job.id,attemptId:item.currentAttemptId,error:'',globalFailure:false});scheduleThemeReportSidecarPump();
 }
 async function harvestServerFailure(job,item,envelope){
  const message=String(envelope?.error||'Server AI analysis failed'),requested=Array.isArray(envelope?.requested)?envelope.requested:(item.components||[]).map(c=>c.component),artifactEngine=window.genreactrixAiArtifactEngine,record=window.genreactrixImageRecordEngine?.get?.(item.imageId,{touch:false}),descriptionRerun=requested.includes('description')&&job.config?.descriptionRerun?clone(job.config.descriptionRerun):null,themeRerun=requested.includes('themes')&&job.config?.themeRerun?clone(job.config.themeRerun):null;
  let attemptId=null;try{if(artifactEngine&&record){const componentBehaviors=Object.fromEntries((item.components||[]).map(c=>[c.component,c.behavior])),guidance=String(job.config.analysisGuidance||'').trim().slice(0,6000),baseMode=artifactEngine.attemptMode({requested,componentBehaviors,themeUseAnalysis:Boolean(job.config.themeUseAnalysis),directReactionUseAnalysis:false,reactionRerunSources:null,directorGuidance:guidance}),mode=descriptionRerun?.operation?`server:failed:rerun:description-${String(descriptionRerun.operation)}`:(themeRerun?'server:failed:rerun:themes-director-workspace':'server:failed');const attempt=await artifactEngine.beginAttempt({imageId:item.imageId,jobId:job.id,itemId:item.id,itemAttemptId:item.currentAttemptId,components:requested,componentBehaviors,mode,directorGuidance:guidance,inputRefs:{imageId:item.imageId,serverJobId:job.serverJobId,serverItemId:item.id,descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun)},configRefs:{serverExecutionProtocol:'d1-r2-queue-v1',descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun),providerDiagnostic:clone(envelope?.providerDiagnostic||null)}});attemptId=attempt.id;await artifactEngine.failAttempt(attempt.id,message)}}catch(error){console.warn('Server AI failure attempt could not be recorded',error)}
  for(const c of item.components||[]){c.state='failed';const field=COMPONENTS.find(([id])=>id===c.component)?.[2];if(field&&record)window.genreactrixImageRecordEngine.setComponent(item.imageId,field,'failed')}item.state='failed';item.error=message;await put(ITEMS,item);await q()?.setItemState?.(`queue_${item.id}`,'failed',{error:message});await window.genreactrixHistoryEngine?.append?.({imageId:item.imageId,eventType:'ai-failed',actor:'system',sourceEngine:'ai-analysis',jobId:job.id,summary:message,payload:{attemptId,error:message,components:requested,directorGuidance:String(job.config.analysisGuidance||'').trim().slice(0,6000),descriptionRerun:clone(descriptionRerun),themeRerun:clone(themeRerun),serverExecution:{protocol:'d1-r2-queue-v1',serverJobId:job.serverJobId,serverItemId:item.id},providerDiagnostic:clone(envelope?.providerDiagnostic||null)}}).catch(()=>{});if(isThemeRerunConfig(job.config))restoreThemeRerunLifecycle(item,'theme-rerun-lifecycle-guard-server-error');else window.genreactrixLifecycleEngine?.reconcileAfterAi?.(item.imageId,{jobId:job.id,attemptId:item.currentAttemptId,error:message,globalFailure:isGlobalProviderFailure(message)});
 }
 async function harvestServerItem(job,item,summary){
  if(['complete','failed','cancelled'].includes(item.state))return item.state;const payload=await window.GenreactrixCloudApi.serverJobItem(job.serverJobId,item.id),detail=payload?.result||payload,envelope=detail?.envelope||null,remoteState=String(detail?.item?.state||summary?.state||'');
  try{if(remoteState==='complete')await harvestServerSuccess(job,item,envelope);else if(remoteState==='failed')await harvestServerFailure(job,item,envelope);else if(remoteState==='cancelled'){item.state='cancelled';item.error='Cancelled on server';for(const c of item.components||[])c.state='cancelled';await put(ITEMS,item);await q()?.setItemState?.(`queue_${item.id}`,'cancelled',{error:item.error});if(!isThemeRerunConfig(job.config))window.genreactrixLifecycleEngine?.reconcileAfterAi?.(item.imageId,{jobId:job.id,attemptId:item.currentAttemptId});}}
  finally{if(['complete','failed','cancelled'].includes(item.state))await window.GenreactrixCloudApi.harvestServerJobItem(job.serverJobId,item.id).catch(()=>{});}
  return item.state;
 }
 async function finalizeServerLocalJob(job){
  const items=await byIndex(ITEMS,'jobId',job.id);job.completed=items.filter(i=>i.state==='complete').length;job.failed=items.filter(i=>i.state==='failed').length;job.processing=0;const stopped=job.stopRequested||job.state==='cancelled',finalState=stopped?'cancelled':(job.failed?'completed-with-failures':'completed');let finalMessage=stopped?'Stopped safely':(job.failed?`Completed with ${job.failed} failure(s)`:'Completed');const sweepConfig=job.config?.themeSweep,themeSweepManaged=Boolean(sweepConfig?.managed&&sweepConfig?.sweepId);
  if(!stopped&&themeSweepManaged){const sweepEngine=window.genreactrixThemeSweepEngine,pass=Math.max(1,Math.min(3,Number(sweepConfig.pass)||1)),sweep=sweepEngine?.get?.(sweepConfig.sweepId),passIds=sweep?.passes?.[String(pass)]?.imageIds||sweep?.passes?.[pass]?.imageIds||[];if(!sweepEngine||!sweep)throw new Error('Theme Sweep state is unavailable');const outcome=sweepEngine.evaluate(passIds,pass);if(outcome.failedIds.length){sweepEngine.blockPassForFailures?.(sweep.id,pass,{...outcome,imageIds:[...passIds]});finalMessage+=` · Theme Sweep Pass ${pass}: ${outcome.successful}/${outcome.analyzed} valid · ${outcome.failedIds.length} failed · automatic recovery`;await updateJob(job,{state:'completed-with-failures',completedAt:now(),message:finalMessage});await q()?.setJobState?.(`queue_${job.id}`,'completed-with-failures',finalMessage);render();setTimeout(()=>autoAdvanceBlockedThemeSweep(job.id).catch(error=>markAiAutoRecoveryFailure(job.id,error)),0);return;}sweepEngine.finishPass(sweep.id,pass,outcome);const tripletLabel=outcome.triplet?.labels?.join(' / ')||outcome.triplet?.codes?.join(' / ')||'';finalMessage+=pass<3?(outcome.holdIds.length?` · Theme Sweep pass ${pass}: ${outcome.holdIds.length} held${tripletLabel?` for ${tripletLabel}`:''}`:` · Theme Sweep pass ${pass}: all released`):` · Theme Sweep verification: ${outcome.releaseIds.length} released`;await updateJob(job,{state:finalState,completedAt:now(),message:finalMessage});await q()?.setJobState?.(`queue_${job.id}`,finalState,finalMessage);render();if(pass<3&&outcome.holdIds.length){const nextPass=pass+1,next=sweepEngine.prepareNext(sweep.id,nextPass,outcome.holdIds),components=componentMap();components.themes={enabled:true,behavior:'reanalyze'};if(job.config?.components?.genreReasons?.enabled)components.genreReasons={enabled:true,behavior:'reanalyze'};if(job.config?.themeSweep?.persistDescription)components.description={enabled:true,behavior:'reanalyze'};const nextConfig={target:'selected',imageIds:[...next.imageIds],quantityMode:'all',quantity:next.imageIds.length,order:'queue',components,promptRefs:clone(job.config.promptRefs||{}),themeSweep:{managed:true,sweepId:sweep.id,pass:nextPass,orderMode:'shuffled',orderSeed:next.orderSeed,rootJobId:sweep.rootJobId||job.id,persistDescription:Boolean(job.config?.themeSweep?.persistDescription)}};const nextJob=await createJob(nextConfig);if(nextJob?.id){sweepEngine.attachPassJob(sweep.id,nextPass,nextJob.id,next.imageIds,next.orderSeed);await run(nextJob.id);}else console.warn('Theme Sweep recovery pass could not be queued',nextJob);}else setTimeout(()=>maintainActiveMode().catch(console.warn),0);return;}
  if(!stopped&&!isThemeRerunConfig(job.config)){const staged=window.genreactrixLifecycleEngine?.snapshot?.().staged||0;if(staged)finalMessage+=` · ${staged} Staged · ready for manual Bundle`; }await updateJob(job,{state:finalState,completedAt:now(),message:finalMessage});await q()?.setJobState?.(`queue_${job.id}`,finalState,finalMessage);render();if(!stopped&&!isThemeRerunConfig(job.config)){if(job.failed)setTimeout(()=>autoRecoverCompletedJob(job.id).catch(error=>markAiAutoRecoveryFailure(job.id,error)),0);else setTimeout(()=>maintainActiveMode().catch(console.warn),0);}
 }
 async function syncServerJobOnce(job){
  const payload=await window.GenreactrixCloudApi.serverJobStatus(job.serverJobId),remote=payload?.result||payload,server=remote?.job||{},summaries=remote?.items||[],items=await byIndex(ITEMS,'jobId',job.id),byId=new Map(items.map(item=>[String(item.id),item]));
  for(const summary of summaries){const item=byId.get(String(summary.id));if(item&&['complete','failed','cancelled'].includes(String(summary.state))&&!['complete','failed','cancelled'].includes(item.state))await harvestServerItem(job,item,summary);}
  const refreshed=await byIndex(ITEMS,'jobId',job.id);job.completed=refreshed.filter(i=>i.state==='complete').length;job.failed=refreshed.filter(i=>i.state==='failed').length;job.processing=refreshed.filter(i=>i.state==='processing').length;job.serverState=server.state||job.serverState;job.message=`Server ${server.state||'running'} · ${Number(server.completed)||0}/${Number(server.total)||job.total} complete${Number(server.failed)?` · ${server.failed} failed`:''}`;await put(JOBS,job);emit();render();
  if(String(server.state)==='paused'){job.state='paused';job.message=server.message||job.message;await put(JOBS,job);await q()?.setJobState?.(`queue_${job.id}`,'paused',job.message);return'paused';}
  if(['completed','completed-with-failures','failed','cancelled'].includes(String(server.state))){if(server.state==='cancelled'){job.state='cancelled';job.stopRequested=true;}await finalizeServerLocalJob(job);return'done';}
  return'running';
 }
 async function monitorServerJob(jobId){
  while(true){let job=(await all(JOBS)).find(j=>j.id===jobId);if(!job||job.execution!=='server'||!job.serverJobId)return;if(job.state==='cancelled')return;try{const state=await syncServerJobOnce(job);if(state!=='running')return;}catch(error){job=(await all(JOBS)).find(j=>j.id===jobId)||job;job.message=`Server status unavailable · ${String(error?.message||error)}`;await put(JOBS,job);emit();render();}await new Promise(resolve=>setTimeout(resolve,SERVER_JOB_POLL_MS));}
 }
 async function runServerJobOnce(job){
  if(!window.GenreactrixCloudApi?.isConfigured?.())return false;
  const prepared=await prepareServerJobManifest(job);if(!prepared)return false;
  try{
   let remoteState='';
   if(!job.serverJobId){
    await updateJob(job,{state:'queued',execution:'server-preparing',message:`Preparing server handoff · ${prepared.manifest.length} images`});
    const created=await window.GenreactrixCloudApi.createServerJob({clientJobId:job.id,config:{themeSweep:clone(job.config.themeSweep||null),themeRerun:clone(job.config.themeRerun||null),descriptionRerun:clone(job.config.descriptionRerun||null),components:clone(job.config.components||{}),siteBuild:window.GENREACTRIX_BUILD||null},items:prepared.manifest}),remote=created?.result||created,serverJobId=remote?.job?.id;
    if(!serverJobId)throw new Error('Worker did not return a server job id');
    job.serverJobId=serverJobId;job.execution='server-preparing';remoteState=String(remote?.job?.state||'');await put(JOBS,job);
   }else{
    const status=await window.GenreactrixCloudApi.serverJobStatus(job.serverJobId),remote=status?.result||status;
    remoteState=String(remote?.job?.state||'');
   }

   if(['running','completed','completed-with-failures','failed','cancelled'].includes(remoteState)){
    job.execution='server';job.state='running';job.startedAt=job.startedAt||now();job.stopRequested=false;job.serverState=remoteState;job.message=`Reattached to server · ${remoteState}`;await put(JOBS,job);
    await q()?.setJobState?.(`queue_${job.id}`,'running',job.message);await markServerItemsInFlight(job);emit();render();
    const state=await syncServerJobOnce(job);if(state==='running')await monitorServerJob(job.id);return true;
   }
   if(remoteState==='paused'){
    job.execution='server';job.state='paused';job.serverState='paused';job.message='Server job is paused';await put(JOBS,job);await q()?.setJobState?.(`queue_${job.id}`,'paused',job.message);emit();render();return true;
   }

   await uploadServerLocalImages(job,job.serverJobId,prepared.uploads);
   const started=await window.GenreactrixCloudApi.startServerJob(job.serverJobId),startedRemote=started?.result||started;
   remoteState=String(startedRemote?.job?.state||'running');
   job.execution='server';job.state='running';job.startedAt=job.startedAt||now();job.stopRequested=false;job.serverState=remoteState;job.message=`Running on server · ${job.total} images`;await put(JOBS,job);await q()?.setJobState?.(`queue_${job.id}`,'running','AI analysis running on server');await markServerItemsInFlight(job);emit();render();
   const state=await syncServerJobOnce(job);if(state==='running')await monitorServerJob(job.id);return true;
  }catch(error){
   const attached=Boolean(job.serverJobId);
   job.execution=attached?'server-preparing':null;job.state='paused';job.message=`Server handoff failed · ${String(error?.message||error)}`;
   await put(JOBS,job);await q()?.setJobState?.(`queue_${job.id}`,'paused',job.message);emit();render();throw error;
  }
 }
 async function runServerJob(job){
  const key=String(job?.id||'');if(!key)return false;
  const existing=SERVER_JOB_HANDOFFS.get(key);if(existing)return existing;
  const promise=runServerJobOnce(job);SERVER_JOB_HANDOFFS.set(key,promise);
  try{return await promise;}finally{if(SERVER_JOB_HANDOFFS.get(key)===promise)SERVER_JOB_HANDOFFS.delete(key);}
 }
 async function run(jobId){
  let job=(await all(JOBS)).find(j=>j.id===jobId);if(!job)return;
  if(job.execution==='server'&&job.serverJobId){if(job.state==='running')return monitorServerJob(job.id);if(job.state==='paused')return;}
  if(job.execution==='server-preparing'&&job.serverJobId){const capable=await serverJobCapability();if(capable)return runServerJob(job);}
  if(await serverJobCapability()){const prepared=await prepareServerJobManifest(job);if(prepared)return runServerJob(job);}
  return runLocal(jobId);
 }

 function isGlobalProviderFailure(message){return /unauthorized|analysis access is not configured|ai worker url is not configured|failed to fetch|networkerror|load failed|workers ai binding ai is not configured|rate limit|quota|ai attempt\/artifact history|ai artifact transaction|indexeddb/i.test(String(message||''))}
 async function runLocal(jobId){
  let job=(await all(JOBS)).find(j=>j.id===jobId);
  if(!job||job.state==='running')return;
  if(!window.GenreactrixCloudApi?.isConfigured?.()){await updateJob(job,{state:'queued',message:'Waiting for AI Worker configuration'});await q()?.setJobState?.(`queue_${job.id}`,'queued','Waiting for AI Worker configuration');return;}
  await updateJob(job,{state:'running',startedAt:job.startedAt||now(),stopRequested:false});await q()?.setJobState?.(`queue_${job.id}`,'running','AI analysis running');
  const items=(await byIndex(ITEMS,'jobId',job.id)).sort((a,b)=>a.order-b.order);
  let fatalMessage='';
  for(const item of items){
   job=(await all(JOBS)).find(j=>j.id===job.id);
   while(job.state==='paused'){await new Promise(r=>setTimeout(r,250));job=(await all(JOBS)).find(j=>j.id===job.id)}
   if(job.stopRequested||job.state==='cancelled')break;
   if(!['queued','failed'].includes(item.state))continue;
   const currentRecord=window.genreactrixImageRecordEngine?.get?.(item.imageId,{touch:false});if(['quarantine','defective'].includes(String(currentRecord?.workflow?.stage||'')))continue;
   try{const state=await processItem(job,item);job.processing=0;if(state==='complete')job.completed++;else job.failed++}
   catch(error){
    item.state='failed';item.error=String(error.message||error);finishLiveItem(job.id,'failed',item.error);await put(ITEMS,item);await q()?.setItemState?.(`queue_${item.id}`,'failed',{error:item.error});job.processing=0;job.failed++;
    for(const c of item.components){if(c.state==='queued'||c.state==='processing')c.state='failed';const field=COMPONENTS.find(([id])=>id===c.component)?.[2];window.genreactrixImageRecordEngine.setComponent(item.imageId,field,'failed')}
    let pipelineAttemptId=null;try{const ae=window.genreactrixAiArtifactEngine;if(ae){const requested=(item.components||[]).map(c=>c.component),componentBehaviors=Object.fromEntries((item.components||[]).map(c=>[c.component,c.behavior])),guidance=String(job.config.analysisGuidance||'').trim().slice(0,6000),mode=job.config.descriptionRerun?.operation?`description-${String(job.config.descriptionRerun.operation)}`:(job.config.themeRerun?'themes-director-workspace':ae.attemptMode({requested,componentBehaviors,themeUseAnalysis:Boolean(job.config.themeUseAnalysis),directReactionUseAnalysis:Boolean(job.config.directReactionUseAnalysis),reactionRerunSources:clone(job.config.reactionRerunSources||null),directorGuidance:guidance}));const attempt=await ae.beginAttempt({imageId:item.imageId,jobId:job.id,itemId:item.id,itemAttemptId:item.currentAttemptId,components:requested,componentBehaviors,mode:`pipeline:${mode}`,directorGuidance:guidance,inputRefs:{imageId:item.imageId,descriptionRerun:clone(job.config.descriptionRerun||null),themeRerun:clone(job.config.themeRerun||null)},configRefs:{projectId:window.genreactrixSettingsEngine?.get?.('project.id')||'',promptRefs:clone(job.config.promptRefs||{}),configuredPromptVersion:window.genreactrixSettingsEngine?.get?.('ai.prompt.version')||'',reactionArchitecture:'theme-derived-six-equal-slots-v1',reactionAiScan:false,descriptionRerun:clone(job.config.descriptionRerun||null),themeRerun:clone(job.config.themeRerun||null)}});pipelineAttemptId=attempt.id;await ae.failAttempt(attempt.id,item.error)}}catch(historyError){console.warn('AI pipeline failure attempt could not be recorded',historyError)}
    await window.genreactrixHistoryEngine.append({imageId:item.imageId,eventType:'ai-failed',actor:'system',sourceEngine:'ai-analysis',jobId:job.id,summary:item.error,payload:{attemptId:pipelineAttemptId,error:item.error,components:item.components,directorGuidance:String(job.config.analysisGuidance||'').trim().slice(0,6000),reactionRerunSources:clone(job.config.reactionRerunSources||null),descriptionRerun:clone(job.config.descriptionRerun||null),themeRerun:clone(job.config.themeRerun||null)}}).catch(()=>{});
    if(isThemeRerunConfig(job.config))restoreThemeRerunLifecycle(item,'theme-rerun-lifecycle-guard-error');else window.genreactrixLifecycleEngine?.reconcileAfterAi?.(item.imageId,{jobId:job.id,attemptId:item.currentAttemptId||`${item.id}:attempt:${item.attempts||1}`,error:item.error,globalFailure:isGlobalProviderFailure(item.error)});
    if(isGlobalProviderFailure(item.error))fatalMessage=item.error;
   }
   await updateJob(job,{completed:job.completed,failed:job.failed,processing:0});
   if(fatalMessage)break;
  }
  job=(await all(JOBS)).find(j=>j.id===job.id);
  if(fatalMessage){const message=`Paused after provider failure: ${fatalMessage}`;await updateJob(job,{state:'paused',processing:0,message});await q()?.setJobState?.(`queue_${job.id}`,'paused',message);render();return;}
  const stopped=job.stopRequested||job.state==='cancelled';const finalState=stopped?'cancelled':(job.failed?'completed-with-failures':'completed');
  let finalMessage=stopped?'Stopped safely':(job.failed?`Completed with ${job.failed} failure(s)`:'Completed');
  const sweepConfig=job.config?.themeSweep,themeSweepManaged=Boolean(sweepConfig?.managed&&sweepConfig?.sweepId);
  if(!stopped&&themeSweepManaged){
   const sweepEngine=window.genreactrixThemeSweepEngine,pass=Math.max(1,Math.min(3,Number(sweepConfig.pass)||1)),sweep=sweepEngine?.get?.(sweepConfig.sweepId),passIds=sweep?.passes?.[String(pass)]?.imageIds||sweep?.passes?.[pass]?.imageIds||[];
   if(!sweepEngine||!sweep)throw new Error('Theme Sweep state is unavailable');
   const outcome=sweepEngine.evaluate(passIds,pass);
   // A Theme Sweep pass is atomic. Technical/format failures are corrected inside
   // the same pass, under the same Theme order, before any result is released or
   // any later pass is allowed to start. The existing Retry Failed control reruns
   // only those failed items on this same AI job.
   if(outcome.failedIds.length){
    sweepEngine.blockPassForFailures?.(sweep.id,pass,{...outcome,imageIds:[...passIds]});
    finalMessage+=` · Theme Sweep Pass ${pass}: ${outcome.successful}/${outcome.analyzed} valid · ${outcome.failedIds.length} failed · automatic recovery`;
    await updateJob(job,{state:'completed-with-failures',completedAt:now(),message:finalMessage});await q()?.setJobState?.(`queue_${job.id}`,'completed-with-failures',finalMessage);render();
    setTimeout(()=>autoAdvanceBlockedThemeSweep(job.id).catch(error=>markAiAutoRecoveryFailure(job.id,error)),0);
    return;
   }
   sweepEngine.finishPass(sweep.id,pass,outcome);
   const tripletLabel=outcome.triplet?.labels?.join(' / ')||outcome.triplet?.codes?.join(' / ')||'';
   finalMessage+=pass<3?(outcome.holdIds.length?` · Theme Sweep pass ${pass}: ${outcome.holdIds.length} held${tripletLabel?` for ${tripletLabel}`:''}`:` · Theme Sweep pass ${pass}: all released`):` · Theme Sweep verification: ${outcome.releaseIds.length} released`;
   await updateJob(job,{state:finalState,completedAt:now(),message:finalMessage});await q()?.setJobState?.(`queue_${job.id}`,finalState,finalMessage);render();
   if(pass<3&&outcome.holdIds.length){
    const nextPass=pass+1,next=sweepEngine.prepareNext(sweep.id,nextPass,outcome.holdIds),components=componentMap();components.themes={enabled:true,behavior:'reanalyze'};if(job.config?.components?.genreReasons?.enabled)components.genreReasons={enabled:true,behavior:'reanalyze'};if(job.config?.themeSweep?.persistDescription)components.description={enabled:true,behavior:'reanalyze'};
    const nextConfig={target:'selected',imageIds:[...next.imageIds],quantityMode:'all',quantity:next.imageIds.length,order:'queue',components,promptRefs:clone(job.config.promptRefs||{}),themeSweep:{managed:true,sweepId:sweep.id,pass:nextPass,orderMode:'shuffled',orderSeed:next.orderSeed,rootJobId:sweep.rootJobId||job.id,persistDescription:Boolean(job.config?.themeSweep?.persistDescription)}};
    const nextJob=await createJob(nextConfig);if(nextJob?.id){sweepEngine.attachPassJob(sweep.id,nextPass,nextJob.id,next.imageIds,next.orderSeed);await run(nextJob.id);}else{console.warn('Theme Sweep recovery pass could not be queued',nextJob);}
   }else setTimeout(()=>maintainActiveMode().catch(console.warn),0);
   return;
  }
  if(!stopped&&!isThemeRerunConfig(job.config)){
   const staged=window.genreactrixLifecycleEngine?.snapshot?.().staged||0;
   if(staged)finalMessage+=` · ${staged} Staged · ready for manual Bundle`;
  }
  await updateJob(job,{state:finalState,completedAt:now(),message:finalMessage});await q()?.setJobState?.(`queue_${job.id}`,finalState,finalMessage);render();
  if(!stopped&&!isThemeRerunConfig(job.config)){if(job.failed)setTimeout(()=>autoRecoverCompletedJob(job.id).catch(error=>markAiAutoRecoveryFailure(job.id,error)),0);else setTimeout(()=>maintainActiveMode().catch(console.warn),0);}
 }
 async function pause(id){const j=(await all(JOBS)).find(x=>x.id===id);if(j?.state==='running'){if(j.execution==='server'&&j.serverJobId)await window.GenreactrixCloudApi.controlServerJob(j.serverJobId,'pause');await updateJob(j,{state:'paused',message:j.execution==='server'?'Pausing server job after current image':'Paused safely'});await q()?.setJobState?.(`queue_${id}`,'paused',j.message)}}
 async function resume(id){const j=(await all(JOBS)).find(x=>x.id===id);if(j&&['paused','queued'].includes(j.state)){if(j.execution==='server'&&j.serverJobId){await window.GenreactrixCloudApi.controlServerJob(j.serverJobId,'resume');await updateJob(j,{state:'running',message:'Resuming on server'});await q()?.setJobState?.(`queue_${id}`,'running','Resuming on server');monitorServerJob(id);return;}await updateJob(j,{state:'queued',message:'Resuming'});await q()?.setJobState?.(`queue_${id}`,'queued','Resuming');run(id)}}
 async function stop(id){const j=(await all(JOBS)).find(x=>x.id===id);if(j&&['running','paused','queued'].includes(j.state)){if(j.execution==='server'&&j.serverJobId)await window.GenreactrixCloudApi.controlServerJob(j.serverJobId,'cancel').catch(()=>{});const items=await byIndex(ITEMS,'jobId',id);await updateJob(j,{stopRequested:true,state:'cancelled',message:'Stopped safely',completedAt:now()});for(const item of items.filter(item=>['queued','processing','failed'].includes(item.state))){item.state='cancelled';item.error='Stopped by user';for(const c of item.components||[])if(['queued','processing','failed'].includes(c.state))c.state='cancelled';await put(ITEMS,item);await q()?.setItemState?.(`queue_${item.id}`,'cancelled',{error:'Stopped by user'});if(isThemeRerunConfig(j.config))restoreThemeRerunLifecycle(item,'theme-rerun-lifecycle-guard-stopped');else window.genreactrixLifecycleEngine?.reconcileAfterAi?.(item.imageId,{jobId:id,attemptId:item.currentAttemptId||item.id})}await q()?.setJobState?.(`queue_${id}`,'cancelled','Stopped safely')}}
 async function reconcileCancelledJobs(){const jobs=await all(JOBS);for(const job of jobs.filter(j=>j.state==='cancelled')){const items=await byIndex(ITEMS,'jobId',job.id);for(const item of items.filter(i=>['queued','processing'].includes(i.state))){item.state='cancelled';item.error='Recovered cancelled job';for(const c of item.components||[])if(['queued','processing'].includes(c.state))c.state='cancelled';await put(ITEMS,item);await q()?.setItemState?.(`queue_${item.id}`,'cancelled',{error:'Recovered cancelled job'})}await q()?.setJobState?.(`queue_${job.id}`,'cancelled','Stopped safely')}}
 async function recoverInterruptedAiJobs(){const jobs=await all(JOBS);let recovered=0;for(const job of jobs.filter(j=>j.state==='running'&&j.execution!=='server')){const items=await byIndex(ITEMS,'jobId',job.id);for(const item of items.filter(i=>i.state==='processing')){item.state='queued';item.error='Recovered after page reload';for(const c of item.components||[])if(c.state==='processing')c.state='queued';await put(ITEMS,item);await q()?.setItemState?.(`queue_${item.id}`,'queued',{error:'Recovered after page reload'});if(isThemeRerunConfig(job.config))restoreThemeRerunLifecycle(item,'theme-rerun-lifecycle-guard-reload');else window.genreactrixLifecycleEngine?.reconcileAfterAi?.(item.imageId,{jobId:job.id,attemptId:item.id});recovered++}job.state='queued';job.processing=0;job.stopRequested=false;job.message='Recovered after page reload';await put(JOBS,job);await q()?.setJobState?.(`queue_${job.id}`,'queued','Recovered after page reload');recovered++}if(recovered)emit();return recovered}
 async function autoRecoverCompletedJob(id){
  const jobs=await all(JOBS),job=jobs.find(x=>x.id===id);if(!job||job.stopRequested||job.state==='cancelled'||job.state==='paused')return false;
  if(job.config?.themeSweep?.managed&&job.config?.themeSweep?.sweepId){const advanced=await autoAdvanceBlockedThemeSweep(id);if(advanced)return true;}
  const items=await byIndex(ITEMS,'jobId',id),failedItems=items.filter(item=>item.state==='failed');if(!failedItems.length)return false;
  const retryable=failedItems.filter(item=>{const record=window.genreactrixImageRecordEngine?.get?.(item.imageId,{touch:false});return !['quarantine','defective'].includes(String(record?.workflow?.stage||''));});
  if(retryable.length){job.message=`Automatic recovery · retrying ${retryable.length} failed image${retryable.length===1?'':'s'}`;await put(JOBS,job);await q()?.setJobState?.(`queue_${id}`,'completed-with-failures',job.message).catch(()=>{});render();setTimeout(()=>retryFailed(id).catch(error=>markAiAutoRecoveryFailure(id,error)),0);return true;}
  const staged=Number(window.genreactrixLifecycleEngine?.snapshot?.().staged)||0;job.message=`${failedItems.length} failed image${failedItems.length===1?'':'s'} isolated in Quarantine/Defective${staged?` · ${staged} Staged · ready for manual Bundle`:''}`;await put(JOBS,job);await q()?.setJobState?.(`queue_${id}`,'completed-with-failures',job.message).catch(()=>{});render();setTimeout(()=>maintainActiveMode().catch(console.warn),0);return true;
 }
 async function markAiAutoRecoveryFailure(id,error){
  const jobs=await all(JOBS),job=jobs.find(x=>x.id===id);if(!job)return;job.autoRecoveryError=String(error?.message||error);job.message=`Automatic AI recovery needs attention · ${job.autoRecoveryError}`;await put(JOBS,job);await q()?.setJobState?.(`queue_${id}`,'completed-with-failures',job.message).catch(()=>{});render();
 }
 async function autoAdvanceBlockedThemeSweep(id){
  const jobs=await all(JOBS),job=jobs.find(x=>x.id===id);if(!job)return false;const cfg=job.config?.themeSweep;if(!cfg?.managed||!cfg?.sweepId)return false;
  const sweepEngine=window.genreactrixThemeSweepEngine;let sweep=sweepEngine?.get?.(cfg.sweepId);if(sweep&&sweepEngine?.recoverResidualPass)sweep=sweepEngine.recoverResidualPass(cfg.sweepId)||sweep;const pass=Math.max(1,Math.min(3,Number(cfg.pass)||1)),passState=sweep?.passes?.[String(pass)]||sweep?.passes?.[pass];if(!sweepEngine||!sweep||passState?.state!=='blocked')return false;
  const passIds=passState.imageIds||[],outcome=sweepEngine.evaluate(passIds,pass),failed=[...outcome.failedIds],valid=Math.max(0,outcome.analyzed-failed.length);if(!failed.length)return false;
  const retryable=failed.filter(imageId=>{const record=window.genreactrixImageRecordEngine?.get?.(String(imageId),{touch:false});return !['quarantine','defective'].includes(String(record?.workflow?.stage||''));});
  if(retryable.length){job.autoRecoveryError='';job.message=`Theme Sweep Pass ${pass}: retrying ${retryable.length} failed image${retryable.length===1?'':'s'} automatically`;await put(JOBS,job);await q()?.setJobState?.(`queue_${id}`,'completed-with-failures',job.message).catch(()=>{});render();setTimeout(()=>retryFailed(id).catch(error=>markAiAutoRecoveryFailure(id,error)),0);return true;}
  if(valid>0){job.autoRecoveryError='';job.message=`Theme Sweep Pass ${pass}: ${failed.length} image${failed.length===1?'':'s'} isolated · continuing automatically with ${valid}`;await put(JOBS,job);await q()?.setJobState?.(`queue_${id}`,'completed-with-failures',job.message).catch(()=>{});render();setTimeout(()=>continueThemeSweepWithValid(id,{automatic:true}).catch(error=>markAiAutoRecoveryFailure(id,error)),0);return true;}
  sweepEngine.forceFinishPass?.(sweep.id,pass,{...outcome,holdIds:[],abandonedFailedIds:failed,forcedContinue:true});job.state='completed-with-failures';job.completedAt=job.completedAt||now();job.autoRecoveryError='';job.message=`Theme Sweep Pass ${pass}: all ${failed.length} image${failed.length===1?'':'s'} isolated in Quarantine/Defective · sweep ended`;await put(JOBS,job);await q()?.setJobState?.(`queue_${id}`,'completed-with-failures',job.message).catch(()=>{});render();setTimeout(()=>maintainActiveMode().catch(console.warn),0);return true;
 }
 async function continueThemeSweepWithValid(id,{automatic=false}={}){
  const jobs=await all(JOBS),job=jobs.find(x=>x.id===id);if(!job)return;const cfg=job.config?.themeSweep;if(!cfg?.managed||!cfg?.sweepId){job.message='Selected job is not a managed Theme Sweep pass';await put(JOBS,job);render();return;}
  const sweepEngine=window.genreactrixThemeSweepEngine;let sweep=sweepEngine?.get?.(cfg.sweepId);if(sweep&&sweepEngine?.recoverResidualPass)sweep=sweepEngine.recoverResidualPass(cfg.sweepId)||sweep;const pass=Math.max(1,Math.min(3,Number(cfg.pass)||1)),passState=sweep?.passes?.[String(pass)]||sweep?.passes?.[pass];
  if(!sweepEngine||!sweep||passState?.state!=='blocked'){job.message='Theme Sweep pass is not blocked by failures';await put(JOBS,job);render();return;}
  const passIds=passState.imageIds||[],outcome=sweepEngine.evaluate(passIds,pass),failed=[...outcome.failedIds],valid=Math.max(0,outcome.analyzed-failed.length);
  if(!failed.length){job.message='No failed images remain in this Theme Sweep pass';await put(JOBS,job);render();return;}
  if(!valid){job.message='Cannot continue: this pass has no valid Theme results';await put(JOBS,job);render();return;}
  if(!automatic){const ok=window.confirm(`Pass ${pass} has ${valid}/${outcome.analyzed} valid. Continue with ${valid}? ${failed.length} failed image${failed.length===1?'':'s'} will remain held and excluded from Theme Sweep and Bundling.`);if(!ok)return;}
  const failedSet=new Set(failed),recoveryIds=outcome.holdIds.filter(imageId=>!failedSet.has(String(imageId)));
  sweepEngine.forceFinishPass?.(sweep.id,pass,{...outcome,holdIds:recoveryIds,abandonedFailedIds:failed,forcedContinue:true});
  const tripletLabel=outcome.triplet?.labels?.join(' / ')||outcome.triplet?.codes?.join(' / ')||'';let message=`Theme Sweep Pass ${pass}: continued with ${valid}/${outcome.analyzed} valid · ${failed.length} failed held`;
  if(pass<3)message+=recoveryIds.length?` · ${recoveryIds.length} rerunning${tripletLabel?` for ${tripletLabel}`:''}`:' · no recovery subset';else message+=` · ${outcome.releaseIds.length} valid released`;
  job.state='completed-with-failures';job.completedAt=job.completedAt||now();job.autoRecoveryError='';job.message=message;await put(JOBS,job);await q()?.setJobState?.(`queue_${job.id}`,'completed-with-failures',message);render();
  if(pass<3&&recoveryIds.length){const nextPass=pass+1,next=sweepEngine.prepareNext(sweep.id,nextPass,recoveryIds),components=componentMap();components.themes={enabled:true,behavior:'reanalyze'};if(job.config?.components?.genreReasons?.enabled)components.genreReasons={enabled:true,behavior:'reanalyze'};if(job.config?.themeSweep?.persistDescription)components.description={enabled:true,behavior:'reanalyze'};const nextConfig={target:'selected',imageIds:[...next.imageIds],quantityMode:'all',quantity:next.imageIds.length,order:'queue',components,promptRefs:clone(job.config.promptRefs||{}),themeSweep:{managed:true,sweepId:sweep.id,pass:nextPass,orderMode:'shuffled',orderSeed:next.orderSeed,rootJobId:sweep.rootJobId||job.id,persistDescription:Boolean(job.config?.themeSweep?.persistDescription)}};const nextJob=await createJob(nextConfig);if(nextJob?.id){sweepEngine.attachPassJob(sweep.id,nextPass,nextJob.id,next.imageIds,next.orderSeed);await run(nextJob.id);}else console.warn('Theme Sweep override recovery pass could not be queued',nextJob);}
  else setTimeout(()=>maintainActiveMode().catch(console.warn),0);
 }
 async function retryFailed(id){const items=await byIndex(ITEMS,'jobId',id),j=(await all(JOBS)).find(x=>x.id===id);if(j?.execution==='server'&&j.serverJobId){let queued=0;const retryItemIds=[];for(const item of items.filter(i=>i.state==='failed')){const record=window.genreactrixImageRecordEngine?.get?.(item.imageId,{touch:false});if(['quarantine','defective'].includes(String(record?.workflow?.stage||'')))continue;item.state='processing';item.error='';item.currentAttemptId=`${item.id}:server:${Math.max(1,(Number(item.attempts)||0)+1)}`;item.attempts=Math.max(1,(Number(item.attempts)||0)+1);item.components.forEach(c=>{if(c.state==='failed'){c.state='processing';const field=COMPONENTS.find(([id])=>id===c.component)?.[2];if(field&&record)window.genreactrixImageRecordEngine?.setComponent?.(record.id,field,'processing')}});if(record&&!isThemeRerunConfig(j.config))window.genreactrixLifecycleEngine?.markAiProcessing?.(item.imageId,{jobId:j.id,attemptId:item.currentAttemptId,execution:'server-retry'});await put(ITEMS,item);retryItemIds.push(item.id);queued++;}if(queued){await window.GenreactrixCloudApi.controlServerJob(j.serverJobId,'retry-failed',{itemIds:retryItemIds});j.state='running';j.failed=0;j.autoRecoveryError='';j.message='Retrying failed items on server';await put(JOBS,j);await q()?.setJobState?.(`queue_${id}`,'running',j.message);const sweep=j.config?.themeSweep;if(sweep?.managed&&sweep?.sweepId)window.genreactrixThemeSweepEngine?.markPassRetrying?.(sweep.sweepId,Math.max(1,Math.min(3,Number(sweep.pass)||1)));monitorServerJob(id);}else{j.message='No retryable failures · Quarantine requires manual investigation';await put(JOBS,j);render()}return;}let queued=0;for(const item of items.filter(i=>i.state==='failed')){const record=window.genreactrixImageRecordEngine?.get?.(item.imageId,{touch:false});if(['quarantine','defective'].includes(String(record?.workflow?.stage||'')))continue;item.state='queued';item.error='';item.components.forEach(c=>{if(c.state==='failed')c.state='queued'});await put(ITEMS,item);queued++}if(j&&queued){j.state='queued';j.failed=items.filter(i=>i.state==='failed').length;j.completed=items.filter(i=>i.state==='complete').length;j.autoRecoveryError='';j.message='Retry queued';await put(JOBS,j);const sweep=j.config?.themeSweep;if(sweep?.managed&&sweep?.sweepId)window.genreactrixThemeSweepEngine?.markPassRetrying?.(sweep.sweepId,Math.max(1,Math.min(3,Number(sweep.pass)||1)));run(id)}else if(j){j.message='No retryable failures · Quarantine requires manual investigation';await put(JOBS,j);render()}}
 async function resumeStrandedJobs(){window.GenreactrixCloudApi?.reload?.();if(!window.GenreactrixCloudApi?.isConfigured?.())return 0;const jobs=await all(JOBS);let resumed=0;for(const job of jobs){const duplicateHandoffFailure=job.state==='paused'&&/server handoff failed[\s\S]*unique constraint failed:\s*ai_job_items\.id/i.test(String(job.message||''));if(duplicateHandoffFailure){job.state='queued';job.execution=null;job.serverJobId=null;job.message='Recovering duplicate server handoff';await put(JOBS,job);await q()?.setJobState?.(`queue_${job.id}`,'queued',job.message);await run(job.id);resumed++;continue;}if(job.execution==='server'&&job.serverJobId&&job.state==='running'){monitorServerJob(job.id);resumed++;continue;}if(job.execution==='server-preparing'&&job.serverJobId&&['queued','paused'].includes(job.state)){run(job.id).catch(console.warn);resumed++;continue;}if(job.state==='queued'){await run(job.id);resumed++;continue;}if(job.state==='completed-with-failures'&&job.config?.autoOrchestration===true){const advanced=await autoRecoverCompletedJob(job.id).catch(error=>{markAiAutoRecoveryFailure(job.id,error);return false});if(advanced)resumed++;}}return resumed}
 function automaticOutputs(){const defaults=window.genreactrixSettingsEngine?.get?.('ai.components.default',{})||{};return{reactions:true,themes:true,description:true,reactionReasons:Boolean(defaults.reactionReasons),genreReasons:true}}
 function automaticEligibleCount(){return eligibleRecords({target:'current',quantityMode:'all',order:'queue',components:{reactions:{enabled:true,behavior:'analyze'},themes:{enabled:true,behavior:'analyze'},description:{enabled:true,behavior:'analyze'}}}).filter(r=>['aiReactions','aiThemes','aiDescription'].some(key=>['missing','stale','failed','partial'].includes(r.components?.[key]||'missing'))).length}
 function bufferPolicy(){
  const target=Math.max(0,Number(window.genreactrixSettingsEngine?.get?.('ai.buffer.target',25))||0),rawRefill=Math.max(0,Number(window.genreactrixSettingsEngine?.get?.('ai.buffer.refillThreshold',10))||0),refillThreshold=Math.min(target,rawRefill),priority=String(window.genreactrixSettingsEngine?.get?.('ai.lookAhead.priority','low')||'low'),bundleSize=Math.max(1,Number(window.genreactrixSettingsEngine?.get?.('queue.bundle.size',50))||50),reserveFloor=priority==='high'?target:(priority==='normal'?refillThreshold:0);
  return{target,refillThreshold,rawRefillThreshold:rawRefill,priority:['low','normal','high'].includes(priority)?priority:'low',bundleSize,reserveFloor,bundleThreshold:bundleSize+reserveFloor};
 }
 function planBufferStep({staged=0,pending=0,available=0}={}){
  const p=bufferPolicy(),s=Math.max(0,Number(staged)||0),wait=Math.max(0,Number(pending)||0),a=Math.max(0,Number(available)||0);
  if(wait)return{action:'wait',count:0,reason:'ai-active',...p};
  if(s>=p.bundleThreshold)return{action:'bundle',count:p.bundleSize,reason:`${p.priority}-priority-bundle`,...p};
  const toBundle=Math.max(0,p.bundleThreshold-s);
  if(a>=toBundle&&toBundle>0)return{action:'queue',count:toBundle,reason:'prepare-priority-bundle',...p};
  if(s<=p.refillThreshold&&s<p.target&&a>0)return{action:'queue',count:Math.min(p.target-s,a),reason:'refill-buffer',...p};
  return{action:'hold',count:0,reason:s>=p.target?'buffer-held':'insufficient-for-bundle-above-refill',...p};
 }
 async function snapshot(){const jobs=await all(JOBS),items=await all(ITEMS),life=window.genreactrixLifecycleEngine?.snapshot?.()||{},policy=bufferPolicy();snapshotCache={pending:items.filter(i=>['queued','processing'].includes(i.state)).length,available:automaticEligibleCount(),output:Number(life.staged)||0,partial:Number(life.partial)||0,bufferTarget:policy.target,bufferRefillThreshold:policy.refillThreshold,bufferPriority:policy.priority,bufferReserveFloor:policy.reserveFloor,quickAddAmount:Math.max(1,Number(window.genreactrixSettingsEngine?.get?.('defaults.ai.quickAdd',100))||100),jobs,items};return clone(snapshotCache)}
 function snapshotCached(){return clone(snapshotCache)}
 async function queueNext(count,outputs=null,options={}){const map=componentMap(),selected=outputs||window.selectedPortraitAiOutputs?.()||{};for(const [key,on] of Object.entries(selected)){const normalized={'reaction-reasons':'reactionReasons','genre-reasons':'genreReasons'}[key]||key;if(map[normalized])map[normalized]={enabled:Boolean(on),behavior:'analyze'}}const config={target:'current',quantityMode:'next',quantity:count,order:'queue',components:map,skipFailed:Boolean(options.skipFailed)};const job=await createJob(config);if(job.total&&window.GenreactrixCloudApi?.isConfigured())await run(job.id);render();return job.total}
 async function maintainAutomaticFlow(){
  if(!Boolean(window.genreactrixSettingsEngine?.get?.('queue.flow.enabled',true)))return 0;
  if(maintainFlowPromise)return maintainFlowPromise;
  maintainFlowPromise=(async()=>{
   const snap=await snapshot();if(snap.pending)return 0;
   const size=Math.max(1,Number(window.genreactrixSettingsEngine?.get?.('queue.bundle.size',50))||50),staged=Number(window.genreactrixLifecycleEngine?.snapshot?.().staged)||0,available=automaticEligibleCount();
   if(staged>=size||!available)return 0;
   const needed=Math.max(1,size-staged);
   return queueNext(Math.min(needed,available),automaticOutputs(),{skipFailed:false});
  })();
  try{return await maintainFlowPromise}finally{maintainFlowPromise=null}
 }
 async function maintainBuffer(){
  if(Boolean(window.genreactrixSettingsEngine?.get?.('queue.flow.enabled',true)))return 0;
  if(!Boolean(window.genreactrixSettingsEngine?.get?.('ai.lookAhead.enabled',true)))return 0;
  if(maintainBufferPromise)return maintainBufferPromise;
  maintainBufferPromise=(async()=>{
   for(let guard=0;guard<100;guard++){
    const snap=await snapshot(),staged=Number(window.genreactrixLifecycleEngine?.snapshot?.().staged)||0,available=automaticEligibleCount(),plan=planBufferStep({staged,pending:snap.pending,available});
    if(plan.action==='wait'||plan.action==='hold')return 0;
    if(plan.action==='bundle')return 0;
    if(plan.action==='queue')return queueNext(plan.count,automaticOutputs(),{skipFailed:false});
   }
   console.warn('Buffer maintenance guard reached');return 0;
  })();
  try{return await maintainBufferPromise}finally{maintainBufferPromise=null}
 }
 async function maybeBundleAfterAi(){return[];}
 async function maintainActiveMode(){if(Boolean(window.genreactrixSettingsEngine?.get?.('ai.queue.holdUntilManualStart',false)))return 0;return Boolean(window.genreactrixSettingsEngine?.get?.('queue.flow.enabled',true))?maintainAutomaticFlow():maintainBuffer();}
 function emit(){window.dispatchEvent(new CustomEvent('genreactrix:ai-jobs'));render()}
 function configFromForm(){const components=componentMap();document.querySelectorAll('[data-ai-component]').forEach(row=>{const key=row.dataset.aiComponent;components[key]={enabled:row.querySelector('input').checked,behavior:row.querySelector('select').value}});const promptRefs={};for(const [key,v] of Object.entries(components))if(v.enabled){const p=window.genreactrixPromptLibraryEngine?.active?.(key);if(p)promptRefs[key]={id:p.id,version:p.version,name:p.name}}return{target:document.getElementById('aiTarget').value,quantity:Number(document.getElementById('aiQuantity').value)||100,quantityMode:document.getElementById('aiQuantityMode').value,order:document.getElementById('aiOrder').value,components,promptRefs}}
 function cycleEvent(message,level='info'){const log=window.genreactrixEventLog;const fn=level==='warn'?log?.warn:level==='error'?log?.error:log?.info;fn?.(message,'CYCLE');}
 function setCycleUi(running,message=''){
  const button=document.getElementById('aiCycleBtn'),status=document.getElementById('aiCycleStatus'),start=document.getElementById('aiStartJob');
  if(button){button.textContent=running?'Stop Cycle':'Cycle';button.classList.toggle('is-running',running);button.title=running?'Stop after the current AI operation':'Repeat Missing analysis for the frozen selection, up to three total passes';}
  if(start)start.disabled=running;if(status)status.textContent=message;
 }
 function missingComponentsFrom(config){const next=componentMap();for(const [key,value] of Object.entries(config.components||{}))if(value.enabled&&next[key])next[key]={enabled:true,behavior:'analyze'};return next;}
 function unresolvedForCycle(imageIds,components){
  const wanted=new Set((imageIds||[]).map(String)),records=(window.genreactrixImageRecordEngine?.all?.()||[]).filter(record=>wanted.has(String(record.id))),out=[];
  const selected=Object.entries(components||{}).filter(([,value])=>value.enabled);
  for(const record of records)for(const [component] of selected){const field=COMPONENTS.find(([id])=>id===component)?.[2],status=record.components?.[field]||'missing';if(['missing','stale','failed','partial'].includes(status))out.push(`${record.id}:${component}`);}
  return out.sort();
 }
 async function cycleMissing(){
  if(cycleRunning){cycleStopRequested=true;setCycleUi(true,'Stopping…');cycleEvent('Stop requested.','warn');if(cycleCurrentJobId)await stop(cycleCurrentJobId);return;}
  try{
   if(!window.GenreactrixCloudApi.isConfigured())throw new Error('Save a Worker URL before starting Cycle');
   const base=configFromForm(),components=missingComponentsFrom(base),enabled=Object.values(components).some(value=>value.enabled);if(!enabled)throw new Error('Choose at least one AI component');
   const selectionConfig={...base,components};
   const activeItems=(await all(ITEMS)).filter(item=>['queued','processing'].includes(item.state)),activeIds=new Set(activeItems.map(item=>String(item.imageId)));
   const initialRows=applyQuantity(eligibleRecords(selectionConfig).filter(record=>!activeIds.has(String(record.id))&&Object.entries(components).some(([component,value])=>value.enabled&&shouldRun(record,component,'analyze'))),selectionConfig);
   const imageIds=initialRows.map(record=>record.id);if(!imageIds.length)throw new Error('No matching images need Missing analysis');
   const cycleConfig={...base,target:'selected',imageIds,quantityMode:'all',quantity:imageIds.length,components};
   cycleRunning=true;cycleStopRequested=false;setCycleUi(true,`Cycle · ${imageIds.length} images`);cycleEvent(`Started with ${imageIds.length} frozen image${imageIds.length===1?'':'s'}.`);
   let finished=false;
   for(let pass=1;pass<=CYCLE_MAX_PASSES&&!cycleStopRequested;pass++){
    const before=unresolvedForCycle(imageIds,components);if(!before.length){setCycleUi(true,'Cycle complete · 0 unresolved');cycleEvent(`Pass ${pass}: nothing unresolved. Cycle complete.`);finished=true;break;}
    setCycleUi(true,`Cycle pass ${pass} of ${CYCLE_MAX_PASSES} · ${before.length} unresolved`);cycleEvent(`Pass ${pass} of ${CYCLE_MAX_PASSES} starting · ${before.length} unresolved image/component pair${before.length===1?'':'s'}.`);
    const job=await createJob(cycleConfig);
    if(job.total){cycleCurrentJobId=job.id;await run(job.id);const finalJob=(await all(JOBS)).find(item=>item.id===job.id);cycleCurrentJobId=null;if(cycleStopRequested||finalJob?.state==='cancelled'){setCycleUi(true,'Cycle stopped');cycleEvent(`Stopped during pass ${pass}.`,'warn');break;}if(finalJob?.state==='paused'){setCycleUi(true,'Cycle paused by provider error');cycleEvent(`Stopped because pass ${pass} paused: ${finalJob.message}`,'error');break;}}
    const unresolved=unresolvedForCycle(imageIds,components);
    if(!unresolved.length){setCycleUi(true,`Cycle complete · pass ${pass}`);cycleEvent(`Pass ${pass} completed with 0 unresolved. Cycle complete.`);finished=true;break;}
    cycleEvent(`Pass ${pass} completed · ${unresolved.length} unresolved remain.`,'warn');
    if(pass===CYCLE_MAX_PASSES){const imageCount=new Set(unresolved.map(value=>value.split(':')[0])).size;setCycleUi(true,`Cycle limit · ${imageCount} image${imageCount===1?'':'s'} unresolved`);cycleEvent(`Cycle stopped after ${CYCLE_MAX_PASSES} total passes. ${imageCount} image${imageCount===1?'':'s'} remain unresolved across ${unresolved.length} selected component${unresolved.length===1?'':'s'}.`,'warn');finished=true;}
   }
   if(cycleStopRequested&&!finished)setCycleUi(true,'Cycle stopped');
  }catch(error){setCycleUi(false,String(error.message||error));cycleEvent(String(error.message||error),'error');return;}
  finally{cycleRunning=false;cycleCurrentJobId=null;const status=document.getElementById('aiCycleStatus')?.textContent||'';setCycleUi(false,status);render();}
 }
 async function render(){
  const snap=await snapshot();
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v)};
  set('portraitAiOutputCount',snap.output);set('portraitAiPendingCount',snap.pending);set('portraitAiBufferTarget',snap.bufferTarget);
  set('aiDialogQueued',snap.items.filter(i=>i.state==='queued').length);set('aiDialogRunning',snap.items.filter(i=>i.state==='processing').length);set('aiDialogDone',snap.items.filter(i=>i.state==='complete').length);set('aiDialogFailed',snap.items.filter(i=>i.state==='failed').length);
  const ordered=[...snap.jobs].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const latest=ordered[0], selectedId=document.getElementById('aiJobSummary')?.dataset.jobId||latest?.id||'';
  const selected=ordered.find(j=>j.id===selectedId)||latest;
  const sweepOverride=document.getElementById('aiThemeSweepContinueValid');if(sweepOverride){const sc=selected?.config?.themeSweep,engine=window.genreactrixThemeSweepEngine;let sweep=sc?.managed&&sc?.sweepId?engine?.get?.(sc.sweepId):null;if(sweep&&engine?.recoverResidualPass)sweep=engine.recoverResidualPass(sc.sweepId)||sweep;const pass=Math.max(1,Math.min(3,Number(sc?.pass)||1)),ps=sweep?.passes?.[String(pass)]||sweep?.passes?.[pass],failed=Array.isArray(ps?.failedIds)?ps.failedIds.length:0,total=Number(ps?.imageIds?.length)||Number(ps?.analyzed)||0,valid=Math.max(0,total-failed),show=Boolean(selected&&selected.autoRecoveryError&&ps?.state==='blocked'&&failed>0&&valid>0);sweepOverride.hidden=!show;sweepOverride.textContent=show?`Continue with ${valid}`:'Continue with valid';sweepOverride.title=show?`Leave ${failed} failed image${failed===1?'':'s'} held and continue Theme Sweep with ${valid} valid result${valid===1?'':'s'}.`:'';}
  const progress=document.getElementById('aiJobProgress');if(progress)progress.value=selected?.total?Math.round(((selected.completed+selected.failed)/selected.total)*100):0;
  const summary=document.getElementById('aiJobSummary');if(summary){summary.dataset.jobId=selected?.id||'';summary.textContent=selected?`${selected.message} · ${selected.completed}/${selected.total} complete · ${selected.failed} failed`:'No AI job selected.'}
  const list=document.getElementById('aiJobList');if(list)list.innerHTML=ordered.slice(0,20).map(j=>`<button type="button" class="ai-job-row ${j.id===selected?.id?'is-selected':''}" data-ai-job-id="${j.id}"><span>${j.state}<small>${new Date(j.createdAt).toLocaleString()} · ${j.message}</small></span><strong>${j.completed}/${j.total}</strong></button>`).join('')||'<div class="ai-job-detail">No AI jobs.</div>';
  const detail=document.getElementById('aiJobDetail');if(detail){const live=selected?LIVE_JOBS.get(selected.id):null;if(live)detail.textContent=liveDetailText(live,selected);else if(!selected)detail.textContent='Select a job to inspect its target, components, failures, provider and prompt versions.';else{const enabled=Object.entries(selected.config?.components||{}).filter(([,v])=>v.enabled).map(([k,v])=>`${k}: ${v.behavior}`).join(', '),failures=snap.items.filter(i=>i.jobId===selected.id&&i.error).slice(-3).map(i=>i.error),failureText=failures.length?`\nLatest failure: ${failures[failures.length-1]}`:'';detail.textContent=`${selected.id}\nTarget: ${selected.config?.target||'—'} · ${selected.config?.quantityMode||'—'} ${selected.config?.quantity||''}\nOrder: ${selected.config?.order||'—'}\nComponents: ${enabled||'none'}\nCreated: ${selected.createdAt}\nState: ${selected.state} · ${selected.message}${failureText}`}}
  const pre=document.getElementById('aiPreflight');if(pre){try{const cfg=configFromForm();const enabled=Object.entries(cfg.components).filter(([,v])=>v.enabled),activeImageIds=new Set(snap.items.filter(i=>['queued','processing'].includes(i.state)).map(i=>i.imageId));const eligibleRows=eligibleRecords(cfg).filter(r=>!activeImageIds.has(r.id)&&enabled.some(([c,v])=>shouldRun(r,c,v.behavior))),eligible=eligibleRows.length,willRun=applyQuantity(eligibleRows,cfg).length;pre.textContent=`${eligible} eligible image${eligible===1?'':'s'} · ${willRun} will run · ${enabled.length} component${enabled.length===1?'':'s'} selected`;}catch(e){pre.textContent=e.message}}
  window.renderPortraitControlStation?.();
 }
 function openConsole(){
  const d=document.getElementById('aiAnalysisDialog');if(!d)return;
  document.getElementById('aiWorkerUrl').value=window.GenreactrixCloudApi.getBaseUrl();
  document.getElementById('aiAnalysisKey').value=window.GenreactrixCloudApi.getKey();
  document.getElementById('aiQuantity').value=String(Math.max(1,Number(window.genreactrixSettingsEngine?.get?.('defaults.ai.quickAdd',100))||100));
  document.getElementById('aiAutoEnabled').checked=Boolean(window.genreactrixSettingsEngine?.get?.('ai.lookAhead.enabled',true));
  document.getElementById('aiAutoBuffer').value=String(Math.max(0,Number(window.genreactrixSettingsEngine?.get?.('ai.buffer.target',25))||25));
  document.getElementById('aiAutoRefill').value=String(Math.max(0,Number(window.genreactrixSettingsEngine?.get?.('ai.buffer.refillThreshold',10))||10));
  document.getElementById('aiAutoPriority').value=window.genreactrixSettingsEngine?.get?.('ai.lookAhead.priority','low')||'low';
  document.getElementById('aiQueueHold').checked=Boolean(window.genreactrixSettingsEngine?.get?.('ai.queue.holdUntilManualStart',false));
  document.getElementById('aiModelName').value=window.genreactrixSettingsEngine?.get?.('ai.provider.model','')||'';
  document.getElementById('aiPromptVersion').value=window.genreactrixSettingsEngine?.get?.('ai.prompt.version','')||'';
  syncComponentChecksFromDefaults();render();d.showModal();
 }
 function initUi(){
  const grid=document.getElementById('aiComponentGrid');
  if(grid)grid.innerHTML=COMPONENTS.map(([key,label])=>`<label class="ai-component-option" data-ai-component="${key}"><input type="checkbox" ${['reactions','themes','description'].includes(key)?'checked':''}><span>${label}</span><select aria-label="${label} behavior"><option value="analyze">Missing</option><option value="reanalyze">Rerun</option></select></label>`).join('');
  if(!liveTicker)liveTicker=setInterval(()=>repaintLiveDetail(),1000);
  document.getElementById('aiAnalysisClose')?.addEventListener('click',()=>document.getElementById('aiAnalysisDialog')?.close());
  document.getElementById('aiSaveProvider')?.addEventListener('click',async()=>{
    window.GenreactrixCloudApi.configure(document.getElementById('aiWorkerUrl').value);window.GenreactrixCloudApi.setKey(document.getElementById('aiAnalysisKey').value);
    const settings=window.genreactrixSettingsEngine;if(!settings?.set)throw new Error('Settings engine is unavailable');
    await settings.set('ai.provider.model',document.getElementById('aiModelName').value.trim());
    await settings.set('ai.prompt.version',document.getElementById('aiPromptVersion').value.trim());
    window.GenreactrixCloudApi.reload?.();document.getElementById('aiProviderStatus').textContent='Saved';await resumeStrandedJobs();render();maintainActiveMode().catch(console.warn);
  });
  document.getElementById('aiSaveAutomatic')?.addEventListener('click',async()=>{
    await window.genreactrixSettingsEngine?.set?.('ai.lookAhead.enabled',document.getElementById('aiAutoEnabled').checked);
    await window.genreactrixSettingsEngine?.set?.('ai.buffer.target',Math.max(0,Number(document.getElementById('aiAutoBuffer').value)||0));
    await window.genreactrixSettingsEngine?.set?.('ai.buffer.refillThreshold',Math.max(0,Number(document.getElementById('aiAutoRefill').value)||0));
    await window.genreactrixSettingsEngine?.set?.('ai.lookAhead.priority',document.getElementById('aiAutoPriority').value);
    document.getElementById('aiAutomaticStatus').textContent='Saved';await render();if(document.getElementById('aiAutoEnabled').checked)maintainActiveMode().catch(console.warn);
  });
  document.getElementById('aiHealthCheck')?.addEventListener('click',async()=>{const el=document.getElementById('aiProviderStatus');el.textContent='Checking Mistral + GPT-4.1 mini + Qwen 3.7 Plus…';try{const p=await window.GenreactrixCloudApi.verifyConnection(),providers=p.providers||{},mistral=providers.primary||providers.mistral||{},gpt=providers.secondary||providers.fallback||{},qwen=providers.third||providers.qwen||{},fmt=row=>row.ready?'Ready':(row.status==='capacity-unavailable'?'Capacity unavailable':(row.error||row.status||'Failed'));el.textContent=`Mistral: ${fmt(mistral)} · GPT-4.1 mini: ${fmt(gpt)} · Qwen 3.7 Plus: ${fmt(qwen)}`}catch(e){el.textContent=e.message}});
  document.getElementById('aiQueueHold')?.addEventListener('change',async e=>{await window.genreactrixSettingsEngine?.set?.('ai.queue.holdUntilManualStart',e.target.checked);document.getElementById('aiJobSummary').textContent=e.target.checked?'Queue hold active · automatic AI intake paused until you press Start analysis.':'Queue hold off · automatic AI intake may resume.';if(!e.target.checked)maintainActiveMode().catch(console.warn);render();});
  document.getElementById('aiStartJob')?.addEventListener('click',async()=>{try{const cfg=configFromForm(), enabled=Object.values(cfg.components).some(v=>v.enabled);if(!enabled)throw new Error('Choose at least one AI component');if(!window.GenreactrixCloudApi.isConfigured())throw new Error('Save a Worker URL before starting');if(cfg.components?.themes?.enabled&&cfg.components?.themes?.behavior==='analyze')cfg.themeSweepRequested=true;const j=await createJob(cfg);if(!j.total)throw new Error('No matching images need the selected analysis');const summary=document.getElementById('aiJobSummary');if(summary)summary.dataset.jobId=j.id;await render();await run(j.id)}catch(e){document.getElementById('aiJobSummary').textContent=e.message}});
  document.getElementById('aiCycleBtn')?.addEventListener('click',()=>cycleMissing());
  document.getElementById('aiThemeSweepContinueValid')?.addEventListener('click',()=>{const selectedId=document.getElementById('aiJobSummary')?.dataset.jobId||'';if(selectedId)continueThemeSweepWithValid(selectedId);});
  document.querySelectorAll('#aiAnalysisDialog input,#aiAnalysisDialog select').forEach(el=>{if(!['aiWorkerUrl','aiAnalysisKey','aiModelName','aiPromptVersion'].includes(el.id))el.addEventListener('change',()=>{if(el.closest?.('[data-ai-component]'))saveComponentDefaultsFromGrid();render()})});
  document.getElementById('aiJobList')?.addEventListener('click',e=>{const b=e.target.closest('[data-ai-job-id]');if(!b)return;document.getElementById('aiJobSummary').dataset.jobId=b.dataset.aiJobId;render()});
  const current=()=>document.getElementById('aiJobSummary').dataset.jobId||null;
  document.getElementById('aiPauseJob')?.addEventListener('click',()=>current()&&pause(current()));document.getElementById('aiResumeJob')?.addEventListener('click',()=>current()&&resume(current()));document.getElementById('aiStopJob')?.addEventListener('click',()=>current()&&stop(current()));document.getElementById('aiRetryFailed')?.addEventListener('click',()=>current()&&retryFailed(current()));
 }

 function safeExportName(value,fallback='image'){
  const clean=String(value||fallback).replace(/[\\/:*?"<>|\x00-\x1F]/g,'_').trim();return clean||fallback;
 }
 function crc32(bytes){
  let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;
 }
 function dosStamp(input){
  const d=input instanceof Date?input:new Date(input||Date.now()),year=Math.max(1980,d.getFullYear());
  return {time:((d.getHours()&31)<<11)|((d.getMinutes()&63)<<5)|((Math.floor(d.getSeconds()/2))&31),date:(((year-1980)&127)<<9)|(((d.getMonth()+1)&15)<<5)|(d.getDate()&31)};
 }
 function u16(v){return new Uint8Array([v&255,(v>>>8)&255]);}
 function u32(v){return new Uint8Array([v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]);}
 function joinBytes(parts){const total=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(total);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
 async function storedZip(entries){
  const encoder=new TextEncoder(),locals=[],centrals=[];let offset=0;
  for(const entry of entries){
    const name=encoder.encode(entry.name),bytes=entry.bytes instanceof Uint8Array?entry.bytes:new Uint8Array(entry.bytes),crc=crc32(bytes),stamp=dosStamp(entry.date),size=bytes.length;
    const local=joinBytes([u32(0x04034b50),u16(20),u16(0),u16(0),u16(stamp.time),u16(stamp.date),u32(crc),u32(size),u32(size),u16(name.length),u16(0),name,bytes]);
    const central=joinBytes([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(stamp.time),u16(stamp.date),u32(crc),u32(size),u32(size),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]);
    locals.push(local);centrals.push(central);offset+=local.length;
  }
  const centralBytes=joinBytes(centrals),localBytes=joinBytes(locals),end=joinBytes([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(centralBytes.length),u32(localBytes.length),u16(0)]);
  return new Blob([localBytes,centralBytes,end],{type:'application/zip'});
 }
 function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 async function exportFails(){
  const records=window.genreactrixCurrentAiFailureRecords?.()||[];if(!records.length)throw new Error('No current AI failures are available to export.');
  const [jobs,items]=await Promise.all([all(JOBS),all(ITEMS)]),jobsById=new Map(jobs.map(job=>[job.id,job])),recordIds=new Set(records.map(r=>r.id)),entries=[],manifestRows=[],usedNames=new Set();
  for(const record of records){
    let blob=await window.imageBlobGet?.(record.id).catch(()=>null);
    if(!blob){const url=record.storage?.hyperlink||record.source?.originalUrl;if(url){const response=await fetch(url,{mode:'cors'});if(response.ok)blob=await response.blob();}}
    if(!blob)throw new Error(`Could not copy ${record.source?.originalFilename||record.name||record.id}; export cancelled before anything moved.`);
    let filename=safeExportName(record.source?.originalFilename||record.name||`${record.id}.img`),base=filename,n=2;while(usedNames.has(filename)){const dot=base.lastIndexOf('.');filename=dot>0?`${base.slice(0,dot)}-${n++}${base.slice(dot)}`:`${base}-${n++}`;}usedNames.add(filename);
    entries.push({name:`images/${filename}`,bytes:new Uint8Array(await blob.arrayBuffer()),date:new Date(record.createdAt||Date.now())});
    const related=items.filter(item=>item.imageId===record.id&&item.error).sort((a,b)=>String(jobsById.get(a.jobId)?.createdAt||'').localeCompare(String(jobsById.get(b.jobId)?.createdAt||'')));
    const latest=related.at(-1)||null,job=latest?jobsById.get(latest.jobId):null;
    manifestRows.push({
      imageId:record.id,filename:record.source?.originalFilename||record.name||filename,zipPath:`images/${filename}`,
      failedComponents:[['reactions','aiReactions'],['themes','aiThemes'],['description','aiDescription'],['reactionReasons','aiReactionReasons'],['genreReasons','aiGenreReasons']].filter(([,field])=>record.components?.[field]==='failed').map(([component])=>component),
      error:latest?.error||record.error||'',aiJobId:latest?.jobId||null,attempts:latest?.attempts||0,jobCreatedAt:job?.createdAt||null,jobCompletedAt:job?.completedAt||null,
      model:window.genreactrixSettingsEngine?.get?.('ai.provider.model','')||null,promptVersion:window.genreactrixSettingsEngine?.get?.('ai.prompt.version','')||null,
      configuration:job?.config||null,workerBaseUrl:window.GenreactrixCloudApi?.getBaseUrl?.()||null,siteBuild:window.GENREACTRIX_BUILD||null
    });
  }
  const exportedAt=new Date().toISOString(),manifest={schemaVersion:1,type:'genreactrix-ai-failure-export',exportedAt,count:manifestRows.length,images:manifestRows};
  entries.unshift({name:'failure-manifest.json',bytes:new TextEncoder().encode(JSON.stringify(manifest,null,2)),date:new Date()});
  const zip=await storedZip(entries),stamp=exportedAt.replace(/[:.]/g,'-'),filename=`genreactrix-ai-fails-${stamp}.zip`;downloadBlob(zip,filename);
  const move=confirm(`Failure ZIP created with ${records.length} image${records.length===1?'':'s'} and manifest.\n\nAfter you have saved the ZIP, move these exported failures to Recycle?`);
  if(!move){render();window.renderPortraitControlStation?.();return{exported:records.length,moved:0,filename};}
  const affectedJobIds=new Set(),affectedItems=[];
  for(const item of items){if(recordIds.has(item.imageId)&&item.state==='failed'){item.state='exported';item.exportedAt=exportedAt;item.exportedError=item.error;await put(ITEMS,item);affectedJobIds.add(item.jobId);affectedItems.push(item);}}
  for(const record of records)await window.genreactrixImagesEngine?.moveAiFailureToRecycle?.(record.id);
  for(const item of affectedItems)await q()?.setItemState?.(`queue_${item.id}`,'cancelled',{error:'Failure exported; original moved to Recycle'}).catch(()=>{});
  for(const jobId of affectedJobIds){
    const rows=await byIndex(ITEMS,'jobId',jobId),job=(await all(JOBS)).find(j=>j.id===jobId);if(!job)continue;
    const failed=rows.filter(i=>i.state==='failed').length,exported=rows.filter(i=>i.state==='exported').length;
    job.completed=rows.filter(i=>i.state==='complete').length;job.failed=failed;job.skipped=rows.filter(i=>['cancelled','exported','skipped'].includes(i.state)).length;job.exportedFailures=exported;job.updatedAt=exportedAt;
    if(!failed&&['completed-with-failures','failed'].includes(job.state)){job.state='completed';job.message='Failures exported to Recycle';job.completedAt=job.completedAt||exportedAt;}
    await put(JOBS,job);
    const queueJobId=`queue_${jobId}`;const queueJob=q()?.getJob?.(queueJobId);if(queueJob&&!failed)await q()?.patchJob?.(queueJobId,{state:'completed',message:'Failures exported to Recycle',completedAt:queueJob.completedAt||exportedAt});
  }
  await q()?.refresh?.();emit();render();window.renderPortraitControlStation?.();window.dispatchEvent(new CustomEvent('genreactrix:ai-failures-exported',{detail:{imageIds:[...recordIds],filename,exportedAt}}));
  return{exported:records.length,moved:records.length,filename};
 }

 async function verify(){const jobs=await all(JOBS),items=await all(ITEMS),issues=[],jobIds=new Set(jobs.map(j=>j.id));for(const item of items){if(!jobIds.has(item.jobId))issues.push({type:'ai-item-missing-job',recordId:item.id,severity:'attention'});if(item.state==='processing'&&!jobs.some(j=>j.id===item.jobId&&j.state==='running'))issues.push({type:'ai-item-stuck-processing',recordId:item.id,severity:'attention'})}for(const job of jobs)if(job.state==='running'&&Date.now()-new Date(job.startedAt||job.createdAt).getTime()>86400000)issues.push({type:'ai-job-stuck',jobId:job.id,severity:'attention'});const history=await window.genreactrixAiArtifactEngine?.verify?.().catch(error=>({attemptCount:0,artifactCount:0,issues:[{type:'ai-artifact-history-verification-failed',severity:'attention',summary:String(error?.message||error)}]}))||{attemptCount:0,artifactCount:0,issues:[]};issues.push(...(history.issues||[]));return{jobCount:jobs.length,itemCount:items.length,attemptCount:history.attemptCount||0,artifactCount:history.artifactCount||0,issueCount:issues.length,issues}}
 const engine={createJob,run,pause,resume,stop,retryFailed,continueThemeSweepWithValid,exportFails,snapshot,snapshotCached,queueNext,maintainAutomaticFlow,maintainBuffer,maintainActiveMode,bufferPolicy,planBufferStep,cycleMissing,openConsole,verify,components:COMPONENTS};window.genreactrixAiAnalysisEngine=engine;window.genreactrixAIAnalysisEngine=engine;window.addEventListener('DOMContentLoaded',async()=>{q()?.registerType?.('ai',{pause,resume,stop,retry:retryFailed});initUi();syncComponentChecksFromDefaults();await reconcileCancelledJobs();await repairLegacyThemeRerunLifecycleDrift();await reconcileThemeRerunPlacementIntegrity();await recoverInterruptedAiJobs();const startAfterSettings=async()=>{window.GenreactrixCloudApi?.reload?.();syncComponentChecksFromDefaults();await resumeStrandedJobs();render();maintainActiveMode().catch(console.warn)};if(window.genreactrixSettingsEngine?.ready)await startAfterSettings();else window.addEventListener('genreactrix:settings-ready',()=>startAfterSettings().catch(console.warn),{once:true});render()});window.addEventListener('genreactrix:image-record',()=>render());window.addEventListener('genreactrix:bundle',()=>{render();setTimeout(()=>maintainActiveMode().catch(console.warn),0)});
 window.addEventListener('genreactrix:setting',event=>{if(['queue.flow.enabled','queue.bundle.size','ai.lookAhead.enabled','ai.buffer.target','ai.buffer.refillThreshold','ai.lookAhead.priority','ai.queue.holdUntilManualStart'].includes(event.detail?.id))setTimeout(()=>maintainActiveMode().catch(console.warn),0)});
})();
