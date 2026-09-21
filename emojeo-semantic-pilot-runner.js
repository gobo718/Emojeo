/* Emojeo Semantic Pilot Runner — resumable */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v);
function create(options={}){
 const api=options.api||globalThis.GenreactrixCloudApi||globalThis.window?.GenreactrixCloudApi||globalThis.genreactrixCloudApi;
 if(!api||typeof api.emojeoSemanticDiscovery!=='function')throw new Error('Emojeo semantic discovery Worker adapter is unavailable.');
 const normalize=options.normalize||globalThis.emojeoOpenDiscovery?.normalizeResult;
 return async function run(manifest={},runOptions={}){
  const subjects=Array.isArray(manifest.subjects)?manifest.subjects:[];
  const limit=Math.max(0,Math.min(subjects.length,Number(runOptions.limit??subjects.length)||0));
  const startIndex=Math.max(0,Math.min(limit,Number(runOptions.startIndex||0)||0));
  const rows=Array.isArray(runOptions.initialRows)?runOptions.initialRows.map(clone):[];
  for(let index=startIndex;index<limit;index++){
   const subject=subjects[index];
   if(runOptions.signal?.aborted)throw new DOMException('Aborted','AbortError');
   const startedAt=Date.now();
   const stage=(name,extra={})=>runOptions.onStage?.({stage:name,subject:clone(subject),index:index+1,total:limit,completed:rows.length,failed:0,remaining:Math.max(0,limit-rows.length),...extra});
   stage('preparing');
   const request=globalThis.emojeoSemanticPilot.discoveryRequest({id:subject.id,glyph:subject.glyph,codePoints:subject.codePoints,names:{cldr:subject.name},taxonomy:{group:subject.group,subgroup:subject.subgroup,order:subject.sourceOrder}});
   stage('awaiting-worker');
   let envelope;
   try{envelope=await api.emojeoSemanticDiscovery(request,undefined,{signal:runOptions.signal});}
   catch(error){stage('failed',{elapsedMs:Date.now()-startedAt,error});throw error;}
   stage('validating',{elapsedMs:Date.now()-startedAt,httpStatus:envelope?.httpStatus||200,provider:envelope?.result?.provider||envelope?.provider||null,providerRouting:envelope?.providerRouting||null});
   const raw=clone(envelope?.result||envelope);
   const normalized=typeof normalize==='function'?normalize(raw?.rawDiscovery||{}, {subjectId:subject.id,source:{kind:'emojeo-semantic-pilot',provider:raw?.provider||null}}):null;
   stage('retaining-result',{elapsedMs:Date.now()-startedAt,provider:raw?.provider||null});
   rows.push({subject:clone(subject),request:clone(request),raw,normalized});
   runOptions.onResult?.(rows.at(-1),rows.length,limit);
   stage('completed',{elapsedMs:Date.now()-startedAt,completed:rows.length,remaining:Math.max(0,limit-rows.length),provider:raw?.provider||null});
  }
  return {schemaVersion:1,kind:'emojeo-semantic-pilot-run',pilotSeed:manifest.seed||null,startedSubjectCount:limit,completedSubjectCount:rows.length,results:rows};
 };
}
const api=Object.freeze({create});
if(typeof window!=='undefined')window.emojeoSemanticPilotRunner=api;if(typeof globalThis!=='undefined')globalThis.emojeoSemanticPilotRunner=api;
})();
