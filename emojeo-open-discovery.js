/* Emojeo Open-Ended Discovery — Pass 5
   Captures uncensored descriptive observations before any shared vocabulary exists.
   Raw observations are evidence-bearing analysis artifacts, NOT canonical tags. */
(()=>{'use strict';
const clean=v=>String(v??'').trim();
const clone=v=>v==null?v:structuredClone(v);
const unique=xs=>[...new Set((xs||[]).map(clean).filter(Boolean))];
const DIMENSIONS=Object.freeze(['visual','object','expression','action','relationship','setting','symbolic','situational','structural','other']);
const normalizeObservation=(row={},i=0)=>({
 id:clean(row.id)||`obs-${i+1}`,
 phrase:clean(row.phrase||row.label||row.observation),
 dimension:DIMENSIONS.includes(clean(row.dimension).toLowerCase())?clean(row.dimension).toLowerCase():'other',
 description:clean(row.description),
 evidence:unique(Array.isArray(row.evidence)?row.evidence:[row.evidence]),
 confidence:Number.isFinite(Number(row.confidence))?Math.max(0,Math.min(1,Number(row.confidence))):null,
 metadata:clone(row.metadata||{})
});
function normalizeResult(input={},context={}){
 const observations=(input.observations||input.traits||[]).map(normalizeObservation).filter(x=>x.phrase);
 return {
  schemaVersion:1,
  subject:{type:'emoji',id:clean(context.subjectId||input.subject?.id)},
  summary:clean(input.summary),
  observations,
  ambiguities:unique(input.ambiguities),
  rawNotes:unique(input.rawNotes||input.notes),
  source:clone(context.source||input.source||{}),
  run:{id:clean(context.runId),at:context.at||new Date().toISOString(),promptVersion:'emojeo-open-discovery-v1'},
  metadata:clone(input.metadata||{})
 };
}
function validateResult(result={}){
 if(result?.subject?.type!=='emoji'||!clean(result?.subject?.id))return false;
 if(!Array.isArray(result.observations))return false;
 return result.observations.every(o=>clean(o.phrase)&&DIMENSIONS.includes(o.dimension));
}
function promptFor(emoji={}){
 const glyph=clean(emoji.glyph),name=clean(emoji.names?.cldr||emoji.names?.unicode),group=clean(emoji.taxonomy?.group),subgroup=clean(emoji.taxonomy?.subgroup);
 return `EMOJEO OPEN DISCOVERY v1\nSubject: ${glyph} ${name}\nOfficial context: group=${group||'unknown'}; subgroup=${subgroup||'unknown'}\n\nDescribe what is actually observable or strongly implied by this emoji. Do NOT force observations into a predefined vocabulary and do NOT optimize for consistency with other emoji. Look broadly for visual properties, depicted objects, expressions, actions, relationships, setting/context, symbolic associations, situational implications, and unusual structural features. Preserve odd or specific observations even if they may occur only once. Separate uncertainty into ambiguities. Do not turn Unicode group/subgroup labels into discovered traits merely because they were supplied as context.\n\nReturn JSON only: {"summary":"...","observations":[{"phrase":"short raw phrase","dimension":"visual|object|expression|action|relationship|setting|symbolic|situational|structural|other","description":"why it applies","evidence":["specific visible/implied cue"],"confidence":0.0}],"ambiguities":["..."],"rawNotes":["..."]}`;
}
function createRunner(options={}){
 const analyze=options.analyze;
 if(typeof analyze!=='function')throw new TypeError('Open discovery requires an analyze({emoji,prompt,signal}) adapter.');
 return async function discover(emoji={},runOptions={}){
  const subjectId=clean(emoji.id);if(!subjectId)throw new Error('Open discovery requires an emoji record ID.');
  const prompt=promptFor(emoji);
  const raw=await analyze({emoji:clone(emoji),prompt,signal:runOptions.signal||null});
  const parsed=typeof raw==='string'?JSON.parse(raw):raw;
  const result=normalizeResult(parsed,{subjectId,runId:runOptions.runId,at:runOptions.at,source:runOptions.source||options.source});
  if(!validateResult(result))throw new Error(`Invalid open-discovery result for ${subjectId}`);
  return result;
 };
}
function attachToEmoji(emoji={},result={}){
 if(!validateResult(result))throw new Error('Cannot attach invalid open-discovery result.');
 if(clean(emoji.id)!==clean(result.subject.id))throw new Error('Discovery subject does not match emoji record.');
 const next=clone(emoji);next.analysis=next.analysis||{};next.analysis.state='discovered';next.analysis.lastRunAt=result.run.at;
 next.analysis.metadata=next.analysis.metadata||{};
 const prior=Array.isArray(next.analysis.metadata.openDiscovery)?next.analysis.metadata.openDiscovery:[];
 next.analysis.metadata.openDiscovery=[...prior,clone(result)];
 return next;
}
const api=Object.freeze({DIMENSIONS,promptFor,normalizeResult,validateResult,createRunner,attachToEmoji});
if(typeof window!=='undefined')window.emojeoOpenDiscovery=api;
if(typeof globalThis!=='undefined')globalThis.emojeoOpenDiscovery=api;
})();
