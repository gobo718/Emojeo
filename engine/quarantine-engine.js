/* Genreactrix Quarantine Engine v1
   Queue-owned technical hold for suspected problem images after isolated AI failures.
   Quarantine is manual-only: no automatic AI retry, no Daily Housekeeping retry. */
(()=>{'use strict';
const KEY='genreactrix-quarantine-cases-v1';
const now=()=>new Date().toISOString();
const clone=v=>v==null?v:structuredClone(v);
const uid=()=>`quarantine_${Date.now().toString(36)}_${crypto.randomUUID().slice(0,8)}`;
let cases=[];
try{cases=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{cases=[]}
if(!Array.isArray(cases))cases=[];
function persist(){localStorage.setItem(KEY,JSON.stringify(cases))}
function emit(type,c,detail={}){window.dispatchEvent(new CustomEvent('genreactrix:quarantine',{detail:{type,case:clone(c),...clone(detail)}}))}
function save(c,type='updated'){c.updatedAt=now();const i=cases.findIndex(x=>x.id===c.id);if(i>=0)cases[i]=c;else cases.push(c);persist();emit(type,c);return clone(c)}
function get(id){return clone(cases.find(c=>c.id===String(id))||null)}
function all(){return [...cases].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).map(clone)}
function openForImage(imageId){return clone(cases.find(c=>String(c.imageId)===String(imageId)&&c.status==='open')||null)}
function record(){return window.genreactrixImageRecordEngine}
function image(imageId){return record()?.get?.(String(imageId),{touch:false})||null}
function notify(c){const n=window.genreactrixNotificationsEngine;if(!n?.create)return;n.create({severity:'attention',title:'Image moved to Quarantine',message:'Three isolated AI failures require manual investigation before any fresh AI attempt.',ownerEngine:'queue',actionTarget:'queue',actionLabel:'Queue',dedupeKey:`quarantine:${c.id}`,persistent:true}).catch(()=>{})}
function attemptRow(input={}){return{attemptId:String(input.attemptId||''),jobId:input.jobId||null,at:input.at||now(),error:String(input.error||''),globalFailure:Boolean(input.globalFailure),isolated:Boolean(input.isolated!==false)}}
function openCase({imageId,attemptId=null,jobId=null,error='',streak=3,evidence={},attempts=[]}={}){
  imageId=String(imageId||'');if(!imageId)throw new Error('Quarantine requires an Image ID');
  let c=cases.find(x=>String(x.imageId)===imageId&&x.status==='open');
  const attempt=attemptRow({attemptId,jobId,error,isolated:true});
  if(c){if(attempt.attemptId&&!c.attempts.some(a=>a.attemptId===attempt.attemptId))c.attempts.push(attempt);c.streak=Math.max(Number(c.streak)||0,Number(streak)||0);c.evidence={...(c.evidence||{}),...clone(evidence)};if(error)c.lastError=String(error);return save(c,'evidence-appended')}
  const r=image(imageId),createdAt=now(),seed=Array.isArray(attempts)?attempts.map(a=>attemptRow({attemptId:a.attemptId,jobId:a.jobId,error:a.error,at:a.at,isolated:true})).filter(a=>a.attemptId):[];if(attempt.attemptId&&!seed.some(a=>a.attemptId===attempt.attemptId))seed.push(attempt);c={id:uid(),schemaVersion:2,projectId:window.genreactrixProjectRuntimeEngine?.projectId?.()||'',runtimeId:window.genreactrixProjectRuntimeEngine?.runtimeId?.()||null,imageId,status:'open',createdAt,updatedAt:createdAt,trigger:'three-isolated-ai-failures',streak:Math.max(3,Number(streak)||3),attempts:seed,evidence:clone(evidence),lastError:String(error||''),resolution:null,recordName:r?.name||r?.source?.originalFilename||imageId};cases.push(c);persist();emit('opened',c);notify(c);window.genreactrixHistoryEngine?.append?.({imageId,eventType:'quarantine-opened',actor:'system',sourceEngine:'quarantine',summary:'Image moved to Quarantine after three isolated AI failures',payload:{quarantineCaseId:c.id,streak:c.streak,attempts:clone(c.attempts),evidence:clone(c.evidence)}}).catch(()=>{});return clone(c)
}
function appendEvidence(imageId,{attemptId=null,jobId=null,error='',globalFailure=false,isolated=true}={}){const c=cases.find(x=>String(x.imageId)===String(imageId)&&x.status==='open');if(!c)return null;const a=attemptRow({attemptId,jobId,error,globalFailure,isolated});if(a.attemptId&&!c.attempts.some(x=>x.attemptId===a.attemptId))c.attempts.push(a);if(error)c.lastError=String(error);return save(c,'evidence-appended')}
function removeThemeRerunEvidence(imageId,jobIds=[]){
  const wanted=new Set((jobIds||[]).map(String));if(!wanted.size)return null;const c=cases.find(x=>String(x.imageId)===String(imageId)&&x.status==='open');if(!c)return null;
  const before=(c.attempts||[]).length,remaining=(c.attempts||[]).filter(a=>!wanted.has(String(a.jobId||'')));if(remaining.length===before)return clone(c);
  c.attempts=remaining;c.streak=remaining.length;c.lastError=remaining.at(-1)?.error||'';
  if(remaining.length<3){c.status='void';c.resolution={action:'void-theme-rerun-evidence',at:now(),reason:'Theme Rerun attempts are lifecycle-isolated and cannot trigger Quarantine.'};}
  const next=save(c,'theme-rerun-evidence-removed');window.genreactrixHistoryEngine?.append?.({imageId:String(imageId),eventType:'quarantine-theme-rerun-evidence-removed',actor:'system',sourceEngine:'quarantine',summary:'Removed Theme Rerun attempts from Quarantine isolation evidence',payload:{quarantineCaseId:c.id,removed:before-remaining.length,remaining:remaining.length,status:c.status}}).catch(()=>{});return next;
}
async function release(id){const c=cases.find(x=>x.id===String(id));if(!c||c.status!=='open')throw new Error('Open Quarantine case not found');const r=image(c.imageId);if(!r)throw new Error('Quarantined Image Record not found');if(r.workflow?.stage!=='quarantine')throw new Error('Image is no longer in Quarantine');
  const components={aiReactions:'missing',aiThemes:'missing',aiDescription:'missing',aiEmotion:'missing',aiReactionReasons:'missing',aiGenreReasons:'missing'};
  const next=record().update(r.id,{workflow:{stage:'queued'},components,analysis:{ai:null},error:'',metadata:{extended:{problemImage:false,isolatedAiFailureStreak:0,lastIsolationCountedAttemptId:null,lastIsolatedAiFailureAt:null,activeAiJobId:null,activeAiAttemptId:null,quarantineCaseId:c.id,quarantineReleasedAt:now()}}},'quarantine-released');
  c.status='released';c.resolution={action:'release',at:now(),returnedStage:'queued'};save(c,'released');await window.genreactrixHistoryEngine?.append?.({imageId:r.id,eventType:'quarantine-released',actor:'director',sourceEngine:'quarantine',summary:'Quarantine investigation released image to Queue for a fresh AI try',payload:{quarantineCaseId:c.id,clearedAiWorkingData:true}}).catch(()=>{});
  setTimeout(()=>window.genreactrixAiAnalysisEngine?.maintainActiveMode?.().catch?.(console.warn),0);return clone(next)
}
async function finalizeDefective(id){const c=cases.find(x=>x.id===String(id));if(!c||c.status!=='open')throw new Error('Open Quarantine case not found');const r=image(c.imageId);if(!r)throw new Error('Quarantined Image Record not found');if(r.workflow?.stage!=='quarantine')throw new Error('Image is no longer in Quarantine');const result=await window.genreactrixImagesEngine?.finalizeDefective?.(r.id,{quarantineCaseId:c.id});if(!result)throw new Error('Defective finalization did not complete');c.status='defective';c.resolution={action:'defective',at:now(),finalStage:'defective'};save(c,'defective');await window.genreactrixHistoryEngine?.append?.({imageId:r.id,eventType:'defective-finalized',actor:'director',sourceEngine:'quarantine',summary:'Quarantine investigation confirmed image as Defective',payload:{quarantineCaseId:c.id,fullResolutionDeleted:true,thumbnailRetained:true}}).catch(()=>{});return clone(result)}
function snapshot(){const rows=all(),open=rows.filter(c=>c.status==='open');return{total:rows.length,open:open.length,released:rows.filter(c=>c.status==='released').length,defective:rows.filter(c=>c.status==='defective').length,cases:open}}
function migrateExisting(){let made=0;for(const r of record()?.all?.()||[]){if(r.workflow?.stage!=='quarantine'||openForImage(r.id))continue;const ext=r.metadata?.extended||{};openCase({imageId:r.id,attemptId:ext.lastIsolationCountedAttemptId||ext.lastAiAttemptId||null,jobId:ext.lastAiJobId||null,error:r.error||'',streak:Number(ext.isolatedAiFailureStreak)||3,evidence:{migrated:true,reason:ext.quarantineReason||'three-isolated-ai-failures'}});made++}return made}
async function verify(){const issues=[];const rows=all(),records=record()?.all?.()||[];for(const c of rows.filter(x=>x.status==='open')){const r=records.find(x=>String(x.id)===String(c.imageId));if(!r)issues.push({type:'quarantine-missing-image-record',severity:'critical',caseId:c.id,imageId:c.imageId});else if(r.workflow?.stage!=='quarantine')issues.push({type:'quarantine-stage-mismatch',severity:'attention',caseId:c.id,imageId:c.imageId})}for(const r of records.filter(x=>x.workflow?.stage==='quarantine'))if(!rows.some(c=>c.status==='open'&&String(c.imageId)===String(r.id)))issues.push({type:'quarantine-missing-case',severity:'attention',imageId:r.id});return{checkedAt:now(),caseCount:rows.length,openCount:rows.filter(c=>c.status==='open').length,issueCount:issues.length,issues}}
const api={openCase,appendEvidence,removeThemeRerunEvidence,release,finalizeDefective,get,all,openForImage,snapshot,migrateExisting,verify};window.genreactrixQuarantineEngine=api;
window.addEventListener('DOMContentLoaded',()=>{try{migrateExisting()}catch(error){console.error('Quarantine migration failed',error)}window.genreactrixMaintenanceEngine?.registerChecker?.('quarantine',verify,{quick:true,label:'Quarantine'});});
})();
