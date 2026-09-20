/* Emojeo Semantic Pilot — Pass 28
   Builds a reproducible Unicode 18.0 semantic-discovery pilot without spending
   an AI call. Unicode group/subgroup stay source metadata and are deliberately
   excluded from the discovery prompt. */
(()=>{'use strict';
const DEFAULTS=Object.freeze({seed:'emojeo-unicode18-semantic-pilot-v1',subgroupCount:6,randomCount:40,maxSubgroupSubjects:30});
const clean=v=>String(v??'').trim();
const hashSeed=value=>{let h=2166136261>>>0;for(const ch of String(value)){h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0;}return h||1};
const rngFrom=seed=>{let x=hashSeed(seed);return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}};
const stableId=r=>clean(r?.id)||clean(r?.codePoints?.join('-'))||clean(r?.glyph);
const sourceMeta=r=>Object.freeze({id:stableId(r),glyph:r.glyph,codePoints:[...(r.codePoints||[])],name:clean(r.names?.cldr),group:clean(r.taxonomy?.group),subgroup:clean(r.taxonomy?.subgroup),sourceOrder:Number(r.taxonomy?.order)||0});
function completeSubgroups(records){
 const map=new Map();
 for(const r of records||[]){const g=clean(r.taxonomy?.group),s=clean(r.taxonomy?.subgroup);if(!g||!s)continue;const key=`${g}\u0000${s}`;if(!map.has(key))map.set(key,{group:g,subgroup:s,records:[]});map.get(key).records.push(r)}
 return [...map.values()].map(x=>({...x,records:x.records.slice().sort((a,b)=>(a.taxonomy?.order||0)-(b.taxonomy?.order||0))}));
}
function chooseSubgroups(records,{count=DEFAULTS.subgroupCount,maxSubjects=DEFAULTS.maxSubgroupSubjects}={}){
 const groups=new Map();for(const x of completeSubgroups(records)){if(x.records.length>maxSubjects)continue;if(!groups.has(x.group))groups.set(x.group,[]);groups.get(x.group).push(x)}
 const chosen=[];for(const [,subs] of groups){subs.sort((a,b)=>a.records.length-b.records.length||(a.records[0]?.taxonomy?.order||0)-(b.records[0]?.taxonomy?.order||0));if(subs[0])chosen.push(subs[0])}
 chosen.sort((a,b)=>(a.records[0]?.taxonomy?.order||0)-(b.records[0]?.taxonomy?.order||0));return chosen.slice(0,Math.max(0,count));
}
function randomSample(records,{seed=DEFAULTS.seed,count=DEFAULTS.randomCount,excludeIds=[]}={}){
 const excluded=new Set(excludeIds);const pool=(records||[]).filter(r=>!excluded.has(stableId(r))).slice().sort((a,b)=>stableId(a).localeCompare(stableId(b)));const rand=rngFrom(seed);
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
 return pool.slice(0,Math.max(0,count));
}
function create(records,options={}){
 const opts={...DEFAULTS,...options};const subgroups=chooseSubgroups(records,{count:opts.subgroupCount,maxSubjects:opts.maxSubgroupSubjects});const subgroupRecords=subgroups.flatMap(x=>x.records);const subgroupIds=new Set(subgroupRecords.map(stableId));const random=randomSample(records,{seed:opts.seed,count:opts.randomCount,excludeIds:subgroupIds});
 const subjects=[...subgroupRecords,...random];return Object.freeze({schemaVersion:1,kind:'emojeo-semantic-discovery-pilot',unicodeEmojiVersion:'18.0',seed:opts.seed,selection:{completeSubgroups:subgroups.map(x=>({group:x.group,subgroup:x.subgroup,count:x.records.length,subjectIds:x.records.map(stableId)})),random:{count:random.length,subjectIds:random.map(stableId)}},subjects:subjects.map(sourceMeta)});
}
function discoveryPrompt(subject){
 const s=sourceMeta(subject);return [
  'Analyze this Unicode emoji as a visual/semantic object.',
  `Emoji: ${s.glyph}`,
  `Official name: ${s.name}`,
  'Describe what is visibly represented and return unconstrained semantic tags that could help compare this emoji with very different emoji.',
  'Include concrete parts, objects, materials/textures, colors when intrinsic, shapes/structure, actions/poses, expressions/emotions, roles/occupations, settings or context implied by the symbol, and functional or relational properties.',
  'Do not force a predefined taxonomy. Do not infer a property merely because it is common for the official Unicode group or subgroup.',
  'Separate direct visual evidence from reasonable semantic interpretation. Preserve uncertainty.'
 ].join('\n');
}
function discoveryRequest(subject){const s=sourceMeta(subject);return Object.freeze({schemaVersion:1,subject:{id:s.id,glyph:s.glyph,codePoints:s.codePoints,name:s.name},sourceMetadata:{unicodeGroup:s.group,unicodeSubgroup:s.subgroup,sourceOrder:s.sourceOrder},prompt:discoveryPrompt(subject)});}
const api=Object.freeze({DEFAULTS,stableId,completeSubgroups,chooseSubgroups,randomSample,create,discoveryPrompt,discoveryRequest});
if(typeof window!=='undefined')window.emojeoSemanticPilot=api;if(typeof globalThis!=='undefined')globalThis.emojeoSemanticPilot=api;
})();
