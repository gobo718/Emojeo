(function(){
  'use strict';
  const PROFILE_KEY='genreactrix-import-profiles-v1';
  const now=()=>new Date().toISOString();
  const profiles=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'[]')}catch{return[]}};
  const saveProfiles=p=>localStorage.setItem(PROFILE_KEY,JSON.stringify(p));
  function profileDefaults(){return{id:'default',name:'Default intake',sourceType:'urls',mode:window.genreactrixSettingsEngine?.get?.('acquisition.defaultMode','link')||'link',quantity:Number(window.genreactrixSettingsEngine?.get?.('defaults.urls',100))||100,prefetch:true,target:'queue'}}
  function allProfiles(){const p=profiles();return p.length?p:[profileDefaults()]}
  function saveProfile(profile){const p=allProfiles().filter(x=>x.id!==profile.id);p.push({...profile,id:profile.id||`profile_${Date.now()}`,updatedAt:now()});saveProfiles(p);return p[p.length-1]}
  function normalizeUrls(text){return String(text||'').split(/\r?\n|,\s*(?=https?:)/).map(v=>v.trim()).filter(v=>/^https?:\/\//i.test(v))}
  function existingByUrl(){return new Map((window.genreactrixImagesEngine?.allRecords?.()||[]).filter(r=>r.source?.originalUrl).map(r=>[r.source.originalUrl,r]))}
  async function previewUrls(text,options={}){const urls=normalizeUrls(text).slice(0,Math.max(1,Number(options.limit)||100)),existing=existingByUrl(),rows=urls.map(url=>({url,knownSource:existing.has(url),existingImageId:existing.get(url)?.id||null,eligible:true}));return{sourceType:'urls',requested:Math.max(1,Number(options.limit)||100),found:rows.length,eligible:rows.length,knownSourceMatches:rows.filter(r=>r.knownSource).length,invalid:0,rows,estimatedBytes:null}}
  function gateStats(gates=[]){const importFailures=gates.filter(g=>g.type==='import-failure').length,duplicates=gates.filter(g=>g.type==='dupe'||g.type==='repeat').length;return{importFailures,duplicates,gated:gates.length,skipped:Math.max(0,gates.length-importFailures)}}
  async function completeJob(job,records,gates,pack){const stats=gateStats(gates),status=stats.importFailures?'completed-with-failures':'completed';return window.genreactrixImportJobEngine.patch(job.id,{status,completedAt:now(),imported:records.length,failed:stats.importFailures,duplicateCount:stats.duplicates,skipped:stats.skipped,imageIds:records.map(r=>r.id),packId:pack?.id||job.packId||null,metadata:{...(job.metadata||{}),originPackId:pack?.id||job.packId||null,originGateIds:gates.map(g=>g.id),originGateCount:gates.length}})}
  async function createPack({sourceType,sourceLabel,intakeMode,candidateCount,sourceContext={}}){const engine=window.genreactrixOriginPackEngine;if(!engine?.create)throw new Error('Origin Pack engine is unavailable');return engine.create({sourceType,sourceLabel,intakeMode,candidateCount,sourceContext,status:'draft'})}
  async function finishPack(pack,job,records,gates,status=null){if(!pack)return null;const stats=gateStats(gates),finalStatus=status||(gates.length?'completed-with-gates':'completed');return window.genreactrixOriginPackEngine.complete(pack.id,{status:finalStatus,importJobId:job?.id||null,imageIds:records.map(r=>r.id),originGateIds:gates.map(g=>g.id),metadata:{importStatus:job?.status||finalStatus,admittedCount:records.length,gateCount:gates.length,duplicateCount:stats.duplicates,importFailureCount:stats.importFailures}})}
  async function runUrls(text,options={}){
    const preview=await previewUrls(text,options);if(!preview.found)throw new Error('No eligible image URLs were found.');
    const sourceLabel=options.sourceLabel||'URL list',intakeMode=options.mode||'link';
    const pack=await createPack({sourceType:'urls',sourceLabel,intakeMode,candidateCount:preview.found,sourceContext:{requested:preview.requested,found:preview.found,prefetch:Boolean(options.prefetch),profileId:options.profileId||null}});
    const job=await window.genreactrixImportJobEngine.create({sourceType:'urls',sourceLabel,profileId:options.profileId||null,targetBatchId:null,mode:intakeMode,requested:preview.requested,packId:pack.id,metadata:{prefetch:Boolean(options.prefetch),originPackId:pack.id}});
    await window.genreactrixOriginPackEngine.patch(pack.id,{status:'importing',startedAt:now(),importJobId:job.id});
    await window.genreactrixImportJobEngine.patch(job.id,{status:'running',startedAt:now(),found:preview.found});
    try{
      const sourceText=preview.rows.map(r=>r.url).join('\n'),records=await window.genreactrixImagesEngine.importUrls(sourceText,{limit:preview.found,mode:options.mode==='temporary'?'download':'link',prefetch:Boolean(options.prefetch),importJobId:job.id,packId:pack.id}),gates=records.originGates||[];
      const completedJob=await completeJob(job,records,gates,pack);await finishPack(pack,completedJob,records,gates);const stats=gateStats(gates);
      window.genreactrixNotificationsEngine?.create?.({severity:stats.importFailures?'attention':'info',title:'Import complete',message:`${records.length} imported${gates.length?` · ${gates.length} Origin gate${gates.length===1?'':'s'}`:''}${stats.importFailures?` · ${stats.importFailures} failure${stats.importFailures===1?'':'s'}`:''}`,ownerEngine:'origin',relatedJobId:job.id,dedupeKey:`import:${job.id}:complete`,resolved:!stats.importFailures});
      window.dispatchEvent(new CustomEvent('genreactrix:import-complete',{detail:{jobId:job.id,packId:pack.id,imageIds:records.map(r=>r.id),originGateIds:gates.map(g=>g.id)}}));return{job:await window.genreactrixImportJobEngine.get(job.id),pack:await window.genreactrixOriginPackEngine.get(pack.id),records,gates,preview};
    }catch(error){await window.genreactrixImportJobEngine.patch(job.id,{status:'failed',completedAt:now(),failed:preview.found,errors:[String(error?.message||error)]});await window.genreactrixOriginPackEngine.patch(pack.id,{status:'failed',completedAt:now(),metadata:{error:String(error?.message||error)}});throw error}
  }
  const IMAGE_FILE_RE=/\.(?:jpe?g|png|gif|webp|bmp|avif|heic|heif)$/i;
  function isImageFile(file){const type=String(file?.type||'').toLowerCase();return type.startsWith('image/')||IMAGE_FILE_RE.test(String(file?.name||''))}
  async function runFiles(fileList,options={}){
    const files=[...fileList].filter(isImageFile).slice(0,Math.max(1,Number(options.limit)||100));if(!files.length)throw new Error('No eligible image file was selected.');
    const sourceLabel=options.sourceLabel||(files.length===1?files[0].name:`${files.length} selected files`);
    const pack=await createPack({sourceType:'file-selection',sourceLabel,intakeMode:'temporary',candidateCount:files.length,sourceContext:{selectedCount:files.length,profileId:options.profileId||null,sampleFilenames:files.slice(0,25).map(f=>f.name)}});
    const job=await window.genreactrixImportJobEngine.create({sourceType:'file-selection',sourceLabel,profileId:options.profileId||null,targetBatchId:null,mode:'temporary',requested:files.length,packId:pack.id,metadata:{originPackId:pack.id}});
    await window.genreactrixOriginPackEngine.patch(pack.id,{status:'importing',startedAt:now(),importJobId:job.id});
    await window.genreactrixImportJobEngine.patch(job.id,{status:'running',startedAt:now(),found:files.length});
    try{
      const records=await window.genreactrixImagesEngine.importFiles(files,{limit:files.length,importJobId:job.id,packId:pack.id}),gates=records.originGates||[];
      const completedJob=await completeJob(job,records,gates,pack);await finishPack(pack,completedJob,records,gates);
      window.dispatchEvent(new CustomEvent('genreactrix:import-complete',{detail:{jobId:job.id,packId:pack.id,imageIds:records.map(r=>r.id),originGateIds:gates.map(g=>g.id)}}));return{job:await window.genreactrixImportJobEngine.get(job.id),pack:await window.genreactrixOriginPackEngine.get(pack.id),records,gates};
    }catch(error){await window.genreactrixImportJobEngine.patch(job.id,{status:'failed',completedAt:now(),failed:files.length,errors:[String(error?.message||error)]});await window.genreactrixOriginPackEngine.patch(pack.id,{status:'failed',completedAt:now(),metadata:{error:String(error?.message||error)}});throw error}
  }
  async function dashboard(){const jobs=await window.genreactrixImportJobEngine.all(),records=window.genreactrixImagesEngine?.allRecords?.()||[],output=(window.genreactrixInboxAiOutputRecords?.()||[]).length,origin=await window.genreactrixOriginGateEngine?.snapshot?.()||{};return{active:jobs.filter(j=>['running','paused'].includes(j.status)),recent:jobs.slice(0,20),failed:jobs.filter(j=>j.status==='failed'||j.status==='completed-with-failures'),pendingAi:records.filter(r=>['queued','ai-partial'].includes(r.workflow?.stage)&&!r.attributes?.failed).length,aiOutput:output,origin}}
  window.genreactrixImportEngine={allProfiles,saveProfile,previewUrls,runUrls,runFiles,dashboard,verify:async()=>({importJobs:await window.genreactrixImportJobEngine.verify(),originPacks:await window.genreactrixOriginPackEngine?.verify?.()})};
})();
