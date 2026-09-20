/* Emojeo Semantic Pilot Runner — Pass 31
   Executes only an explicitly supplied pilot manifest. Raw provider discovery is
   retained separately from normalized open-discovery interpretation. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v);
function create(options={}){
 const api=options.api||globalThis.GenreactrixCloudApi||globalThis.window?.GenreactrixCloudApi||globalThis.genreactrixCloudApi;
 if(!api||typeof api.emojeoSemanticDiscovery!=='function')throw new Error('Emojeo semantic discovery Worker adapter is unavailable.');
 const normalize=options.normalize||globalThis.emojeoOpenDiscovery?.normalizeResult;
 return async function run(manifest={},runOptions={}){
  const subjects=Array.isArray(manifest.subjects)?manifest.subjects:[];
  const limit=Math.max(0,Math.min(subjects.length,Number(runOptions.limit??subjects.length)||0));
  const rows=[];
  for(const subject of subjects.slice(0,limit)){
   if(runOptions.signal?.aborted)throw new DOMException('Aborted','AbortError');
   const request=globalThis.emojeoSemanticPilot.discoveryRequest({id:subject.id,glyph:subject.glyph,codePoints:subject.codePoints,names:{cldr:subject.name},taxonomy:{group:subject.group,subgroup:subject.subgroup,order:subject.sourceOrder}});
   const envelope=await api.emojeoSemanticDiscovery(request);
   const raw=clone(envelope?.result||envelope);
   const normalized=typeof normalize==='function'?normalize(raw?.rawDiscovery||{}, {subjectId:subject.id,source:{kind:'emojeo-semantic-pilot',provider:raw?.provider||null}}):null;
   rows.push({subject:clone(subject),request:clone(request),raw,normalized});
   runOptions.onResult?.(rows.at(-1),rows.length,limit);
  }
  return {schemaVersion:1,kind:'emojeo-semantic-pilot-run',pilotSeed:manifest.seed||null,startedSubjectCount:limit,completedSubjectCount:rows.length,results:rows};
 };
}
const api=Object.freeze({create});
if(typeof window!=='undefined')window.emojeoSemanticPilotRunner=api;if(typeof globalThis!=='undefined')globalThis.emojeoSemanticPilotRunner=api;
})();
