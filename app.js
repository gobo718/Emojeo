const GENREACTRIX_BUILD="v0.9.40.212";
// v0.9.40.204 — Add first-pass binary AI W/L/C content ratings from Cloudflare Llama Guard; tap AI ratings for stored reasoning. Director five-size overrides remain unchanged.
// v0.9.40.203 — Add compact always-visible W/L/C content-rating controls; Director values are editable and persisted, AI values remain display-only placeholders.
// v0.9.40.148 — Theme reasoning diagnostic capture; Themes Info auto-paired with Theme analysis.
// v0.9.40.146 — selected completed-job Theme Sweep recovery; targeted Bundle retraction.
// v0.9.40.144 — Theme Sweep current-pack recovery + selected-target registration.
 // AI Console manual Theme analysis now registers as Pass 1 even when target=selected.
 // Current Staged results can be processed in place as completed Pass 1 with no rerun:
 // non-common triplets release to Bundling and only the most-common repeated triplet enters shuffled Pass 2.
 // Home layout unchanged.
window.GENREACTRIX_BUILD=GENREACTRIX_BUILD;
const PRIMFUSION_LABEL_FIT = Object.freeze({ preferredPx: 9, stepPx: 0.25, allowedShrinkRatio: 0.15, individualMinimumPx: 1 });
function setDirectorStatus(message){
  const status=$("directorStatus");
  if(status) status.textContent=message;
}
console.info(`Genreactrix JavaScript loaded: ${GENREACTRIX_BUILD}`);
const PRIMITIVES = [
  {id:"P01",name:"Beautiful",symbol:"✨"},
  {id:"P02",name:"Adorable",symbol:"🧸"},
  {id:"P03",name:"Tragic",symbol:"😭"},
  {id:"P04",name:"Funny",symbol:"🤣"},
  {id:"P05",name:"Intense",symbol:"💥"},
  {id:"P06",name:"Weird",symbol:"🌀"},
  {id:"P08",name:"Dreamy",symbol:"🌌"},
  {id:"P09",name:"Zazzly",symbol:"🌶️"},
  {id:"P10",name:"Disgusting",symbol:"🤢"},
  {id:"P11",name:"Scary",symbol:"👻"},
  {id:"P12",name:"Celebration",symbol:"🎉"},
  {id:"P07",name:"Angry",symbol:"🤬"}
];
const PRIMITIVE_BY_ID = Object.fromEntries(PRIMITIVES.map(p=>[p.id,p]));
const PRIMITIVE_BY_NAME = Object.fromEntries(PRIMITIVES.map(p=>[p.name,p]));
// Director reaction selections historically persist numeric slots. Ticket's old numeric
// slot remains legacy-only; active P07 is Angry and keeps the historical Angry slot.
// Smart is retired; active P12 is Celebration and keeps the historical Celebration slot,
// so existing Director classifications do not shift physical storage positions.
const LEGACY_REACTION_SLOT_BY_PRIM_ID = Object.freeze({P01:0,P02:1,P03:2,P04:3,P05:4,P06:5,P07:13,P08:7,P09:8,P10:9,P11:10,P12:12});
const primitiveSelectionToken=primitive=>LEGACY_REACTION_SLOT_BY_PRIM_ID[primitive?.id];
// Cloud Worker / PrimFusion Matrix canonical IDs keep Adorable=P01 and Beautiful=P02.
// The local reaction display order historically stores those two in the opposite P slots,
// so AI payload lookup must resolve by canonical semantic identity rather than local slot ID.
const AI_CANONICAL_PRIM_ID_BY_NAME = Object.freeze({Beautiful:"P02",Adorable:"P01",Tragic:"P03",Funny:"P04",Intense:"P05",Weird:"P06",Angry:"P07",Dreamy:"P08",Zazzly:"P09",Disgusting:"P10",Scary:"P11",Celebration:"P12"});
const AI_CANONICAL_PRIM_NAME_BY_ID = Object.freeze(Object.fromEntries(Object.entries(AI_CANONICAL_PRIM_ID_BY_NAME).map(([name,id])=>[id,name])));
const LEGACY_AI_PRIM_ID_ALIASES = Object.freeze({P07:Object.freeze(["P07"])});

const CUSTOM_REACTION_LIBRARY_KEY="genreactrix-custom-reactions-v1";
const CUSTOM_THEME_LIBRARY_KEY="genreactrix-custom-themes-v2";
const CUSTOM_THEME_LEGACY_KEYS=["genreactrix-v0.9.1-writeins","genreactrix-v0.8.0-writeins","genreactrix-v0.7.0-writeins"];
const slugifyCustom=value=>String(value||"").trim().toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||`item-${Date.now()}`;
function projectLocalKey(key){return window.genreactrixProjectRuntimeEngine?.projectKey?.(key)||key;}
function readJsonArray(key){try{const scoped=projectLocalKey(key),raw=localStorage.getItem(scoped)??(scoped!==key?localStorage.getItem(key):null),value=JSON.parse(raw||"[]");if(scoped!==key&&raw&&localStorage.getItem(scoped)==null)localStorage.setItem(scoped,raw);return Array.isArray(value)?value:[]}catch{return []}}
function writeJsonArray(key,value){const raw=JSON.stringify(Array.isArray(value)?value:[]),scoped=projectLocalKey(key);localStorage.setItem(scoped,raw);window.genreactrixProjectRuntimeEngine?.setProjectValue?.(key,raw).catch?.(()=>{});}
function dedupeReactionRefs(refs){const seen=new Set();return (Array.isArray(refs)?refs:[]).filter(ref=>{if(!ref?.id)return false;const key=`${ref.type||"canonical"}:${ref.id}`;if(seen.has(key))return false;seen.add(key);return true;}).map(ref=>({type:ref.type==="custom"?"custom":"canonical",id:String(ref.id)}));}
function normalizedReactionRefs(theme){if(!theme)return[];if(Array.isArray(theme.reactionRefs))return dedupeReactionRefs(theme.reactionRefs);if(Array.isArray(theme.primitiveIds))return dedupeReactionRefs(theme.primitiveIds.map(id=>({type:"canonical",id})));if(theme.primitiveId)return[{type:"canonical",id:theme.primitiveId}];return[];}
function reactionRefKey(ref){if(!ref?.id)return"";return`${ref.type==="custom"?"custom":"canonical"}:${String(ref.id)}`;}
function normalizeCustomReaction(value){if(!value)return null;const label=String(value.label||value.name||"").trim();const emoji=String(value.emoji||value.symbol||"").trim();if(!label||!emoji)return null;return{id:String(value.id||`custom-reaction:${slugifyCustom(label)}`),label,emoji,kind:"customReaction",createdAt:value.createdAt||new Date().toISOString(),updatedAt:value.updatedAt||new Date().toISOString()};}
function normalizeCustomThemeRecord(value){if(!value)return null;if(typeof value==="string")value={label:value};const label=String(value.label||value.name||"").trim();if(!label)return null;return{id:String(value.id||`custom-theme:${slugifyCustom(label)}`),label,kind:"customTheme",reactionRefs:normalizedReactionRefs(value),createdAt:value.createdAt||new Date().toISOString(),updatedAt:value.updatedAt||new Date().toISOString()};}
function loadCustomReactions(){return readJsonArray(CUSTOM_REACTION_LIBRARY_KEY).map(normalizeCustomReaction).filter(Boolean);}
function saveCustomReactions(records){const normalized=records.map(normalizeCustomReaction).filter(Boolean);writeJsonArray(CUSTOM_REACTION_LIBRARY_KEY,normalized);state.customReactions=normalized;return normalized;}
function loadCustomThemes(){let records=readJsonArray(CUSTOM_THEME_LIBRARY_KEY).map(normalizeCustomThemeRecord).filter(Boolean);if(!records.length){let legacy=[];for(const key of CUSTOM_THEME_LEGACY_KEYS){legacy=readJsonArray(key);if(legacy.length)break;}records=legacy.map(normalizeCustomThemeRecord).filter(Boolean);if(records.length)writeJsonArray(CUSTOM_THEME_LIBRARY_KEY,records);}return records;}
function saveCustomThemes(records){const normalized=records.map(normalizeCustomThemeRecord).filter(Boolean);writeJsonArray(CUSTOM_THEME_LIBRARY_KEY,normalized);state.customThemes=normalized;state.writeIns=normalized.map(item=>item.label);return normalized;}
function allReactionRecords(){return[...PRIMITIVES.map(p=>({id:p.id,label:p.name,emoji:p.symbol,kind:"canonicalReaction",type:"canonical"})),...(state.customReactions||[]).map(r=>({...r,type:"custom"}))];}
function reactionRecordFromRef(ref){if(!ref)return null;if(ref.type==="custom")return(state.customReactions||[]).find(r=>r.id===ref.id)||{id:ref.id,label:"Missing custom reaction",emoji:"?",kind:"missingReaction",type:"custom"};const p=PRIMITIVE_BY_ID[ref.id];return p?{id:p.id,label:p.name,emoji:p.symbol,kind:"canonicalReaction",type:"canonical"}:null;}
function customReactionSelectionToken(id){return`custom:${id}`;}

const primitivePairId=(a,b)=>window.classificationMatrixEngine?.pairKey?.(a,b)||[a,b].sort().join("|");
const primFusionCellId=(a,b)=>window.classificationMatrixEngine?.intersection?.(a,b)?.id||`CELL:${primitivePairId(a,b)}`;



const CANONICAL_PRIMFUSION_LABELS = {
  "Beautiful|Beautiful": "Beautiful",
  "Adorable|Beautiful": "Cozy",
  "Beautiful|Tragic": "Mundane",
  "Beautiful|Funny": "Camp",
  "Beautiful|Intense": "Epic",
  "Beautiful|Weird": "Psychedelic",
  "Beautiful|Dreamy": "Satisfying",
  "Beautiful|Zazzly": "Fleshy",
  "Beautiful|Disgusting": "Grotesque",
  "Beautiful|Scary": "Vulnerable",
  "Beautiful|Celebration": "Festive",
  "Angry|Beautiful": "Bougie",
  "Adorable|Adorable": "Adorable",
  "Adorable|Tragic": "Poignant",
  "Adorable|Funny": "Goofy",
  "Adorable|Intense": "Joy",
  "Adorable|Weird": "Whimsical",
  "Adorable|Dreamy": "Romance",
  "Adorable|Zazzly": "Cheeky",
  "Adorable|Disgusting": "UglyCute",
  "Adorable|Scary": "CreepyCute",
  "Adorable|Celebration": "Playful",
  "Adorable|Angry": "Sassy",
  "Tragic|Tragic": "Tragic",
  "Funny|Tragic": "Schadenfreude",
  "Intense|Tragic": "Despair",
  "Tragic|Weird": "Nightmarish",
  "Dreamy|Tragic": "Nostalgia",
  "Tragic|Zazzly": "Humiliation",
  "Disgusting|Tragic": "Shame",
  "Scary|Tragic": "Cringe",
  "Celebration|Tragic": "Bittersweet",
  "Angry|Tragic": "Overstimulated",
  "Funny|Funny": "Funny",
  "Funny|Intense": "Hilarious",
  "Funny|Weird": "Absurd",
  "Dreamy|Funny": "Medicated",
  "Funny|Zazzly": "Raunchy",
  "Disgusting|Funny": "Grossout",
  "Funny|Scary": "Scandalarious",
  "Celebration|Funny": "PartyTime",
  "Angry|Funny": "Mockery",
  "Intense|Intense": "Intense",
  "Intense|Weird": "Chaotic",
  "Dreamy|Intense": "Ethereal",
  "Intense|Zazzly": "Exposure",
  "Disgusting|Intense": "Collapse",
  "Intense|Scary": "Corrupted",
  "Celebration|Intense": "Glory",
  "Angry|Intense": "Aggressive",
  "Angry|Dreamy": "Cursed",
  "Weird|Weird": "Weird",
  "Weird|Zazzly": "FreakyDeaky",
  "Disgusting|Weird": "Strange",
  "Scary|Weird": "Horror",
  "Celebration|Weird": "Freakshow",
  "Angry|Weird": "Monstrous",
  "Dreamy|Dreamy": "Dreamy",
  "Dreamy|Zazzly": "Seduction",
  "Disgusting|Dreamy": "Phantasmagoric",
  "Dreamy|Scary": "Eerie",
  "Celebration|Dreamy": "Magical",
  "Zazzly|Zazzly": "Zazzly",
  "Disgusting|Zazzly": "Lewd",
  "Scary|Zazzly": "Zazzploitation",
  "Celebration|Zazzly": "ZazzlyParty",
  "Angry|Zazzly": "Sadomasochism",
  "Disgusting|Disgusting": "Disgusting",
  "Disgusting|Scary": "Foreboding",
  "Celebration|Disgusting": "Excess",
  "Angry|Disgusting": "Outrage",
  "Scary|Scary": "Scary",
  "Dreamy|Weird": "Spirituality",
  "Angry|Scary": "Paranoia",
  "Celebration|Scary": "Halloween",
  "Celebration|Celebration": "Celebration",
  "Angry|Celebration": "Badass",
  "Angry|Angry": "Angry"
};

function canonicalPrimFusionLabel(firstName, secondName){
  const first=PRIMITIVE_BY_NAME[firstName],second=PRIMITIVE_BY_NAME[secondName];
  const generic=first&&second?genericMatrixIntersectionLabel(first.id,second.id):null;
  if(generic)return generic;
  const key=[firstName,secondName].sort().join("|");
  return CANONICAL_PRIMFUSION_LABELS[key] || (firstName===secondName ? firstName : `${firstName} + ${secondName}`);
}

// Compatibility adapter: Genreactrix supplies the vocabulary; the matrix engine supplies
// product-neutral item/intersection mechanics. Future applications replace this definition,
// not the matrix implementation.
const GENREACTRIX_MATRIX_DEFINITION = {
  id:"genreactrix-primfusion",
  label:"PrimFusion Matrix",
  items:PRIMITIVES.map(p=>({id:p.id,label:p.name,symbol:p.symbol})),
  intersections:Object.fromEntries(Object.entries(CANONICAL_PRIMFUSION_LABELS).map(([names,label])=>{
    const ids=names.split("|").map(name=>PRIMITIVE_BY_NAME[name]?.id).filter(Boolean);
    return ids.length===2 ? [window.classificationMatrixEngine.pairKey(ids[0],ids[1]),label] : null;
  }).filter(Boolean)),
  orderedPairs:false,
  allowSelfPairs:true
};
window.classificationMatrixEngine?.configure?.(GENREACTRIX_MATRIX_DEFINITION);

function genericMatrixIntersectionLabel(firstId,secondId){
  return window.classificationMatrixEngine?.intersection?.(firstId,secondId)?.label || null;
}

// v0.9.40.166 — fresh independent Reaction and Theme/Description Worker requests now launch concurrently; local commits remain serialized.
// v0.9.40.165 — linked-image display fallback: if a direct linked URL cannot render, resolve it through the existing Worker image proxy without changing linked storage semantics.
// v0.9.40.164 — PrimFusion Matrix bottom-right heading restored with Smart 🧠. Geometry and taxonomy unchanged.
// v0.9.40.163 — Goofy/Camp swap. PFM0104 (Adorable + Funny) is now Goofy and PFM0204 (Beautiful + Funny) is now Camp. Charming remains retired. Active Prim IDs are P01-P12 with Angry at P07 and Celebration at P12.
window.genreactrixCurrentFusionThemes = Object.freeze([...new Set(
  Object.entries(CANONICAL_PRIMFUSION_LABELS)
    .filter(([pair])=>{const [a,b]=pair.split("|");return a!==b;})
    .map(([,label])=>label)
)]);

const BASE_THEMES = [
  "Fantasy","Nature","Mythology","Cute","Food","Animal","Magic","Adventure",
  "Comedy","Romance","Science Fiction","Holiday","Transformation",
  "Dreamlike","Mechanical","Aquatic","Celestial","Domestic","Gothic",
  "Royalty","Sports","Music","Transportation","Weather","Horror","Mystery"
];

// Reusable-engine compatibility view. This exposes Genreactrix vocabulary to the
// generic tag layer without changing the specialized Reaction/Theme implementation.
window.genreactrixTagSource = Object.freeze({
  reactions:Object.freeze(PRIMITIVES.map(p=>Object.freeze({id:p.id,label:p.name,symbol:p.symbol,metadata:{legacySelectionToken:primitiveSelectionToken(p)}}))),
  themes:Object.freeze([
    ...BASE_THEMES.map(label=>Object.freeze({id:`base-theme:${slugifyCustom(label)}`,label,kind:"baseTheme"})),
    ...Object.entries(CANONICAL_PRIMFUSION_LABELS).map(([names,label])=>{
      const reactionRefs=names.split("|").map(name=>PRIMITIVE_BY_NAME[name]).filter(Boolean).map(p=>({type:"reaction",id:p.id}));
      return Object.freeze({id:`fusion-theme:${slugifyCustom(label)}`,label,kind:"primFusionTheme",reactionRefs});
    })
  ])
});
window.genreactrixTagCompatibility?.register?.();

const DEMOS = [
  {
    src: svgData("MUTOSIS","🦄","🦥"),
    description:"A dreamy creature mashup combining a unicorn with a sloth. The composition is whimsical, gentle, and intentionally improbable.",
    aiThemes:[["Fantasy",96],["Cute",82],["Nature",59]],
    aiWeights:{P01:79,P02:72,P03:4,P04:18,P05:12,P06:42,P08:88,P09:5,P10:0,P11:8,P12:21,P07:0}
  },
  {
    src: svgData("MUTOSIS","🐙","🫖"),
    description:"An octopus–teapot hybrid with domestic and aquatic visual cues. The humor comes from treating an object as a living creature.",
    aiThemes:[["Aquatic",93],["Comedy",77],["Domestic",65]],
    aiWeights:{P01:18,P02:12,P03:2,P04:91,P05:20,P06:85,P08:27,P09:9,P10:5,P11:15,P12:33,P07:0}
  },
  {
    src: svgData("MUTOSIS","🐈","🌙"),
    description:"A cat merged with a crescent moon. The image reads as nocturnal fantasy with celestial and magical themes.",
    aiThemes:[["Celestial",94],["Magic",89],["Fantasy",86]],
    aiWeights:{P01:88,P02:64,P03:3,P04:9,P05:17,P06:39,P08:92,P09:4,P10:0,P11:31,P12:16,P07:0}
  }
];

function svgData(label,a,b){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
  <defs><radialGradient id="g"><stop stop-color="#493761"/><stop offset="1" stop-color="#17141e"/></radialGradient></defs>
  <rect width="800" height="800" rx="64" fill="url(#g)"/>
  <text x="400" y="210" fill="#d9c3ff" font-size="48" text-anchor="middle" font-family="system-ui">${label}</text>
  <text x="315" y="500" font-size="210" text-anchor="middle">${a}</text>
  <text x="490" y="500" font-size="210" text-anchor="middle">${b}</text>
  <text x="400" y="670" fill="#f4eef8" font-size="32" text-anchor="middle" font-family="system-ui">Genreactrix demo image</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);
}

const state = {
  files: [],
  demoIndex: 0,
  index: 0,
  records: {},
  selectedReactions: [],
  themes: [null,null,null],
  targetSlot: 1,
  flagged: false,
  writeIn: "",
  retention: "keep",
  history: [],
  future: [],
  writeIns: [],
  customThemes: [],
  customReactions: [],
  objectUrls: [],
  visitBaseline: null,
  aiRuns: {},
  canonicalFeedActive: true,
  feedEmpty: true
};

// Queue owns AI-complete images as Staged until the Bundle Engine moves them into Inbox.
const LANDSCAPE_FILTER_KEY="genreactrix-landscape-filter-v7";
const LANDSCAPE_FILTER_LEGACY_KEYS=["genreactrix-landscape-filter-v6","genreactrix-landscape-filter-v5","genreactrix-landscape-filter-v4","genreactrix-landscape-filter-v3","genreactrix-landscape-filter-v2","genreactrix-landscape-filter-v1"];
const LEGACY_SIDELINE_FILTER_KEY=["par","ked"].join("");
const FILTER_STATUS_CATEGORIES=["review","rejection","reject","kept","depot","seen","tuned","slopWarning","slopDetected"];
const FILTER_SAFETY_SOURCES=["ai","director"];
const FILTER_SAFETY_AXES=["work","lunch","civility"];
const FILTER_SAFETY_SIZES=["XS","S","M","L","XL"];
const FILTER_SAFETY_CATEGORIES=FILTER_SAFETY_SOURCES.flatMap(source=>FILTER_SAFETY_AXES.flatMap(axis=>FILTER_SAFETY_SIZES.map(size=>`safety_${source}_${axis}_${size}`)));
const FILTER_CATEGORIES=[...FILTER_STATUS_CATEGORIES,...FILTER_SAFETY_CATEGORIES];
const SORT_MODES=new Set(["bundle","newest","oldest","filename","random"]);
const defaultLandscapeFilter=()=>{
  const include={},exclude={};
  FILTER_CATEGORIES.forEach(key=>{include[key]=false;exclude[key]=false;});
  return{all:false,feed:true,include,exclude,bundleId:null,sort:"bundle",randomSeed:0};
};
function normalizeLandscapeFilter(value,{legacy=false}={}){
  const base=defaultLandscapeFilter(), input=value&&typeof value==="object"?value:{};
  if(Object.prototype.hasOwnProperty.call(input,"all"))base.all=Boolean(input.all);
  if(Object.prototype.hasOwnProperty.call(input,"feed"))base.feed=Boolean(input.feed);
  FILTER_CATEGORIES.forEach(key=>{base.include[key]=Boolean(input.include?.[key]);base.exclude[key]=Boolean(input.exclude?.[key]);});
  if(input.include?.slop){base.include.slopWarning=true;base.include.slopDetected=true;}
  if(input.exclude?.slop){base.exclude.slopWarning=true;base.exclude.slopDetected=true;}
  if(legacy){
    // The superseded sidelining state behaved as Review, never as Depot.
    if(input.include?.[LEGACY_SIDELINE_FILTER_KEY])base.include.review=true;
    if(input.exclude?.[LEGACY_SIDELINE_FILTER_KEY])base.exclude.review=true;
  }
  base.bundleId=input.bundleId?String(input.bundleId):(input.packId?String(input.packId):null);
  const incomingSort=input.sort==="pack"?"bundle":input.sort;
  base.sort=SORT_MODES.has(incomingSort)?incomingSort:"bundle";
  base.randomSeed=Number(input.randomSeed)||0;
  if(base.all&&base.feed)base.feed=false;
  if(FILTER_CATEGORIES.some(key=>base.include[key])){base.all=false;base.feed=false;}
  return base;
}
function loadLandscapeFilter(){
  try{
    const current=localStorage.getItem(LANDSCAPE_FILTER_KEY);
    if(current)return normalizeLandscapeFilter(JSON.parse(current));
    for(const key of LANDSCAPE_FILTER_LEGACY_KEYS){
      const legacy=localStorage.getItem(key);
      if(legacy)return normalizeLandscapeFilter(JSON.parse(legacy),{legacy:true});
    }
    return defaultLandscapeFilter();
  }catch{return defaultLandscapeFilter();}
}
let landscapeFilter=loadLandscapeFilter();
let landscapeFeedDirty=false;
let landscapeRehydrateTimer=0;
let landscapeRehydrateGeneration=0;
let landscapeHydrationPending=0;
const landscapeHydrationInFlight=new Map();
const LANDSCAPE_ASSET_TIMEOUT_MS=12000;
const LANDSCAPE_PREFETCH_RADIUS=1;
let landscapeHydrationWindowIds=[];
function saveLandscapeFilter(){localStorage.setItem(LANDSCAPE_FILTER_KEY,JSON.stringify(landscapeFilter));}
function recordHasRequestedAi(record){return ["aiReactions","aiThemes","aiDescription"].every(key=>record?.components?.[key]==="current");}
function recordHasPrimaryAiFailure(record){return ["aiReactions","aiThemes","aiDescription","aiReactionReasons","aiGenreReasons"].some(key=>record?.components?.[key]==="failed");}
function recordAlreadyInInbox(record){
  const ext=record?.metadata?.extended||{};
  const active=[...(Array.isArray(ext.inboxBundleIds)?ext.inboxBundleIds:[]),...(Array.isArray(ext.inboxPackIds)?ext.inboxPackIds:[])];
  const history=[...(Array.isArray(ext.inboxHistoryBundleIds)?ext.inboxHistoryBundleIds:[]),...(Array.isArray(ext.inboxHistoryPackIds)?ext.inboxHistoryPackIds:[])];
  return record?.workflow?.stage==="inbox-working"||active.length>0||history.length>0||Boolean(ext.lastInboxBatchId);
}
function recordIsStaged(record){return Boolean(record)&&record.workflow?.stage==="staged"&&recordHasRequestedAi(record)&&!record.attributes?.inRecycleBin&&!record.attributes?.rejected&&!record.attributes?.archived;}
function aiOutputRecords(){return (window.genreactrixImagesEngine?.allRecords?.()||[]).filter(recordIsStaged);}
function currentAiFailureRecords(){return (window.genreactrixImagesEngine?.allRecords?.()||[]).filter(record=>recordHasPrimaryAiFailure(record)&&!['quarantine','defective'].includes(String(record.workflow?.stage||''))&&!record.attributes?.inRecycleBin&&!record.attributes?.rejected&&!record.attributes?.archived&&!recordAlreadyInInbox(record));}
window.genreactrixInboxAiOutputRecords=()=>aiOutputRecords().map(record=>structuredClone(record));
window.genreactrixCurrentAiFailureRecords=()=>currentAiFailureRecords().map(record=>structuredClone(record));
function recordIsTuned(record){
  const ext=record?.metadata?.extended||{};return ext.aiTuned===true;
}
function recordSlopAssessment(record){return record?.metadata?.extended?.aiSlopAssessment||record?.analysis?.ai?.components?.slopAssessment||null}
function slopAssessmentKind(assessment){if(assessment?.detected)return'detected';if(assessment?.warning===true||String(assessment?.status||'').toLowerCase()==='warning'||String(assessment?.kind||'').toLowerCase()==='warning')return'warning';return'none'}
function recordHasSlopSuggestion(record,kind=null){const assessment=recordSlopAssessment(record),actual=slopAssessmentKind(assessment);if(actual==='none'||(kind&&actual!==kind))return false;const review=record?.metadata?.extended?.slopDirectorReview||null;if(review?.decision==='not-slop'&&String(review.assessmentId||'')===String(assessment.assessmentId||''))return false;return true}
function recordMatchesFilterCategory(record,key){
  if(key==="review")return Boolean(record.attributes?.flagged);
  if(key==="rejection")return Boolean(record.attributes?.rejectionFlagged);
  if(key==="reject")return Boolean(record.attributes?.rejected);
  if(key==="kept")return Boolean(record.attributes?.saved);
  if(key==="depot")return Boolean(record.attributes?.depot);
  if(key==="seen")return Boolean(record.attributes?.seen);
  if(key==="tuned")return recordIsTuned(record);
  if(key==="slop")return recordHasSlopSuggestion(record);
  if(key==="slopWarning")return recordHasSlopSuggestion(record,'warning');
  if(key==="slopDetected")return recordHasSlopSuggestion(record,'detected');
  if(key.startsWith("safety_")){
    const parts=key.split("_"),source=parts[1],axis=parts[2],size=parts[3];
    if(!["ai","director"].includes(source)||!["work","lunch","civility"].includes(axis)||!["XS","S","M","L","XL"].includes(size))return false;
    const ratings=imageContentRatings(record);
    return ratings[source]?.[axis]===size;
  }
  return false;
}
function recordEligibleForLandscapeBase(record){return Boolean(record)&&!record.attributes?.inRecycleBin&&record.workflow?.stage==="inbox-working";}
function inboxBundleById(id){return window.genreactrixBundleEngine?.byId?.(id)||null;}
function inboxImageIds(){return new Set((window.genreactrixImagesEngine?.allRecords?.()||[]).filter(record=>record.workflow?.stage==="inbox-working").map(record=>String(record.id)));}
function inboxContainsImage(imageId){return inboxImageIds().has(String(imageId));}
async function finalizeInboxBatchImages(imageIds,{batchId=null,submittedAt=null}={}){
  const result=await window.genreactrixBundleEngine?.finalizeBatchImages?.(imageIds,{batchId,submittedAt})||{removedImages:0,remainingBundles:0};
  await rehydrateLandscapeFeed();renderPortraitInboxControls();return result;
}
window.genreactrixInboxLifecycle={
  contains:inboxContainsImage,
  activeImageIds:()=>[...inboxImageIds()],
  finalizeBatchImages:finalizeInboxBatchImages
};
function bundleOrderMap(){
  const order=new Map();let n=0;
  const bundles=landscapeFilter.bundleId?[inboxBundleById(landscapeFilter.bundleId)].filter(Boolean):(window.genreactrixBundleEngine?.activeBundles?.()||[]);
  for(const bundle of bundles){for(const id of bundle.imageIds||[]){if(!order.has(id))order.set(id,n++);}}
  return order;
}
function deterministicRandomRank(id,seed){
  let h=(Number(seed)||1)>>>0;for(const ch of String(id)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h;
}
function sortLandscapeRecords(records){
  const rows=[...records],mode=landscapeFilter.sort;
  if(mode==="newest")rows.sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
  else if(mode==="oldest")rows.sort((a,b)=>String(a.createdAt||"").localeCompare(String(b.createdAt||"")));
  else if(mode==="filename")rows.sort((a,b)=>String(a.source?.originalFilename||a.name||a.id).localeCompare(String(b.source?.originalFilename||b.name||b.id),undefined,{numeric:true,sensitivity:"base"}));
  else if(mode==="random"){const seed=landscapeFilter.randomSeed||1;rows.sort((a,b)=>deterministicRandomRank(a.id,seed)-deterministicRandomRank(b.id,seed));}
  else{const order=bundleOrderMap();rows.sort((a,b)=>(order.get(a.id)??Number.MAX_SAFE_INTEGER)-(order.get(b.id)??Number.MAX_SAFE_INTEGER));}
  return rows;
}
function filteredLandscapeRecords(){
  const inboxIds=inboxImageIds();
  let records=(window.genreactrixImagesEngine?.allRecords?.()||[]).filter(record=>inboxIds.has(String(record.id))&&recordEligibleForLandscapeBase(record));
  if(landscapeFilter.bundleId){const selected=inboxBundleById(landscapeFilter.bundleId);const ids=new Set(selected?.imageIds||[]);records=records.filter(record=>ids.has(String(record.id)));}
  const includeKeys=FILTER_CATEGORIES.filter(key=>landscapeFilter.include[key]);
  let candidates=[];
  if(landscapeFilter.all)candidates=records;
  else if(landscapeFilter.feed)candidates=records.filter(r=>!r.attributes?.depot&&!r.attributes?.rejectionFlagged&&!r.attributes?.rejected);
  else if(includeKeys.length)candidates=records.filter(r=>includeKeys.some(key=>recordMatchesFilterCategory(r,key)));
  const excludeKeys=FILTER_CATEGORIES.filter(key=>landscapeFilter.exclude[key]);
  if(excludeKeys.length)candidates=candidates.filter(r=>!excludeKeys.some(key=>recordMatchesFilterCategory(r,key)));
  return sortLandscapeRecords(candidates);
}

function currentImageRecord(){return state.canonicalFeedActive&&state.files.length?window.genreactrixImagesEngine?.recordById?.(currentKey())||null:null;}


const $ = id => document.getElementById(id);
const $$ = selector => document.querySelectorAll(selector);
const currentKey = () => state.files.length ? (state.files[state.index].id || state.files[state.index].name) : `demo-${state.demoIndex}`;
const currentDemo = () => DEMOS[state.demoIndex % DEMOS.length];

function currentSource(){
  if(state.feedEmpty)return "";
  return state.files.length ? state.files[state.index].url : currentDemo().src;
}
function currentLandscapeFile(){return state.canonicalFeedActive&&state.files.length?state.files[state.index]||null:null;}
function requestCurrentLandscapeAsset(){
  const file=currentLandscapeFile();
  if(!file?.id)return;
  const generation=landscapeRehydrateGeneration;
  if(file.isHydratingAsset){
    hydrateLandscapeAssetNow(String(file.id),generation,{urgent:true}).catch(error=>console.warn("Current Landscape asset hydration failed",file.id,error));
  }
  // Hydrate only the active image and its immediate neighbors. The logical
  // Inbox population remains fully available without materializing every asset.
  queueMicrotask(()=>hydrateLandscapeWindow(generation,state.index).catch(error=>console.warn("Landscape prefetch window failed",error)));
}
async function markLandscapeAssetUnavailable(imageId,failedSrc,message="Image source could not be displayed."){
  const id=String(imageId||"");if(!id)return;
  let index=state.files.findIndex(file=>String(file.id)===id);if(index<0)return;
  let live=state.files[index];
  if(live?.isMissingAsset||String(live?.url||"")!==String(failedSrc||""))return;
  const record=live.imageRecord||window.genreactrixImagesEngine?.recordById?.(id)||null;

  // v0.9.40.165 — A linked source may be a webpage (for example a Wikimedia
  // Commons File: page) rather than directly decodable image bytes. Do not
  // mutate the Image Record or convert linked storage into a local copy. Only
  // after the browser proves the direct <img> source cannot render, ask the
  // existing Worker image proxy for display bytes and use a temporary object URL.
  if(record?.storage?.mode==="linked"&&!record?.attributes?.saved&&!live?.isResolvedRemoteSource){
    try{
      const imagesEngine=/** @type {any} */(window).genreactrixImagesEngine;
      const resolved=await imagesEngine?.resolveLinkedDisplay?.(id,{failedSrc});
      index=state.files.findIndex(file=>String(file.id)===id);if(index<0)return;
      live=state.files[index];
      // Navigation or another hydration may have replaced this source while the
      // proxy request was in flight. Never overwrite newer display state.
      if(String(live?.url||"")!==String(failedSrc||""))return;
      if(resolved?.url){
        state.files[index]={...resolved,id,imageRecord:resolved.imageRecord||record,isHydratingAsset:false,isResolvedRemoteSource:true};
        if(index===state.index){renderImage();renderTabletWorkbench();}
        return;
      }
    }catch(error){
      message=`${message} Worker display fallback failed: ${String(error?.message||error)}`;
    }
  }

  const imagesEngine=/** @type {any} */(window).genreactrixImagesEngine;
  const missing=imagesEngine?.missingAssetPlaceholder?.(record,message);
  if(!missing)return;
  state.files[index]={...missing,id,imageRecord:missing.imageRecord||record,isHydratingAsset:false};
  if(index===state.index){renderImage();renderTabletWorkbench();}
}
function canonicalAiRunFromRecord(record){
  const ai=record?.analysis?.ai;if(!ai)return null;
  const components=ai.components||{};
  const normalizeAiKey=value=>String(value??"").trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g,"");
  const reactionAliases={};
  let rawReactions=components.reactions??components.aiReactions??ai.reactions??ai.aiReactions??ai.weights??null;
  if(rawReactions&&typeof rawReactions==="object"&&!Array.isArray(rawReactions)&&rawReactions.reactions&&typeof rawReactions.reactions==="object")rawReactions=rawReactions.reactions;
  const reactionRows=Array.isArray(rawReactions)?rawReactions:[];
  const reactionObject=rawReactions&&typeof rawReactions==="object"&&!Array.isArray(rawReactions)?rawReactions:{};
  const reactionObjectByKey=new Map(Object.entries(reactionObject).map(([key,value])=>[normalizeAiKey(key),value]));
  const weights=Object.fromEntries(PRIMITIVES.map(p=>{
    const canonicalAiId=AI_CANONICAL_PRIM_ID_BY_NAME[p.name]||p.id;
    const aliases=[canonicalAiId,...(LEGACY_AI_PRIM_ID_ALIASES[canonicalAiId]||[]),p.name,...(reactionAliases[canonicalAiId]||reactionAliases[p.id]||[])];
    let row=null;
    for(const alias of aliases){const hit=reactionObjectByKey.get(normalizeAiKey(alias));if(hit!==undefined){row=hit;break;}}
    if(row==null&&reactionRows.length){
      row=reactionRows.find(item=>aliases.some(alias=>normalizeAiKey(item?.name??item?.id??item?.reaction??item?.label)===normalizeAiKey(alias)))??null;
    }
    const value=typeof row==="number"?row:(row?.percentage??row?.confidence??row?.score??row?.weight??row?.value??ai.weights?.[p.id]??0);
    return[p.id,Math.max(0,Math.min(100,Number(value)||0))];
  }));
  let rawThemes=components.themes??components.aiThemes??ai.themes??ai.aiThemes??[];
  if(rawThemes&&typeof rawThemes==="object"&&!Array.isArray(rawThemes)&&Array.isArray(rawThemes.themes))rawThemes=rawThemes.themes;
  const resolveAiThemeLabel=(row,rawLabel)=>{
    const label=String(rawLabel||"").trim();
    if(label && !/^PFM\d{4}$/i.test(label)) return label;
    const candidate=String((typeof row==="object"&&row?.code)||label).trim().toUpperCase();
    const match=candidate.match(/^PFM(\d{2})(\d{2})$/);
    if(!match)return label;
    const firstName=AI_CANONICAL_PRIM_NAME_BY_ID[`P${match[1]}`];
    const secondName=AI_CANONICAL_PRIM_NAME_BY_ID[`P${match[2]}`];
    return firstName&&secondName?canonicalPrimFusionLabel(firstName,secondName):label;
  };
  const themes=(Array.isArray(rawThemes)?rawThemes:[]).map((row,index)=>{
    const rawLabel=String(typeof row==="string"?row:(row?.theme??row?.name??row?.proposedName??row?.label??row?.code??"")).trim();if(!rawLabel)return null;
    const label=resolveAiThemeLabel(row,rawLabel);
    const value=typeof row==="string"?0:(row?.percentage??row?.confidence??row?.score??row?.weight??0);
    return{id:row?.id||row?.code||`ai-theme:${index}:${label.toLowerCase()}`,label,weight:Math.max(0,Math.min(100,Number(value)||0)),evidence:row?.evidence||row?.reason||"",role:row?.role||""};
  }).filter(Boolean);
  let rawDescription=components.description??components.aiDescription??ai.description??ai.aiDescription??"";
  if(rawDescription&&typeof rawDescription==="object")rawDescription=rawDescription.description??rawDescription.text??rawDescription.value??"";
  const description=String(rawDescription).trim();
  return {
    id:ai.jobId||ai.id||`${record.id}-ai`,
    createdAt:ai.recordedAt||ai.analyzedAt||record.updatedAt||new Date().toISOString(),
    model:ai.model||ai.provider?.model||"",
    interpretationSystemVersion:"IS-1",
    weights,themes,description,provider:ai.provider||{},promptVersions:ai.promptVersions||{}
  };
}
function currentDescription(){
  if(state.feedEmpty)return "No images match the current Landscape filter.";
  if(state.files.length)return canonicalAiRunFromRecord(currentImageRecord())?.description||"No AI description is stored for this image.";
  return currentDemo().description;
}
function defaultAiRun(){
  if(state.feedEmpty){
    return {id:"filter-empty",createdAt:new Date().toISOString(),model:"none",interpretationSystemVersion:"IS-1",weights:Object.fromEntries(PRIMITIVES.map(p=>[p.id,0])),themes:[],description:currentDescription()};
  }
  if(state.files.length){
    const canonical=canonicalAiRunFromRecord(currentImageRecord());
    if(canonical)return canonical;
    return {id:`${currentKey()}-no-ai`,createdAt:new Date().toISOString(),model:"none",interpretationSystemVersion:"IS-1",weights:Object.fromEntries(PRIMITIVES.map(p=>[p.id,0])),themes:[],description:currentDescription()};
  }
  const demo=currentDemo();
  return {
    id:`demo-${state.demoIndex}-base`,
    createdAt:new Date().toISOString(),
    model:"demo-static",
    interpretationSystemVersion:"IS-1",
    weights:{...demo.aiWeights},
    themes:demo.aiThemes.map(([label,weight])=>({id:`theme:${label.toLowerCase()}`,label,weight})),
    description:demo.description
  };
}
function currentAiRuns(){
  const key=currentKey();
  if(state.canonicalFeedActive&&state.files.length){const canonical=canonicalAiRunFromRecord(currentImageRecord());if(canonical)state.aiRuns[key]=[canonical];}
  if(!state.aiRuns[key]?.length) state.aiRuns[key]=[defaultAiRun()];
  return state.aiRuns[key];
}
function currentAiRun(){ return currentAiRuns().at(-1); }
function currentAiThemes(){ return currentAiRun().themes.map(t=>[t.label,t.weight]); }
function currentAiWeights(){ return currentAiRun().weights || {}; }

/* v0.9.40.173 — whole-number presentation for six equal Theme→Prim slots.
   Stored weights use exact 1/6 contributions; largest-remainder display keeps the
   visible vector at exactly 100 while preserving duplicate-Prim accumulation. */
function displayReactionPercentages(source={}){
  const rows=PRIMITIVES.map((p,index)=>({id:p.id,index,value:Math.max(0,Number(source?.[p.id])||0)}));
  const total=rows.reduce((sum,row)=>sum+row.value,0);
  if(!(total>0))return Object.fromEntries(rows.map(row=>[row.id,0]));
  rows.forEach(row=>{row.exact=row.value*100/total;row.whole=Math.floor(row.exact);row.fraction=row.exact-row.whole;});
  let remaining=100-rows.reduce((sum,row)=>sum+row.whole,0);
  const order=[...rows].sort((a,b)=>b.fraction-a.fraction||a.index-b.index);
  for(let i=0;i<remaining;i++)order[i%order.length].whole++;
  return Object.fromEntries(rows.map(row=>[row.id,row.whole]));
}

function classificationState(){
  return {
    selectedReactions:[...state.selectedReactions],
    themes:JSON.parse(JSON.stringify(state.themes)),
    flagged:!!state.flagged,
    writeIn:state.writeIn||"",
    retention:state.retention||"keep"
  };
}
function snapshot(){
  return JSON.parse(JSON.stringify({
    sourceType:state.files.length?"files":"demo",
    demoIndex:state.demoIndex,
    index:state.index,
    key:currentKey(),
    working:classificationState(),
    records:state.records,
    aiRuns:state.aiRuns
  }));
}
function snapshotsEqual(a,b){
  if(!a||!b) return false;
  return JSON.stringify(a)===JSON.stringify(b);
}
function pushHistory(){
  const next=snapshot();
  const last=state.history[state.history.length-1];
  if(snapshotsEqual(last,next)){
    updateUndoRedo();
    return false;
  }
  state.history.push(next);
  if(state.history.length>100) state.history.shift();
  state.future=[];
  updateUndoRedo();
  return true;
}
function applyClassification(data){
  state.selectedReactions=[...(data?.selectedReactions||[])];
  state.themes=normalizeThemes(data?.themes||[null,null,null]);
  state.flagged=!!data?.flagged;
  state.writeIn=data?.writeIn||"";
  state.retention=data?.retention||"keep";
}
function persistRecords(){
  try{
    const recordsJson=JSON.stringify(state.records);
    const aiRunsJson=JSON.stringify(state.aiRuns);
    localStorage.setItem("genreactrix-v0.9.2j-records",recordsJson);
    localStorage.setItem("genreactrix-v0.9.2j-ai-runs",aiRunsJson);
    // Verify the classification write immediately. A failed or blocked write must
    // not masquerade as a successful save in the UI.
    if(localStorage.getItem("genreactrix-v0.9.2j-records")!==recordsJson){
      throw new Error("Classification storage verification failed");
    }
    return true;
  }catch(error){
    console.error("Genreactrix could not persist classification data",error);
    setDirectorStatus("Save failed. Classification data was not stored.");
    return false;
  }
}
function restoreSnapshot(s){
  state.records=JSON.parse(JSON.stringify(s.records||{}));
  state.aiRuns=JSON.parse(JSON.stringify(s.aiRuns||{}));
  state.demoIndex=s.demoIndex||0;
  state.index=s.index||0;
  applyClassification(s.working||state.records[s.key]);
  persistRecords();
  syncDirectorRecordHistory("director-history-restored");
  state.visitBaseline=classificationState();
  renderAll();
}
function writeClassificationForKey(key, data){
  state.records[key]=JSON.parse(JSON.stringify(data));
  return persistRecords();
}
function readClassificationForKey(key){
  const record=state.records[key];
  return record ? JSON.parse(JSON.stringify(record)) : emptyClassification();
}
function saveCurrent(action="commit"){
  const imageId=currentKey();
  const legacy=classificationState();
  const engine=window.genreactrixDirectorClassificationEngine;
  if(engine){
    engine.begin(imageId,legacy);
    engine.patchDraft(imageId,{reactions:legacy.selectedReactions,themes:legacy.themes,notes:legacy.writeIn,flagged:legacy.flagged,retention:legacy.retention,aiVisible:Boolean(document.getElementById("directorAiConsole")?.open)});
    const result=engine.commit(imageId,{action,aiVisible:Boolean(document.getElementById("directorAiConsole")?.open)});
    if(!result.ok){setDirectorStatus(`Classification not saved: ${result.issues.join(", ")}`);return false;}
  }
  legacy.evaluationVersion=currentEvaluationVersion();
  const saved=writeClassificationForKey(imageId,legacy);
  if(saved){
    localStorage.setItem(projectLocalKey(EVALUATION_USED_KEY),"1");window.genreactrixProjectRuntimeEngine?.setProjectValue?.(EVALUATION_USED_KEY,"1").catch?.(()=>{});
    syncDirectorRecordHistory("director-classified");
    lockBatchEvaluationVersion().catch(console.warn);
  }
  return saved;
}
function syncDirectorRecordHistory(eventType="director-classified"){
  const imageId=currentKey();
  const recordEngine=window.genreactrixImageRecordEngine;
  if(!recordEngine?.get||!recordEngine.get(imageId,{touch:false})) return;
  const data={...classificationState(),evaluationVersion:currentEvaluationVersion(),aiVisible:Boolean(document.getElementById("directorAiConsole")?.open),recordedAt:new Date().toISOString()};
  try{recordEngine.update(imageId,{analysis:{director:data},components:{directorReactions:"current",directorThemes:"current",primFusion:state.selectedReactions.length>=2?"current":"missing"},attributes:{flagged:Boolean(state.flagged),needsReview:Boolean(state.flagged)},timestamps:{flaggedAt:state.flagged?new Date().toISOString():null}},eventType);}catch(error){console.warn("Director record could not be synchronized",error);}
}
function emptyClassification(){
  return {selectedReactions:[],themes:[null,null,null],flagged:false,writeIn:"",retention:"keep"};
}
function applyAiDrawerLoadDefaults(){
  if(reactionRerunWorkspace?.active||descriptionRerunWorkspace?.active||themeRerunWorkspace?.active){tabletLandscapeView.aiReactions=true;tabletLandscapeView.aiThemes=true;tabletLandscapeView.aiDescription=true;return;}
  const directorThemesComplete=state.themes.length>=3&&state.themes.slice(0,3).every(theme=>Boolean(normalizeTheme(theme)));
  const hasDirectorReaction=state.selectedReactions.length>0;
  const selected=directorThemesComplete&&hasDirectorReaction;
  tabletLandscapeView.aiReactions=selected;
  tabletLandscapeView.aiThemes=selected;
  tabletLandscapeView.aiDescription=selected;
}
function loadCurrent(){
  if(state.feedEmpty){applyClassification(emptyClassification());state.visitBaseline=classificationState();renderAll();return;}
  const key=currentKey();
  const legacy=readClassificationForKey(key);
  const engine=window.genreactrixDirectorClassificationEngine;
  const canonical=engine?.migrate?.(key,legacy)||null;
  applyClassification(canonical?{selectedReactions:canonical.reactions,themes:canonical.themes,flagged:canonical.flagged,writeIn:canonical.notes,retention:canonical.retention}:legacy);
  const imageRecord=state.canonicalFeedActive?window.genreactrixImagesEngine?.recordById?.(key):null;
  if(imageRecord){
    state.flagged=Boolean(imageRecord.attributes?.flagged);
    state.retention=imageRecord.attributes?.saved?"keep":"discard";
  }
  engine?.begin?.(key,canonical||legacy);
  state.visitBaseline=classificationState();
  // v0.9.40.48 — AI drawer defaults are recalculated only when an image loads.
  // Manual AI control changes remain untouched until the next image load.
  applyAiDrawerLoadDefaults();
  if(descriptionRerunWorkspace?.active){descriptionRerunWorkspace.imageId=currentKey();descriptionRerunWorkspace.current=loadDescriptionRerunCurrent(currentKey());descriptionRerunWorkspace.catalog=[];descriptionRerunWorkspace.undo=[];descriptionRerunWorkspace.future=[];}
  if(themeRerunWorkspace?.active){themeRerunWorkspace.imageId=currentKey();themeRerunWorkspace.current=loadThemeRerunCurrent(currentKey());themeRerunWorkspace.pickerOpen=false;themeRerunWorkspace.descriptionCatalog=[];}
  // Paint the destination image's classification immediately, before any
  // nonclassification console work.
  renderThemes();
  renderReactions();
  renderAll();
  if(descriptionRerunWorkspace?.active)activateDescriptionRerunImage().catch(error=>console.warn("Description rerun image load failed",error));
  if(themeRerunWorkspace?.active)activateThemeRerunImage().catch(error=>console.warn("Theme rerun image load failed",error));
}
function advanceImageIndex(){
  if(state.files.length) state.index=(state.index+1)%state.files.length;
  else state.demoIndex=(state.demoIndex+1)%DEMOS.length;
}
function commitAndAdvance(sourceKey){
  // Theme 1 is one transaction: persist the source image under the key that
  // was active when selection began, then switch identity and load a fresh
  // destination record. No working Theme state is carried across the boundary.
  const saveOk=writeClassificationForKey(sourceKey,classificationState());
  if(!saveOk) return;
  advanceImageIndex();
  const destinationKey=currentKey();
  applyClassification(readClassificationForKey(destinationKey));
  state.visitBaseline=classificationState();
  applyAiDrawerLoadDefaults();
  if(descriptionRerunWorkspace?.active){descriptionRerunWorkspace.imageId=currentKey();descriptionRerunWorkspace.current=loadDescriptionRerunCurrent(currentKey());descriptionRerunWorkspace.catalog=[];descriptionRerunWorkspace.undo=[];descriptionRerunWorkspace.future=[];}
  if(themeRerunWorkspace?.active){themeRerunWorkspace.imageId=currentKey();themeRerunWorkspace.current=loadThemeRerunCurrent(currentKey());themeRerunWorkspace.pickerOpen=false;themeRerunWorkspace.descriptionCatalog=[];}
  if($("themeWorkspace")?.open) $("themeWorkspace").close();
  renderAll();
  if(descriptionRerunWorkspace?.active)activateDescriptionRerunImage().catch(error=>console.warn("Description rerun image load failed",error));
  if(themeRerunWorkspace?.active)activateThemeRerunImage().catch(error=>console.warn("Theme rerun image load failed",error));
}
async function navigateImage(delta){
  if(state.feedEmpty)return;
  saveImageTransformForCurrent?.();
  if(state.files.length){
    state.index=(state.index+delta+state.files.length)%state.files.length;
    const destinationId=currentKey();
    if(landscapeFeedDirty){
      landscapeFeedDirty=false;
      await rehydrateLandscapeFeed({preserveId:destinationId,preferredIndex:state.index});
      return;
    }
  }else{
    state.demoIndex=(state.demoIndex+delta+DEMOS.length)%DEMOS.length;
  }
  loadCurrent();
}
function nextImage(){ navigateImage(1); }
function prevImage(){ navigateImage(-1); }
const DIRECTOR_LAST_KEY="genreactrix-director-last-image-v1";
function directorSetting(id,fallback){try{return window.genreactrixSettingsEngine?.get?.(id,fallback)??fallback}catch{return fallback}}
function imageCount(){return state.feedEmpty?0:(state.files.length||DEMOS.length)}
function imageKeyAt(index){return state.files.length?(state.files[index]?.id||state.files[index]?.name):`demo-${index}`}
function goToImageIndex(index,{remember=true}={}){
  const count=imageCount();if(!count)return false;
  if(remember)localStorage.setItem(DIRECTOR_LAST_KEY,JSON.stringify({source:state.files.length?"files":"demo",index:state.files.length?state.index:state.demoIndex,key:currentKey()}));
  saveImageTransformForCurrent?.();
  const next=((index%count)+count)%count;
  if(state.files.length)state.index=next;else state.demoIndex=next;
  loadCurrent();return true;
}
function directorRecordForIndex(index){const key=imageKeyAt(index);return window.genreactrixDirectorClassificationEngine?.get?.(key)||null}
function findDirectorIndex(predicate,{random=false}={}){
  const count=imageCount(),current=state.files.length?state.index:state.demoIndex;if(!count)return -1;
  const matches=[];
  for(let step=1;step<=count;step++){const idx=(current+step)%count,record=directorRecordForIndex(idx);if(predicate(record,imageKeyAt(idx),idx))matches.push(idx);}
  if(!matches.length)return -1;return random?matches[Math.floor(Math.random()*matches.length)]:matches[0];
}
function navigateDirectorMode(mode){
  let idx=-1;
  if(mode==="next")return goToImageIndex((state.files.length?state.index:state.demoIndex)+1);
  if(mode==="random")idx=findDirectorIndex(()=>true,{random:true});
  else if(mode==="next-incomplete")idx=findDirectorIndex(r=>!r||!["complete"].includes(r.completion));
  else if(mode==="next-flagged")idx=findDirectorIndex(r=>Boolean(r?.flagged));
  else if(mode==="next-blocked")idx=findDirectorIndex(r=>r?.completion==="blocked"||Boolean(r?.blocked));
  if(idx<0){setDirectorStatus(`No ${mode.replace("next-","")} image found.`);return false;}
  return goToImageIndex(idx);
}
function commitDirectorAndFollowSetting(){
  const ok=saveCurrent("director-commit");if(!ok)return false;
  setDirectorStatus("Classification committed.");
  const behavior=directorSetting("director.postCommit","stay");
  if(behavior==="next")navigateDirectorMode("next");
  if(behavior==="next-incomplete")navigateDirectorMode("next-incomplete");
  return true;
}
function returnToLastDirectorImage(){
  try{const last=JSON.parse(localStorage.getItem(DIRECTOR_LAST_KEY)||"null");if(!last)return setDirectorStatus("No previous image recorded.");return goToImageIndex(Number(last.index)||0,{remember:false});}catch{return false;}
}
function normalizeTheme(value){
  if(!value) return null;
  if(typeof value==="object" && value.id) return {...value,reactionRefs:normalizedReactionRefs(value)};
  return {id:`legacy:${String(value).toLowerCase()}`,label:String(value),kind:"legacy"};
}
function normalizeThemes(values){ return [0,1,2].map(i=>normalizeTheme(values?.[i])); }
function themeLabel(theme){ return normalizeTheme(theme)?.label || "—"; }
function renderReactions(){
  const bar=$("reactionBar");
  const expanded=$("directorReactionGrid");
  if(!bar||!expanded)return;
  bar.innerHTML="";expanded.innerHTML="";
  const records=allReactionRecords();
  records.forEach((record,index)=>{
    const canonical=record.type==="canonical";
    const token=canonical?primitiveSelectionToken(PRIMITIVE_BY_ID[record.id]):customReactionSelectionToken(record.id);
    const make=()=>{
      const b=document.createElement("button");
      b.className="reaction-button"+(state.selectedReactions.includes(token)?" selected":"")+(canonical?"":" custom-reaction-button");
      b.innerHTML=`<span class="reaction-symbol" aria-hidden="true">${record.emoji}</span>`;
      b.setAttribute("aria-label",record.label);b.title=record.label;b.setAttribute("aria-pressed",String(state.selectedReactions.includes(token)));
      if(!canonical)b.dataset.customReaction=record.id;
      b.addEventListener("click",()=>{pushHistory();const n=state.selectedReactions.indexOf(token);if(n>=0)state.selectedReactions.splice(n,1);else state.selectedReactions.push(token);saveCurrent("director-reaction-auto");renderAll();});
      return b;
    };
    bar.appendChild(make());expanded.appendChild(make());
  });
}
function renderThemes(){
  for(let i=0;i<3;i++){
    const value=themeLabel(state.themes[i]);
    $(`themeValue${i+1}`).textContent=value;
    $(`expandedTheme${i+1}`).textContent=value;
    const summary=$(`themeSummary${i+1}`);
    if(summary) summary.textContent=value;
  }
}
function renderImage(){
  const guidanceInput=$("aiReanalysisGuidance");
  if(guidanceInput){const imageId=currentKey();if(guidanceInput.dataset.imageId!==imageId){guidanceInput.value="";guidanceInput.dataset.imageId=imageId;}}
  const src=currentSource();
  requestCurrentLandscapeAsset();
  if(state.feedEmpty){
    $("mainImage").removeAttribute("src");
    $("mainImage").hidden=true;
    $("imageEmpty").hidden=false;
    $("imageEmpty").textContent=activeInboxBundles().length?"No images match the current filter.":"Inbox is empty. AI-finished images remain Staged in Queue until Bundled.";
    if($("profileName"))$("profileName").textContent=activeInboxBundles().length?"Filtered feed":"Inbox";
    if($("profilePosition"))$("profilePosition").textContent="0 / 0";
    if($("progressText"))$("progressText").textContent="0 images";
    return;
  }
  const mainImage=$("mainImage");
  mainImage.onerror=null;
  mainImage.src=src;
  mainImage.hidden=false;
  const landscapeFile=currentLandscapeFile();
  if(landscapeFile&&!landscapeFile.isHydratingAsset&&!landscapeFile.isMissingAsset){
    const imageId=String(landscapeFile.id||"");
    mainImage.onerror=()=>markLandscapeAssetUnavailable(imageId,src,"The resolved image source could not be decoded or displayed.");
  }
  if(typeof restoreImageTransformForCurrent==="function") restoreImageTransformForCurrent();
  $("imageEmpty").hidden=true;
  $("inspectionImage").src=src;
  if($("aiWorkspaceImage")) $("aiWorkspaceImage").src=src;
  if($("aiWorkspacePortraitImage")) $("aiWorkspacePortraitImage").src=src;
  if($("directorThumbnail")) $("directorThumbnail").src=src;
  if($("directorPortraitThumbnail")) $("directorPortraitThumbnail").src=src;
  const description=currentAiRun().description || currentDescription();
  $("aiDescription").textContent=description;
  $("inspectionDescription").textContent=description;
  const total=state.files.length || DEMOS.length;
  const position=state.files.length ? state.index+1 : state.demoIndex+1;
  $("profileName").textContent=state.files.length ? state.files[state.index].name : `Demo image ${position}`;
  $("profilePosition").textContent=`${position} / ${total}`;
  $("profileRetention").textContent=state.retention==="keep"?"Keep":"Keep off";
  $("profileFlagged").textContent=state.flagged ? "Yes" : "No";
  if($("aiWorkspaceDescription")) $("aiWorkspaceDescription").textContent=description;
  if($("tabletAiDescription")) $("tabletAiDescription").textContent=description;
  $("progressText").textContent=`${state.files.length?"Image":"Demo image"} ${position} / ${total}`;
}
function flagSeverityForRecord(record){
  if(record?.attributes?.rejected)return "reject";
  if(record?.attributes?.rejectionFlagged)return "delete";
  if(record?.attributes?.flagged)return "review";
  return "none";
}
function applyFlagButtonSeverity(button,severity){
  if(!button)return;
  const active=severity!=="none";
  button.dataset.flagSeverity=severity;
  button.setAttribute("aria-pressed",String(active));
  button.setAttribute("aria-label",severity==="review"?"Flag — Review":severity==="delete"?"Flag — Delete":severity==="reject"?"Flag — Reject":"Flag");
}
function renderFlag(){
  const hasImage=!state.feedEmpty;
  const record=hasImage?currentImageRecord():null;
  const severity=hasImage?flagSeverityForRecord(record):"none";
  applyFlagButtonSeverity($("directorFlagBtn"),severity);
  applyFlagButtonSeverity($("tabletFlagBtn"),severity);
  applyFlagButtonSeverity($("landscapeImageViewFlagBtn"),severity);
  $("landscapeImageViewSaveBtn")?.setAttribute("aria-pressed",String(hasImage&&state.retention==="keep"));
  $("tabletSaveBtn")?.setAttribute("aria-pressed",String(hasImage&&state.retention==="keep"));
  $("tabletDepotBtn")?.setAttribute("aria-pressed",String(Boolean(record?.attributes?.depot)));
  $("landscapeImageViewDepotBtn")?.setAttribute("aria-pressed",String(Boolean(record?.attributes?.depot)));
  // Filter highlight reflects actual record filtering only. Base population and sort order are not "on" states.
  const customFilter=Boolean(landscapeFilter.bundleId)||FILTER_CATEGORIES.some(k=>landscapeFilter.include[k]||landscapeFilter.exclude[k]);
  $("tabletFilterBtn")?.setAttribute("aria-pressed",String(customFilter));
  ["tabletPrevBtn","tabletNextBtn","tabletUndoBtn","tabletRedoBtn","tabletFlagBtn","tabletSaveBtn","tabletDepotBtn","landscapeImageViewDepotBtn"].forEach(id=>{if($(id))$(id).disabled=!hasImage;});
  $("landscapeFeedEmpty")?.toggleAttribute("hidden",hasImage);
}
function renderDirectorFields(){
  $("directorWriteIn").value=state.writeIn;
  $("retentionControl").value=state.retention;
}
function renderDirectorWorkspaceState(){
  const engine=window.genreactrixDirectorClassificationEngine;
  const imageId=currentKey();
  const canonical=engine?.get?.(imageId)||null;
  const completion=canonical?.completion||engine?.completion?.({reactions:state.selectedReactions,themes:state.themes,primFusion:state.selectedReactions.length>=2?state.selectedReactions.slice(0,2):null})||"unclassified";
  const labels={unclassified:"Working",partial:"Working",complete:"Working",blocked:"Working"};
  [$("directorStateStrip"),$("directorWorkspaceStateStrip")].filter(Boolean).forEach(strip=>{
    const completionEl=strip.querySelector('[data-state="completion"]');
    if(completionEl){completionEl.textContent=labels[completion]||completion;completionEl.dataset.tone=completion;}
    const set=(name,show)=>{const el=strip.querySelector(`[data-state="${name}"]`);if(el)el.hidden=!show;};
    set("draft",Boolean(engine?.isDirty?.(imageId)));
    set("saved",Boolean(canonical?.saved));
    set("flagged",Boolean(state.flagged||canonical?.flagged));
    set("ai",Boolean(canonical?.aiVisible||document.getElementById("directorAiConsole")?.open));
    set("locked",Boolean(canonical?.locked));
  });
  const revert=$("directorRevertDraftBtn");
  if(revert) revert.disabled=!engine?.isDirty?.(imageId);
}
function renderPrimitiveWeights(target, {showDirector=false}={}){
  if(!target) return;
  target.innerHTML="";
  target.className="primitive-weight-grid" + (target.id==="homeAiPrimitives" ? " compact" : "");
  const weights=displayReactionPercentages(currentAiWeights());
  PRIMITIVES.forEach((p,index)=>{
    const item=document.createElement("div");
    item.className="primitive-weight-item"+(showDirector && state.selectedReactions.includes(primitiveSelectionToken(p))?" director-selected":"");
    item.innerHTML=`<span class="primitive-weight-symbol" title="${p.name}">${p.symbol}</span><small>${weights[p.id]>0?`${Math.round(weights[p.id])}%`:"-%"}</small>`;
    target.appendChild(item);
  });
}
function isFoldedLandscapeHome(){
  return window.innerWidth>window.innerHeight && window.innerHeight<600;
}

function fitFoldedLandscapeDescription(){
  const panel=document.querySelector(".image-console .ai-description");
  const text=$("aiDescription");
  if(!panel || !text){return;}

  panel.style.removeProperty("--folded-ai-description-size");
  text.style.fontSize="";
  if(!isFoldedLandscapeHome()) return;

  const preferredPx=11.52; // .72rem at the default 16px root size
  const minimumPx=8.8;
  const stepPx=.2;
  let size=preferredPx;
  text.style.fontSize=`${size}px`;

  // Prefer the largest readable size that fits before relying on vertical scrolling.
  while(size>minimumPx && panel.scrollHeight>panel.clientHeight+1){
    size=Math.max(minimumPx,+(size-stepPx).toFixed(2));
    text.style.fontSize=`${size}px`;
  }
  panel.dataset.descriptionFitPx=String(size);
  panel.dataset.descriptionScrolls=String(panel.scrollHeight>panel.clientHeight+1);
}

function scheduleFoldedLandscapeDescriptionFit(){
  requestAnimationFrame(()=>requestAnimationFrame(fitFoldedLandscapeDescription));
}


function fitAdaptiveWorkspaceDescription(panelSelector, preferredPx=18, minimumPx=11){
  const panel=document.querySelector(panelSelector);
  const text=panel?.querySelector("p");
  if(!panel || !text) return;
  text.style.fontSize="";
  text.style.overflowY="hidden";
  let size=preferredPx;
  text.style.fontSize=`${size}px`;
  const fits=()=>text.scrollHeight<=text.clientHeight+1;
  while(size>minimumPx && !fits()){
    size=Math.max(minimumPx,+(size-.25).toFixed(2));
    text.style.fontSize=`${size}px`;
  }
  text.style.overflowY=fits()?"hidden":"auto";
  panel.dataset.descriptionFitPx=String(size);
  panel.dataset.descriptionScrolls=String(!fits());
}

function scheduleWorkspaceDescriptionFits(){
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(document.getElementById("aiWorkspace")?.open)
      fitAdaptiveWorkspaceDescription("#aiWorkspace .ai-freeform-panel",18,11);
    if(document.getElementById("imageWorkspace")?.open)
      fitAdaptiveWorkspaceDescription("#imageWorkspace .inspection-ai-description",18,11);
  }));
}

function renderAi(){
  renderPrimitiveWeights($("homeAiPrimitives"));
  renderPrimitiveWeights($("aiPrimitives"));
  renderPrimitiveWeights($("tabletAiPrimitives"));
  const themeTargets=[$("aiThemes"),$("tabletAiThemes")];
  themeTargets.forEach(themes=>{
    if(!themes) return;
    themes.innerHTML="";
    currentAiThemes().forEach(([label,weight])=>themes.appendChild(aiThemeSuggestion(label,weight)));
  });
}
function aiThemeSuggestion(label,weight){
  const b=document.createElement("button");
  b.className="ai-suggestion";
  b.innerHTML=`<span>${label}</span><strong>${weight}%</strong>`;
  b.addEventListener("click",()=>selectTheme({id:`theme:${label.toLowerCase()}`,label,kind:"established"}));
  return b;
}
function renderComparison(){
  const directorThemes=state.themes.filter(Boolean).map(themeLabel);
  const aiThemes=currentAiThemes();
  $("inspectionDirectorThemes").textContent=directorThemes.length?directorThemes.join(", "):"—";
  $("inspectionAiThemes").textContent=aiThemes.length?aiThemes.map(([label,weight])=>`${label} ${weight}%`).join(", "):"—";
  $("profileRetention").textContent=state.retention==="keep"?"Keep":"Keep off";
  $("profileFlagged").textContent=state.flagged?"Yes":"No";
}


const tabletLandscapeView={face:"matrix",aiReactions:true,aiThemes:false,aiDescription:false,customs:false,activeThemeSlot:null,customsTab:"search"};
const landscapeCustomSort={
  reactions:{mode:"alpha",direction:"asc"},
  themes:{mode:"alpha",direction:"asc"}
};
const landscapeCustomScroll={reactions:0,themes:0,search:0};
const AI_RERUN_LOCK_KEY="genreactrix-ai-rerun-lock-v1";
const AI_RERUN_COMPONENTS=["reactions","themes","description"];
let tabletAiRerunLocked=localStorage.getItem(AI_RERUN_LOCK_KEY)!=="0";
let aiRerunInFlight=false;
const reactionRerunWorkspace={active:false,useImage:true,useDescription:true,preDrawer:null};
function reactionRerunDescriptionText(){const text=String(currentAiRun()?.description||currentDescription()||'').trim();return /^No AI description is stored/i.test(text)?'':text}
function reactionRerunSources(){return{image:Boolean(reactionRerunWorkspace.useImage),description:Boolean(reactionRerunWorkspace.useDescription)}}
function renderReactionRerunChrome(){const active=reactionRerunWorkspace.active,drawer=$("tabletSlidingDrawer"),controls=$("tabletReactionRerunControls"),image=$("reactionRerunUseImage"),description=$("reactionRerunUseDescription"),submit=$("reactionRerunSubmitBtn");drawer?.classList.toggle("reaction-rerun-active",active);if(controls)controls.hidden=!active;if(image)image.checked=Boolean(reactionRerunWorkspace.useImage);if(description)description.checked=Boolean(reactionRerunWorkspace.useDescription);if(submit){const noSource=!reactionRerunWorkspace.useImage&&!reactionRerunWorkspace.useDescription,missingDescription=reactionRerunWorkspace.useDescription&&!reactionRerunDescriptionText();submit.disabled=aiRerunInFlight||noSource||missingDescription;submit.setAttribute("aria-busy",String(aiRerunInFlight));}}
function openReactionRerunWorkspace(){if(tabletAiRerunLocked||aiRerunInFlight||reactionRerunWorkspace.active)return;if(descriptionRerunWorkspace?.active)closeDescriptionRerunWorkspace();if(themeRerunWorkspace?.active)closeThemeRerunWorkspace();reactionRerunWorkspace.preDrawer={face:tabletLandscapeView.face,aiReactions:tabletLandscapeView.aiReactions,aiThemes:tabletLandscapeView.aiThemes,aiDescription:tabletLandscapeView.aiDescription,customs:tabletLandscapeView.customs};reactionRerunWorkspace.active=true;reactionRerunWorkspace.useImage=true;reactionRerunWorkspace.useDescription=true;tabletLandscapeView.face="judgment";tabletLandscapeView.customs=false;tabletLandscapeView.aiReactions=true;tabletLandscapeView.aiThemes=false;tabletLandscapeView.aiDescription=true;renderTabletWorkbench()}
function closeReactionRerunWorkspace(){if(!reactionRerunWorkspace.active)return;reactionRerunWorkspace.active=false;const prior=reactionRerunWorkspace.preDrawer;if(prior)Object.assign(tabletLandscapeView,prior);reactionRerunWorkspace.preDrawer=null;renderTabletWorkbench()}
async function recalculateCurrentReactions(){if(aiRerunInFlight)return;setDirectorStatus('Recalculating Reactions from the current three Themes…');try{await runCurrentAiRerun(['reactions']);tabletLandscapeView.aiReactions=true;setDirectorStatus('Reactions recalculated from Themes · no AI Reaction scan.');}catch(error){const message=String(error?.message||error);console.error('Theme-derived Reaction recalculation failed',error);setDirectorStatus(`Reaction recalculation failed: ${message}`);alert(`Reaction recalculation failed: ${message}`)}}
async function submitReactionRerun(){return recalculateCurrentReactions()}
function syncTabletAiRerunControls(){
  const lock=$("tabletAiRerunLockBtn");
  lock?.setAttribute("aria-pressed",String(tabletAiRerunLocked));
  ["tabletAiRerunReactionsBtn","tabletAiRerunThemesBtn","tabletAiRerunDescriptionBtn"].forEach(id=>{const b=$(id);if(b){b.disabled=tabletAiRerunLocked||aiRerunInFlight;b.setAttribute("aria-busy",String(aiRerunInFlight));}});
  const full=$("rerunAiBtn");
  if(full){full.disabled=aiRerunInFlight;full.setAttribute("aria-busy",String(aiRerunInFlight));}
  ["aiGuidedDescriptionRerunBtn","aiThemeFailsafeBtn"].forEach(id=>{const b=$(id);if(b){b.disabled=aiRerunInFlight;b.setAttribute("aria-busy",String(aiRerunInFlight));}});
  renderReactionRerunChrome();
}



// v0.9.40.56 — AI Theme rerun shell + PrimPicker + Theme Exclusions + Description context + Preview Request.
// Prim identities are stored only by stable P-code. Human-readable names and
// emoji are resolved at render time so future label changes cannot alter identity.
const THEME_RERUN_CURRENT_KEY='genreactrix-theme-rerun-current-v1';
const THEME_RERUN_THEME_STATES=Object.freeze(['neutral','replace','preserve']);
const THEME_RERUN_PRIM_STATES=Object.freeze(['mandatory','preferred','optional','discouraged','forbidden']);
const THEME_RERUN_PRIM_CYCLE=Object.freeze(['mandatory','preferred','optional','discouraged','forbidden',null]);
const THEME_RERUN_PRIM_ORDER=Object.freeze(Array.from({length:12},(_,index)=>`P${String(index+1).padStart(2,'0')}`));
function themeRerunPfmCode(firstCode,secondCode){const nums=[firstCode,secondCode].map(code=>Number(String(code).replace(/\D/g,''))||0).sort((a,b)=>a-b);return`PFM${String(nums[0]).padStart(2,'0')}${String(nums[1]).padStart(2,'0')}`}
const THEME_RERUN_FUSION_CATALOG=Object.freeze((()=>{const rows=[],activeIds=Object.keys(AI_CANONICAL_PRIM_NAME_BY_ID).sort((a,b)=>Number(a.slice(1))-Number(b.slice(1)));for(let first=0;first<activeIds.length;first++)for(let second=first+1;second<activeIds.length;second++){const firstCode=activeIds[first],secondCode=activeIds[second],code=themeRerunPfmCode(firstCode,secondCode),firstName=AI_CANONICAL_PRIM_NAME_BY_ID[firstCode]||firstCode,secondName=AI_CANONICAL_PRIM_NAME_BY_ID[secondCode]||secondCode;rows.push(Object.freeze({code,primitiveCodes:Object.freeze([firstCode,secondCode]),label:canonicalPrimFusionLabel(firstName,secondName)}));}return rows;})());
const THEME_RERUN_FUSION_BY_CODE=Object.freeze(Object.fromEntries(THEME_RERUN_FUSION_CATALOG.map(row=>[row.code,row])));
const LEGACY_ANGRY_PFM_CODE_TO_CURRENT=Object.freeze({"PFM0114":"PFM0107","PFM0214":"PFM0207","PFM0314":"PFM0307","PFM0414":"PFM0407","PFM0514":"PFM0507","PFM0614":"PFM0607","PFM0814":"PFM0708","PFM0914":"PFM0709","PFM1014":"PFM0710","PFM1114":"PFM0711","PFM1314":"PFM0712"});
const LEGACY_SMART_RETIREMENT_PFM_CODE_TO_CURRENT=Object.freeze({"PFM0113":"PFM0112","PFM0213":"PFM0212","PFM0313":"PFM0312","PFM0413":"PFM0412","PFM0613":"PFM0612","PFM0813":"PFM0812","PFM0913":"PFM0912","PFM1013":"PFM1012","PFM0713":"PFM0712","PFM0312":"PFM0203","PFM1213":"PFM0512"});
const themeRerunWorkspace={active:false,pickerOpen:false,imageId:null,current:null,preDrawer:null,pendingScopeChange:null,longPressTimer:null,longPressFired:false,longPressTarget:null,exclusionQuery:'',descriptionCatalog:[],descriptionsLongPress:false,descriptionsTimer:null,themeHistoryCatalog:[]};
const emptyThemeRerunCurrent=()=>({schemaVersion:3,themeStates:{1:'neutral',2:'neutral',3:'neutral'},primScopes:{theme1:{},theme2:{},theme3:{},general:{}},excludedThemeCodes:[],includedDescriptionIds:[],populatedDescriptionId:null,descriptionContextInitialized:false,explainChanges:true,updatedAt:null});
function themeRerunStorageKey(){return window.genreactrixProjectRuntimeEngine?.projectKey?.(THEME_RERUN_CURRENT_KEY)||THEME_RERUN_CURRENT_KEY}
function readThemeRerunMap(){try{const raw=localStorage.getItem(themeRerunStorageKey());const parsed=raw?JSON.parse(raw):{};return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{}}catch{return {}}}
function writeThemeRerunMap(map){try{localStorage.setItem(themeRerunStorageKey(),JSON.stringify(map||{}));return true}catch(error){console.warn('Theme rerun Current state could not be stored',error);return false}}
function normalizeThemeRerunCurrent(value){
  const source=value&&typeof value==='object'?value:{},themeStates={},primScopes={};
  for(let slot=1;slot<=3;slot++){const raw=String(source.themeStates?.[slot]||'neutral');themeStates[slot]=THEME_RERUN_THEME_STATES.includes(raw)?raw:'neutral';}
  const sourceSchema=Number(source.schemaVersion)||1;
  for(const scope of ['theme1','theme2','theme3','general']){
    const clean={};const raw=source.primScopes?.[scope];
    if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const [rawCode,state] of Object.entries(raw)){
      let code=String(rawCode);
      if(sourceSchema<2){if(code==='P07')continue;if(code==='P14')code='P07';}
      else if(code==='P14')code='P07';
      if(sourceSchema<3){if(code==='P12')continue;if(code==='P13')code='P12';}
      else if(code==='P13')code='P12';
      if(THEME_RERUN_PRIM_ORDER.includes(code)&&THEME_RERUN_PRIM_STATES.includes(state))clean[code]=state;
    }
    primScopes[scope]=clean;
  }
  const excludedThemeCodes=[...new Set((Array.isArray(source.excludedThemeCodes)?source.excludedThemeCodes:[]).map(String).map(code=>sourceSchema<3?(LEGACY_SMART_RETIREMENT_PFM_CODE_TO_CURRENT[code]||LEGACY_ANGRY_PFM_CODE_TO_CURRENT[code]||code):(LEGACY_ANGRY_PFM_CODE_TO_CURRENT[code]||code)).filter(code=>Boolean(THEME_RERUN_FUSION_BY_CODE[code])))];
  const includedDescriptionIds=[...new Set((Array.isArray(source.includedDescriptionIds)?source.includedDescriptionIds:[]).filter(Boolean).map(String))];
  return{schemaVersion:3,themeStates,primScopes,excludedThemeCodes,includedDescriptionIds,populatedDescriptionId:source.populatedDescriptionId?String(source.populatedDescriptionId):null,descriptionContextInitialized:Boolean(source.descriptionContextInitialized),explainChanges:source.explainChanges!==false,updatedAt:source.updatedAt||null};
}
function loadThemeRerunCurrent(imageId=currentKey()){const map=readThemeRerunMap();return normalizeThemeRerunCurrent(map[String(imageId)]||emptyThemeRerunCurrent())}
function saveThemeRerunCurrent(){if(!themeRerunWorkspace.imageId||!themeRerunWorkspace.current)return false;themeRerunWorkspace.current.updatedAt=new Date().toISOString();const map=readThemeRerunMap();map[String(themeRerunWorkspace.imageId)]=normalizeThemeRerunCurrent(themeRerunWorkspace.current);return writeThemeRerunMap(map)}
function themeRerunPrimPresentation(code){const name=AI_CANONICAL_PRIM_NAME_BY_ID[code]||PRIMITIVE_BY_ID[code]?.name||code;const semantic=PRIMITIVES.find(item=>item.name===name);return{code,name,symbol:semantic?.symbol||PRIMITIVE_BY_ID[code]?.symbol||'•'}}
function themeRerunAiThemeSnapshot(slot){const sorted=(currentAiRun()?.themes||[]).map(row=>({id:row?.id||null,label:String(row?.label||''),weight:Number(row?.weight)||0})).sort((a,b)=>b.weight-a.weight).slice(0,3);return sorted[slot-1]||null}
function themeRerunFusionFromLabel(label){const wanted=String(label||'').trim().toLowerCase();return THEME_RERUN_FUSION_CATALOG.find(row=>row.label.toLowerCase()===wanted)||null}
function themeRerunCurrentThemeFusion(slot){const snapshot=themeRerunAiThemeSnapshot(slot),labelMatch=themeRerunFusionFromLabel(snapshot?.label||''),rawCode=String(snapshot?.id||'').trim().toUpperCase(),code=LEGACY_ANGRY_PFM_CODE_TO_CURRENT[rawCode]||rawCode;return labelMatch||THEME_RERUN_FUSION_BY_CODE[code]||null}
function themeRerunExcludedCodes(){return themeRerunWorkspace.current?.excludedThemeCodes||[]}
function themeRerunIsExcluded(code){return themeRerunExcludedCodes().includes(code)}
function themeRerunProtectedSlotsForCode(code){const slots=[];for(let slot=1;slot<=3;slot++)if(themeRerunWorkspace.current?.themeStates?.[slot]==='preserve'&&themeRerunCurrentThemeFusion(slot)?.code===code)slots.push(slot);return slots}
function themeRerunToggleExclusion(code){if(!themeRerunWorkspace.active||!THEME_RERUN_FUSION_BY_CODE[code])return;const current=themeRerunWorkspace.current,existing=new Set(current.excludedThemeCodes||[]);if(existing.has(code))existing.delete(code);else{const protectedSlots=themeRerunProtectedSlotsForCode(code);if(protectedSlots.length){const label=THEME_RERUN_FUSION_BY_CODE[code].label;alert(`${label} is currently preserved in Theme ${protectedSlots.join(', Theme ')}. Change that Theme from green before excluding it.`);return;}existing.add(code);}current.excludedThemeCodes=[...existing];saveThemeRerunCurrent();renderThemeRerunExclusions();renderThemeRerunChrome()}
function renderThemeRerunExclusions(){const list=$('themeRerunExclusionsList'),count=$('themeRerunExclusionsCount'),search=$('themeRerunExclusionsSearch');if(!list)return;if(search&&search.value!==themeRerunWorkspace.exclusionQuery)search.value=themeRerunWorkspace.exclusionQuery;const query=String(themeRerunWorkspace.exclusionQuery||'').trim().toLowerCase(),rows=THEME_RERUN_FUSION_CATALOG.filter(row=>!query||row.label.toLowerCase().includes(query)||row.code.toLowerCase().includes(query)).sort((a,b)=>a.label.localeCompare(b.label));list.innerHTML='';for(const row of rows){const button=document.createElement('button');button.type='button';button.className='theme-rerun-exclusion-choice';button.dataset.pfmCode=row.code;const selected=themeRerunIsExcluded(row.code);button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));button.textContent=row.label;button.title=row.label;list.append(button);}if(count){const n=themeRerunExcludedCodes().length;count.textContent=n?`${n} Theme${n===1?'':'s'} excluded`:'No Themes excluded';}}
function openThemeRerunExclusions(){if(!themeRerunWorkspace.active)return;themeRerunWorkspace.exclusionQuery='';renderThemeRerunExclusions();$('themeRerunExclusionsDialog')?.showModal()}
function themeRerunDescriptionCatalogItem(id){return themeRerunWorkspace.descriptionCatalog.find(item=>String(item.id)===String(id))||null}
function themeRerunDisplayedDescriptionItem(){return themeRerunDescriptionCatalogItem(themeRerunWorkspace.current?.populatedDescriptionId)||themeRerunWorkspace.descriptionCatalog.find(item=>item.current)||themeRerunWorkspace.descriptionCatalog[0]||null}
function themeRerunDisplayedDescriptionText(){return themeRerunDisplayedDescriptionItem()?.text||String(currentAiRun()?.description||currentDescription()||'')}
async function loadThemeRerunDescriptionCatalog(){
  const imageId=themeRerunWorkspace.imageId||currentKey(),engine=window.genreactrixAiArtifactEngine;let rows=[];
  if(engine?.ensureImageReady&&engine?.artifactsForImage){await engine.ensureImageReady(imageId).catch(()=>{});rows=(await engine.artifactsForImage(imageId).catch(()=>[])).filter(row=>row.kind==='description'&&typeof row.payload==='string'&&row.payload.trim());}
  rows.sort((a,b)=>(Number(b.version)||0)-(Number(a.version)||0)||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  themeRerunWorkspace.descriptionCatalog=rows.map(row=>({id:String(row.id),artifactId:String(row.id),version:Number(row.version)||0,createdAt:row.createdAt||'',text:String(row.payload||''),current:String(row.id)===String(currentDescriptionArtifactId(imageId))}));
  if(!themeRerunWorkspace.descriptionCatalog.length){const text=String(currentAiRun()?.description||currentDescription()||'').trim();if(text&&!/^No AI description is stored/i.test(text))themeRerunWorkspace.descriptionCatalog=[{id:`projection:${imageId}`,artifactId:null,version:0,createdAt:currentAiRun()?.createdAt||new Date().toISOString(),text,current:true,projection:true}];}
  const current=themeRerunWorkspace.current||emptyThemeRerunCurrent(),defaultItem=themeRerunWorkspace.descriptionCatalog.find(item=>item.current)||themeRerunWorkspace.descriptionCatalog[0]||null;
  if(!current.descriptionContextInitialized){current.descriptionContextInitialized=true;current.populatedDescriptionId=defaultItem?.id||null;current.includedDescriptionIds=defaultItem?[String(defaultItem.id)]:[];}
  else if(!themeRerunDescriptionCatalogItem(current.populatedDescriptionId))current.populatedDescriptionId=defaultItem?.id||null;
  themeRerunWorkspace.current=current;saveThemeRerunCurrent();return themeRerunWorkspace.descriptionCatalog;
}
function themeRerunIncludedDescriptionCount(){return (themeRerunWorkspace.current?.includedDescriptionIds||[]).filter(id=>Boolean(themeRerunDescriptionCatalogItem(id))).length}
const THEME_RERUN_PRIM_STATE_META=Object.freeze({
  mandatory:Object.freeze({label:'Mandatory',weight:100}),
  preferred:Object.freeze({label:'Preferred',weight:80}),
  optional:Object.freeze({label:'Optional',weight:60}),
  discouraged:Object.freeze({label:'Discouraged',weight:20}),
  forbidden:Object.freeze({label:'Forbidden',weight:0})
});
function themeRerunUnchosenWeight(scope,current=themeRerunWorkspace.current){const states=Object.values(current?.primScopes?.[scope]||{});return states.includes('optional')?40:50}
function themeRerunPrimScopeSpec(scope,current=themeRerunWorkspace.current){
  const assignments=THEME_RERUN_PRIM_ORDER.map(code=>{const state=current?.primScopes?.[scope]?.[code]||null;if(!state)return null;const meta=THEME_RERUN_PRIM_STATE_META[state];return meta?{primCode:code,state,weight:meta.weight}:null}).filter(Boolean);
  const unchosenCodes=THEME_RERUN_PRIM_ORDER.filter(code=>!current?.primScopes?.[scope]?.[code]);
  let configuredSlots=[];
  if(scope==='general')configuredSlots=[1,2,3].filter(slot=>current?.themeStates?.[slot]!=='replace');
  else{const slot=Number(String(scope).replace('theme',''))||0;if(slot)configuredSlots=[slot];}
  const effectiveSlots=configuredSlots.filter(slot=>current?.themeStates?.[slot]!=='preserve');
  return{scope,assignments,unchosenCodes,unchosenWeight:themeRerunUnchosenWeight(scope,current),configuredSlots,effectiveSlots};
}
function buildThemeRerunPreviewSpec(){
  if(!themeRerunWorkspace.active)throw new Error('Theme Rerun is not open.');
  const current=themeRerunWorkspace.current||emptyThemeRerunCurrent(),imageId=String(themeRerunWorkspace.imageId||currentKey()),image=currentLandscapeFile()||{};
  const themeSlots=[1,2,3].map(slot=>{const snapshot=themeRerunAiThemeSnapshot(slot),fusion=themeRerunCurrentThemeFusion(slot),state=current.themeStates?.[slot]||'neutral';return{slot,currentThemeCode:fusion?.code||null,currentThemeLabel:fusion?.label||snapshot?.label||`Theme ${slot}`,weight:snapshot?.weight??null,state,primScope:state==='preserve'?null:state==='replace'?`theme${slot}`:'general'};});
  const activeScopes=themeRerunScopes();
  const primPicker=activeScopes.map(scope=>themeRerunPrimScopeSpec(scope,current));
  const excludedThemeCodes=[...new Set(current.excludedThemeCodes||[])].filter(code=>Boolean(THEME_RERUN_FUSION_BY_CODE[code]));
  const includedDescriptions=[...new Set(current.includedDescriptionIds||[])].map(id=>themeRerunDescriptionCatalogItem(id)).filter(Boolean).map(item=>({artifactId:item.artifactId||null,id:String(item.id),version:Number(item.version)||0,createdAt:item.createdAt||'',text:String(item.text||'')}));
  const explainChanges=current.explainChanges!==false;
  const currentThemeArtifactId=String(themeRerunHistoryCurrentArtifactId(imageId)||'');
  const editLog=explainChanges?{
    schemaVersion:5,
    evidenceProtocol:'frozen-ledger-support-refs-v2',
    token:`theme_edit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`,
    imageId,
    beforeThemeArtifactId:currentThemeArtifactId||null,
    beforeThemes:themeSlots.map(row=>({slot:row.slot,code:row.currentThemeCode||null,label:row.currentThemeLabel||`Theme ${row.slot}`,weight:row.weight??null}))
  }:null;
  return{schemaVersion:1,image:{id:imageId,name:image.name||imageId,alwaysIncluded:true},themeSlots,primPicker,excludedThemeCodes,includedDescriptions,explainChanges,editLog};
}
function previewThemeRerunRequest(spec){
  const lines=[];
  lines.push('AI Theme Rerun — Preview Request');
  lines.push(`Image: ALWAYS INCLUDED · ${spec.image.name} · ${spec.image.id}`);
  lines.push('');
  lines.push('Theme instructions:');
  for(const row of spec.themeSlots){
    const stateText=row.state==='preserve'?'Green — Preserve. This Theme is protected and will not be changed.':row.state==='replace'?'Red — Replace this Theme.':'Neutral — No opinion; AI may keep or replace this Theme.';
    const scopeText=row.state==='preserve'?'PrimPicker: ignored for this protected Theme.':`PrimPicker: ${row.primScope==='general'?'General':`Theme ${row.slot}`}.`;
    lines.push(`- Theme ${row.slot} · ${row.currentThemeLabel}${row.weight!=null?` (${row.weight}%)`:''}: ${stateText} ${scopeText}`);
  }
  lines.push('');
  lines.push('PrimPicker:');
  for(const scope of spec.primPicker){
    const scopeLabel=scope.scope==='general'?'General':`Theme ${Number(scope.scope.replace('theme',''))}`;
    const applies=scope.effectiveSlots.length?scope.effectiveSlots.map(slot=>`Theme ${slot}`).join(', '):'No unprotected Theme slots';
    lines.push(`\n${scopeLabel} · Applies to: ${applies}`);
    for(const state of THEME_RERUN_PRIM_STATES){
      const meta=THEME_RERUN_PRIM_STATE_META[state],codes=scope.assignments.filter(item=>item.state===state).map(item=>item.primCode),names=codes.map(code=>themeRerunPrimPresentation(code).name);
      lines.push(`${meta.label} (${meta.weight}): ${names.length?names.join(', '):'—'}`);
    }
    const unchosenNames=scope.unchosenCodes.map(code=>themeRerunPrimPresentation(code).name);
    lines.push(`Unchosen (automatic ${scope.unchosenWeight}): ${unchosenNames.length?unchosenNames.join(', '):'—'}`);
  }
  lines.push('');
  lines.push('Theme Exclusions:');
  if(spec.excludedThemeCodes.length)for(const code of spec.excludedThemeCodes){const row=THEME_RERUN_FUSION_BY_CODE[code];if(row)lines.push(`- ${row.label}`);}else lines.push('No themes excluded.');
  lines.push('');
  lines.push(`Theme Edit Log: ${spec.explainChanges!==false?'ON — save frozen-evidence reasoning for changed Themes.':'OFF'}`);
  lines.push('');
  lines.push('Included descriptions:');
  if(spec.includedDescriptions.length)spec.includedDescriptions.forEach((row,index)=>{lines.push(`\n[${index+1}] ${formatDescriptionRerunDate(row.createdAt)}${row.version?` · v${row.version}`:''}`);lines.push(row.text)});else lines.push('No descriptions included.');
  lines.push('');
  lines.push('This is a preview only. No AI request has been sent.');
  return lines.join('\n');
}
function toggleThemeRerunIncludedDescription(id,checked){if(!themeRerunWorkspace.active||!id)return;const set=new Set(themeRerunWorkspace.current.includedDescriptionIds||[]);if(checked)set.add(String(id));else set.delete(String(id));themeRerunWorkspace.current.includedDescriptionIds=[...set];saveThemeRerunCurrent();renderThemeRerunChrome()}
function populateThemeRerunDescription(id){if(!themeRerunWorkspace.active||!themeRerunDescriptionCatalogItem(id))return;themeRerunWorkspace.current.populatedDescriptionId=String(id);saveThemeRerunCurrent();renderTabletWorkbench();requestAnimationFrame(()=>fitLandscapeAiDescription())}
function renderThemeRerunDescriptionsDialog(){const list=$('themeRerunDescriptionsList');if(!list)return;list.innerHTML='';if(!themeRerunWorkspace.descriptionCatalog.length){list.textContent='No Description history is available.';return}for(const item of themeRerunWorkspace.descriptionCatalog){const row=document.createElement('div');row.className='description-rerun-list-row';const check=document.createElement('input');check.type='checkbox';check.checked=(themeRerunWorkspace.current.includedDescriptionIds||[]).includes(item.id);check.setAttribute('aria-label',`Include Description from ${formatDescriptionRerunDate(item.createdAt)}`);check.addEventListener('change',()=>toggleThemeRerunIncludedDescription(item.id,check.checked));const button=document.createElement('button');button.type='button';button.className='description-rerun-list-main';button.innerHTML=`<strong>${formatDescriptionRerunDate(item.createdAt)}${item.current?' · Current':''}${item.version?` · v${item.version}`:''}</strong><small>${item.text.slice(0,220)}</small>`;button.addEventListener('click',()=>{$('themeRerunDescriptionsDialog')?.close();populateThemeRerunDescription(item.id)});row.append(check,button);list.append(row)}}


// v0.9.40.59 — read-only Theme History for Theme Rerun.
// Theme/Fusion identity is resolved by stable codes whenever available; current
// display words are derived from those codes so later renames do not rewrite history identity.
function themeRerunHistoryThemeFromRaw(raw,index=0){
  const source=raw&&typeof raw==='object'?raw:{},rawLabel=String(typeof raw==='string'?raw:(source.theme??source.name??source.proposedName??source.label??source.code??source.id??'')).trim();
  let code=String(source.code??source.id??source.value??'').trim().toUpperCase();
  if(!/^PFM\d{4}$/.test(code))code='';
  const fusion=code?THEME_RERUN_FUSION_BY_CODE[code]:themeRerunFusionFromLabel(rawLabel);
  if(fusion)code=fusion.code;
  const label=fusion?.label||rawLabel||`Theme ${index+1}`;
  const weightRaw=typeof raw==='string'?null:(source.percentage??source.confidence??source.score??source.weight??source.value??null),weight=weightRaw==null?null:Number(weightRaw);
  const rationale=String(typeof raw==='string'?'':(source.rationale??source.reason??source.evidence??'')).trim();
  return{slot:index+1,code:code||null,label,weight:Number.isFinite(weight)?Math.max(0,Math.min(100,weight)):null,rationale};
}
function themeRerunHistoryTriplet(payload){const raw=Array.isArray(payload)?payload:(Array.isArray(payload?.themes)?payload.themes:[]);return raw.slice(0,3).map((row,index)=>themeRerunHistoryThemeFromRaw(row,index));}
function themeRerunHistoryThemeKey(row){return row?.code?`code:${row.code}`:`label:${String(row?.label||'').trim().toLowerCase()}`}
function themeRerunHistoryCurrentArtifactId(imageId){const record=window.genreactrixImageRecordEngine?.get?.(String(imageId),{touch:false})||currentImageRecord();return record?.analysis?.ai?.artifactHistory?.currentArtifacts?.themes?.artifactId||null}
function themeRerunHistoryChanges(previous,current){const out=[];for(let slot=1;slot<=3;slot++){const before=previous?.themes?.[slot-1]||null,after=current?.themes?.[slot-1]||null;if(themeRerunHistoryThemeKey(before)!==themeRerunHistoryThemeKey(after))out.push({slot,before,after});}return out}
function themeRerunHistoryContextSummary(entry){const attempt=entry.attempt||{},parts=[];const mode=String(attempt.mode||entry.artifact?.mode||'').trim();if(mode)parts.push(mode);if(attempt.directorGuidance)parts.push('Director guidance');const ctx=attempt.inputRefs?.themeRerun||attempt.configRefs?.themeRerun||null;if(ctx)parts.push('Theme rerun context');return parts.join(' · ')||'Recorded Theme artifact'}
function themeRerunHistoryDetailText(entry){
  const lines=[];lines.push(`${formatDescriptionRerunDate(entry.createdAt)}${entry.version?` · v${entry.version}`:''}${entry.current?' · Current':''}`);lines.push('');
  for(let slot=1;slot<=3;slot++){const row=entry.themes[slot-1];lines.push(`Theme ${slot}: ${row?.label||'—'}${row?.weight!=null?` (${row.weight}%)`:''}`);}
  lines.push('');
  if(entry.previous){if(entry.changes.length){lines.push('Changed from previous:');for(const change of entry.changes)lines.push(`- Theme ${change.slot}: ${change.before?.label||'—'} → ${change.after?.label||'—'}`);}else lines.push('Changed from previous: none.');}else lines.push('Initial recorded Theme artifact.');
  lines.push('');lines.push(`Context: ${themeRerunHistoryContextSummary(entry)}`);
  if(entry.attempt?.directorGuidance){lines.push('');lines.push('Director guidance:');lines.push(String(entry.attempt.directorGuidance));}
  const ctx=entry.attempt?.inputRefs?.themeRerun||entry.attempt?.configRefs?.themeRerun||null;
  if(ctx){
    const slots=Array.isArray(ctx.themeSlots)?ctx.themeSlots:[];
    if(slots.length){lines.push('');lines.push('Theme instructions:');for(const row of slots){const state=String(row?.state||'neutral');const label=row?.currentThemeCode&&THEME_RERUN_FUSION_BY_CODE[row.currentThemeCode]?.label||row?.currentThemeLabel||`Theme ${row?.slot||''}`;lines.push(`- Theme ${row?.slot||'?'} · ${label}: ${state}`);}}
    const exclusions=Array.isArray(ctx.excludedThemeCodes)?ctx.excludedThemeCodes:[];if(exclusions.length){lines.push('');lines.push(`Theme Exclusions: ${exclusions.map(code=>THEME_RERUN_FUSION_BY_CODE[code]?.label||code).join(', ')}`);}
    const descriptions=Array.isArray(ctx.includedDescriptions)?ctx.includedDescriptions:[];if(descriptions.length){lines.push('');lines.push(`Descriptions included: ${descriptions.length}`);}
  }
  return lines.join('\n');
}
async function loadThemeRerunThemeHistory(){
  const imageId=String(themeRerunWorkspace.imageId||currentKey()),engine=window.genreactrixAiArtifactEngine;let artifacts=[],attempts=[];
  if(engine?.ensureImageReady)await engine.ensureImageReady(imageId).catch(()=>{});
  if(engine?.artifactsForImage)artifacts=(await engine.artifactsForImage(imageId).catch(()=>[])).filter(row=>row.kind==='themes');
  if(engine?.attemptsForImage)attempts=await engine.attemptsForImage(imageId).catch(()=>[]);
  const attemptById=new Map(attempts.map(row=>[String(row.id),row])),currentArtifactId=String(themeRerunHistoryCurrentArtifactId(imageId)||'');
  const ordered=[...artifacts].sort((a,b)=>(Number(a.version)||0)-(Number(b.version)||0)||String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
  const entries=ordered.map(artifact=>({artifact,artifactId:String(artifact.id),version:Number(artifact.version)||0,createdAt:artifact.createdAt||'',themes:themeRerunHistoryTriplet(artifact.payload),attempt:artifact.attemptId?attemptById.get(String(artifact.attemptId))||null:null,current:String(artifact.id)===currentArtifactId,previous:null,changes:[]}));
  for(let index=0;index<entries.length;index++){entries[index].previous=index?entries[index-1]:null;entries[index].changes=themeRerunHistoryChanges(entries[index].previous,entries[index]);}
  if(!entries.length){const run=currentAiRun(),themes=(run?.themes||[]).slice(0,3).map((row,index)=>themeRerunHistoryThemeFromRaw(row,index));if(themes.length)entries.push({artifact:null,artifactId:null,version:0,createdAt:run?.createdAt||new Date().toISOString(),themes,attempt:null,current:true,previous:null,changes:[],projection:true});}
  themeRerunWorkspace.themeHistoryCatalog=entries.reverse();return themeRerunWorkspace.themeHistoryCatalog;
}

// v0.9.40.112 — persisted Landscape Theme-change reasoning. The immutable Theme
// artifact already stores the Worker rationale; this cache only maps the latest
// rerun's changed PFM codes onto the confidence-sorted Landscape display.
const themeChangeReasoningCache=new Map();
const themeChangeReasoningLoading=new Map();
// v0.9.40.113 — one guarded refresh may follow a stale artifact mapping.
// A refresh may re-render only when it actually loaded the artifact currently
// attached to the image; stale data can never recursively schedule itself.
const themeChangeReasoningRenderRefreshPending=new Set();
function themeChangeReasoningContext(entry){return entry?.attempt?.inputRefs?.themeRerun||entry?.attempt?.configRefs?.themeRerun||null}
function cleanThemeEditLogReason(raw,{slot=null,code=''}={}){
  let text=String(raw||'').replace(/\r/g,'').trim();if(!text)return'';
  const lines=text.split('\n').map(line=>line.trim()).filter(Boolean);
  const codeUpper=String(code||'').toUpperCase();
  for(const line of lines){
    if(codeUpper&&!line.toUpperCase().includes(codeUpper))continue;
    const cleaned=line.replace(/^\s*[-*•]+\s*/,'').replace(/^\|\s*/,'').replace(/\s*\|$/,'').trim();
    if(!cleaned.includes('|'))continue;
    const parts=cleaned.split('|').map(part=>part.trim()),codeIndex=parts.findIndex(part=>new RegExp(`\\b${codeUpper||'PFM\\d{4}'}\\b`,'i').test(part));
    if(codeIndex<0)continue;
    let tail=parts.slice(codeIndex+1);
    if(tail.length&&/^(?:100|[1-9]?\d(?:\.\d+)?)\s*%?$/.test(tail[0]))tail=tail.slice(1);
    else if(tail.length&&/^(?:0\s*[-–—]\s*100|CONFIDENCE(?:_0_TO_100)?)$/i.test(tail[0]))tail=tail.slice(1);
    const candidate=tail.join('|').trim();if(candidate)text=candidate;
    break;
  }
  text=text.replace(/^\*{0,2}\s*(?:Theme\s*[123]|Slot\s*[123]|Rank\s*[123])\s*[:\-–—]\s*/i,'')
    .replace(/^Reason\s*[:=\-–—]\s*/i,'').replace(/\*{1,2}/g,'').trim();
  if(slot!=null)text=text.replace(new RegExp(`^${Number(slot)}\\s*\\|\\s*matrix\\s*\\|\\s*PFM\\d{4}\\s*\\|\\s*(?:100|[1-9]?\\d(?:\\.\\d+)?|0\\s*[-–—]\\s*100|CONFIDENCE(?:_0_TO_100)?)\\s*\\|\\s*`,'i'),'').trim();
  return text.slice(0,1000);
}
function themeEditLogComparativeReasonValid(reason,before,after){
  const text=String(reason||'').trim().toLowerCase(),beforeLabel=String(before?.label||'').trim().toLowerCase(),afterLabel=String(after?.label||'').trim().toLowerCase(),beforeCode=String(before?.code||'').trim().toLowerCase(),afterCode=String(after?.code||'').trim().toLowerCase();
  if(!text||(!beforeLabel&&!beforeCode)||(!afterLabel&&!afterCode))return false;
  const mentionsBefore=(beforeLabel&&text.includes(beforeLabel))||(beforeCode&&text.includes(beforeCode)),mentionsAfter=(afterLabel&&text.includes(afterLabel))||(afterCode&&text.includes(afterCode));
  return Boolean(mentionsBefore&&mentionsAfter&&/\bE\d{1,2}\b/i.test(text)&&/\b(?:better|stronger|closer|more|less|rather|instead|over|than|whereas|while|compared|outweigh|replace|replacement|fit|fits|fitting|support|supported)\b/i.test(text));
}
function themeChangeReasoningEmpty(imageId,artifactId=null){return{imageId:String(imageId||''),byCode:new Map(),artifactId:artifactId?String(artifactId):null}}
function themeChangeReasoningBuild(imageId,entries){
  const key=String(imageId||''),currentArtifactId=String(themeRerunHistoryCurrentArtifactId(key)||''),current=(entries||[]).find(entry=>entry.current)||null;
  if(!current||String(current.artifactId||'')!==currentArtifactId)return themeChangeReasoningEmpty(key,currentArtifactId);
  const artifact=current.artifact,attempt=current.attempt,ctx=themeChangeReasoningContext(current),editLog=ctx?.editLog;
  if(!artifact||!attempt||!ctx||ctx.explainChanges===false||!editLog||Number(editLog.schemaVersion)<5||String(editLog.evidenceProtocol||'')!=='frozen-ledger-support-refs-v2'||!String(editLog.token||''))return themeChangeReasoningEmpty(key,currentArtifactId);
  const artifactImageId=String(artifact.imageId||''),attemptImageId=String(attempt.imageId||''),contextImageId=String(ctx.image?.id||''),editImageId=String(editLog.imageId||'');
  if([artifactImageId,attemptImageId,contextImageId,editImageId].some(id=>id!==key))return themeChangeReasoningEmpty(key,currentArtifactId);
  if(String(artifact.attemptId||'')!==String(attempt.id||''))return themeChangeReasoningEmpty(key,currentArtifactId);
  const priorThemeArtifactId=String(attempt.inputRefs?.priorArtifacts?.themes?.artifactId||''),capturedBeforeArtifactId=String(editLog.beforeThemeArtifactId||'');
  if(priorThemeArtifactId!==capturedBeforeArtifactId)return themeChangeReasoningEmpty(key,currentArtifactId);
  const beforeBySlot=new Map((Array.isArray(editLog.beforeThemes)?editLog.beforeThemes:[]).map(row=>[Number(row?.slot),themeRerunHistoryThemeFromRaw({code:row?.code,label:row?.label,confidence:row?.weight},Number(row?.slot)-1)]));
  if(beforeBySlot.size!==3)return themeChangeReasoningEmpty(key,currentArtifactId);
  const byCode=new Map();
  for(let slot=1;slot<=3;slot++){
    const before=beforeBySlot.get(slot)||null,after=current.themes?.[slot-1]||null;
    if(!before||!after||themeRerunHistoryThemeKey(before)===themeRerunHistoryThemeKey(after))continue;
    const reason=cleanThemeEditLogReason(after.rationale,{slot,code:after.code});if(!after.code||!reason||!themeEditLogComparativeReasonValid(reason,before,after))continue;
    const evidence=['Image'];
    const descriptions=Array.isArray(ctx.includedDescriptions)?ctx.includedDescriptions:[];if(descriptions.length)evidence.push(`AI Description${descriptions.length===1?'':`s (${descriptions.length})`}`);
    const slotSpec=Array.isArray(ctx.themeSlots)?ctx.themeSlots.find(row=>Number(row?.slot)===slot):null;
    if(slotSpec?.state==='replace')evidence.push('Director Replace instruction');else if(slotSpec?.state==='neutral')evidence.push('Neutral rerun slot');
    const scopeName=slotSpec?.primScope||null;if(scopeName)evidence.push(scopeName==='general'?'General PrimPicker':'Theme-specific PrimPicker');
    if(Array.isArray(ctx.excludedThemeCodes)&&ctx.excludedThemeCodes.length)evidence.push('Theme Exclusions');
    byCode.set(after.code,{imageId:key,slot,before,after,reason,evidence:[...new Set(evidence)],createdAt:current.createdAt,artifactId:currentArtifactId,attemptId:String(attempt.id),editLogToken:String(editLog.token)});
  }
  return{imageId:key,byCode,artifactId:currentArtifactId};
}
async function refreshThemeChangeReasoning(imageId=currentKey(),{force=false}={}){
  const key=String(imageId||'');if(!key)return null;if(!force&&themeChangeReasoningCache.has(key))return themeChangeReasoningCache.get(key);if(themeChangeReasoningLoading.has(key))return themeChangeReasoningLoading.get(key);
  const task=(async()=>{
    const priorImage=themeRerunWorkspace.imageId,priorCatalog=themeRerunWorkspace.themeHistoryCatalog;
    try{themeRerunWorkspace.imageId=key;const entries=await loadThemeRerunThemeHistory();const built=themeChangeReasoningBuild(key,entries);themeChangeReasoningCache.set(key,built);return built;}
    finally{themeRerunWorkspace.imageId=priorImage;themeRerunWorkspace.themeHistoryCatalog=priorCatalog;}
  })().finally(()=>themeChangeReasoningLoading.delete(key));
  themeChangeReasoningLoading.set(key,task);return task;
}
function themeChangeReasoningForDisplaySlot(slot){
  const key=String(currentKey()),data=themeChangeReasoningCache.get(key),currentArtifactId=String(themeRerunHistoryCurrentArtifactId(key)||'');
  if(!data||String(data.imageId||'')!==key||String(data.artifactId||'')!==currentArtifactId)return null;
  const snapshot=themeRerunAiThemeSnapshot(slot),code=String(snapshot?.id||'').trim().toUpperCase(),item=code&&data?.byCode?.get(code)||null;
  if(!item||String(item.imageId||'')!==key||String(item.artifactId||'')!==currentArtifactId||String(item.after?.code||'').toUpperCase()!==code)return null;
  return item;
}
function renderThemeChangeReasoningDialog(item){
  if(!item)return false;const before=item.before||{},after=item.after||{};
  $('themeChangeReasoningBefore').textContent=before.label||'—';$('themeChangeReasoningBeforePct').textContent=before.weight!=null?`${before.weight}%`:'';
  $('themeChangeReasoningAfter').textContent=after.label||'—';$('themeChangeReasoningAfterPct').textContent=after.weight!=null?`${after.weight}%`:'';
  $('themeChangeReasoningWhy').textContent=item.reason||'No saved reasoning is available.';$('themeChangeReasoningEvidence').textContent=(item.evidence||[]).join(' · ')||'Image';
  $('themeChangeReasoningDialog')?.showModal();return true;
}
async function openThemeChangeReasoningForDisplaySlot(slot){
  if(themeRerunWorkspace.active||descriptionRerunWorkspace.active||reactionRerunWorkspace.active)return false;let item=themeChangeReasoningForDisplaySlot(slot);if(!item){await refreshThemeChangeReasoning(currentKey(),{force:true}).catch(()=>null);item=themeChangeReasoningForDisplaySlot(slot);}return renderThemeChangeReasoningDialog(item);
}
function scheduleThemeChangeReasoningRefresh(){
  const key=String(currentKey()||'');if(!key||state.feedEmpty||themeChangeReasoningRenderRefreshPending.has(key))return;
  const expectedArtifactId=String(themeRerunHistoryCurrentArtifactId(key)||''),cached=themeChangeReasoningCache.get(key);
  if(cached&&String(cached.imageId||'')===key&&String(cached.artifactId||'')===expectedArtifactId)return;
  themeChangeReasoningRenderRefreshPending.add(key);
  refreshThemeChangeReasoning(key,{force:true}).then(data=>{
    const sameImage=String(currentKey())===key,currentArtifactId=String(themeRerunHistoryCurrentArtifactId(key)||''),actuallyRefreshed=String(data?.imageId||'')===key&&String(data?.artifactId||'')===currentArtifactId;
    if(sameImage&&actuallyRefreshed)renderThemeRerunChrome();
  }).catch(error=>console.warn('Theme Edit Log could not be loaded',error)).finally(()=>themeChangeReasoningRenderRefreshPending.delete(key));
}
function renderThemeRerunHistoryDialog(){
  const list=$('themeRerunHistoryList');if(!list)return;list.innerHTML='';const entries=themeRerunWorkspace.themeHistoryCatalog||[];
  if(!entries.length){list.textContent='No Theme history is available.';return;}
  for(const entry of entries){
    const row=document.createElement('section');row.className='theme-rerun-history-row';
    const button=document.createElement('button');button.type='button';button.className='theme-rerun-history-main';button.setAttribute('aria-expanded','false');
    const heading=document.createElement('strong');heading.textContent=`${formatDescriptionRerunDate(entry.createdAt)}${entry.current?' · Current':''}${entry.version?` · v${entry.version}`:''}`;
    const triplet=document.createElement('span');triplet.className='theme-rerun-history-triplet';triplet.textContent=entry.themes.map((theme,index)=>`${index+1}. ${theme?.label||'—'}${theme?.weight!=null?` ${theme.weight}%`:''}`).join(' · ');
    const changed=document.createElement('small');changed.textContent=entry.previous?(entry.changes.length?`Changed: ${entry.changes.map(change=>`Theme ${change.slot}`).join(', ')}`:'Changed: none'):'Initial recorded Themes';
    const context=document.createElement('small');context.textContent=themeRerunHistoryContextSummary(entry);
    button.append(heading,triplet,changed,context);
    const detail=document.createElement('pre');detail.className='theme-rerun-history-detail';detail.hidden=true;detail.textContent=themeRerunHistoryDetailText(entry);
    button.addEventListener('click',()=>{detail.hidden=!detail.hidden;button.setAttribute('aria-expanded',String(!detail.hidden));});
    row.append(button,detail);list.append(row);
  }
}
async function openThemeRerunHistory(){if(!themeRerunWorkspace.active)return;const list=$('themeRerunHistoryList');if(list)list.textContent='Loading Theme history…';$('themeRerunHistoryDialog')?.showModal();await loadThemeRerunThemeHistory();renderThemeRerunHistoryDialog();}

function themeRerunScopeLabel(scope){if(scope==='general')return'General';const slot=Number(scope.replace('theme',''))||0,theme=themeRerunAiThemeSnapshot(slot);return`Theme ${slot}${theme?.label?` · ${theme.label}`:''}`}
function themeRerunScopesForStates(themeStates){const specifics=[];for(let slot=1;slot<=3;slot++)if(themeStates?.[slot]==='replace')specifics.push(`theme${slot}`);if(specifics.length<3)specifics.push('general');return specifics}
function themeRerunScopes(){return themeRerunScopesForStates(themeRerunWorkspace.current?.themeStates||{})}
function themeRerunScopePopulated(scope,current=themeRerunWorkspace.current){return Boolean(Object.keys(current?.primScopes?.[scope]||{}).length)}
function themeRerunStateForPrim(scope,code){return themeRerunWorkspace.current?.primScopes?.[scope]?.[code]||null}
function themeRerunSetPrimState(scope,code,nextState){if(!themeRerunWorkspace.active||!THEME_RERUN_PRIM_ORDER.includes(code))return;const scopes=themeRerunWorkspace.current.primScopes||(themeRerunWorkspace.current.primScopes={});const row=scopes[scope]||(scopes[scope]={});if(nextState&&THEME_RERUN_PRIM_STATES.includes(nextState))row[code]=nextState;else delete row[code];saveThemeRerunCurrent();renderThemeRerunPrimPicker()}
function themeRerunCyclePrim(scope,code){const current=themeRerunStateForPrim(scope,code);const index=THEME_RERUN_PRIM_CYCLE.findIndex(value=>value===current);const next=THEME_RERUN_PRIM_CYCLE[(index<0?THEME_RERUN_PRIM_CYCLE.length-1:index)+1>=THEME_RERUN_PRIM_CYCLE.length?0:(index<0?THEME_RERUN_PRIM_CYCLE.length-1:index)+1];themeRerunSetPrimState(scope,code,next)}
function themeRerunStateClass(state){return state?`state-${state}`:'state-unchosen'}
function renderThemeRerunPrimPicker(){
  const root=$('themeRerunPrimPicker');if(!root)return;root.innerHTML='';
  for(const scope of themeRerunScopes()){
    const row=document.createElement('section');row.className='theme-rerun-prim-row';row.dataset.scope=scope;
    const label=document.createElement('div');label.className='theme-rerun-scope-label';label.textContent=themeRerunScopeLabel(scope);row.append(label);
    const strip=document.createElement('div');strip.className='theme-rerun-prim-strip';
    for(const code of THEME_RERUN_PRIM_ORDER){
      const presentation=themeRerunPrimPresentation(code),state=themeRerunStateForPrim(scope,code),button=document.createElement('button');
      button.type='button';button.className='theme-rerun-prim';button.dataset.primCode=code;button.dataset.scope=scope;button.dataset.primState=state||'unchosen';button.title=`${presentation.name} · ${state?state[0].toUpperCase()+state.slice(1):'Unchosen'}`;button.setAttribute('aria-label',button.title);
      const dot=document.createElement('span');dot.className=`theme-rerun-prim-dot ${themeRerunStateClass(state)}`;dot.setAttribute('aria-hidden','true');
      const emoji=document.createElement('span');emoji.className='theme-rerun-prim-emoji';emoji.textContent=presentation.symbol;emoji.setAttribute('aria-hidden','true');
      button.append(dot,emoji);
      button.addEventListener('pointerdown',event=>{if(!themeRerunWorkspace.active||!themeRerunWorkspace.pickerOpen)return;themeRerunWorkspace.longPressFired=false;themeRerunWorkspace.longPressTarget={scope,code};clearTimeout(themeRerunWorkspace.longPressTimer);button.setPointerCapture?.(event.pointerId);themeRerunWorkspace.longPressTimer=setTimeout(()=>{themeRerunWorkspace.longPressFired=true;const info=themeRerunPrimPresentation(code);$('themeRerunPrimStateTitle').textContent=info.name;document.querySelectorAll('[data-theme-rerun-prim-state]').forEach(choice=>choice.classList.toggle('current',choice.dataset.themeRerunPrimState===(state||'unchosen')));$('themeRerunPrimStateDialog')?.showModal();},520);});
      button.addEventListener('pointerup',()=>{clearTimeout(themeRerunWorkspace.longPressTimer);if(!themeRerunWorkspace.longPressFired)themeRerunCyclePrim(scope,code);themeRerunWorkspace.longPressFired=false;});
      button.addEventListener('pointercancel',()=>{clearTimeout(themeRerunWorkspace.longPressTimer);themeRerunWorkspace.longPressFired=false;});
      button.addEventListener('contextmenu',event=>event.preventDefault());
      strip.append(button);
    }
    row.append(strip);root.append(row);
  }
}
function themeRerunNextThemeState(slot){const current=themeRerunWorkspace.current?.themeStates?.[slot]||'neutral';return current==='neutral'?'replace':current==='replace'?'preserve':'neutral'}
function applyThemeRerunThemeState(slot,nextState){themeRerunWorkspace.current.themeStates[slot]=nextState;saveThemeRerunCurrent();renderTabletWorkbench()}
function requestThemeRerunThemeState(slot){
  if(!themeRerunWorkspace.active)return;const nextState=themeRerunNextThemeState(slot);if(nextState==='preserve'){const fusion=themeRerunCurrentThemeFusion(slot);if(fusion&&themeRerunIsExcluded(fusion.code)){alert(`${fusion.label} is excluded from this rerun. Remove the exclusion before preserving this Theme.`);return;}}const before=themeRerunScopes(),candidate=normalizeThemeRerunCurrent(themeRerunWorkspace.current);candidate.themeStates[slot]=nextState;const after=themeRerunScopesForStates(candidate.themeStates),removed=before.filter(scope=>!after.includes(scope)),populated=removed.filter(scope=>themeRerunScopePopulated(scope));
  if(populated.length){themeRerunWorkspace.pendingScopeChange={slot,nextState,removed:populated};$('themeRerunScopeConfirmText').textContent=`This Theme change will remove PrimPicker data from ${populated.map(themeRerunScopeLabel).join(', ')}.\n\nContinue and clear that data?`;$('themeRerunScopeConfirmDialog')?.showModal();return;}
  applyThemeRerunThemeState(slot,nextState);
}
function applyPendingThemeRerunScopeChange(){const pending=themeRerunWorkspace.pendingScopeChange;if(!pending)return;for(const scope of pending.removed||[])themeRerunWorkspace.current.primScopes[scope]={};themeRerunWorkspace.pendingScopeChange=null;$('themeRerunScopeConfirmDialog')?.close();applyThemeRerunThemeState(pending.slot,pending.nextState)}
function cancelPendingThemeRerunScopeChange(){themeRerunWorkspace.pendingScopeChange=null;$('themeRerunScopeConfirmDialog')?.close()}
function clearThemeRerunPrimData(){if(!themeRerunWorkspace.active)return;for(const scope of ['theme1','theme2','theme3','general'])themeRerunWorkspace.current.primScopes[scope]={};saveThemeRerunCurrent();renderThemeRerunPrimPicker();setDirectorStatus('PrimPicker cleared. Theme selections retained.');}
function clearThemeRerunSelections(){
  if(!themeRerunWorkspace.active||!themeRerunWorkspace.current)return;
  const preservedThemeStates={1:themeRerunWorkspace.current.themeStates?.[1]||'neutral',2:themeRerunWorkspace.current.themeStates?.[2]||'neutral',3:themeRerunWorkspace.current.themeStates?.[3]||'neutral'};
  themeRerunWorkspace.current.themeStates=preservedThemeStates;
  themeRerunWorkspace.current.primScopes={theme1:{},theme2:{},theme3:{},general:{}};
  themeRerunWorkspace.current.excludedThemeCodes=[];
  themeRerunWorkspace.current.includedDescriptionIds=[];
  // Keep the displayed Description and initialization marker. Clear removes selections/context inclusion;
  // it does not erase Description history or cause the default Description to be auto-included again.
  themeRerunWorkspace.current.descriptionContextInitialized=true;
  themeRerunWorkspace.exclusionQuery='';
  themeRerunWorkspace.pendingScopeChange=null;
  saveThemeRerunCurrent();
  renderThemeRerunPrimPicker();
  renderThemeRerunExclusions();
  renderThemeRerunDescriptionsDialog();
  renderThemeRerunChrome();
  setDirectorStatus('Theme rerun options cleared. Red / Green / Neutral Theme states retained.');
}
function remapThemeRerunCurrentAfterSubmit(){
  if(!themeRerunWorkspace.current)return;
  const output=(currentAiRun()?.themes||[]).slice(0,3).map((row,index)=>({logicalSlot:index+1,weight:Number(row?.weight)||0}));
  if(output.length!==3)return;
  const display=[...output].sort((a,b)=>b.weight-a.weight),displaySlotByLogical=new Map(display.map((row,index)=>[row.logicalSlot,index+1]));
  const prior=normalizeThemeRerunCurrent(themeRerunWorkspace.current),next=normalizeThemeRerunCurrent(prior);
  next.themeStates={1:'neutral',2:'neutral',3:'neutral'};
  next.primScopes={theme1:{},theme2:{},theme3:{},general:structuredClone(prior.primScopes?.general||{})};
  for(let logicalSlot=1;logicalSlot<=3;logicalSlot++){
    const displaySlot=displaySlotByLogical.get(logicalSlot)||logicalSlot;
    next.themeStates[displaySlot]=prior.themeStates?.[logicalSlot]||'neutral';
    next.primScopes[`theme${displaySlot}`]=structuredClone(prior.primScopes?.[`theme${logicalSlot}`]||{});
  }
  themeRerunWorkspace.current=next;saveThemeRerunCurrent();
}

async function submitThemeRerun(){
  if(!themeRerunWorkspace.active||aiRerunInFlight)return;
  let spec;
  try{spec=buildThemeRerunPreviewSpec();}
  catch(error){alert(error.message||String(error));return;}
  const dynamicSlots=spec.themeSlots.filter(row=>row.state!=='preserve');
  if(!dynamicSlots.length){const message='All three Themes are preserved. There is nothing for AI to rerun.';setDirectorStatus(message);alert(message);return;}
  for(const row of spec.themeSlots){
    if(['preserve','replace'].includes(row.state)&&!row.currentThemeCode){const message=`Theme ${row.slot} cannot be ${row.state==='preserve'?'preserved':'replaced'} because its PFM code could not be resolved.`;setDirectorStatus(message);alert(message);return;}
  }
  const button=$('themeRerunSubmitBtn'),originalLabel=button?.textContent||'Submit';
  if(button){button.disabled=true;button.textContent='Submitting…';}
  setDirectorStatus(`Rerunning AI Themes · ${dynamicSlots.length} Theme${dynamicSlots.length===1?'':'s'} open to change…`);
  try{
    await runCurrentAiRerun(['themes'],{themeRerun:spec});
    remapThemeRerunCurrentAfterSubmit();
    themeRerunWorkspace.themeHistoryCatalog=[];
    await loadThemeRerunThemeHistory().catch(()=>[]);
    await refreshThemeChangeReasoning(themeRerunWorkspace.imageId,{force:true}).catch(()=>null);
    renderTabletWorkbench();
    setDirectorStatus('AI Theme rerun complete. Reactions were recalculated 100% from the new three Themes.');
  }catch(error){
    const message=String(error?.message||error);
    console.error('AI Theme rerun failed',error);
    setDirectorStatus(`AI Theme rerun failed: ${message}`);
    alert(`AI Theme rerun failed: ${message}`);
  }finally{
    if(button){button.disabled=false;button.textContent=originalLabel;}
  }
}

function renderThemeRerunChrome(){
  const active=themeRerunWorkspace.active,drawer=$('tabletSlidingDrawer'),root=$('tabletWorkbench'),workspace=$('tabletThemeRerunWorkspace'),controls=$('tabletThemeRerunControls'),descriptionInclude=$('themeRerunPopulatedInclude'),descriptionIncludeCheck=$('themeRerunPopulatedIncludeCheck'),explain=$('themeRerunExplainChanges'),explainCheck=$('themeRerunExplainChangesCheck');drawer?.classList.toggle('theme-rerun-active',active);root?.classList.toggle('theme-rerun-active',active);if(workspace)workspace.hidden=!active||!themeRerunWorkspace.pickerOpen;if(controls)controls.hidden=!active;$('themeRerunPrimPickerBtn')?.setAttribute('aria-pressed',String(active&&themeRerunWorkspace.pickerOpen));const exclusions=$('themeRerunExclusionsBtn'),exclusionCount=active?themeRerunExcludedCodes().length:0;if(exclusions){exclusions.classList.toggle('has-data',Boolean(exclusionCount));exclusions.setAttribute('aria-label',exclusionCount?`Theme Exclusions, ${exclusionCount} selected`:'Theme Exclusions');}const displayedDescription=active?themeRerunDisplayedDescriptionItem():null,descriptionCount=active?themeRerunIncludedDescriptionCount():0,descriptionsBtn=$('themeRerunDescriptionsBtn');if(descriptionInclude){descriptionInclude.hidden=!active||!displayedDescription;if(descriptionIncludeCheck)descriptionIncludeCheck.checked=Boolean(displayedDescription&&(themeRerunWorkspace.current?.includedDescriptionIds||[]).includes(String(displayedDescription.id)));}if(explain){explain.hidden=!active;if(explainCheck)explainCheck.checked=themeRerunWorkspace.current?.explainChanges!==false;}const amaButton=$('themeRerunAmaBtn');if(amaButton){const aiCount=amaAiThemes().length,directorCount=amaDirectorThemes().length;amaButton.hidden=!active;amaButton.disabled=!active||aiCount!==3||directorCount<1;amaButton.title=directorCount<1?'AI AMA requires at least one Director Theme.':aiCount!==3?'AI AMA requires the current three AI Themes.':'Interview AI about the current AI-versus-Director Theme snapshot.';}if(descriptionsBtn){descriptionsBtn.classList.toggle('has-data',Boolean(descriptionCount));descriptionsBtn.setAttribute('aria-label',descriptionCount?`Descriptions, ${descriptionCount} included`:'Descriptions');}
  for(let slot=1;slot<=3;slot++){const cell=$(`tabletWorkbenchAiTheme${slot}`)?.closest('.tablet-theme-cell');if(!cell)continue;const state=active?(themeRerunWorkspace.current?.themeStates?.[slot]||'neutral'):'neutral';cell.classList.toggle('theme-rerun-replace',active&&state==='replace');cell.classList.toggle('theme-rerun-preserve',active&&state==='preserve');const changeReason=!active&&!descriptionRerunWorkspace.active&&!reactionRerunWorkspace.active?themeChangeReasoningForDisplaySlot(slot):null;cell.classList.toggle('theme-change-reasoning-available',Boolean(changeReason));cell.dataset.themeRerunState=active?state:'';if(active){cell.tabIndex=0;cell.setAttribute('role','button');const theme=themeRerunAiThemeSnapshot(slot);cell.setAttribute('aria-label',`Theme ${slot}${theme?.label?` ${theme.label}`:''}: ${state==='replace'?'replace':state==='preserve'?'preserve':'neutral'}. Tap to cycle.`);}else if(changeReason&&!descriptionRerunWorkspace.active){cell.tabIndex=0;cell.setAttribute('role','button');cell.setAttribute('aria-label',`${changeReason.after?.label||`Theme ${slot}`} changed in the latest Theme rerun. Tap for reasoning.`);}else if(!descriptionRerunWorkspace.active){cell.tabIndex=-1;cell.setAttribute('role','group');cell.removeAttribute('aria-label');}}
  if(!active&&!descriptionRerunWorkspace.active&&!reactionRerunWorkspace.active){const key=String(currentKey()),cached=themeChangeReasoningCache.get(key),artifactId=String(themeRerunHistoryCurrentArtifactId(key)||'');if(!cached||String(cached.artifactId||'')!==artifactId)scheduleThemeChangeReasoningRefresh();}
  if(active&&themeRerunWorkspace.pickerOpen)renderThemeRerunPrimPicker();
}
async function activateThemeRerunImage(){if(!themeRerunWorkspace.active)return;themeRerunWorkspace.imageId=currentKey();themeRerunWorkspace.current=loadThemeRerunCurrent(themeRerunWorkspace.imageId);themeRerunWorkspace.pickerOpen=false;themeRerunWorkspace.descriptionCatalog=[];await loadThemeRerunDescriptionCatalog();renderTabletWorkbench()}
async function openThemeRerunWorkspace(){if(tabletAiRerunLocked||aiRerunInFlight)return;if(themeRerunWorkspace.active)return;if(reactionRerunWorkspace.active)closeReactionRerunWorkspace();if(descriptionRerunWorkspace.active)closeDescriptionRerunWorkspace();themeRerunWorkspace.preDrawer={face:tabletLandscapeView.face,aiReactions:tabletLandscapeView.aiReactions,aiThemes:tabletLandscapeView.aiThemes,aiDescription:tabletLandscapeView.aiDescription,customs:tabletLandscapeView.customs};themeRerunWorkspace.active=true;themeRerunWorkspace.pickerOpen=false;tabletLandscapeView.face='judgment';tabletLandscapeView.customs=false;tabletLandscapeView.aiReactions=true;tabletLandscapeView.aiThemes=true;tabletLandscapeView.aiDescription=true;await activateThemeRerunImage()}
function closeThemeRerunWorkspace(){if(!themeRerunWorkspace.active)return;saveThemeRerunCurrent();themeRerunWorkspace.active=false;themeRerunWorkspace.pickerOpen=false;themeRerunWorkspace.pendingScopeChange=null;clearTimeout(themeRerunWorkspace.longPressTimer);clearTimeout(themeRerunWorkspace.descriptionsTimer);const prior=themeRerunWorkspace.preDrawer;if(prior)Object.assign(tabletLandscapeView,prior);themeRerunWorkspace.preDrawer=null;themeRerunWorkspace.imageId=null;themeRerunWorkspace.current=null;themeRerunWorkspace.descriptionCatalog=[];themeRerunWorkspace.themeHistoryCatalog=[];themeRerunWorkspace.descriptionsLongPress=false;renderTabletWorkbench()}
window.genreactrixThemeRerunWorkspace={open:openThemeRerunWorkspace,close:closeThemeRerunWorkspace,isActive:()=>themeRerunWorkspace.active};


// v0.9.40.132 — Theme adversarial decision pipeline; literal evidence -> broad candidates -> adversarial audit -> final rank; PrimFusion definitions unchanged.
// v0.9.40.130 — AI AMA provider slot prompts; canonical Q IDs hidden from provider; 3-to-1 execution retained.
const AMA_UI_COLOR='#EF806C';
const amaUiState={reportId:null,runId:null,running:false,statusTimer:null,statusStartedAt:0,statusBase:''};
function amaEsc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function amaBlockRange(run,blockIndex){const expected=Math.max(1,Number(run?.questionCount)||68),size=Math.max(1,Number(run?.blockSize)||3),start=Math.max(1,Number(blockIndex)*size+1),end=Math.min(expected,start+size-1);return{start,end,label:`Q${start}–Q${end}`}}
function amaQuestionNumberFromId(id){const m=String(id||'').toUpperCase().match(/^Q(\d+)$/);return m?Number(m[1]):Number.MAX_SAFE_INTEGER}
function amaQuestionIdsLabel(ids=[]){const nums=[...new Set((ids||[]).map(amaQuestionNumberFromId).filter(Number.isFinite).filter(n=>n<Number.MAX_SAFE_INTEGER))].sort((a,b)=>a-b);if(!nums.length)return'questions';if(nums.length===1)return`Q${nums[0]}`;const contiguous=nums.every((n,i)=>i===0||n===nums[i-1]+1);return contiguous?`Q${nums[0]}–Q${nums.at(-1)}`:nums.map(n=>`Q${n}`).join(', ')}
function amaBlockQuestionIds(run,blockIndex){const fromPlan=Array.isArray(run?.questionBlocks)?run.questionBlocks.find(row=>Number(row?.index)===Number(blockIndex))?.questionIds:null;if(Array.isArray(fromPlan)&&fromPlan.length)return fromPlan.map(id=>String(id).toUpperCase());const range=amaBlockRange(run,blockIndex),ids=[];for(let n=range.start;n<=range.end;n++)ids.push(`Q${n}`);return ids}
function amaMissingQuestionIds(run,blockIndex){const saved=new Set((run?.questions||[]).filter(q=>amaClientAnswerValidation(q?.answer).valid).map(q=>String(q?.id||'').toUpperCase()).filter(Boolean));return amaBlockQuestionIds(run,blockIndex).filter(id=>!saved.has(id))}
function amaThreeQuestionPlan(questionCount=68){const count=Math.max(1,Number(questionCount)||68),blocks=[];for(let start=1,index=0;start<=count;start+=3,index++){const questionIds=[];for(let n=start;n<=Math.min(count,start+2);n++)questionIds.push(`Q${n}`);blocks.push({index,questionIds})}return{questionCount:count,blockSize:3,blockCount:blocks.length,blocks}}
function amaThreeQuestionPlanMatches(run){const plan=amaThreeQuestionPlan(run?.questionCount||68);if(Number(run?.blockSize)!==3||Number(run?.blockCount)!==plan.blockCount)return false;const existing=Array.isArray(run?.questionBlocks)?run.questionBlocks:[];if(existing.length!==plan.blocks.length)return false;return plan.blocks.every((block,i)=>Number(existing[i]?.index)===block.index&&JSON.stringify((existing[i]?.questionIds||[]).map(id=>String(id).toUpperCase()))===JSON.stringify(block.questionIds))}
async function amaNormalizeThreeQuestionRun(engine,run){
  if(!run)return run;
  const plan=amaThreeQuestionPlan(run?.questionCount||68),rawQuestions=Array.isArray(run?.questions)?run.questions:[],safeQuestions=rawQuestions.filter(q=>amaClientAnswerValidation(q?.answer).valid),saved=new Set(safeQuestions.map(q=>String(q?.id||'').toUpperCase()).filter(Boolean)),completed=plan.blocks.filter(block=>block.questionIds.every(id=>saved.has(id))).map(block=>block.index),currentCompleted=[...new Set((run?.completedBlockIndexes||[]).map(Number).filter(Number.isInteger))].sort((a,b)=>a-b),needsScrub=safeQuestions.length!==rawQuestions.length||JSON.stringify(currentCompleted)!==JSON.stringify(completed)||!amaThreeQuestionPlanMatches(run)||run.executionStrategy!=='3-to-1-strict-validation';
  if(!needsScrub)return run;
  return engine.checkpointRun(run.id,{questions:safeQuestions,questionCount:plan.questionCount,blockSize:3,blockCount:plan.blockCount,questionBlocks:plan.blocks,completedBlockIndexes:completed,executionStrategy:'3-to-1-strict-validation'});
}
function amaStageLabel(stage,blockIndex,run,meta={}){if(stage==='visual')return'Reading image';if(stage==='candidates')return'Auditing candidate Themes';if(stage==='questions'){const blockCount=Math.max(1,Number(run?.blockCount)||Math.ceil((Number(run?.questionCount)||68)/3)),ids=Array.isArray(meta?.questionIds)&&meta.questionIds.length?meta.questionIds:null,range=ids?{label:amaQuestionIdsLabel(ids)}:amaBlockRange(run,blockIndex),recovery=meta?.recoveryLevel==='single-question recovery'?' · single-question recovery':'';return`Interview step ${Number(blockIndex)+1}/${blockCount} · ${range.label}${recovery}`}if(stage==='finalize')return'Finalizing report';return'AI AMA'}
function amaCompactError(error){return String(error?.message||error||'Unknown AMA error').replace(/\s+/g,' ').trim().slice(0,420)}
function amaClientAnswerValidation(answer){
  const value=String(answer||'').replace(/\r/g,'').trim();if(!value)return{valid:false,reason:'empty answer'};
  if(!/[A-Za-z0-9]/.test(value))return{valid:false,reason:'answer contains no substantive text'};
  const compact=value.replace(/\s+/g,' ').trim();if(/^(?:nswer|answer|response|n\/?a|unknown|unavailable)$/i.test(compact))return{valid:false,reason:'answer is a placeholder/corrupted fragment'};
  const sentences=compact.split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(x=>x.length>=36);if(sentences.length>=3){const counts=new Map();for(const sentence of sentences){const key=sentence.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();counts.set(key,(counts.get(key)||0)+1)}if([...counts.values()].some(count=>count>=3))return{valid:false,reason:'answer contains a repeated sentence loop'};if(sentences.length>=8&&counts.size/sentences.length<0.62)return{valid:false,reason:'answer is dominated by repeated prose'}}
  if(/(?:^|\s)(?:\*\*|__)?(?:Q\s*0*\d{1,4}|Question\s*0*\d{1,4})\s*(?::|[-–—.]|\)|\])/im.test(value))return{valid:false,reason:'answer contains another question-ID marker'};
  const questionMarks=(compact.match(/\?/g)||[]).length,lead=compact.replace(/^[\s"'“”'‘’()[\]{}*_-]+/,'').replace(/^\d+\s*:\s*/,'').trim(),interrogative=/^(?:what|which|why|how|when|where|who|whom|whose|is|are|am|was|were|do|does|did|can|could|would|should|will|has|have|had|may|might)\b/i;
  if(questionMarks>=3)return{valid:false,reason:'response appears to generate questions instead of answering'};
  if(questionMarks>=1&&/[?]\s*$/.test(compact)&&interrogative.test(lead))return{valid:false,reason:'response is a question rather than an answer'};
  if(/^\d+\s*:\s*(?:what|which|why|how|is|are|was|were|do|does|did|can|could|would|should|has|have|had)\b/i.test(compact)&&/[?]\s*$/.test(compact))return{valid:false,reason:'response is a generated question'};
  return{valid:true,reason:''};
}
function amaStopStatusClock(){if(amaUiState.statusTimer){clearInterval(amaUiState.statusTimer);amaUiState.statusTimer=null}amaUiState.statusStartedAt=0;amaUiState.statusBase=''}
function amaStartStatusClock(base,{sameSizeRetryPossible=true}={}){amaStopStatusClock();amaUiState.statusStartedAt=Date.now();amaUiState.statusBase=String(base||'AI AMA');const render=()=>{const elapsed=Math.max(0,Math.floor((Date.now()-amaUiState.statusStartedAt)/1000));let hint='waiting for Worker / AI provider';if(elapsed>=91)hint=sameSizeRetryPossible?'first 90s provider window passed; Worker retry may be active':'90s provider window reached; this chunk will return/fail without a same-size retry';setAmaRunProgress(`${amaUiState.statusBase} · ${elapsed}s · ${hint}`)};render();amaUiState.statusTimer=setInterval(render,1000)}
function amaDirectorThemes(){return(state.themes||[]).map((theme,index)=>{if(!theme)return null;const label=themeLabel(theme),fusion=themeRerunFusionFromLabel(label),rawId=String(theme?.id||'');return{slot:index+1,code:fusion?.code||(rawId.toUpperCase().startsWith('PFM')?rawId.toUpperCase():null),label,kind:theme?.kind||'director'};}).filter(Boolean)}
function amaAiThemes(){return(currentAiRun()?.themes||[]).map((row,index)=>({slot:Number(row?.rank)||index+1,code:String(row?.id||row?.code||'').toUpperCase()||null,label:String(row?.label||row?.name||''),confidence:Number(row?.weight??row?.confidence)||0})).sort((a,b)=>b.confidence-a.confidence).slice(0,3)}
function currentSlopAssessment(){return recordSlopAssessment(currentImageRecord())}
function buildAmaSnapshot(){
  const record=currentImageRecord();if(!record)throw new Error('No current image is available.');
  const aiThemes=amaAiThemes(),directorThemes=amaDirectorThemes();
  if(aiThemes.length!==3)throw new Error('AI AMA requires the current three AI Themes.');
  if(directorThemes.length<1)throw new Error('AI AMA requires at least one Director Theme.');
  let rerunContext=null;try{if(themeRerunWorkspace.active)rerunContext=buildThemeRerunPreviewSpec()}catch{}
  const ai=record.analysis?.ai||{};
  return{schemaVersion:1,imageId:String(record.id),filename:record.source?.originalFilename||record.name||record.id,createdAt:record.createdAt||'',siteVersion:GENREACTRIX_BUILD,aiThemes,directorThemes,aiDescription:String(currentAiRun()?.description||currentDescription()||''),slopAssessment:currentSlopAssessment(),directorReactions:[...state.selectedReactions],rerunContext,aiContext:{provider:ai.provider||{},model:ai.model||'',promptVersions:ai.promptVersions||{},recordedAt:ai.recordedAt||'',jobId:ai.jobId||null,artifactHistory:ai.artifactHistory||null}};
}
function amaBlobDataUrl(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})}
async function amaPreparedImageInput(record){
  const remote=record?.storage?.hyperlink||record?.source?.originalUrl||'';if(record?.storage?.mode==='linked'&&/^https:\/\//i.test(remote))return{imageUrl:remote};
  let blob=await imageBlobGet(record.id).catch(()=>null);if(!blob&&/^https:\/\//i.test(remote))return{imageUrl:remote};if(!blob)return{};
  try{
    if(blob.size<=3_800_000)return{imageDataUrl:await amaBlobDataUrl(blob)};
    const bitmap=await createImageBitmap(blob),max=1600,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();const reduced=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.88));return{imageDataUrl:await amaBlobDataUrl(reduced||blob)};
  }catch{return{imageDataUrl:await amaBlobDataUrl(blob)}}
}
function renderAiStatusTags(){
  const record=currentImageRecord(),tuned=$('landscapeTunedBtn'),slop=$('landscapeSlopBtn'),has=Boolean(record)&&!state.feedEmpty,assessment=recordSlopAssessment(record),kind=slopAssessmentKind(assessment),showSlop=has&&recordHasSlopSuggestion(record);
  if(tuned)tuned.hidden=!has||!recordIsTuned(record);
  if(slop){slop.hidden=!showSlop;slop.textContent='SLOP?';slop.classList.toggle('slop-warning-status',showSlop&&kind==='warning');slop.classList.toggle('slop-detected-status',showSlop&&kind==='detected');slop.title=showSlop?(kind==='warning'?'SLOP? · Slop Warning':'SLOP? · Slop Detected'):'';slop.setAttribute('aria-label',showSlop?(kind==='warning'?'SLOP? Slop Warning':'SLOP? Slop Detected'):'SLOP?');}
}
const CONTENT_RATING_SIZES=new Set(["XS","S","M","L","XL"]);
const CONTENT_RATING_AXES=["work","lunch","civility"];
function normalizedContentRatingSize(value){const size=String(value||"").toUpperCase();return CONTENT_RATING_SIZES.has(size)?size:""}
function imageContentRatings(record=currentImageRecord()){
  const raw=record?.metadata?.extended?.contentRatings||{},reasons=raw.aiReasons&&typeof raw.aiReasons==='object'?raw.aiReasons:{};
  return{schemaVersion:Number(raw.schemaVersion)||1,ai:{work:normalizedContentRatingSize(raw.ai?.work),lunch:normalizedContentRatingSize(raw.ai?.lunch),civility:normalizedContentRatingSize(raw.ai?.civility)},aiReasons:{work:String(reasons.work||''),lunch:String(reasons.lunch||''),civility:String(reasons.civility||'')},aiDetails:raw.aiDetails&&typeof raw.aiDetails==='object'?raw.aiDetails:null,director:{work:normalizedContentRatingSize(raw.director?.work),lunch:normalizedContentRatingSize(raw.director?.lunch),civility:normalizedContentRatingSize(raw.director?.civility)}};
}
function setContentRatingCell(node,size){if(!node)return;const normalized=normalizedContentRatingSize(size);node.dataset.size=normalized;if(node.tagName==='SELECT')node.value=normalized;else node.textContent=normalized||'—'}
function renderContentRatings(){
  const record=currentImageRecord(),has=Boolean(record)&&!state.feedEmpty,ratings=imageContentRatings(record),locked=Boolean(record?.attributes?.locked);
  const ids={work:['contentRatingAiWork','contentRatingDirWork'],lunch:['contentRatingAiLunch','contentRatingDirLunch'],civility:['contentRatingAiCivility','contentRatingDirCivility']};
  for(const axis of CONTENT_RATING_AXES){const [aiId,dirId]=ids[axis],ai=$(aiId),dir=$(dirId);setContentRatingCell(ai,ratings.ai[axis]);setContentRatingCell(dir,ratings.director[axis]);if(dir)dir.disabled=!has||locked;}
}
function setDirectorContentRating(axis,value){
  if(!CONTENT_RATING_AXES.includes(axis))return;const size=normalizedContentRatingSize(value);if(!size)return;
  const record=currentImageRecord();if(!record||state.feedEmpty)return;
  const current=imageContentRatings(record);
  window.genreactrixImageRecordEngine?.update?.(record.id,{metadata:{extended:{contentRatings:{schemaVersion:Math.max(2,current.schemaVersion||1),ai:{...current.ai},aiReasons:{...current.aiReasons},...(current.aiDetails?{aiDetails:current.aiDetails}:{}),director:{...current.director,[axis]:size}}}}},'director-content-rating-changed');
  renderContentRatings();
}
const CONTENT_RATING_AXIS_LABELS={work:'Not Safe for Work',lunch:'Not Safe for Lunch',civility:'Not Safe for Civility'};
function openAiContentRatingReason(axis){
  if(!CONTENT_RATING_AXES.includes(axis))return;const record=currentImageRecord();if(!record||state.feedEmpty)return;const ratings=imageContentRatings(record),size=ratings.ai[axis],reason=ratings.aiReasons[axis];
  const title=$('contentRatingReasonTitle'),summary=$('contentRatingReasonSummary'),body=$('contentRatingReasonBody');
  if(title)title.textContent=`AI ${CONTENT_RATING_AXIS_LABELS[axis]||axis}`;
  if(summary)summary.textContent=size?`AI rating: ${size}`:'AI rating has not been generated yet.';
  if(body)body.textContent=reason||(size?'No stored explanation is available for this rating.':'Run the image through the AI bundle to generate the first-pass content rating.');
  safelyShowDialog($('contentRatingReasonDialog'));
}
async function rerunCurrentAiSafety(){
  if(aiRerunInFlight)return;
  const record=currentImageRecord();if(!record||state.feedEmpty)return;
  const description=String(record.analysis?.ai?.components?.description||record.analysis?.ai?.description||currentDescription()||'').trim();
  if(!description||/^No AI description is stored/i.test(description)){alert('A completed AI Description is required before rerunning AI Safety.');return;}
  if(!window.GenreactrixCloudApi?.isConfigured?.()){alert('AI Worker is not configured.');return;}
  aiRerunInFlight=true;syncTabletAiRerunControls();setDirectorStatus('Rerunning AI Safety…');
  try{
    const payload=await window.GenreactrixCloudApi.contentGate(description),result=payload?.result||payload;
    if(!result?.ai)throw new Error(result?.error||'AI Safety returned no rating.');
    const current=imageContentRatings(record);
    window.genreactrixImageRecordEngine?.update?.(record.id,{metadata:{extended:{contentRatings:{schemaVersion:Math.max(2,current.schemaVersion||1),ai:{...result.ai},aiReasons:{...(result.reasons||{})},aiDetails:{protocol:result.protocol||'',model:result.model||'',mode:result.mode||'',overall:result.overall||'',codes:[...(result.codes||[])],generatedAt:result.generatedAt||'',raw:result.raw||''},director:{...current.director}}}}},'ai-content-rating-rerun');
    renderContentRatings();
    setDirectorStatus('AI Safety rerun complete.');
  }catch(error){const message=String(error?.message||error);console.error('AI Safety rerun failed',error);setDirectorStatus(`AI Safety rerun failed: ${message}`);alert(`AI Safety rerun failed: ${message}`);}
  finally{aiRerunInFlight=false;syncTabletAiRerunControls();}
}
async function openTunedHistory(){
  const record=currentImageRecord();if(!record)return;const body=$('tunedHistoryBody');if(!body)return;body.innerHTML='<p>Loading AI history…</p>';$('tunedHistoryDialog')?.showModal();
  try{
    await window.genreactrixAiArtifactEngine?.ensureImageReady?.(record.id).catch(()=>{});
    const [attempts,artifacts,timeline]=await Promise.all([window.genreactrixAiArtifactEngine?.attemptsForImage?.(record.id)||[],window.genreactrixAiArtifactEngine?.artifactsForImage?.(record.id)||[],window.genreactrixHistoryEngine?.timeline?.(record.id)||[]]);
    const byAttempt=new Map();for(const artifact of artifacts){const key=String(artifact.attemptId||'unlinked');if(!byAttempt.has(key))byAttempt.set(key,[]);byAttempt.get(key).push(artifact)}
    body.innerHTML='';const intro=document.createElement('details');intro.open=true;intro.innerHTML=`<summary>Current AI projection</summary><pre>${amaEsc(JSON.stringify(record.analysis?.ai||{},null,2))}</pre>`;body.append(intro);
    attempts.sort((a,b)=>String(a.startedAt||'').localeCompare(String(b.startedAt||''))).forEach((attempt,index)=>{const d=document.createElement('details'),rerun=/rerun/i.test(String(attempt.mode||''))||Object.values(attempt.componentBehaviors||{}).some(x=>x==='reanalyze');const linked=byAttempt.get(String(attempt.id))||[];d.innerHTML=`<summary>${index===0?'Origin AI scan':rerun?'AI rerun':'AI analysis'} · ${amaEsc(new Date(attempt.startedAt||Date.now()).toLocaleString())} · ${amaEsc((attempt.components||[]).join(' + '))}</summary><pre>${amaEsc(JSON.stringify({attempt,artifacts:linked},null,2))}</pre>`;body.append(d)});
    const h=document.createElement('details');h.innerHTML=`<summary>Full image history timeline · ${timeline.length} events</summary><pre>${amaEsc(JSON.stringify(timeline,null,2))}</pre>`;body.append(h);
  }catch(error){body.innerHTML=`<p>AI history could not be loaded: ${amaEsc(error?.message||error)}</p>`}
}
function openSlopDecision(){const assessment=currentSlopAssessment(),kind=slopAssessmentKind(assessment);if(kind==='none')return;const reason=$('slopReason'),confidence=$('slopConfidence');if(reason)reason.textContent=assessment.reason||(kind==='warning'?'Theme analysis could not establish three defensible Themes; Director review is recommended.':'AI marked this image as possible SLOP.');if(confidence)confidence.textContent=kind==='warning'?`Slop Warning · ${Number(assessment.themeSurvivorCount)||0} defensible Theme${Number(assessment.themeSurvivorCount)===1?'':'s'} after ${Number(assessment.themeAuditedCount)||77} audited.`:`Slop Detected · AI advisory confidence: ${Number(assessment.confidence)||0}%`;safelyShowDialog($('slopDialog'))}
async function applySlopDecision(decision){
  const record=currentImageRecord(),assessment=currentSlopAssessment();if(!record||!assessment)return;const at=new Date().toISOString();
  if(decision==='not-slop')window.genreactrixImageRecordEngine?.update?.(record.id,{metadata:{extended:{slopDirectorReview:{decision:'not-slop',assessmentId:assessment.assessmentId||null,at}}}},'slop-director-not-slop');
  else{const updated=await window.genreactrixImagesEngine?.setFlagSeverity?.(record.id,decision);state.flagged=Boolean(updated?.attributes?.flagged);window.genreactrixImageRecordEngine?.update?.(record.id,{metadata:{extended:{slopDirectorReview:{decision,assessmentId:assessment.assessmentId||null,at}}}},'slop-director-disposition');}
  $('slopDialog')?.close();landscapeFeedDirty=true;await rehydrateLandscapeFeed().catch(()=>{});renderAll();renderTabletWorkbench();
}
function amaRunProgressText(run){if(!run)return'';const progress=window.genreactrixAmaEngine?.runProgress?.(run)||{answered:(run.questions||[]).length,expected:Number(run.questionCount)||68};return`${progress.answered}/${progress.expected} core Q&A saved`;}
function setAmaRunProgress(text=''){const node=$('amaRunProgress');if(node)node.textContent=String(text||'')}
async function refreshAmaRunMenu(){
  const button=$('amaRunBtn'),record=currentImageRecord(),engine=window.genreactrixAmaEngine;if(!button||!record||!engine)return null;
  let pending=await engine.latestIncompleteRun(record.id);if(pending){pending=await amaNormalizeThreeQuestionRun(engine,pending);const progress=engine.runProgress(pending),err=pending.lastError||null;button.disabled=false;button.textContent='Resume AI AMA';button.title='Resume the saved incomplete AMA from its first unfinished step.';if(err){const stage=amaStageLabel(err.stage,err.blockIndex,pending,err),when=err.at?new Date(err.at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit',second:'2-digit'}):'';setAmaRunProgress(`Paused at ${stage} · ${progress.answered}/${progress.expected} saved · ${amaCompactError(err.message)}${when?` · ${when}`:''} · Resume restarts only the unfinished step.`)}else setAmaRunProgress(`Incomplete AMA · ${progress.answered}/${progress.expected} saved · resume available`);return pending}
  const directorCount=amaDirectorThemes().length,aiCount=amaAiThemes().length;button.disabled=directorCount<1||aiCount!==3;button.textContent='Run AI AMA?';button.title=directorCount<1?'Select at least one Director Theme first.':aiCount!==3?'Three AI Themes are required.':'';setAmaRunProgress('');return null;
}
async function openAmaMenu(){safelyShowDialog($('amaMenuDialog'));try{await refreshAmaRunMenu()}catch(error){console.warn('AMA resume state could not be loaded',error)}}
function amaPriorTranscript(bundle){const report=bundle?.report;if(!report)return'';const core=(report.interview?.questions||[]).map(q=>`Q: ${q.question}\nA: ${q.answer}`).join('\n\n'),follow=(bundle.followups||[]).map(q=>`Q: ${q.question}\nA: ${q.answer}`).join('\n\n');return(core+'\n\n'+follow).slice(0,18000)}
async function runAmaCurrent(){
  if(amaUiState.running)return;const record=currentImageRecord(),engine=window.genreactrixAmaEngine,api=window.GenreactrixCloudApi;if(!record||!engine)throw new Error('AMA Engine is unavailable.');if(!api?.isConfigured?.())throw new Error('AI Worker is not configured.');
  let run=await engine.latestIncompleteRun(record.id),currentStage='created',currentBlock=null,currentQuestionIds=[],currentRecoveryLevel='normal';
  if(run)run=await amaNormalizeThreeQuestionRun(engine,run);
  if(!run){const snapshot=buildAmaSnapshot();run=await engine.createRun({imageId:record.id,snapshot,siteVersion:GENREACTRIX_BUILD})}
  amaUiState.runId=run.id;amaUiState.running=true;const runBtn=$('amaRunBtn');if(runBtn){runBtn.disabled=true;runBtn.textContent='Starting AMA…'};
  const key=api.getKey();
  try{
    if(!String(run.visualRead||'').trim()){
      currentStage='visual';currentQuestionIds=[];currentRecoveryLevel='normal';setAmaRunProgress('Preparing image for AI visual read… · 0/68 saved');setDirectorStatus('AI AMA · preparing image…');if(runBtn)runBtn.textContent='Reading image…';
      const imageInput=await amaPreparedImageInput(record);amaStartStatusClock('Reading image · 0/68 saved');
      const payload=await api.ama({mode:'visual',snapshot:run.snapshot,...imageInput},key),result=payload.result||payload;amaStopStatusClock();if(!String(result?.visualRead||'').trim())throw new Error('AI AMA visual read returned no result.');
      run=await engine.checkpointRun(run.id,{stage:'visual',visualRead:result.visualRead,workerVersion:result.workerVersion||run.workerVersion,matrixVersion:result.matrixVersion||run.matrixVersion,model:result.model||run.model,questionCount:Number(result.questionCount)||68,blockSize:Number(result.blockSize)||3,blockCount:Number(result.blockCount)||0,questionBlocks:result.blocks||run.questionBlocks||[],executionStrategy:'3-to-1-strict-validation',lastError:null});
      run=await amaNormalizeThreeQuestionRun(engine,run);
    }
    if(!run.candidatesReady){
      currentStage='candidates';currentQuestionIds=[];currentRecoveryLevel='normal';if(runBtn)runBtn.textContent='Auditing Themes…';amaStartStatusClock(`Auditing candidate Themes · ${amaRunProgressText(run)}`);setDirectorStatus('AI AMA · visual read saved · auditing candidate Themes…');
      const payload=await api.ama({mode:'candidates',snapshot:run.snapshot,visualRead:run.visualRead},key),result=payload.result||payload;amaStopStatusClock();
      run=await engine.checkpointRun(run.id,{stage:'candidates',candidatesReady:true,candidateThemeCodes:Array.isArray(result.candidateThemeCodes)?result.candidateThemeCodes:[],themeDefinitions:Array.isArray(result.themeDefinitions)?result.themeDefinitions:[],workerVersion:result.workerVersion||run.workerVersion,matrixVersion:result.matrixVersion||run.matrixVersion,model:result.model||run.model,questionCount:Number(result.questionCount)||run.questionCount||68,blockSize:Number(result.blockSize)||3,blockCount:Number(result.blockCount)||run.blockCount||0,questionBlocks:result.blocks||run.questionBlocks||[],executionStrategy:'3-to-1-strict-validation',lastError:null});
      run=await amaNormalizeThreeQuestionRun(engine,run);
    }
    const blockCount=Number(run.blockCount)||Math.ceil((Number(run.questionCount)||68)/3);
    for(let blockIndex=0;blockIndex<blockCount;blockIndex++){
      if((run.completedBlockIndexes||[]).includes(blockIndex))continue;currentStage='questions';currentBlock=blockIndex;const blockIds=amaBlockQuestionIds(run,blockIndex),range=amaBlockRange(run,blockIndex);
      let missing=amaMissingQuestionIds(run,blockIndex);if(!missing.length){run=await engine.saveQuestionBlock(run.id,{blockIndex,complete:true,meta:{lastError:null}});continue}
      const callChunk=async(ids,recoveryLevel)=>{
        const requested=[...ids];currentQuestionIds=requested;currentRecoveryLevel=recoveryLevel;const progress=engine.runProgress(run),label=amaQuestionIdsLabel(requested),levelText=recoveryLevel==='normal'?'3-question step':'single-question recovery';
        if(runBtn)runBtn.textContent=`Running ${label}…`;amaStartStatusClock(`Step ${blockIndex+1}/${blockCount} · ${label} · ${progress.answered}/${progress.expected} saved · ${levelText}`,{sameSizeRetryPossible:false});setDirectorStatus(`AI AMA · step ${blockIndex+1}/${blockCount} · ${label} · ${levelText} · ${progress.answered}/${progress.expected} saved…`);
        try{
          const payload=await api.ama({mode:'question-block',snapshot:run.snapshot,visualRead:run.visualRead,candidateThemeCodes:run.candidateThemeCodes||[],blockIndex,questionIds:requested},key),result=payload.result||payload;amaStopStatusClock();
          const incoming=Array.isArray(result.questions)?result.questions:[],accepted=[],clientRejected=[];for(const q of incoming){const validation=amaClientAnswerValidation(q?.answer);if(validation.valid)accepted.push(q);else clientRejected.push({id:String(q?.id||'').toUpperCase(),reason:validation.reason,preview:String(q?.answer||'').replace(/\s+/g,' ').slice(0,500)})}
          run=await engine.saveQuestionBlock(run.id,{questions:accepted,blockIndex,complete:false,meta:{workerVersion:result.workerVersion||run.workerVersion,matrixVersion:result.matrixVersion||run.matrixVersion,model:result.model||run.model,questionCount:Number(result.questionCount)||run.questionCount||68,blockSize:3,blockCount:Number(result.blockCount)||run.blockCount||blockCount,questionBlocks:result.blocks||run.questionBlocks||[],executionStrategy:'3-to-1-strict-validation',lastError:null}});
          const after=engine.runProgress(run),missingSet=new Set(amaMissingQuestionIds(run,blockIndex)),stillMissing=requested.filter(id=>missingSet.has(id)),rejectNote=clientRejected.length?` · rejected malformed ${clientRejected.map(row=>row.id||'answer').join(', ')}`:'';if(stillMissing.length)setAmaRunProgress(`${label} returned partial/invalid results · ${after.answered}/${after.expected} saved · missing ${stillMissing.join(', ')}${rejectNote} · switching only the missing question(s) to single-question recovery.`);else setAmaRunProgress(`${label} saved · ${after.answered}/${after.expected} core Q&A saved.`);
          return{result,missing:stillMissing,clientRejected};
        }catch(error){amaStopStatusClock();throw error}
      };
      const priorSingleRecovery=run.lastError?.stage==='questions'&&Number(run.lastError?.blockIndex)===blockIndex&&run.lastError?.recoveryLevel==='single-question recovery';
      if(missing.length===blockIds.length&&missing.length>1&&!priorSingleRecovery){
        try{await callChunk(missing,'normal')}catch(error){const progress=engine.runProgress(run);setAmaRunProgress(`${amaQuestionIdsLabel(missing)} failed as a 3-question step · ${progress.answered}/${progress.expected} saved · switching only this step to single-question recovery. ${amaCompactError(error)}`);setDirectorStatus(`AI AMA · ${range.label} failed · switching to single questions.`)}
      }else if(missing.length<blockIds.length||priorSingleRecovery){const progress=engine.runProgress(run);setAmaRunProgress(`${range.label} is already in recovery · ${progress.answered}/${progress.expected} saved · continuing only the missing question(s) one at a time.`)}
      missing=amaMissingQuestionIds(run,blockIndex);
      for(const id of missing){const single=await callChunk([id],'single-question recovery');if(single.missing.length){const progress=engine.runProgress(run),preview=String(single.result?.rawResponsePreview||'').trim(),workerReject=Array.isArray(single.result?.rejectedAnswers)?single.result.rejectedAnswers.find(row=>String(row?.id||'').toUpperCase()===id):null,clientReject=Array.isArray(single.clientRejected)?single.clientRejected.find(row=>String(row?.id||'').toUpperCase()===id):null,reject=workerReject||clientReject,why=reject?.reason?` Rejected because: ${reject.reason}.`:'',detail=preview?` Provider response preview: ${preview}`:(reject?.preview?` Provider response preview: ${reject.preview}`:'');throw new Error(`AI AMA ${id} returned no validated answer.${why}${detail} ${progress.answered}/${progress.expected} answers were saved and can be resumed.`)}}
      missing=amaMissingQuestionIds(run,blockIndex);if(missing.length){const progress=engine.runProgress(run);throw new Error(`AI AMA step ${blockIndex+1}/${blockCount} (${range.label}) is still incomplete. Missing ${missing.join(', ')}. ${progress.answered}/${progress.expected} answers were saved and can be resumed.`)}
      run=await engine.saveQuestionBlock(run.id,{questions:[],blockIndex,complete:true,meta:{lastError:null,executionStrategy:'3-to-1-strict-validation'}});const progress=engine.runProgress(run);setAmaRunProgress(`Step ${blockIndex+1}/${blockCount} complete · ${progress.answered}/${progress.expected} core Q&A saved.`);
    }
    const progress=engine.runProgress(run);if(progress.answered!==progress.expected)throw new Error(`AI AMA stopped with ${progress.answered}/${progress.expected} core answers saved.`);
    currentStage='finalize';currentQuestionIds=[];currentRecoveryLevel='normal';if(runBtn)runBtn.textContent='Finalizing…';setAmaRunProgress(`Finalizing immutable report · ${progress.answered}/${progress.expected} saved`);const report=await engine.finalizeRun(run.id);amaUiState.runId=null;$('amaMenuDialog')?.close();await openAmaReport(report.id);setDirectorStatus(`AI AMA ${report.sequence} complete · ${progress.answered}/${progress.expected} saved.`);
  }catch(error){
    amaStopStatusClock();await engine.recordRunError(run.id,error,{stage:currentStage,blockIndex:currentBlock,questionIds:currentQuestionIds,recoveryLevel:currentRecoveryLevel}).catch(()=>{});const saved=await engine.getRun(run.id).catch(()=>run),progress=engine.runProgress(saved),stage=amaStageLabel(currentStage,currentBlock,saved,{questionIds:currentQuestionIds,recoveryLevel:currentRecoveryLevel}),message=amaCompactError(error);setAmaRunProgress(`Paused at ${stage} · ${progress.answered}/${progress.expected} saved · ${message} · Resume begins with the first actually missing question(s); saved answers are not rerun.`);setDirectorStatus(`AI AMA paused at ${stage} · ${progress.answered}/${progress.expected} saved · ${message}`);throw error;
  }finally{amaStopStatusClock();amaUiState.running=false;await refreshAmaRunMenu().catch(()=>{if(runBtn){runBtn.disabled=false;runBtn.textContent='Resume AI AMA'}})}
}
async function renderAmaHistory(){const list=$('amaHistoryList'),engine=window.genreactrixAmaEngine,record=currentImageRecord();if(!list||!engine||!record)return;list.innerHTML='<p>Loading AMA History…</p>';const reports=await engine.reportsForImage(record.id);list.innerHTML='';if(!reports.length){list.innerHTML='<p>No saved AMAs for this image.</p>';return}for(const report of [...reports].reverse()){const bundle=await engine.getReportBundle(report.id),row=document.createElement('div');row.className='ama-history-row';const b=document.createElement('button');b.type='button';b.innerHTML=`<strong>${amaEsc(report.title)}</strong><small>${report.interview?.questionCount||report.interview?.questions?.length||0} core Q&amp;A${bundle?.followups?.length?` · ${bundle.followups.length} follow-up${bundle.followups.length===1?'':'s'}`:''}</small>`;b.addEventListener('click',()=>openAmaReport(report.id));const outcome=document.createElement('span');outcome.className='ama-history-outcome';const last=bundle?.outcomes?.at(-1);outcome.textContent=last?(last.verdict==='agreement'?'Post-Batch: Agreement':'Post-Batch: Director final'):'';row.append(b,outcome);list.append(row)}}
function amaThemeListHtml(rows=[],withConfidence=false){return rows.length?`<ul>${rows.map(row=>`<li>${amaEsc(row.label||row.name||row.code||'—')}${withConfidence&&Number.isFinite(Number(row.confidence))?` · ${Number(row.confidence)}%`:''}</li>`).join('')}</ul>`:'<p>—</p>'}
async function amaReportHtml(bundle,{standalone=false}={}){const report=bundle.report,snapshot=report.snapshot||{},questions=report.interview?.questions||[],sections=[];for(const q of questions){let sec=sections.find(x=>x.name===q.section);if(!sec){sec={name:q.section||'Interview',rows:[]};sections.push(sec)}sec.rows.push(q)}const outcome=bundle.outcomes?.at(-1),styles=standalone?'<style>body{font-family:system-ui;background:#fff;color:#111;max-width:900px;margin:auto;padding:24px}h1{font-size:22px}.qa{border-top:1px solid #bbb;padding:10px 0}.q{font-weight:800}.a{white-space:pre-wrap}.snapshot{display:grid;grid-template-columns:1fr 1fr;gap:16px}.meta{color:#555;font-size:12px}@media print{button{display:none}}</style>':'';return`${styles}<article class="ama-export"><h1>${amaEsc(report.title)}</h1><p class="meta">Site ${amaEsc(report.siteVersion)} · Worker ${amaEsc(report.worker?.version||report.interview?.workerVersion||'')} · Matrix ${amaEsc(report.matrixVersion)}</p><div class="snapshot"><section><h2>AI Themes</h2>${amaThemeListHtml(snapshot.aiThemes||[],true)}</section><section><h2>Director Themes</h2>${amaThemeListHtml(snapshot.directorThemes||[],false)}</section></div>${outcome?`<section><h2>Post-Batch outcome</h2><p>${outcome.verdict==='agreement'?'AI and final Director Theme sets agreed.':'Director final Theme set differed from the AMA AI Theme set.'}</p>${amaThemeListHtml(outcome.finalDirectorThemes||[],false)}</section>`:''}${sections.map(sec=>`<section><h2>${amaEsc(sec.name)}</h2>${sec.rows.map(q=>`<div class="qa"><div class="q">Q: ${amaEsc(q.question)}</div><div class="a">A: ${amaEsc(q.answer)}</div></div>`).join('')}</section>`).join('')}${bundle.followups?.length?`<section><h2>Follow-up AMA</h2>${bundle.followups.map(q=>`<div class="qa"><div class="q">Q: ${amaEsc(q.question)}</div><div class="a">A: ${amaEsc(q.answer)}</div></div>`).join('')}</section>`:''}</article>`}
async function renderAmaReport(bundle){const report=bundle.report,body=$('amaReportBody');if(!body)return;$('amaReportHeading').textContent=`AI AMA ${report.sequence}`;$('amaReportSubheading').textContent=report.title;const snapshot=report.snapshot||{},questions=report.interview?.questions||[],sections=[];for(const q of questions){let sec=sections.find(x=>x.name===q.section);if(!sec){sec={name:q.section||'Interview',rows:[]};sections.push(sec)}sec.rows.push(q)}body.innerHTML=`<div class="ama-report-snapshot"><section><h4>AI Themes</h4>${amaThemeListHtml(snapshot.aiThemes||[],true)}</section><section><h4>Director Themes</h4>${amaThemeListHtml(snapshot.directorThemes||[],false)}</section></div>${bundle.outcomes?.length?`<section class="ama-outcome-card"><h4>Post-Batch outcome</h4><p>${bundle.outcomes.at(-1).verdict==='agreement'?'Agreement — final Director Theme set matches the AMA AI Theme set.':'Director final — final Director Theme set differs from the AMA AI Theme set.'}</p>${amaThemeListHtml(bundle.outcomes.at(-1).finalDirectorThemes||[],false)}</section>`:''}${sections.map(sec=>`<section class="ama-report-section"><h3 class="ama-report-section-title">${amaEsc(sec.name)}</h3>${sec.rows.map(q=>`<div class="ama-qa"><div class="q">${amaEsc(q.question)}</div><div class="a">${amaEsc(q.answer)}</div></div>`).join('')}</section>`).join('')}${bundle.followups?.length?`<section class="ama-report-section"><h3 class="ama-report-section-title">Follow-up AMA</h3>${bundle.followups.map(q=>`<div class="ama-followup-row"><div class="q">Q: ${amaEsc(q.question)}</div><div class="a">A: ${amaEsc(q.answer)}</div></div>`).join('')}</section>`:''}`}
async function openAmaReport(reportId){const engine=window.genreactrixAmaEngine,bundle=await engine?.getReportBundle?.(reportId);if(!bundle)return;amaUiState.reportId=reportId;await renderAmaReport(bundle);$('amaHistoryDialog')?.close();safelyShowDialog($('amaReportDialog'))}
function amaDownloadText(text,filename,type){const blob=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1200)}
async function currentAmaBundle(){return amaUiState.reportId?window.genreactrixAmaEngine?.getReportBundle?.(amaUiState.reportId):null}
async function askAmaFollowup(){const bundle=await currentAmaBundle(),question=String($('amaFollowupQuestion')?.value||'').trim();if(!bundle||!question)return;const status=$('amaFollowupStatus'),btn=$('amaFollowupAskBtn');if(btn)btn.disabled=true;if(status)status.textContent='Asking AI…';try{const payload=await window.GenreactrixCloudApi.ama({mode:'followup',snapshot:bundle.report.snapshot,visualRead:bundle.report.interview?.visualRead||'',candidateThemeCodes:bundle.report.interview?.candidateThemeCodes||[],priorTranscript:amaPriorTranscript(bundle),question},window.GenreactrixCloudApi.getKey()),result=payload.result||payload;await window.genreactrixAmaEngine.addFollowup(bundle.report.id,question,result.answer,{workerVersion:result.workerVersion||''});$('amaFollowupQuestion').value='';if(status)status.textContent='Follow-up saved.';await renderAmaReport(await currentAmaBundle());}catch(error){if(status)status.textContent=`Follow-up failed: ${error?.message||error}`}finally{if(btn)btn.disabled=false}}

// v0.9.40.49 — AI Description rerun workstation.
// The Reaction rectangle is temporarily repurposed as the guidance surface.
// Current working state is project-scoped and sticky; Saved Drafts live on the
// permanent Image Record; AI Description versions remain immutable artifacts.
const DESCRIPTION_RERUN_CURRENT_KEY='genreactrix-description-rerun-current-v1';
const DESCRIPTION_RERUN_DRAFTS_FIELD='aiDescriptionRerunDrafts';
const descriptionRerunWorkspace={active:false,reviewHeld:false,imageId:null,current:null,catalog:[],preDrawer:null,undo:[],future:[],classicsLongPress:false,classicsTimer:null};
const cloneDescriptionRerun=value=>value==null?value:structuredClone(value);
const emptyDescriptionRerunCurrent=()=>({schemaVersion:1,guidance:'',selectedThemes:[],includedDescriptionIds:[],populatedDescriptionId:null,target:{armed:false,start:null,end:null},updatedAt:null});
function descriptionRerunStorageKey(){return window.genreactrixProjectRuntimeEngine?.projectKey?.(DESCRIPTION_RERUN_CURRENT_KEY)||DESCRIPTION_RERUN_CURRENT_KEY}
function readDescriptionRerunMap(){try{const raw=localStorage.getItem(descriptionRerunStorageKey());const parsed=raw?JSON.parse(raw):{};return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{}}catch{return {}}}
function writeDescriptionRerunMap(map){try{localStorage.setItem(descriptionRerunStorageKey(),JSON.stringify(map||{}));return true}catch(error){console.warn('Description rerun Current state could not be stored',error);return false}}
function normalizeDescriptionRerunCurrent(value){const v=value&&typeof value==='object'?value:{},target=v.target&&typeof v.target==='object'?v.target:{};return{schemaVersion:1,guidance:String(v.guidance||''),selectedThemes:Array.isArray(v.selectedThemes)?v.selectedThemes.filter(x=>x&&x.key&&x.label).map(x=>({key:String(x.key),source:String(x.source||''),slot:Number(x.slot)||0,label:String(x.label||''),weight:Number.isFinite(Number(x.weight))?Number(x.weight):null})):[],includedDescriptionIds:[...new Set((v.includedDescriptionIds||[]).filter(Boolean).map(String))],populatedDescriptionId:v.populatedDescriptionId?String(v.populatedDescriptionId):null,target:{armed:Boolean(target.armed),start:Number.isFinite(Number(target.start))?Math.max(0,Number(target.start)):null,end:Number.isFinite(Number(target.end))?Math.max(0,Number(target.end)):null},updatedAt:v.updatedAt||null}}
function loadDescriptionRerunCurrent(imageId=currentKey()){const map=readDescriptionRerunMap();return normalizeDescriptionRerunCurrent(map[String(imageId)]||emptyDescriptionRerunCurrent())}
function saveDescriptionRerunCurrent(){if(!descriptionRerunWorkspace.imageId||!descriptionRerunWorkspace.current)return false;descriptionRerunWorkspace.current.updatedAt=new Date().toISOString();const map=readDescriptionRerunMap();map[String(descriptionRerunWorkspace.imageId)]=normalizeDescriptionRerunCurrent(descriptionRerunWorkspace.current);return writeDescriptionRerunMap(map)}
function clearDescriptionRerunCurrentForImages(imageIds=[]){const map=readDescriptionRerunMap();let changed=false;for(const id of imageIds){if(Object.prototype.hasOwnProperty.call(map,String(id))){delete map[String(id)];changed=true}}if(changed)writeDescriptionRerunMap(map);return changed}
function formatDescriptionRerunDate(value){try{return new Date(value).toLocaleString()}catch{return String(value||'Unknown time')}}
function descriptionRerunCatalogItem(id){return descriptionRerunWorkspace.catalog.find(x=>String(x.id)===String(id))||null}
function currentDescriptionArtifactId(imageId=currentKey()){const record=window.genreactrixImageRecordEngine?.get?.(String(imageId),{touch:false});return record?.analysis?.ai?.artifactHistory?.currentArtifacts?.description?.artifactId||null}
async function loadDescriptionRerunCatalog({preferLatest=false}={}){
  const imageId=descriptionRerunWorkspace.imageId||currentKey(),engine=window.genreactrixAiArtifactEngine;
  let rows=[];
  if(engine?.ensureImageReady&&engine?.artifactsForImage){await engine.ensureImageReady(imageId).catch(()=>{});rows=(await engine.artifactsForImage(imageId).catch(()=>[])).filter(row=>row.kind==='description'&&typeof row.payload==='string'&&row.payload.trim());}
  rows.sort((a,b)=>(Number(b.version)||0)-(Number(a.version)||0)||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  descriptionRerunWorkspace.catalog=rows.map(row=>({id:String(row.id),artifactId:String(row.id),version:Number(row.version)||0,createdAt:row.createdAt||'',text:String(row.payload||''),current:String(row.id)===String(currentDescriptionArtifactId(imageId))}));
  if(!descriptionRerunWorkspace.catalog.length){const text=String(currentAiRun()?.description||currentDescription()||'').trim();if(text&&!/^No AI description is stored/i.test(text))descriptionRerunWorkspace.catalog=[{id:`projection:${imageId}`,artifactId:null,version:0,createdAt:currentAiRun()?.createdAt||new Date().toISOString(),text,current:true,projection:true}];}
  const current=descriptionRerunWorkspace.current||emptyDescriptionRerunCurrent(),latest=descriptionRerunWorkspace.catalog[0]||null,existing=descriptionRerunCatalogItem(current.populatedDescriptionId);
  if(preferLatest||!existing)current.populatedDescriptionId=latest?.id||null;
  descriptionRerunWorkspace.current=current;
  return descriptionRerunWorkspace.catalog;
}
function descriptionRerunDisplayedItem(){return descriptionRerunCatalogItem(descriptionRerunWorkspace.current?.populatedDescriptionId)||descriptionRerunWorkspace.catalog[0]||null}
function descriptionRerunDisplayedText(){return descriptionRerunDisplayedItem()?.text||String(currentAiRun()?.description||currentDescription()||'')}
function descriptionRerunOperation(){const c=descriptionRerunWorkspace.current||emptyDescriptionRerunCurrent(),text=descriptionRerunDisplayedText();if(!text.trim())return'all';const t=c.target||{};if(t.armed&&Number.isFinite(t.start)&&Number.isFinite(t.end)){if(t.end>t.start)return'replace';return'add'}return'all'}
function descriptionRerunSelectedTheme(key){return Boolean(descriptionRerunWorkspace.current?.selectedThemes?.some(x=>x.key===key))}
function descriptionRerunThemeSnapshot(source,slot){if(source==='director'){const theme=state.themes[slot-1],label=themeLabel(theme);return label&&label!=='—'?{key:`director:${slot}`,source:'Director',slot,label,weight:null}:null}const sorted=currentAiThemes().map(([label,weight])=>({label,weight:Number(weight)||0})).sort((a,b)=>b.weight-a.weight).slice(0,3),row=sorted[slot-1];return row?.label?{key:`ai:${slot}`,source:'AI',slot,label:row.label,weight:row.weight}:null}
function toggleDescriptionRerunTheme(source,slot){if(!descriptionRerunWorkspace.active)return false;const candidate=descriptionRerunThemeSnapshot(source,slot);if(!candidate)return false;const rows=[...(descriptionRerunWorkspace.current.selectedThemes||[])],index=rows.findIndex(x=>x.key===candidate.key);if(index>=0)rows.splice(index,1);else rows.push(candidate);descriptionRerunWorkspace.current.selectedThemes=rows;saveDescriptionRerunCurrent();renderTabletWorkbench();return true}
function toggleDescriptionRerunIncludedDescription(id,checked){if(!id)return;const set=new Set(descriptionRerunWorkspace.current.includedDescriptionIds||[]);if(checked)set.add(String(id));else set.delete(String(id));descriptionRerunWorkspace.current.includedDescriptionIds=[...set];saveDescriptionRerunCurrent();renderDescriptionRerunChrome()}
function populateDescriptionRerunDescription(id){if(!descriptionRerunCatalogItem(id))return;descriptionRerunWorkspace.current.populatedDescriptionId=String(id);descriptionRerunWorkspace.current.target={armed:false,start:null,end:null};saveDescriptionRerunCurrent();renderTabletWorkbench();requestAnimationFrame(()=>fitLandscapeAiDescription())}
function descriptionRerunTargetTextWithMarker(){const text=descriptionRerunDisplayedText(),t=descriptionRerunWorkspace.current?.target||{},op=descriptionRerunOperation();if(op==='add'){const at=Math.max(0,Math.min(text.length,Number(t.start)||0));return text.slice(0,at)+'⟦CURSOR⟧'+text.slice(at)}if(op==='replace'){const start=Math.max(0,Math.min(text.length,Number(t.start)||0)),end=Math.max(start,Math.min(text.length,Number(t.end)||0));return text.slice(0,start)+'⟦HIGHLIGHT START⟧'+text.slice(start,end)+'⟦HIGHLIGHT END⟧'+text.slice(end)}return text}
function buildDescriptionRerunRequest(){const current=descriptionRerunWorkspace.current||emptyDescriptionRerunCurrent(),operation=descriptionRerunOperation(),displayed=descriptionRerunDisplayedItem(),displayText=descriptionRerunDisplayedText(),target=current.target||{},included=(current.includedDescriptionIds||[]).map(id=>descriptionRerunCatalogItem(id)).filter(Boolean).map(row=>({artifactId:row.artifactId||null,id:row.id,version:row.version,createdAt:row.createdAt,label:formatDescriptionRerunDate(row.createdAt),text:row.text})),themes=(current.selectedThemes||[]).map(cloneDescriptionRerun),guidance=String(current.guidance||'').trim();const spec={schemaVersion:1,operation,guidance,themes,includedDescriptions:included,targetDescription:null};if(['add','replace'].includes(operation)){if(!displayed||!displayText.trim())throw new Error(`${operation==='add'?'Add':'Replace'} requires a populated Description.`);const start=Math.max(0,Math.min(displayText.length,Number(target.start)||0)),end=operation==='replace'?Math.max(start,Math.min(displayText.length,Number(target.end)||0)):start;spec.targetDescription={artifactId:displayed.artifactId||null,id:displayed.id,version:displayed.version,createdAt:displayed.createdAt,label:formatDescriptionRerunDate(displayed.createdAt),text:displayText,start,end,selectedText:operation==='replace'?displayText.slice(start,end):''};}return spec}
function previewDescriptionRerunRequest(spec){const image=currentLandscapeFile()||{},lines=[];lines.push(`Operation: ${spec.operation==='all'?'ALL / Rewrite All':spec.operation==='add'?'ADD at cursor':'REPLACE highlighted section'}`);lines.push(`Image: ALWAYS INCLUDED · ${image.name||currentKey()} · ${currentKey()}`);lines.push('');lines.push('Guidance:');lines.push(spec.guidance||'No guidance included.');lines.push('');lines.push('Themes:');if(spec.themes.length)spec.themes.forEach(row=>lines.push(`- ${row.source} Theme ${row.slot}: ${row.label}${row.weight!=null?` (${row.weight}%)`:''}`));else lines.push('No themes included.');lines.push('');lines.push('Included descriptions:');if(spec.includedDescriptions.length)spec.includedDescriptions.forEach((row,index)=>{lines.push(`\n[${index+1}] ${row.label}${row.version?` · v${row.version}`:''}`);lines.push(row.text)});else lines.push('No descriptions included.');if(spec.targetDescription){lines.push('');lines.push(`Target Description: ${spec.targetDescription.label}${spec.targetDescription.version?` · v${spec.targetDescription.version}`:''}`);lines.push(descriptionRerunTargetTextWithMarker());}lines.push('');lines.push(`Expected edit behavior: ${spec.operation==='all'?'Return a complete new Description.':spec.operation==='add'?'Generate only text to insert at the marked cursor; existing text outside the insertion is preserved locally.':'Generate only replacement text for the highlighted span; everything outside the highlight is preserved locally.'}`);return lines.join('\n')}
function descriptionRerunDraftsFor(imageId=currentKey()){const record=window.genreactrixImageRecordEngine?.get?.(String(imageId),{touch:false});return Array.isArray(record?.metadata?.extended?.[DESCRIPTION_RERUN_DRAFTS_FIELD])?record.metadata.extended[DESCRIPTION_RERUN_DRAFTS_FIELD]:[]}
function createDescriptionRerunDraftRecord(imageId,current,{source='manual'}={}){return{id:`ai_desc_rerun_draft_${Date.now().toString(36)}_${crypto.randomUUID().slice(0,8)}`,schemaVersion:1,type:'AI Desc Rerun Draft',source,createdAt:new Date().toISOString(),state:normalizeDescriptionRerunCurrent(current)}}
function appendDescriptionRerunDraft(imageId,current,{source='manual'}={}){const engine=window.genreactrixImageRecordEngine,record=engine?.get?.(String(imageId),{touch:false});if(!record)return null;const drafts=descriptionRerunDraftsFor(imageId),draft=createDescriptionRerunDraftRecord(imageId,current,{source});engine.update(String(imageId),{metadata:{extended:{[DESCRIPTION_RERUN_DRAFTS_FIELD]:[...drafts,draft]}}},'ai-description-rerun-draft-saved');return draft}
function deleteDescriptionRerunDraft(imageId,draftId){const engine=window.genreactrixImageRecordEngine,record=engine?.get?.(String(imageId),{touch:false});if(!record)return false;const drafts=descriptionRerunDraftsFor(imageId),next=drafts.filter(draft=>String(draft?.id)!==String(draftId));if(next.length===drafts.length)return false;engine.update(String(imageId),{metadata:{extended:{[DESCRIPTION_RERUN_DRAFTS_FIELD]:next}}},'ai-description-rerun-draft-deleted');return true}
function descriptionRerunCurrentMeaningful(imageId,current){const c=normalizeDescriptionRerunCurrent(current),record=window.genreactrixImageRecordEngine?.get?.(String(imageId),{touch:false}),currentArtifact=record?.analysis?.ai?.artifactHistory?.currentArtifacts?.description?.artifactId||null,nonCurrentPopulated=Boolean(c.populatedDescriptionId&&currentArtifact&&c.populatedDescriptionId!==currentArtifact);return Boolean(String(c.guidance||'').trim()||c.selectedThemes.length||c.includedDescriptionIds.length||c.target.armed||nonCurrentPopulated)}
async function autoSaveDescriptionRerunForBatch(imageIds=[]){const map=readDescriptionRerunMap();for(const rawId of imageIds||[]){const id=String(rawId),current=map[id];if(current&&descriptionRerunCurrentMeaningful(id,current))appendDescriptionRerunDraft(id,current,{source:'auto-final'});delete map[id]}writeDescriptionRerunMap(map);if(descriptionRerunWorkspace.active&&imageIds.map(String).includes(String(descriptionRerunWorkspace.imageId))){descriptionRerunWorkspace.current=emptyDescriptionRerunCurrent();descriptionRerunWorkspace.undo=[];descriptionRerunWorkspace.future=[];}return true}
function pushDescriptionRerunUndo(){descriptionRerunWorkspace.undo.push(cloneDescriptionRerun(descriptionRerunWorkspace.current));if(descriptionRerunWorkspace.undo.length>30)descriptionRerunWorkspace.undo.shift();descriptionRerunWorkspace.future=[];updateUndoRedo()}
function undoDescriptionRerun(){if(!descriptionRerunWorkspace.active||!descriptionRerunWorkspace.undo.length)return false;descriptionRerunWorkspace.future.push(cloneDescriptionRerun(descriptionRerunWorkspace.current));descriptionRerunWorkspace.current=normalizeDescriptionRerunCurrent(descriptionRerunWorkspace.undo.pop());saveDescriptionRerunCurrent();renderTabletWorkbench();updateUndoRedo();return true}
function redoDescriptionRerun(){if(!descriptionRerunWorkspace.active||!descriptionRerunWorkspace.future.length)return false;descriptionRerunWorkspace.undo.push(cloneDescriptionRerun(descriptionRerunWorkspace.current));descriptionRerunWorkspace.current=normalizeDescriptionRerunCurrent(descriptionRerunWorkspace.future.pop());saveDescriptionRerunCurrent();renderTabletWorkbench();updateUndoRedo();return true}
function descriptionRerunSelectionOffsets(root){const sel=window.getSelection?.();if(!root||!sel||!sel.rangeCount)return null;const range=sel.getRangeAt(0);if(!root.contains(range.startContainer)||!root.contains(range.endContainer))return null;const pre=document.createRange();pre.selectNodeContents(root);pre.setEnd(range.startContainer,range.startOffset);const start=pre.toString().length;const selected=range.toString();return{start,end:start+selected.length,armed:true}}
function captureDescriptionRerunTarget(){if(!descriptionRerunWorkspace.active)return;const root=$('tabletWorkbenchAiDescription'),text=root?.textContent||'';if(!root||!text.trim())return;const offsets=descriptionRerunSelectionOffsets(root);if(!offsets)return;descriptionRerunWorkspace.current.target=offsets;saveDescriptionRerunCurrent();renderDescriptionRerunChrome()}
function restoreDescriptionRerunSelection(){if(!descriptionRerunWorkspace.active)return;const root=$('tabletWorkbenchAiDescription'),t=descriptionRerunWorkspace.current?.target||{};if(!root||!t.armed||!root.firstChild)return;const text=root.textContent||'',start=Math.max(0,Math.min(text.length,Number(t.start)||0)),end=Math.max(start,Math.min(text.length,Number(t.end)||0)),walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node,pos=0,startNode=null,startOffset=0,endNode=null,endOffset=0;while((node=walker.nextNode())){const len=node.nodeValue.length;if(startNode===null&&start<=pos+len){startNode=node;startOffset=start-pos}if(endNode===null&&end<=pos+len){endNode=node;endOffset=end-pos;break}pos+=len}if(!startNode||!endNode)return;const range=document.createRange();range.setStart(startNode,startOffset);range.setEnd(endNode,endOffset);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range)}
function renderDescriptionRerunChrome(){const active=descriptionRerunWorkspace.active,drawer=$('tabletSlidingDrawer'),root=$('tabletWorkbench'),workspace=$('tabletDescriptionRerunWorkspace'),controls=$('tabletDescriptionRerunControls'),guidance=$('tabletDescriptionRerunGuidance'),description=$('tabletWorkbenchAiDescription'),include=$('descriptionRerunPopulatedInclude'),includeCheck=$('descriptionRerunPopulatedIncludeCheck');drawer?.classList.toggle('description-rerun-active',active);root?.classList.toggle('description-rerun-active',active);if(workspace)workspace.hidden=!active||descriptionRerunWorkspace.reviewHeld;if(controls)controls.hidden=!active;if(active&&guidance&&guidance.value!==String(descriptionRerunWorkspace.current?.guidance||''))guidance.value=String(descriptionRerunWorkspace.current?.guidance||'');if(description){description.classList.toggle('rerun-targeting',active&&['add','replace'].includes(descriptionRerunOperation()));if(active){description.setAttribute('contenteditable','true');description.setAttribute('inputmode','none');description.setAttribute('role','textbox');description.setAttribute('aria-readonly','true');description.spellcheck=false;}else{description.removeAttribute('contenteditable');description.removeAttribute('inputmode');description.removeAttribute('role');description.removeAttribute('aria-readonly');description.classList.remove('rerun-targeting')}}const displayed=active?descriptionRerunDisplayedItem():null;if(include){include.hidden=!active||!displayed;if(includeCheck)includeCheck.checked=Boolean(displayed&&descriptionRerunWorkspace.current?.includedDescriptionIds?.includes(String(displayed.id)))}for(let i=1;i<=3;i++){document.querySelector(`[data-tablet-workbench-slot="${i}"]`)?.classList.toggle('rerun-context-selected',active&&descriptionRerunSelectedTheme(`director:${i}`));const aiCell=$(`tabletWorkbenchAiTheme${i}`)?.closest('.tablet-theme-cell');aiCell?.classList.toggle('rerun-context-selected',active&&descriptionRerunSelectedTheme(`ai:${i}`));if(aiCell){aiCell.dataset.rerunAiThemeSlot=String(i);aiCell.tabIndex=active?0:-1;aiCell.setAttribute('role',active?'button':'group')}}if(active){$('descriptionRerunSubmit')?.toggleAttribute('disabled',aiRerunInFlight);$('descriptionRerunSaveDraft')?.toggleAttribute('disabled',aiRerunInFlight)}}
async function activateDescriptionRerunImage({preferLatest=false}={}){if(!descriptionRerunWorkspace.active)return;descriptionRerunWorkspace.imageId=currentKey();descriptionRerunWorkspace.current=loadDescriptionRerunCurrent(descriptionRerunWorkspace.imageId);descriptionRerunWorkspace.undo=[];descriptionRerunWorkspace.future=[];await loadDescriptionRerunCatalog({preferLatest});renderTabletWorkbench();updateUndoRedo()}
async function openDescriptionRerunWorkspace(){if(tabletAiRerunLocked||aiRerunInFlight)return;if(descriptionRerunWorkspace.active)return;if(reactionRerunWorkspace.active)closeReactionRerunWorkspace();if(themeRerunWorkspace.active)closeThemeRerunWorkspace();descriptionRerunWorkspace.preDrawer={face:tabletLandscapeView.face,aiReactions:tabletLandscapeView.aiReactions,aiThemes:tabletLandscapeView.aiThemes,aiDescription:tabletLandscapeView.aiDescription,customs:tabletLandscapeView.customs};descriptionRerunWorkspace.active=true;descriptionRerunWorkspace.reviewHeld=false;tabletLandscapeView.face='judgment';tabletLandscapeView.customs=false;tabletLandscapeView.aiReactions=true;tabletLandscapeView.aiThemes=true;tabletLandscapeView.aiDescription=true;await activateDescriptionRerunImage();}
function closeDescriptionRerunWorkspace(){if(!descriptionRerunWorkspace.active)return;saveDescriptionRerunCurrent();descriptionRerunWorkspace.active=false;descriptionRerunWorkspace.reviewHeld=false;const prior=descriptionRerunWorkspace.preDrawer;if(prior)Object.assign(tabletLandscapeView,prior);descriptionRerunWorkspace.preDrawer=null;descriptionRerunWorkspace.imageId=null;descriptionRerunWorkspace.catalog=[];descriptionRerunWorkspace.undo=[];descriptionRerunWorkspace.future=[];renderTabletWorkbench();updateUndoRedo()}
function renderDescriptionRerunDraftDialog(){const list=$('descriptionRerunDraftList');if(!list)return;const drafts=[...descriptionRerunDraftsFor(descriptionRerunWorkspace.imageId)].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));list.innerHTML='';if(!drafts.length){list.textContent='No saved drafts.';return}for(const draft of drafts){const row=document.createElement('div');row.className='description-rerun-list-row no-checkbox';const button=document.createElement('button');button.type='button';button.className='description-rerun-list-main';button.title='Tap to restore. Long-press to delete.';button.innerHTML=`<strong>AI Desc Rerun Draft · ${formatDescriptionRerunDate(draft.createdAt)}</strong><small>${String(draft.state?.guidance||'').trim().slice(0,180)||'No text guidance'}</small>`;let holdTimer=0,longPressed=false;button.addEventListener('pointerdown',event=>{if(event.button!==undefined&&event.button!==0)return;longPressed=false;clearTimeout(holdTimer);holdTimer=setTimeout(()=>{longPressed=true;navigator.vibrate?.(25);const when=formatDescriptionRerunDate(draft.createdAt);if(confirm(`Delete AI Desc Rerun Draft from ${when}?`)){const deleted=deleteDescriptionRerunDraft(descriptionRerunWorkspace.imageId,draft.id);if(deleted){renderDescriptionRerunDraftDialog();setDirectorStatus(`AI Desc Rerun Draft deleted · ${when}.`)}}},520)});const cancelHold=()=>clearTimeout(holdTimer);button.addEventListener('pointerup',cancelHold);button.addEventListener('pointercancel',()=>{cancelHold();longPressed=false});button.addEventListener('pointerleave',cancelHold);button.addEventListener('contextmenu',event=>event.preventDefault());button.addEventListener('click',event=>{if(longPressed){longPressed=false;event.preventDefault();return}pushDescriptionRerunUndo();descriptionRerunWorkspace.current=normalizeDescriptionRerunCurrent(draft.state);saveDescriptionRerunCurrent();$('descriptionRerunDraftDialog')?.close();renderTabletWorkbench();requestAnimationFrame(restoreDescriptionRerunSelection)});row.append(button);list.append(row)}}
function renderDescriptionRerunClassicsDialog(){const list=$('descriptionRerunClassicsList');if(!list)return;list.innerHTML='';if(!descriptionRerunWorkspace.catalog.length){list.textContent='No Description history is available.';return}for(const item of descriptionRerunWorkspace.catalog){const row=document.createElement('div');row.className='description-rerun-list-row';const check=document.createElement('input');check.type='checkbox';check.checked=descriptionRerunWorkspace.current.includedDescriptionIds.includes(item.id);check.setAttribute('aria-label',`Include Description from ${formatDescriptionRerunDate(item.createdAt)}`);check.addEventListener('change',()=>toggleDescriptionRerunIncludedDescription(item.id,check.checked));const button=document.createElement('button');button.type='button';button.className='description-rerun-list-main';button.innerHTML=`<strong>${formatDescriptionRerunDate(item.createdAt)}${item.current?' · Current':''}${item.version?` · v${item.version}`:''}</strong><small>${item.text.slice(0,220)}</small>`;button.addEventListener('click',()=>{$('descriptionRerunClassicsDialog')?.close();populateDescriptionRerunDescription(item.id)});row.append(check,button);list.append(row)}}
async function submitDescriptionRerun(){if(aiRerunInFlight)return;let spec;try{spec=buildDescriptionRerunRequest()}catch(error){alert(error.message||String(error));return}setDirectorStatus(`Rerunning AI Description · ${spec.operation.toUpperCase()}…`);try{const oldTarget=spec.targetDescription?{...spec.targetDescription}:null;await runCurrentAiRerun(['description'],{analysisGuidance:spec.guidance,descriptionRerun:spec});await loadDescriptionRerunCatalog({preferLatest:true});const latest=descriptionRerunWorkspace.catalog[0]||null;descriptionRerunWorkspace.current.populatedDescriptionId=latest?.id||null;if(spec.operation==='all')descriptionRerunWorkspace.current.target={armed:false,start:null,end:null};else if(oldTarget&&latest){const diff=latest.text.length-oldTarget.text.length;if(spec.operation==='add'){const end=Math.max(0,Math.min(latest.text.length,oldTarget.start+Math.max(0,diff)));descriptionRerunWorkspace.current.target={armed:true,start:end,end}}else{const replacementLength=Math.max(0,(oldTarget.end-oldTarget.start)+diff),end=Math.max(oldTarget.start,Math.min(latest.text.length,oldTarget.start+replacementLength));descriptionRerunWorkspace.current.target={armed:true,start:oldTarget.start,end}}}saveDescriptionRerunCurrent();renderTabletWorkbench();requestAnimationFrame(restoreDescriptionRerunSelection);setDirectorStatus(`AI Description rerun complete · ${spec.operation.toUpperCase()}.`)}catch(error){const message=String(error?.message||error);console.error('AI Description rerun failed',error);setDirectorStatus(`AI Description rerun failed: ${message}`);alert(`AI Description rerun failed: ${message}`)}}
window.genreactrixDescriptionRerunWorkspace={autoSaveForBatch:autoSaveDescriptionRerunForBatch,open:openDescriptionRerunWorkspace,close:closeDescriptionRerunWorkspace,isActive:()=>descriptionRerunWorkspace.active};

function renderLandscapeInterlockedMatrix(targetId="tabletWorkbenchMatrix"){
  const root=$(targetId);
  if(!root || !window.interlockedMatrixUI) return;

  // Genreactrix compatibility definition. The reusable renderer below this layer
  // knows nothing about Prims, Themes, symbols, or Genreactrix taxonomy.
  const topSymbols=["🧸", "✨", "🤣", "😭", "🌶️", "🎉"];
  const bottomSymbols=["🌀", "🌌", "🤢", "👻", "💥", "🤬"];
  const leftSymbols=["🤬", "💥", "👻", "🤢", "🌌", "🌀", "🧸", "🌀", "🌌", "🤢", "👻", "💥", "🤬"];
  const rightSymbols=["🤬", "💥", "👻", "🤢", "🌌", "🌀", "🧸", "✨", "🤣", "😭", "🌶️", "🎉", "🤬"];
  const matrixRows=[
    [{"value":"Sassy","tone":"lavender"},{"value":"Bougie","tone":"lavender"},{"value":"Mockery","tone":"lavender"},{"value":"Overstimulated","tone":"lavender"},{"value":"Sadomasochism","tone":"lavender"},{"value":"Badass","tone":"lavender"}],
    [{"value":"Joy","tone":"lavender"},{"value":"Epic","tone":"lavender"},{"value":"Hilarious","tone":"lavender"},{"value":"Despair","tone":"lavender"},{"value":"Exposure","tone":"lavender"},{"value":"Glory","tone":"lavender"}],
    [{"value":"CreepyCute","tone":"lavender"},{"value":"Vulnerable","tone":"lavender"},{"value":"Scandalarious","tone":"lavender"},{"value":"Cringe","tone":"lavender"},{"value":"Zazzploitation","tone":"lavender"},{"value":"Halloween","tone":"lavender"}],
    [{"value":"UglyCute","tone":"lavender"},{"value":"Grotesque","tone":"lavender"},{"value":"Grossout","tone":"lavender"},{"value":"Shame","tone":"lavender"},{"value":"Lewd","tone":"lavender"},{"value":"Excess","tone":"lavender"}],
    [{"value":"Romance","tone":"lavender"},{"value":"Satisfying","tone":"lavender"},{"value":"Medicated","tone":"lavender"},{"value":"Nostalgia","tone":"lavender"},{"value":"Seduction","tone":"lavender"},{"value":"Magical","tone":"lavender"}],
    [{"value":"Whimsical","tone":"lavender"},{"value":"Psychedelic","tone":"lavender"},{"value":"Absurd","tone":"lavender"},{"value":"Nightmarish","tone":"lavender"},{"value":"FreakyDeaky","tone":"lavender"},{"value":"Freakshow","tone":"lavender"}],
    [{"value":"🧸","tone":"green"},{"value":"Cozy","tone":"lavender"},{"value":"Goofy","tone":"lavender"},{"value":"Poignant","tone":"lavender"},{"value":"Cheeky","tone":"lavender"},{"value":"Playful","tone":"lavender"}],
    [{"value":"🌀","tone":"green"},{"value":"✨","tone":"green"},{"value":"Camp","tone":"lavender"},{"value":"Mundane","tone":"lavender"},{"value":"Fleshy","tone":"lavender"},{"value":"Festive","tone":"lavender"}],
    [{"value":"Spirituality","tone":"peach"},{"value":"🌌","tone":"green"},{"value":"🤣","tone":"green"},{"value":"Schadenfreude","tone":"lavender"},{"value":"Raunchy","tone":"lavender"},{"value":"PartyTime","tone":"lavender"}],
    [{"value":"Strange","tone":"peach"},{"value":"Phantasmagoric","tone":"peach"},{"value":"🤢","tone":"green"},{"value":"😭","tone":"green"},{"value":"Humiliation","tone":"lavender"},{"value":"Bittersweet","tone":"lavender"}],
    [{"value":"Horror","tone":"peach"},{"value":"Eerie","tone":"peach"},{"value":"Foreboding","tone":"peach"},{"value":"👻","tone":"green"},{"value":"🌶️","tone":"green"},{"value":"ZazzlyParty","tone":"lavender"}],
    [{"value":"Chaotic","tone":"peach"},{"value":"Ethereal","tone":"peach"},{"value":"Collapse","tone":"peach"},{"value":"Corrupted","tone":"peach"},{"value":"💥","tone":"green"},{"value":"🎉","tone":"green"}],
    [{"value":"Monstrous","tone":"peach"},{"value":"Cursed","tone":"peach"},{"value":"Outrage","tone":"peach"},{"value":"Paranoia","tone":"peach"},{"value":"Aggressive","tone":"peach"},{"value":"🤬","tone":"green"}]
  ];
  const primitiveForSymbol=symbol=>PRIMITIVES.find(p=>p.symbol===symbol);
  const pairForLabel=label=>{const match=Object.entries(CANONICAL_PRIMFUSION_LABELS).find(([,value])=>value===label);return match?match[0].split("|"):null;};
  const choosePrimitive=primitive=>{if(!primitive||tabletLandscapeView.activeThemeSlot===null)return;state.targetSlot=tabletLandscapeView.activeThemeSlot;selectTheme({id:`primitive:${primitive.id}`,label:primitive.name,kind:"primitive",primitiveId:primitive.id});};
  window.interlockedMatrixUI.render({
    target:root, top:topSymbols, bottom:bottomSymbols, left:leftSymbols, right:rightSymbols, rows:matrixRows,
    axisLabel:symbol=>primitiveForSymbol(symbol)?.name||symbol,
    onSelectAxis:symbol=>choosePrimitive(primitiveForSymbol(symbol)),
    cellText:entry=>entry.value,
    cellTitle:entry=>{const primitive=primitiveForSymbol(entry.value);if(primitive)return `Select ${primitive.name}`;const pair=pairForLabel(entry.value);const primitives=pair?.map(name=>PRIMITIVE_BY_NAME[name]).filter(Boolean)||[];return primitives.length===2?`${primitives[0].symbol}${primitives[1].symbol} ${entry.value}`:entry.value;},
    cellId:entry=>{const primitive=primitiveForSymbol(entry.value);if(primitive)return `primitive:${primitive.id}`;const pair=pairForLabel(entry.value);const primitives=pair?.map(name=>PRIMITIVE_BY_NAME[name]).filter(Boolean)||[];return primitives.length===2?primFusionCellId(primitives[0].id,primitives[1].id):'';},
    onSelectCell:entry=>{const primitive=primitiveForSymbol(entry.value);if(primitive){choosePrimitive(primitive);return;}const pair=pairForLabel(entry.value);const primitives=pair?.map(name=>PRIMITIVE_BY_NAME[name]).filter(Boolean)||[];if(primitives.length!==2||tabletLandscapeView.activeThemeSlot===null)return;state.targetSlot=tabletLandscapeView.activeThemeSlot;selectTheme({id:primFusionCellId(primitives[0].id,primitives[1].id),label:entry.value,kind:"primFusion",primitiveIds:[primitives[0].id,primitives[1].id].sort()});}
  });
}


function fitLandscapeAiDescription(){
  const panel=document.getElementById("tabletWorkbenchAiDescription");
  if(!panel || panel.hidden || !panel.isConnected) return;
  const startSize=10;
  const minimumSize=10;
  panel.classList.remove("ai-description-scroll");
  panel.style.setProperty("--ai-description-font-size",`${startSize}px`);
  let size=startSize;
  while(size>minimumSize && (panel.scrollHeight>panel.clientHeight || panel.scrollWidth>panel.clientWidth)){
    size-=1;
    panel.style.setProperty("--ai-description-font-size",`${size}px`);
  }
  if(panel.scrollHeight>panel.clientHeight || panel.scrollWidth>panel.clientWidth){
    panel.classList.add("ai-description-scroll");
  }
}

/* v0.9.39.45 — deterministic Judgment reaction geometry.
   One slot center owns the ring, emoji, and percentage. The bottom row uses
   the exact midpoint X between adjacent top-row centers. */
function judgmentReactionGridPosition(index){
  /* v0.9.39.47 — canonical primitive order is interleaved across the two
     brick rows: 1 top, 2 bottom, 3 top, 4 bottom, and so on.  Every
     bottom-row center therefore lands exactly halfway between its adjacent
     top-row centers.  Custom reactions continue the same sequence. */
  const pair=Math.floor(index / 2);
  return index % 2 === 0
    ? {row:1,start:1 + (pair * 2)}
    : {row:2,start:2 + (pair * 2)};
}
/* v0.9.40.57 — measured Landscape lower-panel packing.
   The large blank band between the 4×2 control band and the Director/AI
   Theme + Description fields is removed from the CURRENT layout without
   changing any horizontal geometry or reaction X positions. The exact shift
   is measured from rendered elements on the live viewport; no guessed pixel
   offset is used. The same measured shift is applied to the Director Theme
   stack, and its height is expanded by the same amount, so its bottom edge
   remains unchanged. AI Themes/Description continue to mirror that measured
   Director geometry exactly. The image socket keeps its established outer
   square; its content box reserves the overlapped strip so Theme fields never
   cover image pixels. */
function applyLandscapeLowerPanelPacking(){
  const frame=document.querySelector('.landscape-frame');
  const director=document.querySelector('.landscape-director-themes');
  const drawer=$('tabletSlidingDrawer');
  if(!frame||!director||!drawer)return 0;

  const visibleBand=[
    $('tabletThemeRerunControls'),
    $('tabletDescriptionRerunControls'),
    drawer.querySelector('.landscape-ai-controls')
  ].find(el=>el&&!el.hidden&&getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().height>0);

  /* Customs has no matching 4×2 band. Keep the most recently measured packing
     instead of making the left Theme stack jump when Customs is opened. */
  if(!visibleBand){
    const prior=Number(frame.dataset.lowerPackShift||0);
    frame.style.setProperty('--landscape-lower-pack-shift',`${prior}px`,'important');
    return prior;
  }

  /* Reset synchronously before measuring so repeated renders never compound. */
  frame.style.setProperty('--landscape-lower-pack-shift','0px','important');

  const directorRect=director.getBoundingClientRect();
  const bandRect=visibleBand.getBoundingClientRect();
  const buttons=[...visibleBand.children].filter(el=>el instanceof HTMLElement&&getComputedStyle(el).display!=='none');
  let rowGap=0;
  if(buttons.length>=8){
    const firstRow=buttons.slice(0,4).map(el=>el.getBoundingClientRect());
    const secondRow=buttons.slice(4,8).map(el=>el.getBoundingClientRect());
    const firstBottom=Math.max(...firstRow.map(r=>r.bottom));
    const secondTop=Math.min(...secondRow.map(r=>r.top));
    rowGap=Math.max(0,secondTop-firstBottom);
  }else{
    const computed=getComputedStyle(visibleBand);
    rowGap=parseFloat(computed.rowGap||computed.gap)||0;
  }

  /* Match the space below the second button row to the REAL rendered space
     between row 1 and row 2. */
  const desiredTop=bandRect.bottom+rowGap;
  const shift=Math.max(0,directorRect.top-desiredTop);
  const exact=Math.round(shift*1000)/1000;
  frame.dataset.lowerPackShift=String(exact);
  frame.style.setProperty('--landscape-lower-pack-shift',`${exact}px`,'important');
  return exact;
}

function applyJudgmentReactionGeometry(prims,pctRow){
  if(!prims) return;
  const buttons=[...prims.children];
  let requiredHalfColumns=15;
  const positions=buttons.map((button,index)=>{
    const pos=judgmentReactionGridPosition(index);
    requiredHalfColumns=Math.max(requiredHalfColumns,pos.start+1);
    return {button,pos};
  });
  const halfColumns=Math.max(20,requiredHalfColumns);
  prims.style.setProperty('--reaction-half-columns',String(halfColumns));
  /* Slot center is the center of the historical two-half-column span. */
  positions.forEach(({button,pos})=>{
    const centerUnit=pos.start+1;
    const x=(centerUnit/halfColumns)*100;
    /* Two-row V1 only. These are symbol-center coordinates inside the fixed
       reaction band, leaving the percentage beneath the symbol. */
    const y=pos.row===1?28:58;
    button.style.setProperty('--reaction-slot-x',`${x}%`);
    button.style.setProperty('--reaction-slot-y',`${y}%`);
    button.style.removeProperty('grid-column');
    button.style.removeProperty('grid-row');
  });
  if(pctRow) pctRow.style.setProperty('--reaction-half-columns',String(halfColumns));
}

function renderTabletWorkbench(){
  const root=$("tabletWorkbench");
  if(!root) return;
  const hasImage=!state.feedEmpty;
  renderAiStatusTags();
  renderContentRatings();
  if(hasImage){
    $("landscapeFeedEmpty")?.setAttribute("hidden","");
    if(state.canonicalFeedActive&&window.matchMedia?.("(orientation: landscape)")?.matches){
      const record=currentImageRecord();if(record&&!record.attributes?.seen){window.genreactrixImagesEngine?.setSeen?.(record.id,true);if(landscapeFilter.exclude.seen)landscapeFeedDirty=true;}
    }
    const tabletImage=$("tabletWorkbenchImage"),tabletSrc=currentSource(),landscapeFile=currentLandscapeFile();
    tabletImage.onerror=null;tabletImage.src=tabletSrc;
    if(landscapeFile&&!landscapeFile.isHydratingAsset&&!landscapeFile.isMissingAsset){
      const imageId=String(landscapeFile.id||"");
      tabletImage.onerror=()=>markLandscapeAssetUnavailable(imageId,tabletSrc,"The resolved image source could not be decoded or displayed.");
    }
  }else{
    $("tabletWorkbenchImage")?.removeAttribute("src");
    $("landscapeFeedEmpty")?.removeAttribute("hidden");
  }
  const prims=$("tabletWorkbenchPrims");
  const pctRow=$("tabletWorkbenchPrimPcts");
  prims.innerHTML="";
  if(pctRow) pctRow.innerHTML="";
  const weights=hasImage?displayReactionPercentages(currentAiWeights()):{};
  /* v0.9.39.49 — explicit canonical Judgment order by stable primitive ID.
     Avoid symbol matching so variation-selector differences can never create
     empty slots or shift later canonical/custom reactions. */
  const judgmentReactionOrder=["P02","P01","P03","P04","P09","P12","P05","P11","P10","P08","P06","P07"];
  judgmentReactionOrder.forEach(primitiveId=>{
    const p=PRIMITIVE_BY_ID[primitiveId];
    if(!p) return;
    const selectionToken=primitiveSelectionToken(p);
    const b=document.createElement("button");
    b.type="button";
    b.className="tablet-prim-button"+(state.selectedReactions.includes(selectionToken)?" selected":"");
    b.title=p.name;
    b.setAttribute("aria-pressed",String(state.selectedReactions.includes(selectionToken)));
    const pctText=`${Number(weights[p.id])||0}%`;
    b.classList.toggle("ai-percentage-hidden",!tabletLandscapeView.aiReactions);
    b.innerHTML=`<span class="reaction-core" aria-hidden="true"><span class="reaction-ring"></span><span class="symbol">${p.symbol}</span></span><span class="pct" aria-hidden="${String(!tabletLandscapeView.aiReactions)}">${pctText}</span>`;
    b.addEventListener("click",()=>{pushHistory();const n=state.selectedReactions.indexOf(selectionToken);if(n>=0)state.selectedReactions.splice(n,1);else state.selectedReactions.push(selectionToken);saveCurrent("director-reaction-auto");renderAll();});
    prims.appendChild(b);
  });

  (state.customReactions||[]).forEach(record=>{
    const token=customReactionSelectionToken(record.id);
    const b=document.createElement("button");
    const rawCustomWeight=weights[record.id] ?? weights[token] ?? 0;
    const customPctText=`${Number(rawCustomWeight)||0}%`;
    b.type="button";
    b.className="tablet-prim-button custom-reaction-button"+(state.selectedReactions.includes(token)?" selected":"");
    b.classList.toggle("ai-percentage-hidden",!tabletLandscapeView.aiReactions);
    b.title=record.label;
    b.dataset.customReaction=record.id;
    b.setAttribute("aria-pressed",String(state.selectedReactions.includes(token)));
    b.innerHTML=`<span class="reaction-core" aria-hidden="true"><span class="reaction-ring"></span><span class="symbol">${record.emoji}</span></span><span class="pct custom" aria-hidden="${String(!tabletLandscapeView.aiReactions)}">${customPctText}</span>`;
    b.addEventListener("click",()=>{pushHistory();const n=state.selectedReactions.indexOf(token);if(n>=0)state.selectedReactions.splice(n,1);else state.selectedReactions.push(token);saveCurrent("director-custom-reaction-auto");renderAll();});
    prims.appendChild(b);
  });
  renderLandscapeCustoms();
  applyJudgmentReactionGeometry(prims,pctRow);
  const customReactionCount=prims.querySelectorAll("[data-custom-reaction]").length;
  prims.classList.toggle("has-custom-reactions",customReactionCount>0);
  prims.classList.toggle("custom-reactions-many",customReactionCount>=3);
  for(let i=0;i<3;i++){
    const directorValue=hasImage?themeLabel(state.themes[i]):"—";
    $("tabletWorkbenchTheme"+(i+1)).textContent=directorValue;
    document.querySelector(`[data-tablet-workbench-slot="${i+1}"]`)?.classList.toggle("active",tabletLandscapeView.activeThemeSlot===i+1);
  }
  const sortedAiThemes=(hasImage?currentAiThemes():[])
    .map(([label,weight])=>({label,weight:Number(weight)||0}))
    .sort((a,b)=>b.weight-a.weight)
    .slice(0,3);
  for(let i=0;i<3;i++){
    const value=sortedAiThemes[i];
    $("tabletWorkbenchAiTheme"+(i+1)).textContent=value?.label||"—";
    $("tabletWorkbenchAiThemePct"+(i+1)).textContent=value?`${value.weight}%`:"—";
  }
  $("tabletWorkbenchAiDescription").textContent=hasImage?(descriptionRerunWorkspace.active?descriptionRerunDisplayedText():(themeRerunWorkspace.active?themeRerunDisplayedDescriptionText():(currentAiRun().description||currentDescription()))):"";
  root.classList.toggle("face-judgment",tabletLandscapeView.face==="judgment");
  $("tabletMatrixFace")?.setAttribute("aria-hidden",String(tabletLandscapeView.face!=="matrix"));
  $("tabletJudgmentFace")?.setAttribute("aria-hidden",String(tabletLandscapeView.face!=="judgment"));
  const rerunWorkspaceActive=reactionRerunWorkspace.active||descriptionRerunWorkspace.active||themeRerunWorkspace.active;
  $("tabletAiThemesPanel").hidden=rerunWorkspaceActive?false:(!tabletLandscapeView.aiThemes || tabletLandscapeView.customs);
  $("tabletWorkbenchAiDescription").hidden=rerunWorkspaceActive?false:(!tabletLandscapeView.aiDescription || tabletLandscapeView.customs);
  $("tabletCustomsDrawer").hidden=!tabletLandscapeView.customs;
  $("tabletSlidingDrawer")?.classList.toggle("customs-active",tabletLandscapeView.customs);
  [["tabletAiReactionsBtn","aiReactions"],["tabletAiThemesBtn","aiThemes"],["tabletAiDescriptionBtn","aiDescription"]].forEach(([id,key])=>$(id)?.setAttribute("aria-pressed",String(tabletLandscapeView[key])));
  const contextualCustomsBtn=$("tabletCustomsBtn");
  if(contextualCustomsBtn){
    contextualCustomsBtn.setAttribute("aria-pressed",String(tabletLandscapeView.customs));
    contextualCustomsBtn.textContent=tabletLandscapeView.customs?"AI Analysis":"Customs";
    contextualCustomsBtn.setAttribute("aria-label",tabletLandscapeView.customs?"Return to AI Analysis":"Open Customs");
  }
  applyFlagButtonSeverity($("tabletFlagBtn"),hasImage?flagSeverityForRecord(currentImageRecord()):"none");
  $("tabletDepotBtn")?.setAttribute("aria-pressed",String(hasImage&&Boolean(currentImageRecord()?.attributes?.depot)));
  const keepOn=hasImage&&state.retention==="keep";
  $("tabletSaveBtn")?.setAttribute("aria-pressed",String(keepOn));
  $("landscapeImageViewSaveBtn")?.setAttribute("aria-pressed",String(keepOn));
  renderReactionRerunChrome();
  renderDescriptionRerunChrome();
  renderThemeRerunChrome();
  syncTabletAiRerunControls();
  applyLandscapeLowerPanelPacking();

  // AI theme fields use the exact rendered width and height of the existing
  // Director theme fields. The drawer panel is positioned immediately to the
  // right of that Director stack; no duplicate Director fields are rendered.
  const directorStack=document.querySelector(".landscape-director-themes");
  const directorField=directorStack?.querySelector(".tablet-theme-cell");
  const aiPanel=$("tabletAiThemesPanel");
  if(directorStack && directorField && aiPanel){
    const stackRect=directorStack.getBoundingClientRect();
    const fieldRect=directorField.getBoundingClientRect();
    aiPanel.style.setProperty("--director-stack-width",`${stackRect.width}px`);
    aiPanel.style.setProperty("--director-stack-height",`${stackRect.height}px`);
    aiPanel.style.setProperty("--director-field-width",`${fieldRect.width}px`);
    aiPanel.style.setProperty("--director-field-height",`${fieldRect.height}px`);
    const drawerRect=$("tabletSlidingDrawer")?.getBoundingClientRect();
    if(drawerRect){
      aiPanel.style.setProperty("--ai-theme-panel-top",`${Math.max(0,stackRect.top-drawerRect.top)}px`);
      const descriptionPanel=$("tabletWorkbenchAiDescription");
      if(descriptionPanel){
        descriptionPanel.style.setProperty("--director-stack-width",`${stackRect.width}px`);
        descriptionPanel.style.setProperty("--director-stack-height",`${stackRect.height}px`);
        descriptionPanel.style.setProperty("--ai-theme-panel-top",`${Math.max(0,stackRect.top-drawerRect.top)}px`);
      }
      const panelTop=Math.max(0,stackRect.top-drawerRect.top);
      const descriptionInclude=$("descriptionRerunPopulatedInclude");
      const themeInclude=$("themeRerunPopulatedInclude");
      const themeExplain=$("themeRerunExplainChanges");
      const themeAma=$("themeRerunAmaBtn");
      if(descriptionInclude)descriptionInclude.style.setProperty("--ai-theme-panel-top",`${panelTop}px`);
      if(themeInclude)themeInclude.style.setProperty("--ai-theme-panel-top",`${panelTop}px`);
      if(themeExplain)themeExplain.style.setProperty("--ai-theme-panel-top",`${panelTop}px`);
      if(themeAma)themeAma.style.setProperty("--ai-theme-panel-top",`${panelTop}px`);

      /* v0.9.40.58 — mirrored Include reserve must be recalculated from the
         real baseline on every render. Clear the prior dynamic reserve first;
         otherwise each rerender reads its own previous padding and compounds it. */
      if(descriptionPanel){
        descriptionPanel.style.removeProperty("--description-include-reserve");
        const basePad=parseFloat(getComputedStyle(descriptionPanel).paddingRight)||0;
        const visibleInclude=[descriptionInclude,themeInclude].find(el=>el&&!el.hidden&&getComputedStyle(el).display!=="none");
        if(visibleInclude){
          const panelRect=descriptionPanel.getBoundingClientRect();
          const includeRect=visibleInclude.getBoundingClientRect();
          const reserve=Math.max(basePad,panelRect.right-includeRect.left+basePad);
          descriptionPanel.style.setProperty("--description-include-reserve",`${Math.round(reserve*1000)/1000}px`);
        }
      }
    }
  }
  renderLandscapeInterlockedMatrix("tabletWorkbenchMatrix");
  requestAnimationFrame(fitLandscapeAiDescription);
}


function portraitRecordValues(){
  return window.genreactrixImageRecordEngine?.all?.() || Object.values(state.records || {});
}
let portraitRefreshPending=false;
async function refreshPortraitControlStation(){
  if(portraitRefreshPending) return;
  portraitRefreshPending=true;
  try{
    const records=portraitRecordValues();
    const imageEngine=window.genreactrixImagesEngine?.snapshot?.() || {available:0,temporary:0,linked:0,saved:0,flagged:0,recycle:0};
    const [batchSnapshot,aiSnapshot,reports,homeCounts] = await Promise.all([
      window.genreactrixBatchEngine?.snapshot?.().catch(()=>null) || null,
      window.genreactrixAiAnalysisEngine?.snapshot?.().catch(()=>null) || null,
      window.genreactrixReportsEngine?.all?.().catch(()=>[]) || [],
      window.genreactrixHomeCountEngine?.snapshot?.().catch(()=>null) || null
    ]);
    const queueSnapshot=window.genreactrixQueueEngine?.snapshot?.() || {summary:{}};
    const q=queueSnapshot.summary||{};
    const b=batchSnapshot || window.genreactrixBatchEngine?.snapshotCached || {inbox:{total:0,working:0,review:0,depot:0,red:0,hotMagenta:0,keep:0}};
    const a=aiSnapshot || window.genreactrixAiAnalysisEngine?.snapshotCached?.() || {output:0,pending:0,bufferTarget:25,items:[]};
    const set=(id,value)=>{const el=$(id);if(el)el.textContent=String(value ?? 0)};
    const authoritative=homeCounts||null;
    const inboxWork=authoritative?.inbox||b.inbox||{total:0,working:0,review:0,depot:0,delete:0,reject:0,red:0,hotMagenta:0,keep:0};
    set('portraitBatchName',inboxWork.total?'Inbox work':'No Inbox work');
    set('portraitBatchTotal',inboxWork.total||0);
    set('portraitBatchWorking',inboxWork.working||0);
    set('portraitBatchYellow',inboxWork.review||0);
    set('portraitBatchDepot',inboxWork.depot||0);
    set('portraitBatchRed',inboxWork.delete??inboxWork.red??0);
    set('portraitBatchHotMagenta',inboxWork.reject??inboxWork.hotMagenta??0);
    set('portraitBatchKeep',inboxWork.keep||0);
    // Main Home counts mirror the Director-facing section names. These are
    // navigation/module counts, not additive components of Active. The canonical
    // Active identity remains in HomeCountEngine and is shown by the Active detail.
    set('portraitAvailableCount',authoritative?.activeImageTotal ?? imageEngine.available ?? 0);
    set('portraitTempImageCount',authoritative?.originActive ?? 0); // Origin
    set('portraitLinkedImageCount',authoritative?.queueTotal ?? imageEngine.queued ?? 0); // Queue
    set('portraitReferenceImageCount',authoritative?.aiProcessing ?? a.output ?? 0); // AI
    set('portraitEngineFlaggedCount',inboxWork.total||0); // Batch / current Inbox work
    set('portraitRecycleImageCount',Array.isArray(reports)?reports.length:0); // Reports
    // AI is a process over Queue-owned images. In AI and Staged are therefore
    // Queue populations, not extra Active images.
    set('portraitAiOutputCount',authoritative?.aiProcessing ?? a.output ?? 0);
    set('portraitAiPendingCount',authoritative?.staged ?? a.pending ?? 0);
    set('portraitAiBufferTarget',authoritative?.process?.bufferTarget ?? a.bufferTarget ?? 0);
    set('portraitAiFailedCount',authoritative?.process?.aiFailures ?? currentAiFailureRecords().length);
    // Queue breakdown uses image populations, not queue-job telemetry.
    set('portraitQueueRunningCount',authoritative?.queueWaiting ?? q.running ?? 0);
    set('portraitQueuedCount',authoritative?.partial ?? q.queued ?? 0);
    set('portraitQueueFailedCount',authoritative?.staged ?? q.failed ?? 0);
    const sorted=[...(reports||[])].sort((x,y)=>String(y.createdAt||'').localeCompare(String(x.createdAt||'')));
    const lastAuto=sorted.find(r=>r.automatic);
    const lastCustom=sorted.find(r=>!r.automatic);
    set('portraitLastReport',lastAuto?.title||'None');
    set('portraitLastCustomReport',lastCustom?.title||'None');
    set('portraitReportCount',sorted.length);
    set('portraitReportFailedCount',q.reportsPending ? 0 : (queueSnapshot.jobs||[]).filter(j=>j.type==='report'&&['failed','completed-with-failures'].includes(j.state)).length);
  } finally { portraitRefreshPending=false; }
}
function renderPortraitControlStation(){
  if(!$('portraitControlStation')) return;
  refreshPortraitControlStation().catch(console.warn);
}
let portraitStatusTimer=null;
function setPortraitStationStatus(message){
  const status=$('portraitStationStatus');
  if(!status) return;
  status.textContent=message||'';
  status.hidden=!message;
  clearTimeout(portraitStatusTimer);
  if(message) portraitStatusTimer=setTimeout(()=>{status.textContent='';status.hidden=true},4200);
}

function renderAll(){
  // Classification fields render first so image/profile rendering can never leave
  // Theme 1/2/3 showing the previous image if a later render stage fails.
  renderThemes();
  renderReactions();
  renderFlag();
  renderDirectorFields();
  renderDirectorWorkspaceState();
  renderImage();
  renderAi();
  scheduleFoldedLandscapeDescriptionFit();
  scheduleWorkspaceDescriptionFits();
  renderComparison();
  updateUndoRedo();
  renderTabletTargetSlots();
  renderPrimFusionMatrix($("tabletThemeSearch")?.value || "", "tabletPrimFusionMatrix");
  renderTabletWorkbench();
  renderPortraitControlStation();
}

function openThemeWorkspace(slot=1){
  state.targetSlot=Number(slot);
  const primFusionPanel=$("landscapePrimFusionPanel");
  if(primFusionPanel && window.innerWidth>window.innerHeight){
    primFusionPanel.classList.add("primfusion-collapsed");
    $("landscapePrimFusionToggle")?.setAttribute("aria-expanded","false");
    if($("landscapePrimFusionToggle")) $("landscapePrimFusionToggle").textContent="Expand PrimFusion Matrix";
    document.querySelector("#themeWorkspace .workspace-shell")?.classList.remove("primfusion-expanded");
  }
  renderTargetSlot(true);
  $("themeSearch").value="";
  renderPrimFusionMatrix("");
  renderWriteIns();
  $("themeError").textContent="";
  $("themeWorkspace").showModal();
}
function renderTargetSlot(blink=false){
  document.querySelectorAll(".slot-button[data-target-slot]").forEach(b=>{
    const active=Number(b.dataset.targetSlot)===state.targetSlot;
    b.classList.toggle("active",active);
    b.classList.remove("commit-alert");
  });
  renderTabletTargetSlots();
  if(blink && state.targetSlot===1){
    requestAnimationFrame(()=>document.querySelector('.slot-button[data-target-slot="1"]').classList.add("commit-alert"));
  }
}
function renderPrimFusionMatrix(filter, targetId="primFusionMatrix"){
  const primFusion=$(targetId);
  if(!primFusion) return;

  const q=(filter||"").trim().toLowerCase();
  const landscapeSingleGrid=targetId==="primFusionMatrix" && window.innerWidth > window.innerHeight;
  const singleGrid=targetId==="tabletPrimFusionMatrix" || targetId==="tabletWorkbenchMatrix" || landscapeSingleGrid;

  // Genreactrix compatibility wrapper. Rendering mechanics now live in the
  // product-neutral Classification Matrix UI; this function only translates a
  // selected generic item/intersection back into Genreactrix Theme semantics.
  window.classificationMatrixUI?.render?.({
    target:primFusion,
    engine:window.classificationMatrixEngine,
    filter:q,
    singleGrid,
    bandSize:4,
    emptyCorner:"×",
    sectionLabel:"Classification Matrix",
    onSelectItem:item=>selectTheme({id:`primitive:${item.id}`,label:item.label,kind:"primitive",primitiveId:item.id}),
    onSelectIntersection:cell=>selectTheme({
      id:cell.id,
      label:cell.label,
      kind:"primFusion",
      primitiveIds:[cell.leftId,cell.rightId].sort()
    })
  });

  const directMatches=[...BASE_THEMES.map(label=>({id:`theme:${slugifyCustom(label)}`,label,kind:"established"})),...(state.customThemes||[])]
    .filter(theme=>!q || theme.label.toLowerCase().includes(q))
    .slice(0,20);

  if(directMatches.length){
    const quick=document.createElement("section");
    quick.className="quick-theme-results";
    const heading=document.createElement("div");
    heading.className="primfusion-band-title";
    heading.textContent=q ? "Matching established Themes" : "Established Themes";
    quick.appendChild(heading);
    const wrap=document.createElement("div");
    wrap.className="quick-theme-buttons";
    directMatches.forEach(theme=>{
      const b=document.createElement("button");
      b.type="button";b.textContent=theme.label;
      if(theme.kind==="customTheme")b.classList.add("custom-theme-result");
      b.addEventListener("click",()=>selectTheme(theme));
      wrap.appendChild(b);
    });
    quick.appendChild(wrap);
    primFusion.prepend(quick);
  }

  requestAnimationFrame(()=>requestAnimationFrame(()=>schedulePrimFusionFit(primFusion,0)));
}
function renderWriteIns(){
  const list=$("writeinList");if(!list)return;list.innerHTML="";
  (state.customThemes||[]).forEach(theme=>{const b=document.createElement("button");b.textContent=theme.label;b.className="custom-theme-result";b.addEventListener("click",()=>selectTheme(theme));list.appendChild(b);});
}
function selectTheme(themeInput){
  const sourceKey=currentKey();
  const sourceSlot=state.targetSlot;
  const theme=normalizeTheme(themeInput);
  const target=sourceSlot-1;
  const duplicate=state.themes.some((t,i)=>i!==target && normalizeTheme(t)?.id===theme.id);
  if(duplicate){
    const message=`“${theme.label}” is already selected in another Theme field. Choose a different Theme or clear the duplicate first.`;
    $("themeError").textContent=message;
    $("tabletThemeError").textContent=message;
    return;
  }
  pushHistory();
  state.themes[target]=theme;
  const saveOk=saveCurrent("director-theme-auto");
  if(!saveOk) return;
  renderThemes();
  renderComparison();
  if(tabletLandscapeView.activeThemeSlot===sourceSlot){
    tabletLandscapeView.activeThemeSlot=null;
    renderTabletWorkbench();
  }
}

function primFusionAutoFitEntries(root=document){
  return [...root.querySelectorAll(".primfusion-axis-header, .primfusion-intersection")]
    .filter(square=>{
      if(square.hidden) return false;
      const style=getComputedStyle(square);
      return style.display!=="none" && style.visibility!=="hidden";
    })
    .map(square=>{
      const label=square.matches(".primfusion-axis-header")
        ? square.querySelector("small")
        : square.querySelector(".primfusion-combo-label");
      return label ? {square,label} : null;
    })
    .filter(Boolean);
}

function cancelScheduledPrimFusionFit(root){
  // v0.9.3.18: fitting is intentionally disabled. PrimFusion labels use one
  // fixed, conservative size so the matrix is immediately usable.
}

function schedulePrimFusionFit(root,delay=0){
  if(!root) return;
  requestAnimationFrame(()=>autoFitPrimFusionLabels(root));
}

function autoFitPrimFusionLabels(root=document){
  if(!root || !root.isConnected) return;

  const panel=root.closest('.landscape-primfusion-panel');
  const rect=root.getBoundingClientRect();
  if((panel && panel.classList.contains('primfusion-collapsed')) ||
     root.hidden || getComputedStyle(root).display==='none' ||
     rect.width<=1 || rect.height<=1){
    return;
  }

  const labels=root.querySelectorAll(
    '.primfusion-axis-header small, .primfusion-intersection .primfusion-combo-label'
  );
  labels.forEach(label=>{
    label.style.fontSize='5.0625px';
    label.classList.remove('autofit-shrunk','autofit-tier-75','autofit-tier-50');
    label.removeAttribute('title');
    label.dataset.autofitSize='5.0625px';
  });

  root.classList.remove('primfusion-fitting');
  root.classList.add('primfusion-fitted');
  root.dataset.autofitVisibleCount=String(labels.length);
  root.dataset.autofitSharedPx='5.0625';
  root.dataset.autofitTier75Count='0';
  root.dataset.autofitTier50Count='0';
}

function renderTabletTargetSlots(){
  document.querySelectorAll("[data-tablet-target-slot]").forEach(button=>{
    button.classList.toggle("active", Number(button.dataset.tabletTargetSlot)===state.targetSlot);
  });
}

function updateTabletSearch(){
  const q=$("tabletThemeSearch").value.trim();
  renderPrimFusionMatrix(q,"tabletPrimFusionMatrix");
  const existing=[...BASE_THEMES,...state.writeIns].find(t=>t.toLowerCase()===q.toLowerCase());
  const create=$("tabletCreateThemeBtn");
  if(q && !existing){
    create.hidden=false;
    create.textContent=`Create new Theme: “${q}”`;
  }else{
    create.hidden=true;
    create.textContent="";
  }
}

function createTabletTheme(){
  const q=$("tabletThemeSearch").value.trim();
  if(!q) return;
  if(![...BASE_THEMES,...state.writeIns].some(t=>t.toLowerCase()===q.toLowerCase())){
    const record=normalizeCustomThemeRecord({label:q,reactionRefs:[]});
    saveCustomThemes([...(state.customThemes||[]),record]);
  }
  $("tabletCreateThemeBtn").hidden=true;
  renderPrimFusionMatrix(q,"tabletPrimFusionMatrix");
  $("tabletThemeError").textContent=`Created “${q}”. Select it normally for Theme ${state.targetSlot}.`;
}

function updateSearch(){
  const q=$("themeSearch").value.trim();
  renderPrimFusionMatrix(q);
  const existing=[...BASE_THEMES,...state.writeIns].find(t=>t.toLowerCase()===q.toLowerCase());
  const create=$("createThemeBtn");
  if(q && !existing){
    create.hidden=false;
    create.textContent=`Create new Theme: “${q}”`;
  }else{
    create.hidden=true;
    create.textContent="";
  }
}
function createTheme(){
  const q=$("themeSearch").value.trim();
  if(!q) return;
  if(![...BASE_THEMES,...state.writeIns].some(t=>t.toLowerCase()===q.toLowerCase())){
    const record=normalizeCustomThemeRecord({label:q,reactionRefs:[]});
    saveCustomThemes([...(state.customThemes||[]),record]);
    renderWriteIns();
    $("themeError").textContent=`Created “${q}”. Select it normally for Theme ${state.targetSlot}.`;
  }
  $("createThemeBtn").hidden=true;
}

function undo(){
  if(descriptionRerunWorkspace?.active&&descriptionRerunWorkspace.undo.length)return undoDescriptionRerun();
  const engine=window.genreactrixDirectorClassificationEngine;
  const restored=engine?.undo?.(currentKey());
  if(restored){applyClassification({selectedReactions:restored.reactions,themes:restored.themes,flagged:restored.flagged,writeIn:restored.notes,retention:restored.retention});writeClassificationForKey(currentKey(),classificationState());renderAll();updateUndoRedo();return true;}
  const current=snapshot();
  let target=null;
  while(state.history.length){
    const candidate=state.history.pop();
    if(!snapshotsEqual(current,candidate)){
      target=candidate;
      break;
    }
  }
  if(!target){
    updateUndoRedo();
    return false;
  }
  if(!snapshotsEqual(state.future[state.future.length-1],current)) state.future.push(current);
  restoreSnapshot(target);
  updateUndoRedo();
  return true;
}
function redo(){
  if(descriptionRerunWorkspace?.active&&descriptionRerunWorkspace.future.length)return redoDescriptionRerun();
  const engine=window.genreactrixDirectorClassificationEngine;
  const restored=engine?.redo?.(currentKey());
  if(restored){applyClassification({selectedReactions:restored.reactions,themes:restored.themes,flagged:restored.flagged,writeIn:restored.notes,retention:restored.retention});writeClassificationForKey(currentKey(),classificationState());renderAll();updateUndoRedo();return true;}
  const current=snapshot();
  let target=null;
  while(state.future.length){
    const candidate=state.future.pop();
    if(!snapshotsEqual(current,candidate)){
      target=candidate;
      break;
    }
  }
  if(!target){
    updateUndoRedo();
    return false;
  }
  if(!snapshotsEqual(state.history[state.history.length-1],current)) state.history.push(current);
  restoreSnapshot(target);
  updateUndoRedo();
  return true;
}
function updateUndoRedo(){
  const directorEngine=window.genreactrixDirectorClassificationEngine;
  const engineUndo=directorEngine?.canUndo?.(currentKey());
  const engineRedo=directorEngine?.canRedo?.(currentKey());
  const rerunUndo=Boolean(descriptionRerunWorkspace?.active&&descriptionRerunWorkspace.undo.length),rerunRedo=Boolean(descriptionRerunWorkspace?.active&&descriptionRerunWorkspace.future.length);
  $("undoBtn").disabled=!(rerunUndo||engineUndo||state.history.length);
  $("redoBtn").disabled=!(rerunRedo||engineRedo||state.future.length);
  if($("tabletUndoBtn")) $("tabletUndoBtn").disabled=!(rerunUndo||engineUndo||state.history.length);
  if($("tabletRedoBtn")) $("tabletRedoBtn").disabled=!(rerunRedo||engineRedo||state.future.length);
  if($("directorUndoBtn")){ $("directorUndoBtn").disabled=!(engineUndo||state.history.length); const tx=directorEngine?.peekUndo?.(currentKey()); $("directorUndoBtn").title=tx?`Undo ${tx.action||"classification"}`:"Nothing to undo"; }
  if($("directorRedoBtn")){ $("directorRedoBtn").disabled=!(engineRedo||state.future.length); const tx=directorEngine?.peekRedo?.(currentKey()); $("directorRedoBtn").title=tx?`Redo ${tx.action||"classification"}`:"Nothing to redo"; }
}

const landscapePrimFusionToggle=$("landscapePrimFusionToggle");
if(landscapePrimFusionToggle){
  landscapePrimFusionToggle.addEventListener("click",()=>{
    const panel=$("landscapePrimFusionPanel");
    const collapsed=panel.classList.toggle("primfusion-collapsed");
    landscapePrimFusionToggle.setAttribute("aria-expanded",String(!collapsed));
    landscapePrimFusionToggle.textContent=collapsed?"Expand PrimFusion Matrix":"Collapse PrimFusion Matrix";
    document.querySelector("#themeWorkspace .workspace-shell")?.classList.toggle("primfusion-expanded",!collapsed);
    if(!collapsed){
      renderPrimFusionMatrix($("themeSearch")?.value || "", "primFusionMatrix");
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        $("primFusionMatrix")?.scrollIntoView({block:"start",behavior:"smooth"});
      }));
    }else{
      document.querySelector("#themeWorkspace .workspace-shell")?.scrollTo({top:0,behavior:"instant"});
    }
  });
}


function isTabletWorkspace(){
  return window.innerWidth>=600 && window.innerWidth<=1199 && window.innerHeight>=500;
}

document.addEventListener("click",e=>{
  const opener=e.target.closest("[data-open]");
  if(opener && !isTabletWorkspace()){ $(opener.dataset.open).showModal(); scheduleWorkspaceDescriptionFits(); }
  const closer=e.target.closest("[data-close]");
  if(closer) $(closer.dataset.close).close();
  const themeField=e.target.closest(".theme-field");
  if(themeField){
    if(isTabletWorkspace()){
      state.targetSlot=Number(themeField.dataset.slot);
      renderTabletTargetSlots();
      document.getElementById("tabletPrimFusionMatrix")?.scrollIntoView({block:"start",behavior:"smooth"});
    }else{
      openThemeWorkspace(themeField.dataset.slot);
    }
  }
});

$("openAiBtn").addEventListener("click",()=>{ if(!isTabletWorkspace()){ const record=currentImageRecord();if(record)appendHistory({imageId:record.id,eventType:"director-ai-viewed",actor:"director",sourceEngine:"director-ui",summary:"Director opened AI Analysis",payload:{workspace:"aiWorkspace"}});$("aiWorkspace").showModal(); scheduleWorkspaceDescriptionFits(); } });
$("directorPrimFusionBtn").addEventListener("click",()=>{
  if($("directorWorkspace").open) $("directorWorkspace").close();
  openThemeWorkspace(state.targetSlot || 1);
});
$("prevBtn").addEventListener("click",prevImage);
$("nextBtn").addEventListener("click",nextImage);
$("undoBtn").addEventListener("click",undo);
$("redoBtn").addEventListener("click",redo);
$("tabletPrevBtn")?.addEventListener("click",prevImage);
$("tabletNextBtn")?.addEventListener("click",nextImage);
$("tabletUndoBtn")?.addEventListener("click",undo);
$("tabletRedoBtn")?.addEventListener("click",redo);
$("directorFlagBtn").addEventListener("click",()=>{
  pushHistory(); state.flagged=!state.flagged; saveCurrent();
  if(state.files.length) window.genreactrixImagesEngine?.setFlagged?.(currentKey(),state.flagged);
  renderFlag(); renderComparison(); renderPortraitControlStation();
});
$("directorNextBtn").addEventListener("click",nextImage);
$("directorWriteIn").addEventListener("change",e=>{
  pushHistory(); state.writeIn=e.target.value.trim(); saveCurrent(); renderComparison();
});
$("retentionControl").addEventListener("change",async e=>{
  if(state.feedEmpty)return;
  const keepOn=e.target.value==="keep";
  pushHistory(); state.retention=keepOn?"keep":"discard"; saveCurrent(keepOn?"image-retention-keep":"image-retention-release");
  try{
    const record=window.genreactrixImagesEngine?.recordById?.(currentKey());
    if(record)await window.genreactrixImagesEngine?.setKeep?.(currentKey(),keepOn);
  }catch(error){console.warn("Image Keep state could not be stored",error);}
  renderComparison();renderAll();renderPortraitControlStation();
});
document.querySelectorAll(".slot-button").forEach(b=>b.addEventListener("click",()=>{
  const slot=Number(b.dataset.targetSlot);
  state.targetSlot=(state.targetSlot===slot && slot!==1)?1:slot;
  renderTargetSlot(state.targetSlot===1);
}));
$("themeSearch").addEventListener("input",updateSearch);
$("themeSearch").addEventListener("keydown",e=>{
  if(e.key!=="Enter") return;
  e.preventDefault();
  const q=e.currentTarget.value.trim();
  const existing=[...BASE_THEMES,...state.writeIns].find(t=>t.toLowerCase().startsWith(q.toLowerCase()));
  if(existing) selectTheme(existing);
  else createTheme();
});
$("createThemeBtn").addEventListener("click",createTheme);
document.querySelectorAll("[data-tablet-target-slot]").forEach(button=>button.addEventListener("click",()=>{
  state.targetSlot=Number(button.dataset.tabletTargetSlot);
  renderTargetSlot(state.targetSlot===1);
}));
$("tabletThemeSearch").addEventListener("input",updateTabletSearch);
$("tabletThemeSearch").addEventListener("keydown",e=>{
  if(e.key!=="Enter") return;
  e.preventDefault();
  const q=e.currentTarget.value.trim();
  const existing=[...BASE_THEMES,...state.writeIns].find(t=>t.toLowerCase().startsWith(q.toLowerCase()));
  if(existing) selectTheme(existing); else createTabletTheme();
});
$("tabletCreateThemeBtn").addEventListener("click",createTabletTheme);
$("directorCommitBtn")?.addEventListener("click",commitDirectorAndFollowSetting);
$("directorNextIncompleteBtn")?.addEventListener("click",()=>navigateDirectorMode("next-incomplete"));
$("directorNextFlaggedBtn")?.addEventListener("click",()=>navigateDirectorMode("next-flagged"));
$("directorNextBlockedBtn")?.addEventListener("click",()=>navigateDirectorMode("next-blocked"));
$("directorRandomBtn")?.addEventListener("click",()=>navigateDirectorMode("random"));
$("directorReturnBtn")?.addEventListener("click",returnToLastDirectorImage);
$("directorClearReactionsBtn")?.addEventListener("click",()=>{
  if(!state.selectedReactions.length)return;
  pushHistory();state.selectedReactions=[];
  window.genreactrixDirectorClassificationEngine?.patchDraft?.(currentKey(),{reactions:[],primFusion:null});
  saveCurrent("clear-reactions");renderAll();setDirectorStatus("Reactions cleared.");
});
$("directorRevertDraftBtn")?.addEventListener("click",()=>{
  const engine=window.genreactrixDirectorClassificationEngine;
  const restored=engine?.revertDraft?.(currentKey());
  if(!restored) return;
  applyClassification({selectedReactions:restored.reactions,themes:restored.themes,flagged:restored.flagged,writeIn:restored.notes,retention:restored.retention});
  setDirectorStatus("Draft reverted.");
  renderAll();
});
$("resetOriginalBtn").addEventListener("click",()=>{
  if(!confirm("Discard all classification changes made since you entered this image?")) return;
  pushHistory();
  const keepFlag=state.flagged;
  const keepRetention=state.retention;
  applyClassification(state.visitBaseline||{});
  state.flagged=keepFlag;
  state.retention=keepRetention;
  saveCurrent(); renderAll();
});
$("clearCurrentBtn").addEventListener("click",()=>{
  if(!confirm("Clear all classification data for this image? AI analysis and the flag will be kept.")) return;
  if(!confirm("This will blank reactions, Theme 1/2/3, and classification write-in data. Continue?")) return;
  pushHistory();
  state.selectedReactions=[];
  state.themes=[null,null,null];
  state.writeIn="";
  saveCurrent(); renderAll();
});
$("directorUndoBtn").addEventListener("click",undo);
$("directorRedoBtn").addEventListener("click",redo);

const AI_DIRECTOR_RERUN_WAIT_MS=90000;
const aiDirectorRerunDelay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForDirectorRerunImageIdle(engine,imageId,{timeoutMs=AI_DIRECTOR_RERUN_WAIT_MS}={}){
  const started=Date.now();
  while(true){
    const snapshot=await engine.snapshot?.();
    const active=(snapshot?.items||[]).filter(item=>String(item.imageId)===String(imageId)&&["queued","processing"].includes(item.state));
    if(!active.length)return snapshot;
    const activeJobIds=[...new Set(active.map(item=>item.jobId).filter(Boolean))];
    for(const jobId of activeJobIds){
      const job=(snapshot?.jobs||[]).find(row=>row.id===jobId);
      if(job?.state==="queued")Promise.resolve(engine.run(jobId)).catch(error=>console.warn("Could not advance existing AI job before Director rerun",error));
    }
    if(Date.now()-started>=timeoutMs)throw new Error("Current image still has AI work in progress. Wait for that job to finish, then submit the rerun again.");
    await aiDirectorRerunDelay(250);
  }
}
async function waitForDirectorRerunJob(engine,jobId,{timeoutMs=AI_DIRECTOR_RERUN_WAIT_MS}={}){
  const terminal=new Set(["completed","completed-with-failures","cancelled","paused"]),started=Date.now();
  while(true){
    const snapshot=await engine.snapshot?.(),job=snapshot?.jobs?.find(row=>row.id===jobId);
    if(job&&terminal.has(job.state))return{snapshot,job};
    if(job?.state==="queued")Promise.resolve(engine.run(jobId)).catch(error=>console.warn("Could not advance Director rerun job",error));
    if(Date.now()-started>=timeoutMs)throw new Error("AI rerun is still running. Its job remains active in the AI console.");
    await aiDirectorRerunDelay(250);
  }
}

async function runCurrentAiRerun(components,{analysisGuidance="",themeUseAnalysis=false,reactionRerunSources=null,descriptionRerun=null,themeRerun=null}={}){
  const requested=[...new Set((components||[]).filter(component=>AI_RERUN_COMPONENTS.includes(component)))];
  if(!requested.length)throw new Error("No AI rerun component was selected.");
  if(aiRerunInFlight)throw new Error("An AI rerun is already in progress.");
  const imageId=currentKey(),recordEngine=window.genreactrixImageRecordEngine;
  if(state.feedEmpty||!state.files.length||!recordEngine?.get?.(imageId,{touch:false}))throw new Error("No current image is available for AI rerun.");
  const engine=window.genreactrixAiAnalysisEngine;
  if(!engine?.createJob||!engine?.run)throw new Error("AI Analysis Engine is unavailable.");
  if(!window.GenreactrixCloudApi?.isConfigured?.())throw new Error("AI Worker is not configured.");
  const componentConfig=Object.fromEntries(AI_RERUN_COMPONENTS.map(component=>[component,{enabled:requested.includes(component),behavior:"reanalyze"}]));
  const guidance=String(analysisGuidance||"").trim().slice(0,6000);
  aiRerunInFlight=true;syncTabletAiRerunControls();
  try{
    const explicitReactionRerun=Boolean(reactionRerunSources)&&requested.length===1&&requested[0]==="reactions";
    let job=null;
    for(let attempt=0;attempt<3;attempt++){
      if(explicitReactionRerun)await waitForDirectorRerunImageIdle(engine,imageId);
      job=await engine.createJob({target:"selected",imageIds:[imageId],quantityMode:"all",quantity:1,order:"queue",components:componentConfig,skipFailed:false,analysisGuidance:guidance,themeUseAnalysis:Boolean(themeUseAnalysis),reactionRerunSources:reactionRerunSources?{image:reactionRerunSources.image!==false,description:Boolean(reactionRerunSources.description)}:null,descriptionRerun:descriptionRerun?cloneDescriptionRerun(descriptionRerun):null,themeRerun:themeRerun?structuredClone(themeRerun):null});
      if(job?.id&&job.total)break;
      if(!explicitReactionRerun||job?.message!=="No eligible images")break;
      const raceSnapshot=await engine.snapshot?.(),raced=(raceSnapshot?.items||[]).some(item=>String(item.imageId)===String(imageId)&&["queued","processing"].includes(item.state));
      if(!raced)break;
    }
    if(!job?.id||!job.total)throw new Error(job?.message||"AI rerun could not be queued.");
    let snapshot,finalJob;
    if(explicitReactionRerun){
      Promise.resolve(engine.run(job.id)).catch(error=>console.warn("Director Reaction rerun runner failed",error));
      const terminal=await waitForDirectorRerunJob(engine,job.id);snapshot=terminal.snapshot;finalJob=terminal.job;
    }else{
      await engine.run(job.id);
      snapshot=await engine.snapshot?.();finalJob=snapshot?.jobs?.find(row=>row.id===job.id)||job;
    }
    if(finalJob.state!=="completed"){
      const itemErrors=(snapshot?.items||[]).filter(row=>row.jobId===job.id&&row.state==="failed").map(row=>String(row.error||"").trim()).filter(Boolean);
      throw new Error(itemErrors.length?[...new Set(itemErrors)].join(" | "):(finalJob.message||`AI rerun ended in ${finalJob.state||"an unknown state"}.`));
    }
    // v0.9.39.95 — a completed Reaction rerun is itself a request to inspect
    // the new scores. Make them visible before repainting Judgment so the
    // completed rerun cannot appear to have produced no percentages.
    if(requested.includes("reactions"))tabletLandscapeView.aiReactions=true;
    delete state.aiRuns[imageId];
    renderAll();
    renderTabletWorkbench();
    return finalJob;
  }finally{
    aiRerunInFlight=false;syncTabletAiRerunControls();
  }
}

$("rerunAiBtn").addEventListener("click",async()=>{
  if(!confirm("Rerun AI analysis for this image? The existing AI run will be kept in history.")) return;
  const button=$("rerunAiBtn"),originalLabel=button?.textContent||"Rerun AI Analysis";
  if(button)button.textContent="Rerunning AI…";
  try{
    const guidance=$("aiReanalysisGuidance")?.value?.trim()||"";
    await runCurrentAiRerun(AI_RERUN_COMPONENTS,{analysisGuidance:guidance});
    setDirectorStatus("AI Themes and Description rerun complete. Reactions recalculated 100% from Themes; no Reaction scan was run.");
  }catch(error){
    const message=String(error?.message||error);
    console.error("AI rerun failed",error);
    setDirectorStatus(`AI rerun failed: ${message}`);
    alert(`AI rerun failed: ${message}`);
  }finally{
    if(button)button.textContent=originalLabel;
    syncTabletAiRerunControls();
  }
});

async function applyEngineWorkingFiles(files,{preserveId=null,preferredIndex=0,canonical=true}={}){
  state.objectUrls.forEach(URL.revokeObjectURL);
  state.objectUrls=[];
  state.files=[...files];
  state.canonicalFeedActive=Boolean(canonical);
  state.feedEmpty=Boolean(canonical&&!state.files.length);
  if(state.files.length){
    const preserved=preserveId?state.files.findIndex(file=>file.id===preserveId):-1;
    state.index=preserved>=0?preserved:Math.max(0,Math.min(Number(preferredIndex)||0,state.files.length-1));
  }else state.index=0;
  loadCurrent();
  renderPortraitControlStation();
}
function landscapeLoadingPlaceholder(record){
  const name=String(record?.source?.originalFilename||record?.name||record?.id||"Image").slice(0,80);
  const clean=name.replace(/[&<>]/g,"");
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="#100d16"/><rect x="34" y="34" width="832" height="832" rx="28" fill="none" stroke="#6b5c78" stroke-width="4"/><text x="450" y="410" text-anchor="middle" fill="#f4eef8" font-family="system-ui,sans-serif" font-size="42" font-weight="700">Loading image…</text><text x="450" y="470" text-anchor="middle" fill="#b8aabd" font-family="system-ui,sans-serif" font-size="25">${clean}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function landscapeFeedShell(record){
  return {
    id:String(record.id),
    name:record.name||record.source?.originalFilename||String(record.id),
    url:landscapeLoadingPlaceholder(record),
    imageRecord:record,
    isHydratingAsset:true,
    hydrationStartedAt:Date.now()
  };
}
function landscapeAssetTimeout(record,message="Asset lookup timed out"){
  const engine=window.genreactrixImagesEngine;
  return engine?.missingAssetPlaceholder?.(record,message)||{
    id:String(record?.id||""),name:record?.name||record?.source?.originalFilename||String(record?.id||"Image"),
    url:landscapeLoadingPlaceholder({...record,name:"Image unavailable"}),imageRecord:record,isMissingAsset:true,error:message
  };
}
function withLandscapeAssetTimeout(promise,record,timeoutMs=LANDSCAPE_ASSET_TIMEOUT_MS){
  let timer=0;
  return Promise.race([
    Promise.resolve(promise).finally(()=>clearTimeout(timer)),
    new Promise(resolve=>{timer=setTimeout(()=>resolve(landscapeAssetTimeout(record,`Asset lookup exceeded ${Math.round(timeoutMs/1000)} seconds.`)),timeoutMs);})
  ]);
}
async function hydrateLandscapeAssetNow(imageId,generation,{urgent=false}={}){
  const id=String(imageId||"");if(!id||generation!==landscapeRehydrateGeneration)return null;
  const liveIndex=state.files.findIndex(file=>String(file.id)===id);if(liveIndex<0)return null;
  const live=state.files[liveIndex];if(!live?.isHydratingAsset)return live;
  const key=`${generation}:${id}`;
  if(landscapeHydrationInFlight.has(key))return landscapeHydrationInFlight.get(key);
  const record=live.imageRecord||window.genreactrixImagesEngine?.recordById?.(id)||null;
  const task=(async()=>{
    const engine=window.genreactrixImagesEngine;
    let hydrated=null;
    try{
      const resolver=engine?.displayFile||((targetId)=>engine?.workingFiles?.([targetId]).then(rows=>rows?.[0]||null));
      hydrated=await withLandscapeAssetTimeout(resolver?.(id,{allowRecovery:false,forDisplay:true}),record);
    }catch(error){
      console.warn("Landscape image asset hydration failed",id,error);
      hydrated=engine?.missingAssetPlaceholder?.(record,error?.message||error)||landscapeAssetTimeout(record,String(error?.message||error));
    }
    if(generation!==landscapeRehydrateGeneration)return null;
    const index=state.files.findIndex(file=>String(file.id)===id);if(index<0)return null;
    if(!hydrated)hydrated=engine?.missingAssetPlaceholder?.(record,'No displayable image asset is available.')||landscapeAssetTimeout(record,'No displayable image asset is available.');
    hydrated={...hydrated,id,imageRecord:hydrated.imageRecord||record,isHydratingAsset:false};
    state.files[index]=hydrated;
    if(index===state.index){renderImage();renderTabletWorkbench();}
    return hydrated;
  })().finally(()=>{landscapeHydrationInFlight.delete(key);});
  landscapeHydrationInFlight.set(key,task);
  return task;
}
function landscapeHydrationWindow(centerIndex=state.index){
  const count=state.files.length;if(!count)return [];
  const indexes=[];
  for(let offset=-LANDSCAPE_PREFETCH_RADIUS;offset<=LANDSCAPE_PREFETCH_RADIUS;offset++){
    const index=((Number(centerIndex)||0)+offset+count)%count;
    if(!indexes.includes(index))indexes.push(index);
  }
  // Current first, then the immediate forward/back neighbors.
  indexes.sort((a,b)=>a===(Number(centerIndex)||0)?-1:b===(Number(centerIndex)||0)?1:Math.abs(a-(Number(centerIndex)||0))-Math.abs(b-(Number(centerIndex)||0)));
  return indexes.map(index=>state.files[index]).filter(Boolean);
}
async function hydrateLandscapeWindow(generation,centerIndex=state.index){
  if(generation!==landscapeRehydrateGeneration||!state.files.length){landscapeHydrationPending=0;landscapeHydrationWindowIds=[];return;}
  const targets=landscapeHydrationWindow(centerIndex);
  landscapeHydrationWindowIds=targets.map(file=>String(file.id||"")).filter(Boolean);
  const pending=targets.filter(file=>file?.isHydratingAsset&&file.id);
  landscapeHydrationPending=pending.length;
  if(!pending.length)return;
  const currentId=String(state.files[state.index]?.id||"");
  const current=pending.find(file=>String(file.id)===currentId);
  if(current){
    await hydrateLandscapeAssetNow(currentId,generation,{urgent:true}).catch(()=>null);
    if(generation!==landscapeRehydrateGeneration)return;
    landscapeHydrationPending=Math.max(0,landscapeHydrationPending-1);
  }
  const neighbors=pending.filter(file=>String(file.id)!==currentId);
  await Promise.all(neighbors.map(file=>hydrateLandscapeAssetNow(String(file.id),generation,{urgent:false}).catch(()=>null).finally(()=>{
    if(generation===landscapeRehydrateGeneration)landscapeHydrationPending=Math.max(0,landscapeHydrationPending-1);
  })));
}
async function rehydrateLandscapeFeed({preserveId=null,preferredIndex=null}={}){
  const engine=window.genreactrixImagesEngine;if(!engine)return;
  const generation=++landscapeRehydrateGeneration;
  const oldId=preserveId||(state.files.length?currentKey():null);
  const oldIndex=preferredIndex==null?state.index:preferredIndex;
  const records=filteredLandscapeRecords();
  const priorById=new Map(state.files.map(file=>[String(file?.id||""),file]));
  const shells=records.map(record=>{
    const prior=priorById.get(String(record.id));
    // A feed/filter refresh must not replace a successfully rendered asset with
    // a generic loading shell. Preserve valid resolved state and refresh only
    // the logical Image Record reference. Missing assets may be retried later.
    if(prior&&!prior.isHydratingAsset&&!prior.isMissingAsset&&prior.url){
      return {...prior,name:record.name||record.source?.originalFilename||String(record.id),imageRecord:record};
    }
    return landscapeFeedShell(record);
  });
  await applyEngineWorkingFiles(shells,{preserveId:oldId,preferredIndex:oldIndex,canonical:true});
  renderLandscapeFilterDialog();
  if(generation!==landscapeRehydrateGeneration)return{superseded:true,recordCount:records.length,fileCount:shells.length};
  hydrateLandscapeWindow(generation,state.index).catch(error=>console.warn("Landscape asset hydration window could not complete",error));
  return{recordCount:records.length,fileCount:shells.length,hydrating:landscapeHydrationWindow(state.index).filter(file=>file?.isHydratingAsset).length};
}
function scheduleLandscapeRehydrate(){
  clearTimeout(landscapeRehydrateTimer);
  landscapeRehydrateTimer=setTimeout(()=>rehydrateLandscapeFeed().catch(error=>console.warn("Landscape feed could not be rehydrated",error)),80);
}
window.rehydrateLandscapeFeed=rehydrateLandscapeFeed;
function landscapeFeedDiagnostics(){
  const expected=filteredLandscapeRecords(),visibleIds=new Set(state.files.map(file=>String(file.id)));
  const missing=expected.filter(record=>!visibleIds.has(String(record.id))).map(record=>String(record.id));
  const nowMs=Date.now(),hydrating=state.files.filter(file=>file?.isHydratingAsset),stuck=hydrating.filter(file=>nowMs-Number(file.hydrationStartedAt||nowMs)>LANDSCAPE_ASSET_TIMEOUT_MS+3000);
  const activeWindow=new Set(landscapeHydrationWindowIds);
  const relevantStuck=stuck.filter(file=>activeWindow.has(String(file.id)));
  return {checkedAt:new Date().toISOString(),expectedCount:expected.length,visibleCount:state.files.length,feedEmpty:Boolean(state.feedEmpty),hydrationPending:landscapeHydrationPending,hydratingCount:hydrating.length,activeHydrationWindowIds:[...activeWindow],stuckHydrationIds:relevantStuck.map(file=>String(file.id)),generation:landscapeRehydrateGeneration,missingIds:missing};
}
function verifyLandscapeFeedIntegrity(){
  const d=landscapeFeedDiagnostics(),issues=[];
  if(d.expectedCount!==d.visibleCount)issues.push({type:"inbox-feed-population-mismatch",severity:"critical",expected:d.expectedCount,visible:d.visibleCount,missingIds:d.missingIds.slice(0,20)});
  if(d.expectedCount>0&&d.feedEmpty)issues.push({type:"inbox-feed-false-empty",severity:"critical",expected:d.expectedCount});
  if(d.stuckHydrationIds.length)issues.push({type:"inbox-feed-asset-hydration-stuck",severity:"critical",imageIds:d.stuckHydrationIds.slice(0,20)});
  return {checkedAt:d.checkedAt,issueCount:issues.length,issues,details:d};
}
window.genreactrixLandscapeFeedDiagnostics=landscapeFeedDiagnostics;
window.genreactrixMaintenanceEngine?.registerChecker?.("inbox-feed",verifyLandscapeFeedIntegrity,{quick:true,label:"Inbox feed"});
function activeInboxBundles(){return window.genreactrixBundleEngine?.activeBundles?.()||[];}
const landscapeThumbnailPickerState={objectUrls:[]};
function clearLandscapeThumbnailPickerUrls(){
  while(landscapeThumbnailPickerState.objectUrls.length){
    const url=landscapeThumbnailPickerState.objectUrls.pop();
    try{URL.revokeObjectURL(url);}catch{}
  }
}
function closeLandscapeThumbnailPicker(){
  clearLandscapeThumbnailPickerUrls();
  $("landscapeThumbnailPickerDialog")?.close();
}
async function thumbnailUrlForLandscapeRecord(record){
  const engine=window.genreactrixImagesEngine;
  const thumbKey=record?.storage?.thumbnailKey||record?.id;
  if(engine?.thumbnailBlobGet&&thumbKey){
    const thumb=await engine.thumbnailBlobGet(thumbKey).catch(()=>null);
    if(thumb){
      const url=URL.createObjectURL(thumb);
      landscapeThumbnailPickerState.objectUrls.push(url);
      return url;
    }
  }
  const active=state.files.find(file=>String(file?.id||'')===String(record?.id||''));
  if(active?.url&&!active.isHydratingAsset&&!active.isMissingAsset)return active.url;
  return landscapeLoadingPlaceholder(record);
}
async function jumpToLandscapeRecord(imageId){
  const id=String(imageId||'');
  if(!id)return false;
  const liveIndex=state.files.findIndex(file=>String(file?.id||'')===id);
  if(liveIndex>=0){
    goToImageIndex(liveIndex);
    requestCurrentLandscapeAsset();
    renderAll();
    return true;
  }
  const records=filteredLandscapeRecords();
  const preferredIndex=records.findIndex(record=>String(record.id)===id);
  await rehydrateLandscapeFeed({preserveId:id,preferredIndex:preferredIndex>=0?preferredIndex:0});
  requestCurrentLandscapeAsset();
  renderAll();
  return true;
}
async function openLandscapeThumbnailPicker(){
  const dialog=$("landscapeThumbnailPickerDialog"),grid=$("landscapeThumbnailPickerGrid"),status=$("landscapeThumbnailPickerStatus");
  if(!dialog||!grid)return;
  clearLandscapeThumbnailPickerUrls();
  const records=filteredLandscapeRecords();
  const currentId=String(currentKey?.()||'');
  if(status)status.textContent=`${records.length} image${records.length===1?'':'s'} in current Inbox view`;
  grid.innerHTML='';
  if(!records.length){
    const empty=document.createElement('p');
    empty.className='thumbnail-picker-empty';
    empty.textContent='No images match the current filter.';
    grid.appendChild(empty);
    dialog.showModal();
    return;
  }
  const rows=records.map((record,index)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='thumbnail-picker-item';
    button.dataset.imageId=String(record.id);
    if(String(record.id)===currentId)button.classList.add('is-current');

    const thumb=document.createElement('span');
    thumb.className='thumbnail-picker-thumb';
    const img=document.createElement('img');
    img.alt=record.name||record.source?.originalFilename||`Inbox image ${index+1}`;
    img.loading='lazy';
    img.src=landscapeLoadingPlaceholder({name:'Loading thumbnail…'});
    thumb.appendChild(img);

    const meta=document.createElement('span');
    meta.className='thumbnail-picker-meta';
    const strong=document.createElement('strong');
    strong.textContent=`${index+1}`;
    const small=document.createElement('small');
    small.textContent=record.source?.originalFilename||record.name||String(record.id);
    meta.append(strong,small);

    button.append(thumb,meta);
    grid.appendChild(button);
    return {record,img};
  });
  dialog.showModal();
  await Promise.all(rows.map(async row=>{
    row.img.src=await thumbnailUrlForLandscapeRecord(row.record);
  }));
}
function renderPortraitInboxControls(){
  const bundles=activeInboxBundles(),staged=window.genreactrixBundleEngine?.stagedRecords?.()||[],failedCount=currentAiFailureRecords().length;
  const count=$("portraitInboxPackCount");if(count)count.textContent=String(bundles.length);
  const stagedCount=$("portraitStagedCount");if(stagedCount)stagedCount.textContent=String(staged.length);
  const latest=bundles.at(-1),status=$("portraitInboxStatus");if(status)status.textContent=latest?`Latest: ${latest.label}`:(staged.length?`${staged.length} Staged in Queue`:"Inbox empty");
  const exportButton=$("portraitExportFails");if(exportButton){exportButton.disabled=failedCount===0;exportButton.title=failedCount?`${failedCount} failed image${failedCount===1?"":"s"} available to export`:"No current AI failures";}
}
async function openBundlePicker(){
  const dialog=$("packPickerDialog"),title=$("packPickerTitle"),list=$("packPickerList");if(!dialog||!list)return;
  const bundles=[...activeInboxBundles()].reverse();
  if(title)title.textContent="Select Bundle";
  const rows=[`<button type="button" class="pack-picker-row ${!landscapeFilter.bundleId?"is-selected":""}" data-pack-picker-id=""><strong>All Bundles</strong><small>No Bundle filter</small></button>`];
  rows.push(...bundles.map(bundle=>{const when=bundle.bundledAt||bundle.createdAt;const date=when?new Date(when).toLocaleString():"Undated";return `<button type="button" class="pack-picker-row ${landscapeFilter.bundleId===bundle.id?"is-selected":""}" data-pack-picker-id="${bundle.id.replaceAll('"','&quot;')}"><strong>${bundle.label.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</strong><small>${date} · ${bundle.imageIds.length} image${bundle.imageIds.length===1?"":"s"}</small></button>`;}));
  list.innerHTML=rows.join("")||'<p class="pack-picker-empty">Inbox has no Bundles yet.</p>';dialog.showModal();
}
// Legacy entry point retained so older callers do not auto-push AI Output into Inbox.
window.genreactrixAutoPushAiOutputToInbox=async function(){
  // v0.9.40.190: Bundling is an intentional, trackable manual boundary.
  renderPortraitInboxControls();
  return null;
};
$("portraitExportFails")?.addEventListener("click",async()=>{try{const result=await window.genreactrixAiAnalysisEngine?.exportFails?.();if(result?.moved)setPortraitStationStatus(`${result.moved} exported failure${result.moved===1?"":"s"} moved to Recycle.`);else if(result?.exported)setPortraitStationStatus(`Failure ZIP exported. Originals remain in Failed.`);}catch(error){setPortraitStationStatus(`Export Fails failed: ${error.message||error}`);}});
$("portraitBundleStaged")?.addEventListener("click",async()=>{try{const bundle=await window.genreactrixBundleEngine?.bundleWhateverAvailable?.();setPortraitStationStatus(bundle?`${bundle.label} sent to Inbox · ${bundle.imageIds.length} image${bundle.imageIds.length===1?"":"s"}.`:"No Staged images available.");renderPortraitInboxControls();}catch(error){setPortraitStationStatus(`Bundle failed: ${error.message||error}`);}});
$("packPickerClose")?.addEventListener("click",()=>$("packPickerDialog")?.close());
$("packPickerList")?.addEventListener("click",async event=>{
  const button=event.target.closest("[data-pack-picker-id]");if(!button)return;const id=button.dataset.packPickerId||null;
  landscapeFilter.bundleId=id;saveLandscapeFilter();$("packPickerDialog")?.close();await applyLandscapeFilter();
});
renderPortraitInboxControls();
window.addEventListener("genreactrix:bundle",()=>{renderPortraitInboxControls();scheduleLandscapeRehydrate();});
window.addEventListener("genreactrix:lifecycle",()=>renderPortraitInboxControls());
async function loadImageFiles(fileList,limit=null){
  const result=await window.genreactrixImportEngine.runFiles(fileList,{limit}),records=result?.records||[],gates=result?.gates||[];
  await rehydrateLandscapeFeed({preserveId:records[0]?.id||null});
  window.genreactrixAiAnalysisEngine?.maintainActiveMode?.();
  setPortraitStationStatus(`${records.length} image${records.length===1?"":"s"} imported into Queue${gates.length?` · ${gates.length} stopped at Origin`:''}.`);
  if(gates.some(g=>g.status==='pending-review'||g.status==='blocked-repeat'||g.type==='import-failure'))window.genreactrixImagesConsole?.openGates?.();
  return result;
}
let pendingPortraitImportLimit=null;
function chooseImageFiles({limit=null}={}){
  pendingPortraitImportLimit=limit==null?null:Math.max(1,Number(limit)||1);
  setPortraitStationStatus("Select image files. Use Select all in the Android file picker when available.");
  $("folderInput")?.click();
  return true;
}
window.genreactrixChooseImageFiles=chooseImageFiles;
$("folderInput")?.addEventListener("change",async e=>{
  try{
    if(!e.target.files?.length){setPortraitStationStatus("No image files were selected.");return;}
    await loadImageFiles(e.target.files,pendingPortraitImportLimit);
  }catch(error){setPortraitStationStatus(`Import failed: ${error.message||error}`);}
  finally{pendingPortraitImportLimit=null;e.target.value="";}
});
$("tabletFolderInput")?.addEventListener("change",async e=>{
  try{if(e.target.files?.length)await loadImageFiles(e.target.files,null)}catch(error){setPortraitStationStatus(`Import failed: ${error.message||error}`)}finally{e.target.value=""}
});




const LAYOUT_KEY="genreactrix-v0.9.1-layout";
const layoutState={imageFraction:1,directorFraction:1.18,aiFraction:.82,locked:false,imageCollapsed:false};
function applyLayout(){
  document.documentElement.style.setProperty("--image-console-fr",`${layoutState.imageFraction}fr`);
  document.documentElement.style.setProperty("--director-console-fr",`${layoutState.directorFraction}fr`);
  document.documentElement.style.setProperty("--ai-console-fr",`${layoutState.aiFraction}fr`);
  $("app").querySelector(".base-layout").classList.toggle("divider-locked",layoutState.locked);
  document.querySelector(".image-console").classList.toggle("supporting-collapsed",layoutState.imageCollapsed);
  $("lockDividerBtn").setAttribute("aria-pressed",layoutState.locked);
  $("lockDividerBtn").textContent=layoutState.locked?"🔒 Layout":"🔓 Layout";
  $("resetViewBtn").disabled=layoutState.locked;
  $("resetViewBtn").setAttribute("aria-disabled",String(layoutState.locked));
  $("collapseImageBtn").textContent=layoutState.imageCollapsed?"＋":"−";
}
function saveLayout(){localStorage.setItem(LAYOUT_KEY,JSON.stringify(layoutState));}
function resetLayout(){
  Object.assign(layoutState,{imageFraction:1,directorFraction:1.18,aiFraction:.82,locked:false,imageCollapsed:false});
  applyLayout(); saveLayout();
}
try{Object.assign(layoutState,JSON.parse(localStorage.getItem(LAYOUT_KEY)||"{}"));}catch{}
applyLayout();
$("resetViewBtn").addEventListener("click",resetLayout);
$("lockDividerBtn").addEventListener("click",()=>{layoutState.locked=!layoutState.locked;applyLayout();saveLayout();});
$("collapseImageBtn").addEventListener("click",()=>{layoutState.imageCollapsed=!layoutState.imageCollapsed;applyLayout();saveLayout();});

let dividerPointer=null;
function isTabletMode(){return matchMedia("(min-width: 600px) and (min-height: 500px)").matches;}
function isLandscapeMode(){return matchMedia("(orientation: landscape)").matches;}
function dividerIsAvailable(kind){
  return kind==="ai" ? isTabletMode() : (isTabletMode() || isLandscapeMode());
}
function beginDividerDrag(kind,e){
  if(layoutState.locked || !dividerIsAvailable(kind)) return;
  dividerPointer={id:e.pointerId,kind};
  e.currentTarget.setPointerCapture(e.pointerId);
}
function moveDivider(kind,e){
  if(!dividerPointer || dividerPointer.id!==e.pointerId || dividerPointer.kind!==kind || layoutState.locked) return;
  const box=document.querySelector(".base-layout").getBoundingClientRect();
  const tablet=isTabletMode();
  const dividerWidth=10;
  const gap=tablet ? dividerWidth*2 : dividerWidth;
  const usable=Math.max(1,box.width-gap);
  const relative=Math.max(0,Math.min(usable,e.clientX-box.left));

  if(!tablet){
    if(kind!=="image") return;
    const total=layoutState.imageFraction+layoutState.directorFraction;
    const left=Math.max(.55,Math.min(total-.65,(relative/usable)*total));
    layoutState.imageFraction=+left.toFixed(3);
    layoutState.directorFraction=+Math.max(.65,total-left).toFixed(3);
    applyLayout();
    return;
  }

  const total=layoutState.imageFraction+layoutState.directorFraction+layoutState.aiFraction;
  if(kind==="image"){
    const left=Math.max(.55,Math.min(total-1.15,(relative/usable)*total));
    const remainder=total-left;
    const pair=layoutState.directorFraction+layoutState.aiFraction;
    layoutState.imageFraction=+left.toFixed(3);
    layoutState.directorFraction=+Math.max(.65,remainder*(layoutState.directorFraction/pair)).toFixed(3);
    layoutState.aiFraction=+Math.max(.5,total-layoutState.imageFraction-layoutState.directorFraction).toFixed(3);
  }else{
    const leftTotal=Math.max(1.2,Math.min(total-.5,(relative/usable)*total));
    const pair=layoutState.imageFraction+layoutState.directorFraction;
    layoutState.imageFraction=+Math.max(.55,leftTotal*(layoutState.imageFraction/pair)).toFixed(3);
    layoutState.directorFraction=+Math.max(.65,leftTotal-layoutState.imageFraction).toFixed(3);
    layoutState.aiFraction=+Math.max(.5,total-leftTotal).toFixed(3);
  }
  applyLayout();
}
function endDividerDrag(e){
  if(dividerPointer?.id===e.pointerId){dividerPointer=null;saveLayout();}
}
[
  [$("consoleDivider"),"image"],
  [$("aiConsoleDivider"),"ai"]
].forEach(([divider,kind])=>{
  divider.addEventListener("pointerdown",e=>beginDividerDrag(kind,e));
  divider.addEventListener("pointermove",e=>moveDivider(kind,e));
  divider.addEventListener("pointerup",endDividerDrag);
  divider.addEventListener("pointercancel",endDividerDrag);
  divider.addEventListener("dblclick",()=>{
    if(layoutState.locked || !dividerIsAvailable(kind)) return;
    const total=layoutState.imageFraction+layoutState.directorFraction+layoutState.aiFraction;
    const imageNeed=Math.max(280,document.querySelector(".image-console").scrollWidth);
    const directorNeed=Math.max(360,document.querySelector(".director-console").scrollWidth);
    const aiNeed=Math.max(280,document.querySelector(".tablet-ai-console").scrollWidth);
    const needTotal=imageNeed+directorNeed+aiNeed;
    if(kind==="image"){
      const pair=imageNeed+directorNeed;
      const pairFraction=layoutState.imageFraction+layoutState.directorFraction;
      layoutState.imageFraction=+(pairFraction*(imageNeed/pair)).toFixed(3);
      layoutState.directorFraction=+(pairFraction-layoutState.imageFraction).toFixed(3);
    }else{
      const pair=directorNeed+aiNeed;
      const pairFraction=layoutState.directorFraction+layoutState.aiFraction;
      layoutState.directorFraction=+(pairFraction*(directorNeed/pair)).toFixed(3);
      layoutState.aiFraction=+(pairFraction-layoutState.directorFraction).toFixed(3);
    }
    applyLayout();saveLayout();
  });
  divider.addEventListener("keydown",e=>{
    if(layoutState.locked || !dividerIsAvailable(kind) || !["ArrowLeft","ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const delta=e.key==="ArrowLeft"?-.04:.04;
    if(kind==="image"){
      layoutState.imageFraction=Math.max(.55,layoutState.imageFraction+delta);
      layoutState.directorFraction=Math.max(.65,layoutState.directorFraction-delta);
    }else{
      layoutState.directorFraction=Math.max(.65,layoutState.directorFraction+delta);
      layoutState.aiFraction=Math.max(.5,layoutState.aiFraction-delta);
    }
    applyLayout();saveLayout();
  });
});

const LEGACY_SAVED_LAYOUTS_KEY="genreactrix-v0.8.0-saved-layouts";
const DIRECTOR_ACCOUNT_KEY="genreactrix-current-director-account";
const WORKSPACE_PROFILE_KEY="genreactrix-v0.9.1-workspace-profile";
const WORKSPACE_PROFILES={
  "classification":{imageFraction:1,directorFraction:1.18,aiFraction:.82,imageCollapsed:false},
  "image-study":{imageFraction:1.55,directorFraction:.95,aiFraction:.62,imageCollapsed:false},
  "ai-review":{imageFraction:.78,directorFraction:1.02,aiFraction:1.42,imageCollapsed:false},
  "primfusion-analysis":{imageFraction:.82,directorFraction:1.02,aiFraction:.82,imageCollapsed:true}
};
function currentDirectorAccount(){return localStorage.getItem(DIRECTOR_ACCOUNT_KEY)||"local-director";}
function savedLayoutsKey(){return `genreactrix-v0.9.1-saved-layouts:${currentDirectorAccount()}`;}
function readSavedLayouts(){
  try{
    const current=localStorage.getItem(savedLayoutsKey());
    if(current) return JSON.parse(current);
    const legacy=localStorage.getItem(LEGACY_SAVED_LAYOUTS_KEY);
    if(legacy){localStorage.setItem(savedLayoutsKey(),legacy);return JSON.parse(legacy);}
    return {};
  }catch{return {};}
}
function writeSavedLayouts(layouts){localStorage.setItem(savedLayoutsKey(),JSON.stringify(layouts));}
function applyWorkspaceProfile(name,{persist=true}={}){
  const profile=WORKSPACE_PROFILES[name]||WORKSPACE_PROFILES.classification;
  Object.assign(layoutState,profile);
  applyLayout();saveLayout();
  $("workspaceProfileSelect").value=name in WORKSPACE_PROFILES?name:"classification";
  if(persist) localStorage.setItem(WORKSPACE_PROFILE_KEY,$("workspaceProfileSelect").value);
}
function refreshSavedLayouts(){
  const select=$("savedLayoutSelect");
  const layouts=readSavedLayouts();
  select.innerHTML='<option value="">Saved Layouts</option>';
  Object.keys(layouts).sort().forEach(name=>{
    const option=document.createElement("option"); option.value=name; option.textContent=name; select.appendChild(option);
  });
}
$("saveLayoutBtn").addEventListener("click",()=>{
  const name=prompt("Name this workspace layout:","My Layout");
  if(!name?.trim()) return;
  const layouts=readSavedLayouts();
  layouts[name.trim()]={imageFraction:layoutState.imageFraction,directorFraction:layoutState.directorFraction,aiFraction:layoutState.aiFraction,imageCollapsed:layoutState.imageCollapsed};
  writeSavedLayouts(layouts);
  refreshSavedLayouts();
  $("savedLayoutSelect").value=name.trim();
});
$("savedLayoutSelect").addEventListener("change",e=>{
  if(!e.target.value) return;
  const saved=readSavedLayouts()[e.target.value];
  if(saved){Object.assign(layoutState,saved);applyLayout();saveLayout();}
});
$("workspaceProfileSelect").addEventListener("change",e=>applyWorkspaceProfile(e.target.value));
let initialWorkspaceProfile=localStorage.getItem(WORKSPACE_PROFILE_KEY)||"classification";
if(initialWorkspaceProfile===["matrix","analysis"].join("-")) initialWorkspaceProfile="primfusion-analysis";
$("workspaceProfileSelect").value=initialWorkspaceProfile in WORKSPACE_PROFILES?initialWorkspaceProfile:"classification";
refreshSavedLayouts();

try{
  // v0.9.3.18 preserves the verified v0.9.2j storage namespace and clean classification namespace.
  // Earlier namespaces are left untouched as an archive because prior builds
  // may have written the same Theme values into multiple image records.
  const currentRecords=localStorage.getItem("genreactrix-v0.9.2j-records");
  state.records=currentRecords?JSON.parse(currentRecords):{};
  state.aiRuns=JSON.parse(localStorage.getItem("genreactrix-v0.9.2j-ai-runs")||"{}");
  state.writeIns=JSON.parse(localStorage.getItem("genreactrix-v0.9.1-writeins")||localStorage.getItem("genreactrix-v0.8.0-writeins")||localStorage.getItem("genreactrix-v0.7.0-writeins")||'[]');
  state.customReactions=loadCustomReactions();
  state.customThemes=loadCustomThemes();
  state.writeIns=state.customThemes.map(item=>item.label);
  cleanupPlaceholderCustoms();
}catch(error){ console.warn("Genreactrix storage migration skipped",error); }



// v0.9.1 Desktop Mode: image zoom/pan, keyboard workflow, and primFusion navigation.
const imageTransform={scale:1,x:0,y:0,pointerId:null,startX:0,startY:0,originX:0,originY:0};
const IMAGE_TRANSFORM_KEY="genreactrix-director-image-transforms-v1";
function loadImageTransforms(){try{return JSON.parse(localStorage.getItem(IMAGE_TRANSFORM_KEY)||"{}")||{};}catch{return {};}}
const imageTransformsById=loadImageTransforms();
function saveImageTransformForCurrent(){
  const id=currentKey?.(); if(!id) return;
  imageTransformsById[id]={scale:imageTransform.scale,x:imageTransform.x,y:imageTransform.y};
  localStorage.setItem(IMAGE_TRANSFORM_KEY,JSON.stringify(imageTransformsById));
}
function restoreImageTransformForCurrent(){
  const saved=imageTransformsById[currentKey?.()]||{scale:1,x:0,y:0};
  Object.assign(imageTransform,{scale:Number(saved.scale)||1,x:Number(saved.x)||0,y:Number(saved.y)||0,pointerId:null});
  applyImageTransform();
}
function applyImageTransform(){
  const image=$("mainImage");
  image.style.transform=`translate(${imageTransform.x}px, ${imageTransform.y}px) scale(${imageTransform.scale})`;
  $("imageViewport").classList.toggle("is-zoomed",imageTransform.scale>1);
  saveImageTransformForCurrent();
}
function resetImageTransform(){
  Object.assign(imageTransform,{scale:1,x:0,y:0,pointerId:null});
  $("imageViewport").classList.remove("is-panning");
  applyImageTransform();
}
$("imageViewport").addEventListener("wheel",e=>{
  if(!e.ctrlKey && !isDesktopMode()) return;
  e.preventDefault();
  const old=imageTransform.scale;
  imageTransform.scale=Math.max(1,Math.min(6,old*(e.deltaY<0?1.12:.89)));
  if(imageTransform.scale===1){imageTransform.x=0;imageTransform.y=0;}
  applyImageTransform();
},{passive:false});
$("imageViewport").addEventListener("dblclick",resetImageTransform);
$("imageViewport").addEventListener("pointerdown",e=>{
  if(imageTransform.scale<=1) return;
  imageTransform.pointerId=e.pointerId;
  imageTransform.startX=e.clientX;imageTransform.startY=e.clientY;
  imageTransform.originX=imageTransform.x;imageTransform.originY=imageTransform.y;
  e.currentTarget.setPointerCapture(e.pointerId);
  e.currentTarget.classList.add("is-panning");
});
$("imageViewport").addEventListener("pointermove",e=>{
  if(imageTransform.pointerId!==e.pointerId) return;
  imageTransform.x=imageTransform.originX+(e.clientX-imageTransform.startX);
  imageTransform.y=imageTransform.originY+(e.clientY-imageTransform.startY);
  applyImageTransform();
});
function endImagePan(e){
  if(imageTransform.pointerId!==e.pointerId) return;
  imageTransform.pointerId=null;$("imageViewport").classList.remove("is-panning");
}
$("imageViewport").addEventListener("pointerup",endImagePan);
$("imageViewport").addEventListener("pointercancel",endImagePan);

function isDesktopMode(){return matchMedia("(min-width: 1200px) and (min-height: 650px)").matches;}
function editableTarget(target){return target.matches("input,textarea,select,[contenteditable='true']");}
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    const openDialog=[...document.querySelectorAll("dialog[open]")].pop();
    if(openDialog){e.preventDefault();openDialog.close();}
    return;
  }
  if(editableTarget(e.target)) return;
  if(e.altKey && ["1","2","3","4"].includes(e.key)){
    e.preventDefault();
    const names=["classification","image-study","ai-review","primfusion-analysis"];
    applyWorkspaceProfile(names[Number(e.key)-1]);
    return;
  }
  if(e.key.toLowerCase()==="n" || e.key==="ArrowRight"){e.preventDefault();nextImage();return;}
  if(e.key.toLowerCase()==="p" || e.key==="ArrowLeft"){e.preventDefault();prevImage();return;}
  if(e.key.toLowerCase()==="f"){$("directorFlagBtn").click();}
});
$("tabletPrimFusionMatrix").addEventListener("keydown",e=>{
  if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) return;
  const buttons=[...$("tabletPrimFusionMatrix").querySelectorAll("button:not([hidden])")];
  const index=buttons.indexOf(document.activeElement);
  if(index<0) return;
  e.preventDefault();
  const columns=14;
  const delta=e.key==="ArrowLeft"?-1:e.key==="ArrowRight"?1:e.key==="ArrowUp"?-columns:columns;
  buttons[Math.max(0,Math.min(buttons.length-1,index+delta))]?.focus();
});

let primFusionFitResizeTimer;
let lastPrimFusionLandscapeState=window.innerWidth > window.innerHeight;
window.addEventListener("resize",()=>{
  clearTimeout(primFusionFitResizeTimer);
  primFusionFitResizeTimer=setTimeout(()=>{
    const primFusionLandscapeState=window.innerWidth > window.innerHeight;
    if(primFusionLandscapeState!==lastPrimFusionLandscapeState){
      lastPrimFusionLandscapeState=primFusionLandscapeState;
      renderPrimFusionMatrix($("themeSearch")?.value||"","primFusionMatrix");
    }
    schedulePrimFusionFit($("primFusionMatrix"),0);
    schedulePrimFusionFit($("tabletPrimFusionMatrix"),0);
    scheduleFoldedLandscapeDescriptionFit();
    scheduleWorkspaceDescriptionFits();
  },120);
});


// v0.9.3.2: hydrate the active demo/image record from persistent storage only
// after all renderer dependencies (including image transform state) exist.
loadCurrent();

function renderLandscapeFilterDialog(){
  const dialog=$("landscapeFilterDialog");if(!dialog)return;
  $("landscapeFilterAll").checked=Boolean(landscapeFilter.all);
  $("landscapeFilterFeed").checked=Boolean(landscapeFilter.feed);
  FILTER_CATEGORIES.forEach(key=>{
    const inc=$("landscapeFilterInclude_"+key),exc=$("landscapeFilterExclude_"+key);
    if(inc)inc.checked=Boolean(landscapeFilter.include[key]);
    if(exc)exc.checked=Boolean(landscapeFilter.exclude[key]);
  });
  let selectedBundle=inboxBundleById(landscapeFilter.bundleId);
  if(landscapeFilter.bundleId&&!selectedBundle){landscapeFilter.bundleId=null;saveLandscapeFilter();selectedBundle=null;}
  const packButton=$("landscapeFilterPackSelect"),packRow=packButton?.closest?.(".landscape-filter-pack");if(packButton){packButton.textContent=selectedBundle?selectedBundle.label:"Select Bundle";packButton.classList.toggle("is-unselected",!selectedBundle);packRow?.classList.toggle("is-unselected",!selectedBundle);}
  const sort=$("landscapeFilterSort");if(sort)sort.value=landscapeFilter.sort;
  const count=filteredLandscapeRecords().length;
  const bundleCount=activeInboxBundles().length;
  if($("landscapeFilterCount"))$("landscapeFilterCount").textContent=`${count} image${count===1?"":"s"} match · ${bundleCount} Bundle${bundleCount===1?"":"s"} in Inbox`;
}
async function applyLandscapeFilter(){saveLandscapeFilter();renderLandscapeFilterDialog();await rehydrateLandscapeFeed();}
function setLandscapeFilterBase(key,checked){
  if(key==="all"){landscapeFilter.all=checked;if(checked){landscapeFilter.feed=false;FILTER_CATEGORIES.forEach(k=>landscapeFilter.include[k]=false);}}
  if(key==="feed"){landscapeFilter.feed=checked;if(checked){landscapeFilter.all=false;FILTER_CATEGORIES.forEach(k=>landscapeFilter.include[k]=false);}}
}
$("tabletFilterBtn")?.addEventListener("click",()=>{renderLandscapeFilterDialog();$("landscapeFilterDialog")?.showModal();if(state.feedEmpty&&filteredLandscapeRecords().length)scheduleLandscapeRehydrate();});
$("landscapeFilterClose")?.addEventListener("click",()=>$("landscapeFilterDialog")?.close());
$("landscapeFilterAll")?.addEventListener("change",async e=>{setLandscapeFilterBase("all",e.target.checked);await applyLandscapeFilter();});
$("landscapeFilterFeed")?.addEventListener("change",async e=>{setLandscapeFilterBase("feed",e.target.checked);await applyLandscapeFilter();});
FILTER_CATEGORIES.forEach(key=>{
  $("landscapeFilterInclude_"+key)?.addEventListener("change",async e=>{landscapeFilter.include[key]=e.target.checked;if(e.target.checked){landscapeFilter.all=false;landscapeFilter.feed=false;}await applyLandscapeFilter();});
  $("landscapeFilterExclude_"+key)?.addEventListener("change",async e=>{landscapeFilter.exclude[key]=e.target.checked;await applyLandscapeFilter();});
});
$("landscapeFilterPackSelect")?.addEventListener("click",()=>openBundlePicker());
$("landscapeFilterSort")?.addEventListener("change",async e=>{const next=SORT_MODES.has(e.target.value)?e.target.value:"bundle";if(next==="random"&&landscapeFilter.sort!=="random")landscapeFilter.randomSeed=Date.now();landscapeFilter.sort=next;await applyLandscapeFilter();});
$("landscapeThumbnailViewBtn")?.addEventListener("click",async()=>{
  $("landscapeFilterDialog")?.close();
  await openLandscapeThumbnailPicker();
});
$("landscapeThumbnailPickerClose")?.addEventListener("click",()=>closeLandscapeThumbnailPicker());
$("landscapeThumbnailPickerDialog")?.addEventListener("close",()=>clearLandscapeThumbnailPickerUrls());
$("landscapeThumbnailPickerGrid")?.addEventListener("click",async e=>{
  const button=e.target?.closest?.('.thumbnail-picker-item');
  if(!button)return;
  const imageId=button.dataset.imageId||'';
  closeLandscapeThumbnailPicker();
  await jumpToLandscapeRecord(imageId);
});

let depotToggleInFlight=false;
async function toggleCurrentDepot(){
  if(depotToggleInFlight||state.feedEmpty)return null;
  const id=currentKey(),record=window.genreactrixImagesEngine?.recordById?.(id);if(!record)return null;
  depotToggleInFlight=true;
  try{
    const next=!Boolean(record.attributes?.depot);
    const updated=await window.genreactrixImagesEngine.setDepot(id,next);
    state.flagged=Boolean(updated?.attributes?.flagged);
    landscapeFeedDirty=true;
    renderFlag();renderTabletWorkbench();renderLandscapeImageView();
    setDirectorStatus(next?"Image sent to Depot. It will leave Feed when you navigate away.":"Depot turned off.");
    return updated;
  }finally{depotToggleInFlight=false;}
}
$("tabletDepotBtn")?.addEventListener("click",()=>toggleCurrentDepot());

document.getElementById("tabletWorkspaceFlipBtn")?.addEventListener("click",()=>{tabletLandscapeView.face=tabletLandscapeView.face==="matrix"?"judgment":"matrix";if(tabletLandscapeView.face==="matrix")tabletLandscapeView.customs=false;renderTabletWorkbench();});
document.getElementById("tabletAiReactionsBtn")?.addEventListener("click",()=>{tabletLandscapeView.aiReactions=!tabletLandscapeView.aiReactions;renderTabletWorkbench();});
document.getElementById("tabletAiThemesBtn")?.addEventListener("click",()=>{tabletLandscapeView.aiThemes=!tabletLandscapeView.aiThemes;renderTabletWorkbench();});
document.getElementById("tabletAiDescriptionBtn")?.addEventListener("click",()=>{tabletLandscapeView.aiDescription=!tabletLandscapeView.aiDescription;renderTabletWorkbench();});
document.getElementById("tabletCustomsBtn")?.addEventListener("click",()=>{
  const opening=!tabletLandscapeView.customs;
  tabletLandscapeView.customs=opening;
  if(opening){
    tabletLandscapeView.customsTab="search";
    if($("tabletCustomSearch"))$("tabletCustomSearch").value="";
    landscapeCustomScroll.search=0;
  }
  renderTabletWorkbench();
  if(opening)renderLandscapeCustoms();
});

$("aiGuidedDescriptionRerunBtn")?.addEventListener("click",async()=>{
  if(aiRerunInFlight)return;
  const guidance=$("aiReanalysisGuidance")?.value?.trim()||"";
  setDirectorStatus("Rerunning image analysis…");
  try{
    await runCurrentAiRerun(["description"],{analysisGuidance:guidance});
    setDirectorStatus(guidance?"Image analysis rerun with Director guidance complete.":"Image analysis rerun complete.");
  }catch(error){
    const message=String(error?.message||error);
    console.error("Guided image analysis rerun failed",error);
    setDirectorStatus(`Image analysis rerun failed: ${message}`);
    alert(`Image analysis rerun failed: ${message}`);
  }
});

$("aiThemeFailsafeBtn")?.addEventListener("click",async()=>{
  if(aiRerunInFlight)return;
  const description=String(currentAiRun()?.description||"").trim();
  if(!description){
    const message="No existing AI analysis is available to guide the Theme failsafe.";
    setDirectorStatus(message);alert(message);return;
  }
  setDirectorStatus("Rerunning Themes with image + AI analysis…");
  try{
    await runCurrentAiRerun(["themes"],{themeUseAnalysis:true});
    setDirectorStatus("Theme failsafe rerun complete.");
  }catch(error){
    const message=String(error?.message||error);
    console.error("Theme failsafe rerun failed",error);
    setDirectorStatus(`Theme failsafe failed: ${message}`);
    alert(`Theme failsafe failed: ${message}`);
  }
});

async function createComponentAiRerun(component){
  if(tabletAiRerunLocked||aiRerunInFlight)return;
  if(!confirm(`Rerun AI ${component} for this image? The prior AI analysis will remain in history.`))return;
  let rerunOptions={};
  if(component==="description"){
    const priorGuidance=$("aiReanalysisGuidance")?.value?.trim()||"";
    const entered=window.prompt("Optional re-analysis guidance — tell the AI what it missed or got wrong. Leave blank for a normal Description rerun.",priorGuidance);
    if(entered===null)return;
    const guidance=String(entered||"").trim().slice(0,1200);
    const sharedGuidance=$("aiReanalysisGuidance");
    if(sharedGuidance)sharedGuidance.value=guidance;
    rerunOptions={analysisGuidance:guidance};
  }
  setDirectorStatus(`Rerunning AI ${component}…`);
  try{
    await runCurrentAiRerun([component],rerunOptions);
    setDirectorStatus(component==="description"&&rerunOptions.analysisGuidance?"AI description rerun with Director guidance complete.":`AI ${component} rerun complete.`);
  }catch(error){
    const message=String(error?.message||error);
    console.error(`AI ${component} rerun failed`,error);
    setDirectorStatus(`AI ${component} rerun failed: ${message}`);
    alert(`AI ${component} rerun failed: ${message}`);
  }
}
$("tabletAiRerunLockBtn")?.addEventListener("click",()=>{tabletAiRerunLocked=!tabletAiRerunLocked;localStorage.setItem(AI_RERUN_LOCK_KEY,tabletAiRerunLocked?"1":"0");syncTabletAiRerunControls();});
$("reactionRerunUseImage")?.addEventListener("change",event=>{if(!reactionRerunWorkspace.active)return;reactionRerunWorkspace.useImage=event.target.checked;renderReactionRerunChrome();});
$("reactionRerunUseDescription")?.addEventListener("change",event=>{if(!reactionRerunWorkspace.active)return;reactionRerunWorkspace.useDescription=event.target.checked;renderReactionRerunChrome();});
$("reactionRerunSubmitBtn")?.addEventListener("click",()=>submitReactionRerun());
$("reactionRerunReturnBtn")?.addEventListener("click",()=>closeReactionRerunWorkspace());
$("tabletAiRerunReactionsBtn")?.addEventListener("click",()=>rerunCurrentAiSafety());
$("tabletAiRerunThemesBtn")?.addEventListener("click",()=>openThemeRerunWorkspace().catch(error=>{console.error("Theme rerun workspace could not open",error);alert(error.message||String(error));}));
$("tabletAiRerunDescriptionBtn")?.addEventListener("click",()=>openDescriptionRerunWorkspace().catch(error=>{console.error("Description rerun workspace could not open",error);alert(error.message||String(error));}));
syncTabletAiRerunControls();

// AI Theme rerun shell + PrimPicker controls.
for(let slot=1;slot<=3;slot++){
  const cell=$("tabletWorkbenchAiTheme"+slot)?.closest(".tablet-theme-cell");
  cell?.addEventListener("click",event=>{if(themeRerunWorkspace.active){event.preventDefault();requestThemeRerunThemeState(slot);return;}if(descriptionRerunWorkspace.active||reactionRerunWorkspace.active)return;if(themeChangeReasoningForDisplaySlot(slot)){event.preventDefault();openThemeChangeReasoningForDisplaySlot(slot).catch(error=>console.warn("Theme change reasoning could not open",error));}});
  cell?.addEventListener("keydown",event=>{if(!["Enter"," "].includes(event.key))return;if(themeRerunWorkspace.active){event.preventDefault();requestThemeRerunThemeState(slot);return;}if(descriptionRerunWorkspace.active||reactionRerunWorkspace.active)return;if(themeChangeReasoningForDisplaySlot(slot)){event.preventDefault();openThemeChangeReasoningForDisplaySlot(slot).catch(error=>console.warn("Theme change reasoning could not open",error));}});
}
$("themeRerunPrimPickerBtn")?.addEventListener("click",()=>{if(!themeRerunWorkspace.active)return;themeRerunWorkspace.pickerOpen=!themeRerunWorkspace.pickerOpen;renderThemeRerunChrome();});
$("themeRerunClearBtn")?.addEventListener("click",()=>clearThemeRerunSelections());
$("themeRerunReturnBtn")?.addEventListener("click",()=>closeThemeRerunWorkspace());
$("themeRerunScopeConfirmCancel")?.addEventListener("click",()=>cancelPendingThemeRerunScopeChange());
$("themeRerunScopeConfirmApply")?.addEventListener("click",()=>applyPendingThemeRerunScopeChange());
document.querySelectorAll("[data-theme-rerun-prim-state]").forEach(button=>button.addEventListener("click",()=>{const target=themeRerunWorkspace.longPressTarget;if(!target)return;const raw=button.dataset.themeRerunPrimState;themeRerunSetPrimState(target.scope,target.code,raw==='unchosen'?null:raw);$("themeRerunPrimStateDialog")?.close();themeRerunWorkspace.longPressTarget=null;}));
document.querySelectorAll("[data-theme-rerun-close]").forEach(button=>button.addEventListener("click",()=>{$(button.dataset.themeRerunClose)?.close();themeRerunWorkspace.longPressTarget=null;}));
$("themeRerunExclusionsBtn")?.addEventListener("click",openThemeRerunExclusions);
$("themeRerunExclusionsSearch")?.addEventListener("input",event=>{themeRerunWorkspace.exclusionQuery=event.target.value;renderThemeRerunExclusions();});
$("themeRerunExclusionsList")?.addEventListener("click",event=>{const button=event.target.closest("[data-pfm-code]");if(button)themeRerunToggleExclusion(button.dataset.pfmCode);});
$("themeRerunPreviewBtn")?.addEventListener("click",()=>{if(!themeRerunWorkspace.active)return;try{const spec=buildThemeRerunPreviewSpec();$("themeRerunPreviewBody").textContent=previewThemeRerunRequest(spec);$("themeRerunPreviewDialog")?.showModal();}catch(error){alert(error.message||String(error));}});
$("themeRerunHistoryBtn")?.addEventListener("click",()=>openThemeRerunHistory().catch(error=>{console.error("Theme History could not open",error);$("themeRerunHistoryDialog")?.close();alert(error.message||String(error));}));
$("themeChangeReasoningClose")?.addEventListener("click",()=>$("themeChangeReasoningDialog")?.close());
$("themeRerunSubmitBtn")?.addEventListener("click",()=>submitThemeRerun());
$("themeRerunPopulatedIncludeCheck")?.addEventListener("change",event=>{const item=themeRerunDisplayedDescriptionItem();if(item)toggleThemeRerunIncludedDescription(item.id,event.target.checked);});
$("themeRerunExplainChangesCheck")?.addEventListener("change",event=>{if(!themeRerunWorkspace.active)return;themeRerunWorkspace.current.explainChanges=Boolean(event.target.checked);saveThemeRerunCurrent();renderThemeRerunChrome();});
// v0.9.40.132 — Theme adversarial decision pipeline / .130 AMA stack retained / Tuned / SLOP Director diagnostics.
$("landscapeTunedBtn")?.addEventListener("click",()=>openTunedHistory());
$("tunedHistoryClose")?.addEventListener("click",()=>$("tunedHistoryDialog")?.close());
$("landscapeSlopBtn")?.addEventListener("click",()=>openSlopDecision());
document.querySelectorAll(".content-rating-director[data-axis]").forEach(control=>control.addEventListener("change",()=>{try{setDirectorContentRating(control.dataset.axis,control.value)}catch(error){console.error("Director content rating update failed",error);renderContentRatings();alert(error?.message||String(error));}}));
document.querySelectorAll(".content-rating-ai[data-axis]").forEach(control=>control.addEventListener("click",()=>openAiContentRatingReason(control.dataset.axis)));
$('contentRatingReasonClose')?.addEventListener('click',()=>$('contentRatingReasonDialog')?.close());
$("slopClose")?.addEventListener("click",()=>$("slopDialog")?.close());
document.querySelectorAll("[data-slop-action]").forEach(button=>button.addEventListener("click",()=>applySlopDecision(button.dataset.slopAction).catch(error=>{console.error("SLOP Director disposition failed",error);alert(error?.message||String(error));})));
$("themeRerunAmaBtn")?.addEventListener("click",()=>openAmaMenu().catch(error=>console.warn("AI AMA menu failed",error)));
$("amaMenuClose")?.addEventListener("click",()=>$("amaMenuDialog")?.close());
$("amaRunBtn")?.addEventListener("click",()=>runAmaCurrent().catch(error=>{console.error("AI AMA failed",error);setDirectorStatus(`AI AMA failed: ${error?.message||error}`);alert(`AI AMA failed: ${error?.message||error}`);}));
$("amaHistoryBtn")?.addEventListener("click",()=>{renderAmaHistory().then(()=>{$("amaMenuDialog")?.close();safelyShowDialog($("amaHistoryDialog"));}).catch(error=>{console.error("AMA History failed",error);alert(error?.message||String(error));})});
$("amaHistoryClose")?.addEventListener("click",()=>$("amaHistoryDialog")?.close());
$("amaReportClose")?.addEventListener("click",()=>$("amaReportDialog")?.close());
$("amaFollowupAskBtn")?.addEventListener("click",()=>askAmaFollowup());
$("amaPrintBtn")?.addEventListener("click",async()=>{const win=window.open("","_blank");if(!win){alert("Print window could not be opened.");return}try{win.opener=null;win.document.open();win.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Genreactrix AI AMA</title></head><body><p>Preparing AI AMA for print…</p></body></html>');win.document.close();const bundle=await currentAmaBundle();if(!bundle){win.close();return}const html=await amaReportHtml(bundle,{standalone:true});win.document.open();win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${amaEsc(bundle.report.title)}</title></head><body>${html}</body></html>`);win.document.close();win.focus();const printNow=()=>{try{win.focus();win.print()}catch(error){console.warn("AI AMA print failed",error)}};if(win.document.fonts?.ready)win.document.fonts.ready.catch(()=>{}).finally(()=>setTimeout(printNow,120));else setTimeout(printNow,180)}catch(error){try{win.close()}catch{}alert(`Print/Save PDF could not be prepared: ${error?.message||error}`)}});
$("amaSaveHtmlBtn")?.addEventListener("click",async()=>{const bundle=await currentAmaBundle();if(!bundle)return;const html=await amaReportHtml(bundle,{standalone:true}),doc=`<!doctype html><html><head><meta charset="utf-8"><title>${amaEsc(bundle.report.title)}</title></head><body>${html}</body></html>`;amaDownloadText(doc,`Genreactrix_AI_AMA_${bundle.report.sequence}_${bundle.report.imageId}.html`,"text/html;charset=utf-8");});
$("amaExportJsonBtn")?.addEventListener("click",async()=>{const bundle=await currentAmaBundle();if(!bundle)return;amaDownloadText(JSON.stringify(bundle,null,2),`Genreactrix_AI_AMA_${bundle.report.sequence}_${bundle.report.imageId}.json`,"application/json;charset=utf-8");});
const themeDescriptionsButton=$("themeRerunDescriptionsBtn");
themeDescriptionsButton?.addEventListener("pointerdown",event=>{if(!themeRerunWorkspace.active)return;themeRerunWorkspace.descriptionsLongPress=false;clearTimeout(themeRerunWorkspace.descriptionsTimer);themeDescriptionsButton.setPointerCapture?.(event.pointerId);themeRerunWorkspace.descriptionsTimer=setTimeout(()=>{themeRerunWorkspace.descriptionsLongPress=true;renderThemeRerunDescriptionsDialog();$("themeRerunDescriptionsDialog")?.showModal();},520);});
themeDescriptionsButton?.addEventListener("pointerup",()=>{if(!themeRerunWorkspace.active)return;clearTimeout(themeRerunWorkspace.descriptionsTimer);if(!themeRerunWorkspace.descriptionsLongPress){const prior=themeRerunWorkspace.descriptionCatalog.find(item=>!item.current)||themeRerunWorkspace.descriptionCatalog[0];if(prior)populateThemeRerunDescription(prior.id);}themeRerunWorkspace.descriptionsLongPress=false;});
themeDescriptionsButton?.addEventListener("pointercancel",()=>{clearTimeout(themeRerunWorkspace.descriptionsTimer);themeRerunWorkspace.descriptionsLongPress=false;});
themeDescriptionsButton?.addEventListener("contextmenu",event=>event.preventDefault());

// AI Description rerun workstation controls.
$("tabletDescriptionRerunGuidance")?.addEventListener("input",event=>{if(!descriptionRerunWorkspace.active)return;descriptionRerunWorkspace.current.guidance=event.target.value;saveDescriptionRerunCurrent();});
for(let i=1;i<=3;i++){
  const cell=$("tabletWorkbenchAiTheme"+i)?.closest(".tablet-theme-cell");
  cell?.addEventListener("click",event=>{if(!descriptionRerunWorkspace.active)return;event.preventDefault();toggleDescriptionRerunTheme("ai",i);});
  cell?.addEventListener("keydown",event=>{if(!descriptionRerunWorkspace.active||!["Enter"," "].includes(event.key))return;event.preventDefault();toggleDescriptionRerunTheme("ai",i);});
}
const rerunDescriptionDisplay=$("tabletWorkbenchAiDescription");
rerunDescriptionDisplay?.addEventListener("beforeinput",event=>{if(descriptionRerunWorkspace.active)event.preventDefault();});
rerunDescriptionDisplay?.addEventListener("paste",event=>{if(descriptionRerunWorkspace.active)event.preventDefault();});
rerunDescriptionDisplay?.addEventListener("pointerup",()=>{if(descriptionRerunWorkspace.active)setTimeout(captureDescriptionRerunTarget,0);});
rerunDescriptionDisplay?.addEventListener("keyup",()=>{if(descriptionRerunWorkspace.active)captureDescriptionRerunTarget();});
$("descriptionRerunPopulatedIncludeCheck")?.addEventListener("change",event=>{const item=descriptionRerunDisplayedItem();if(item)toggleDescriptionRerunIncludedDescription(item.id,event.target.checked);});
$("descriptionRerunSaveDraft")?.addEventListener("click",()=>{if(!descriptionRerunWorkspace.active)return;saveDescriptionRerunCurrent();const draft=appendDescriptionRerunDraft(descriptionRerunWorkspace.imageId,descriptionRerunWorkspace.current,{source:"manual"});setDirectorStatus(draft?`AI Desc Rerun Draft saved · ${formatDescriptionRerunDate(draft.createdAt)}.`:"Draft could not be saved.");});
$("descriptionRerunSelectDraft")?.addEventListener("click",()=>{if(!descriptionRerunWorkspace.active)return;renderDescriptionRerunDraftDialog();$("descriptionRerunDraftDialog")?.showModal();});
$("descriptionRerunPreview")?.addEventListener("click",()=>{if(!descriptionRerunWorkspace.active)return;try{const spec=buildDescriptionRerunRequest();$("descriptionRerunPreviewBody").textContent=previewDescriptionRerunRequest(spec);$("descriptionRerunPreviewDialog")?.showModal();}catch(error){alert(error.message||String(error));}});
$("descriptionRerunSubmit")?.addEventListener("click",()=>submitDescriptionRerun());
const reactionReviewButton=$("descriptionRerunReviewReactions");
const endReactionReview=()=>{if(!descriptionRerunWorkspace.active||!descriptionRerunWorkspace.reviewHeld)return;descriptionRerunWorkspace.reviewHeld=false;renderDescriptionRerunChrome();};
reactionReviewButton?.addEventListener("pointerdown",event=>{if(!descriptionRerunWorkspace.active)return;descriptionRerunWorkspace.reviewHeld=true;reactionReviewButton.setPointerCapture?.(event.pointerId);renderDescriptionRerunChrome();});
reactionReviewButton?.addEventListener("pointerup",endReactionReview);
reactionReviewButton?.addEventListener("pointercancel",endReactionReview);
reactionReviewButton?.addEventListener("lostpointercapture",endReactionReview);
reactionReviewButton?.addEventListener("contextmenu",event=>event.preventDefault());
const classicsButton=$("descriptionRerunClassics");
classicsButton?.addEventListener("pointerdown",event=>{if(!descriptionRerunWorkspace.active)return;descriptionRerunWorkspace.classicsLongPress=false;clearTimeout(descriptionRerunWorkspace.classicsTimer);classicsButton.setPointerCapture?.(event.pointerId);descriptionRerunWorkspace.classicsTimer=setTimeout(()=>{descriptionRerunWorkspace.classicsLongPress=true;renderDescriptionRerunClassicsDialog();$("descriptionRerunClassicsDialog")?.showModal();},520);});
classicsButton?.addEventListener("pointerup",()=>{if(!descriptionRerunWorkspace.active)return;clearTimeout(descriptionRerunWorkspace.classicsTimer);if(!descriptionRerunWorkspace.classicsLongPress){const classic=descriptionRerunWorkspace.catalog.find(item=>!item.current)||descriptionRerunWorkspace.catalog[0];if(classic)populateDescriptionRerunDescription(classic.id);}descriptionRerunWorkspace.classicsLongPress=false;});
classicsButton?.addEventListener("pointercancel",()=>{clearTimeout(descriptionRerunWorkspace.classicsTimer);descriptionRerunWorkspace.classicsLongPress=false;});
classicsButton?.addEventListener("contextmenu",event=>event.preventDefault());
$("descriptionRerunClear")?.addEventListener("click",()=>{if(!descriptionRerunWorkspace.active)return;$("descriptionRerunClearText").checked=false;$("descriptionRerunClearTarget").checked=false;$("descriptionRerunClearDialog")?.showModal();});
$("descriptionRerunClearSubmit")?.addEventListener("click",()=>{const clearText=$("descriptionRerunClearText")?.checked,clearTarget=$("descriptionRerunClearTarget")?.checked;if(!clearText&&!clearTarget){alert("Choose what to clear.");return}const choices=[];if(clearText)choices.push("Clear Text Entry");if(clearTarget)choices.push("Clear Highlights/Cursor");$("descriptionRerunClearConfirmText").textContent=`Confirm:\n${choices.map(x=>`• ${x}`).join("\n")}`;$("descriptionRerunClearDialog")?.close();$("descriptionRerunClearConfirmDialog")?.showModal();});
$("descriptionRerunClearConfirmReturn")?.addEventListener("click",()=>{$("descriptionRerunClearConfirmDialog")?.close();$("descriptionRerunClearDialog")?.showModal();});
$("descriptionRerunClearConfirmApply")?.addEventListener("click",()=>{const clearText=$("descriptionRerunClearText")?.checked,clearTarget=$("descriptionRerunClearTarget")?.checked;if(clearText)descriptionRerunWorkspace.current.guidance="";if(clearTarget)descriptionRerunWorkspace.current.target={armed:false,start:null,end:null};saveDescriptionRerunCurrent();$("descriptionRerunClearConfirmDialog")?.close();renderTabletWorkbench();});
$("descriptionRerunReturn")?.addEventListener("click",()=>closeDescriptionRerunWorkspace());
document.querySelectorAll("[data-description-rerun-close]").forEach(button=>button.addEventListener("click",()=>$(button.dataset.descriptionRerunClose)?.close()));

document.getElementById("tabletSaveBtn")?.addEventListener("click",async()=>{
  if(state.feedEmpty)return;
  const id=currentKey();
  const keepOn=state.retention!=="keep";
  pushHistory();state.retention=keepOn?"keep":"discard";
  saveCurrent(keepOn?"image-retention-keep":"image-retention-release");
  try{
    const record=window.genreactrixImagesEngine?.recordById?.(id);
    if(record){
      if(keepOn){
        const wasRejectionFlagged=Boolean(record.attributes?.rejectionFlagged);
        await window.genreactrixImagesEngine.setKeep(id,true);
        if(wasRejectionFlagged)landscapeFeedDirty=true;
      }else await window.genreactrixImagesEngine?.setKeep?.(id,false);
    }
    renderAll();renderLandscapeImageView();
    setDirectorStatus(keepOn?"Full-resolution image marked Keep for batching.":"Keep cleared; full-resolution image may recycle after batching.");
  }catch(error){
    console.warn("Image Keep state could not be stored",error);
    setDirectorStatus("Keep changed in the working evaluation, but storage preference could not be persisted.");
  }
});
document.querySelectorAll("[data-tablet-workbench-slot]").forEach(button=>button.addEventListener("click",()=>{
  const slot=Number(button.dataset.tabletWorkbenchSlot);
  if(descriptionRerunWorkspace.active){toggleDescriptionRerunTheme("director",slot);return;}
  const alreadyActive=tabletLandscapeView.activeThemeSlot===slot;
  if(alreadyActive){
    tabletLandscapeView.activeThemeSlot=null;
  }else{
    state.targetSlot=slot;
    tabletLandscapeView.activeThemeSlot=slot;
  }
  renderTabletWorkbench();
}));

// v0.9.39.24 — focused Image View. This is a verification mode, not an editor.
const landscapeImageViewState={open:false,scale:1,x:0,y:0,pointers:new Map(),gestureMoved:false,pinched:false,downAt:0};
function resetLandscapeImageViewTransform(){
  landscapeImageViewState.scale=1;landscapeImageViewState.x=0;landscapeImageViewState.y=0;
  landscapeImageViewState.pointers.clear();landscapeImageViewState.gestureMoved=false;landscapeImageViewState.pinched=false;
  applyLandscapeImageViewTransform();
}
function applyLandscapeImageViewTransform(){
  const image=$("landscapeImageViewImage");if(!image)return;
  image.style.transform=`translate(${landscapeImageViewState.x}px, ${landscapeImageViewState.y}px) scale(${landscapeImageViewState.scale})`;
}
function landscapeImageViewReactionSelected(value){return state.selectedReactions.includes(value)}

/* v0.9.39.50 — Image View reaction geometry.
   Canonical primitives occupy the first two interleaved brick rows; customs
   continue immediately beneath them in rows three and four using the same
   top/bottom sequence. Each item owns one slot center; CSS centers both the
   glyph and selection ring on that slot. */
/* v0.9.39.56 — Image View uses one explicit reaction field.
   Each item owns one center point. Ring and emoji are siblings inside a
   reaction-core and therefore cannot drift onto separate coordinate systems.
   The finished field has an explicit bounding box and is centered as a unit. */
const LANDSCAPE_IMAGE_REACTION_GEOMETRY={
  ring:44,
  glyph:17,
  stroke:2.6,
  stepX:60,
  stepY:38
};
function landscapeImageViewCenter(index,custom=false){
  const g=LANDSCAPE_IMAGE_REACTION_GEOMETRY;
  if(!custom){
    const col=Math.floor(index/2);
    return index%2===0
      ? {x:col*g.stepX,y:0}
      : {x:(col+.5)*g.stepX,y:g.stepY};
  }
  /* Customs continue as rows 3/4 without a section gap:
     #1,#2,#4,#6... on row 3; #3,#5,#7... on row 4. */
  if(index===0)return{x:0,y:g.stepY*2};
  if(index===1)return{x:g.stepX,y:g.stepY*2};
  const n=index-2;
  return n%2===0
    ? {x:(Math.floor(n/2)+.5)*g.stepX,y:g.stepY*3}
    : {x:(Math.floor(n/2)+2)*g.stepX,y:g.stepY*2};
}
function finalizeLandscapeImageReactionField(field,points){
  const g=LANDSCAPE_IMAGE_REACTION_GEOMETRY;
  if(!points.length){
    field.style.width='0px';field.style.height='0px';
    field.style.setProperty('--iv-field-scale','1');
    field.style.setProperty('--iv-center-x','0px');
    field.style.setProperty('--iv-center-y','0px');
    return;
  }
  const r=g.ring/2;
  const minX=Math.min(...points.map(p=>p.x))-r;
  const maxX=Math.max(...points.map(p=>p.x))+r;
  const minY=Math.min(...points.map(p=>p.y))-r;
  const maxY=Math.max(...points.map(p=>p.y))+r;
  const fieldWidth=maxX-minX;
  const fieldHeight=maxY-minY;
  field.style.width=`${fieldWidth}px`;
  field.style.height=`${fieldHeight}px`;
  field.style.setProperty('--iv-origin-x',`${-minX}px`);
  field.style.setProperty('--iv-origin-y',`${-minY}px`);
  field.style.setProperty('--iv-center-x','0px');
  field.style.setProperty('--iv-center-y','0px');

  /* v0.9.39.62 — fit and center from rendered geometry, not assumed layout.
     The reaction field remains one rigid object. After the browser resolves the
     actual Image View grid, measure both the available reaction region and the
     transformed field, then translate only the field by the exact center delta.
     No ring, glyph, slot, stagger, or custom-reaction geometry is changed. */
  const root=field.parentElement;
  const settle=()=>{
    if(!root||!field.isConnected)return;
    const inset=8;
    const rootRect=root.getBoundingClientRect();
    if(rootRect.width<=0||rootRect.height<=0)return;
    const availableWidth=Math.max(1,rootRect.width-inset);
    const availableHeight=Math.max(1,rootRect.height-inset);
    const scale=Math.min(1,availableWidth/fieldWidth,availableHeight/fieldHeight);
    field.style.setProperty('--iv-field-scale',String(Number.isFinite(scale)&&scale>0?scale:1));
    field.style.setProperty('--iv-center-x','0px');
    field.style.setProperty('--iv-center-y','0px');

    requestAnimationFrame(()=>{
      if(!field.isConnected)return;
      const rr=root.getBoundingClientRect();
      const fr=field.getBoundingClientRect();
      const dx=(rr.left+rr.width/2)-(fr.left+fr.width/2);
      const dy=(rr.top+rr.height/2)-(fr.top+fr.height/2);
      field.style.setProperty('--iv-center-x',`${dx}px`);
      field.style.setProperty('--iv-center-y',`${dy}px`);
    });
  };
  requestAnimationFrame(settle);
}
function placeLandscapeImageReaction(item,point){
  item.style.left=`calc(var(--iv-origin-x) + ${point.x}px)`;
  item.style.top=`calc(var(--iv-origin-y) + ${point.y}px)`;
}
function renderLandscapeImageView(){
  if(!landscapeImageViewState.open)return;
  const image=$("landscapeImageViewImage");if(image)image.src=currentSource();
  const description=$("landscapeImageViewDescription");if(description){
    description.textContent=currentAiRun().description||currentDescription()||"";
    description.title=description.textContent;
  }
  const primRoot=$("landscapeImageViewPrims");if(primRoot){
    primRoot.innerHTML="";
    const field=document.createElement("div");field.className="landscape-image-view-reaction-field";primRoot.appendChild(field);
    const points=[];
    const order=["🧸","✨","😭","🤣","🌶️","🎉","🧠","💥","👻","🤢","🌌","🌀","🤬"];
    order.forEach((symbol,displayIndex)=>{
      const primitive=PRIMITIVES.find(item=>item.symbol===symbol);if(!primitive)return;
      const selectionToken=primitiveSelectionToken(primitive);
      const point=landscapeImageViewCenter(displayIndex,false);points.push(point);
      const item=document.createElement("div");item.className="landscape-image-view-prim"+(landscapeImageViewReactionSelected(selectionToken)?" selected":"");item.title=primitive.name;item.setAttribute("aria-label",`${primitive.name}${landscapeImageViewReactionSelected(selectionToken)?", selected":""}`);
      item.innerHTML=`<span class="reaction-core" aria-hidden="true"><span class="reaction-ring"></span><span class="symbol">${primitive.symbol}</span></span>`;
      placeLandscapeImageReaction(item,point);field.appendChild(item);
    });
    (state.customReactions||[]).forEach((record,customIndex)=>{
      const token=customReactionSelectionToken(record.id);const point=landscapeImageViewCenter(customIndex,true);points.push(point);
      const item=document.createElement("div");item.className="landscape-image-view-prim custom"+(landscapeImageViewReactionSelected(token)?" selected":"");item.title=record.label;item.setAttribute("aria-label",`${record.label}${landscapeImageViewReactionSelected(token)?", selected":""}`);
      item.innerHTML=`<span class="reaction-core" aria-hidden="true"><span class="reaction-ring"></span><span class="symbol">${record.emoji}</span></span>`;
      placeLandscapeImageReaction(item,point);field.appendChild(item);
    });
    finalizeLandscapeImageReactionField(field,points);
  }
  const themeRoot=$("landscapeImageViewThemes");if(themeRoot){
    themeRoot.innerHTML="";
    for(let i=0;i<3;i++){
      const row=document.createElement("div");row.className="landscape-image-view-theme";row.innerHTML=`<b>${i+1}</b><strong>${themeLabel(state.themes[i])}</strong>`;themeRoot.appendChild(row);
    }
  }
  const record=currentImageRecord();
  applyFlagButtonSeverity($("landscapeImageViewFlagBtn"),state.feedEmpty?"none":flagSeverityForRecord(record));
  $("landscapeImageViewSaveBtn")?.setAttribute("aria-pressed",String(Boolean(record)&&state.retention==="keep"));
  $("landscapeImageViewDepotBtn")?.setAttribute("aria-pressed",String(Boolean(record?.attributes?.depot)));
}
function openLandscapeImageView(){
  landscapeImageViewState.open=true;
  const trigger=$("tabletImageViewBtn");if(trigger){trigger.disabled=true;trigger.style.pointerEvents="none";}
  const view=$("landscapeImageView");if(view)view.hidden=false;
  resetLandscapeImageViewTransform();renderLandscapeImageView();
}
function closeLandscapeImageView(){
  landscapeImageViewState.open=false;
  const trigger=$("tabletImageViewBtn");if(trigger){trigger.disabled=true;trigger.style.pointerEvents="none";}
  const view=$("landscapeImageView");if(view)view.hidden=true;
  resetLandscapeImageViewTransform();
  // Keep the underlying normal-view image inert long enough to absorb the
  // synthetic click that follows pointerup on some Android browsers.
  setTimeout(()=>{if(trigger){trigger.disabled=false;trigger.style.pointerEvents="";}},420);
}
function navigateLandscapeImageView(delta){navigateImage(delta);resetLandscapeImageViewTransform();renderLandscapeImageView()}
$("tabletImageViewBtn")?.addEventListener("click",openLandscapeImageView);
$("landscapeImageViewPrevBtn")?.addEventListener("click",e=>{e.stopPropagation();navigateLandscapeImageView(-1)});
$("landscapeImageViewNextBtn")?.addEventListener("click",e=>{e.stopPropagation();navigateLandscapeImageView(1)});
const flagHoldState={timer:null,long:false,startedAt:0,button:null,pointerId:null};
function openFlagAdminDialog(){
  flagHoldState.long=true;
  const dialog=$("flagAdminDialog");
  if(!dialog)return;
  try{if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();else dialog.setAttribute("open","");}
  catch{dialog.setAttribute("open","");}
}
function beginFlagHold(e){
  if(e.pointerType==="mouse"&&e.button!==0)return;
  e.preventDefault();e.stopPropagation();
  clearTimeout(flagHoldState.timer);
  flagHoldState.long=false;flagHoldState.startedAt=performance.now();flagHoldState.button=e.currentTarget;flagHoldState.pointerId=e.pointerId;
  try{e.currentTarget?.setPointerCapture?.(e.pointerId);}catch{}
  flagHoldState.timer=setTimeout(()=>{flagHoldState.timer=null;navigator.vibrate?.(30);openFlagAdminDialog();},2000);
}
function finishFlagHold(e,cancelled=false){
  if(e){e.preventDefault?.();e.stopPropagation?.();}
  const elapsed=flagHoldState.startedAt?performance.now()-flagHoldState.startedAt:0;
  clearTimeout(flagHoldState.timer);flagHoldState.timer=null;
  // Some Android browsers emit pointercancel during a stationary long hold.
  // Treat a ~2 second cancelled hold as the intended administrative gesture.
  if(cancelled&&!flagHoldState.long&&elapsed>=1900)openFlagAdminDialog();
  if(!cancelled&&!flagHoldState.long&&elapsed<1900){
    const record=currentImageRecord();
    if(record){
      const next=flagSeverityForRecord(record)==="review"?"none":"review";
      try{
        const updated=window.genreactrixImagesEngine?.setFlagSeverity?.(record.id,next);
        state.flagged=Boolean(updated?.attributes?.flagged);landscapeFeedDirty=true;renderAll();renderLandscapeImageView();
        setDirectorStatus(next==="review"?"Image flagged for Review.":"Review flag cleared.");
      }catch(error){setDirectorStatus(`Flag could not be changed: ${error.message||error}`);}
    }
  }
  flagHoldState.startedAt=0;flagHoldState.button=null;flagHoldState.pointerId=null;
  setTimeout(()=>flagHoldState.long=false,80);
}
["landscapeImageViewFlagBtn","tabletFlagBtn"].forEach(id=>{
  const b=$(id);if(!b)return;
  b.style.touchAction="none";
  b.addEventListener("pointerdown",beginFlagHold,{passive:false});
  b.addEventListener("pointerup",e=>finishFlagHold(e,false),{passive:false});
  b.addEventListener("pointercancel",e=>finishFlagHold(e,true),{passive:false});
  b.addEventListener("contextmenu",e=>{e.preventDefault();e.stopPropagation();openFlagAdminDialog();});
  b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();},{capture:true});
});

// Finish a Flag hold even if Android releases the pointer outside the button.
document.addEventListener("pointerup",e=>{if(flagHoldState.pointerId===e.pointerId&&flagHoldState.startedAt)finishFlagHold(e,false);},{passive:false});
document.addEventListener("pointercancel",e=>{if(flagHoldState.pointerId===e.pointerId&&flagHoldState.startedAt)finishFlagHold(e,true);},{passive:false});
$("redDeleteAction")?.addEventListener("click",async()=>{
  $("flagAdminDialog")?.close();if(state.feedEmpty)return;const id=currentKey();
  const updated=await window.genreactrixImagesEngine?.setFlagSeverity?.(id,"delete");state.flagged=Boolean(updated?.attributes?.flagged);landscapeFeedDirty=true;
  setDirectorStatus("Delete selected. It will leave Feed when you navigate away.");renderFlag();renderLandscapeImageView();
});
$("hotMagentaRejectAction")?.addEventListener("click",async()=>{
  $("flagAdminDialog")?.close();if(state.feedEmpty)return;
  const id=currentKey();const updated=await window.genreactrixImagesEngine?.setFlagSeverity?.(id,"reject");state.flagged=Boolean(updated?.attributes?.flagged);landscapeFeedDirty=true;
  setDirectorStatus("Reject selected. It will leave Feed when you navigate away.");renderFlag();renderLandscapeImageView();
});
$("landscapeImageViewSaveBtn")?.addEventListener("click",e=>{e.stopPropagation();$("tabletSaveBtn")?.click();renderLandscapeImageView()});
$("landscapeImageViewDepotBtn")?.addEventListener("click",e=>{e.stopPropagation();toggleCurrentDepot()});
const landscapeImageCanvas=$("landscapeImageViewCanvas");
landscapeImageCanvas?.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();},{capture:true});
function landscapePointerDistance(){const p=[...landscapeImageViewState.pointers.values()];if(p.length<2)return 0;return Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)}
function landscapePointerMidpoint(){const p=[...landscapeImageViewState.pointers.values()];if(p.length<2)return{x:0,y:0};return{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}}
landscapeImageCanvas?.addEventListener("pointerdown",e=>{
  e.preventDefault();landscapeImageCanvas.setPointerCapture?.(e.pointerId);
  landscapeImageViewState.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY});
  landscapeImageViewState.downAt=performance.now();landscapeImageViewState.gestureMoved=false;
  if(landscapeImageViewState.pointers.size===2){landscapeImageViewState.pinched=true;landscapeImageViewState.gestureMoved=true;landscapeImageViewState.startDistance=landscapePointerDistance();landscapeImageViewState.startScale=landscapeImageViewState.scale;landscapeImageViewState.startMid=landscapePointerMidpoint();landscapeImageViewState.startX=landscapeImageViewState.x;landscapeImageViewState.startY=landscapeImageViewState.y}
  else if(landscapeImageViewState.pointers.size===1){landscapeImageViewState.panStartX=landscapeImageViewState.x;landscapeImageViewState.panStartY=landscapeImageViewState.y}
});
landscapeImageCanvas?.addEventListener("pointermove",e=>{
  const pointer=landscapeImageViewState.pointers.get(e.pointerId);if(!pointer)return;e.preventDefault();pointer.x=e.clientX;pointer.y=e.clientY;
  if(Math.hypot(pointer.x-pointer.startX,pointer.y-pointer.startY)>5)landscapeImageViewState.gestureMoved=true;
  if(landscapeImageViewState.pointers.size>=2){
    const distance=landscapePointerDistance();const midpoint=landscapePointerMidpoint();const ratio=landscapeImageViewState.startDistance?distance/landscapeImageViewState.startDistance:1;
    landscapeImageViewState.scale=Math.max(1,Math.min(8,landscapeImageViewState.startScale*ratio));
    landscapeImageViewState.x=landscapeImageViewState.startX+(midpoint.x-landscapeImageViewState.startMid.x);
    landscapeImageViewState.y=landscapeImageViewState.startY+(midpoint.y-landscapeImageViewState.startMid.y);
    if(landscapeImageViewState.scale===1){landscapeImageViewState.x=0;landscapeImageViewState.y=0}
    applyLandscapeImageViewTransform();return;
  }
  if(landscapeImageViewState.pointers.size===1 && landscapeImageViewState.scale>1){landscapeImageViewState.x=landscapeImageViewState.panStartX+(pointer.x-pointer.startX);landscapeImageViewState.y=landscapeImageViewState.panStartY+(pointer.y-pointer.startY);applyLandscapeImageViewTransform()}
});
function endLandscapeImagePointer(e){
  if(!landscapeImageViewState.pointers.has(e.pointerId))return;e.preventDefault();
  const wasSingle=landscapeImageViewState.pointers.size===1;const elapsed=performance.now()-landscapeImageViewState.downAt;
  landscapeImageViewState.pointers.delete(e.pointerId);
  if(wasSingle && !landscapeImageViewState.gestureMoved && !landscapeImageViewState.pinched && elapsed<550){closeLandscapeImageView();return}
  if(landscapeImageViewState.pointers.size===0){landscapeImageViewState.pinched=false;landscapeImageViewState.gestureMoved=false}
}
landscapeImageCanvas?.addEventListener("pointerup",endLandscapeImagePointer);
landscapeImageCanvas?.addEventListener("pointercancel",endLandscapeImagePointer);


// Canonical Image Record Engine + shared Images Engine.
// The Image Record Engine owns identity, Origin Metadata, workflow state, extensible metadata,
// analysis containers, locking, queries, integrity checks, and recycle-bin state.
// The Images Engine owns acquisition and blobs, and updates records only through this engine.
const IMAGE_RECORD_SCHEMA_VERSION=4;
const IMAGE_RECORDS_KEY="genreactrix-image-records-v1";
const LEGACY_IMAGE_ENGINE_MANIFEST_KEY="genreactrix-image-engine-manifest-v1";
const RECYCLE_RETENTION_KEY="genreactrix-recycle-retention-days";
const IMAGE_ENGINE_DB_NAME="genreactrix-image-engine";
const IMAGE_ENGINE_DB_VERSION=4;
const IMAGE_ENGINE_BLOB_STORE="image-blobs";
const IMAGE_ENGINE_THUMBNAIL_STORE="image-thumbnails";
const IMAGE_ENGINE_KEPT_STORE="kept-images";
const IMAGE_ENGINE_KEPT_ID_STORE="kept-image-ids";
const IMAGE_ENGINE_RED_FLAG_STORE="red-flag-records";
const IMAGE_ENGINE_HOT_MAGENTA_FLAG_STORE="hot-magenta-flag-records";
const HISTORY_ENGINE_STORE="history-events";

function createImageId(prefix="img"){
  const random=globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}
function safeUrl(value){
  try{ const url=new URL(String(value).trim()); return ["http:","https:"].includes(url.protocol)?url.href:""; }
  catch(error){ return ""; }
}
function openImageEngineDatabase(){
  return new Promise((resolve,reject)=>{
    if(!globalThis.indexedDB){ reject(new Error("IndexedDB is unavailable")); return; }
    const request=indexedDB.open(IMAGE_ENGINE_DB_NAME,IMAGE_ENGINE_DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      [IMAGE_ENGINE_BLOB_STORE,IMAGE_ENGINE_THUMBNAIL_STORE,IMAGE_ENGINE_KEPT_STORE,IMAGE_ENGINE_KEPT_ID_STORE,IMAGE_ENGINE_RED_FLAG_STORE,IMAGE_ENGINE_HOT_MAGENTA_FLAG_STORE].forEach(storeName=>{
        if(!db.objectStoreNames.contains(storeName))db.createObjectStore(storeName);
      });
      if(!db.objectStoreNames.contains(HISTORY_ENGINE_STORE)){
        const history=db.createObjectStore(HISTORY_ENGINE_STORE,{keyPath:"entryId"});
        history.createIndex("imageId","imageId",{unique:false});
        history.createIndex("eventType","eventType",{unique:false});
        history.createIndex("timestamp","timestamp",{unique:false});
        history.createIndex("batchId","batchId",{unique:false});
        history.createIndex("actor","actor",{unique:false});
      }
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error || new Error("Could not open image storage"));
  });
}
function imageStorePut(storeName,key,value){
  return openImageEngineDatabase().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,"readwrite");
    tx.objectStore(storeName).put(value,key);
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onerror=()=>{db.close();reject(tx.error);};
  }));
}
function imageStoreGet(storeName,key){
  return openImageEngineDatabase().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,"readonly");
    const request=tx.objectStore(storeName).get(key);
    request.onsuccess=()=>resolve(request.result ?? null);
    request.onerror=()=>reject(request.error);
    tx.oncomplete=()=>db.close();
  }));
}
function imageStoreDelete(storeName,key){
  return openImageEngineDatabase().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,"readwrite");
    tx.objectStore(storeName).delete(key);
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onerror=()=>{db.close();reject(tx.error);};
  }));
}
function imageStoreGetAll(storeName){
  return openImageEngineDatabase().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,"readonly");
    const request=tx.objectStore(storeName).getAll();
    request.onsuccess=()=>resolve(request.result||[]);
    request.onerror=()=>reject(request.error);
    tx.oncomplete=()=>db.close();
  }));
}
function imageStoreGetAllKeys(storeName){
  return openImageEngineDatabase().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(storeName,"readonly");
    const request=tx.objectStore(storeName).getAllKeys();
    request.onsuccess=()=>resolve(request.result||[]);
    request.onerror=()=>reject(request.error);
    tx.oncomplete=()=>db.close();
  }));
}
async function imageBlobPut(key,blob){await imageStorePut(IMAGE_ENGINE_BLOB_STORE,key,blob);await window.genreactrixProjectRuntimeEngine?.registerAsset?.({imageId:key,kind:'working-fullres',state:'working',database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_BLOB_STORE,storageKey:key,mimeType:blob?.type||'',size:blob?.size||0});}
async function imageBlobGet(key){
  const working=await imageStoreGet(IMAGE_ENGINE_BLOB_STORE,key);
  return working || imageStoreGet(IMAGE_ENGINE_KEPT_STORE,key);
}
async function imageBlobDelete(key){await imageStoreDelete(IMAGE_ENGINE_BLOB_STORE,key);await window.genreactrixProjectRuntimeEngine?.markAsset?.(key,'working-fullres','deleted',{database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_BLOB_STORE,storageKey:key});}
async function thumbnailBlobPut(key,blob){await imageStorePut(IMAGE_ENGINE_THUMBNAIL_STORE,key,blob);await window.genreactrixProjectRuntimeEngine?.registerAsset?.({imageId:key,kind:'thumbnail',state:'present',database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_THUMBNAIL_STORE,storageKey:key,mimeType:blob?.type||'',size:blob?.size||0});}
async function thumbnailBlobGet(key){return imageStoreGet(IMAGE_ENGINE_THUMBNAIL_STORE,key);}
async function keptBlobPut(key,blob){await imageStorePut(IMAGE_ENGINE_KEPT_STORE,key,blob);await window.genreactrixProjectRuntimeEngine?.registerAsset?.({imageId:key,kind:'kept-fullres',state:'kept',database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_KEPT_STORE,storageKey:key,mimeType:blob?.type||'',size:blob?.size||0});}
async function keptBlobGet(key){return imageStoreGet(IMAGE_ENGINE_KEPT_STORE,key);}
async function keptBlobDelete(key){await imageStoreDelete(IMAGE_ENGINE_KEPT_STORE,key);await window.genreactrixProjectRuntimeEngine?.markAsset?.(key,'kept-fullres','deleted',{database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_KEPT_STORE,storageKey:key});}
async function keptIdPut(key,value){return imageStorePut(IMAGE_ENGINE_KEPT_ID_STORE,key,value);}
async function keptIdGet(key){return imageStoreGet(IMAGE_ENGINE_KEPT_ID_STORE,key);}
async function keptIdDelete(key){return imageStoreDelete(IMAGE_ENGINE_KEPT_ID_STORE,key);}
async function exclusionRecordPut(category,key,value){
  const store=category==="red"?IMAGE_ENGINE_RED_FLAG_STORE:IMAGE_ENGINE_HOT_MAGENTA_FLAG_STORE;
  return imageStorePut(store,key,value);
}
async function exclusionRecordGet(category,key){
  const store=category==="red"?IMAGE_ENGINE_RED_FLAG_STORE:IMAGE_ENGINE_HOT_MAGENTA_FLAG_STORE;
  return imageStoreGet(store,key);
}
async function exclusionRecordDelete(category,key){
  const store=category==="red"?IMAGE_ENGINE_RED_FLAG_STORE:IMAGE_ENGINE_HOT_MAGENTA_FLAG_STORE;
  return imageStoreDelete(store,key);
}
function extensionForMime(mime=""){
  const type=String(mime).toLowerCase();
  if(type.includes("jpeg"))return ".jpg";
  if(type.includes("png"))return ".png";
  if(type.includes("gif"))return ".gif";
  if(type.includes("webp"))return ".webp";
  if(type.includes("avif"))return ".avif";
  if(type.includes("bmp"))return ".bmp";
  return ".img";
}
async function fetchImageBlob(url){
  let directError=null;
  try{
    const response=await fetch(url,{mode:"cors"});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const blob=await response.blob();
    if(!blob.type?.startsWith("image/"))throw new Error("URL did not return an image");
    return blob;
  }catch(error){directError=error;}
  if(window.GenreactrixCloudApi?.isConfigured?.()&&window.GenreactrixCloudApi?.getKey?.()){
    try{return await window.GenreactrixCloudApi.fetchImage(url);}catch(proxyError){throw new Error(`Could not retrieve image directly (${directError?.message||directError}) or through the configured Worker (${proxyError?.message||proxyError})`);}
  }
  throw directError||new Error("Could not retrieve image");
}
async function create64Thumbnail(blob){
  if(!blob?.type?.startsWith("image/"))throw new Error("Thumbnail source is not an image");
  if(typeof createImageBitmap!=="function")throw new Error("This browser cannot create image thumbnails");
  const bitmap=await createImageBitmap(blob);
  try{
    const canvas=document.createElement("canvas");canvas.width=64;canvas.height=64;
    const ctx=canvas.getContext("2d",{alpha:true});if(!ctx)throw new Error("Thumbnail canvas is unavailable");
    ctx.clearRect(0,0,64,64);
    const width=Math.max(1,bitmap.width||1),height=Math.max(1,bitmap.height||1),scale=Math.min(64/width,64/height);
    const drawWidth=Math.max(1,Math.round(width*scale)),drawHeight=Math.max(1,Math.round(height*scale));
    const x=Math.floor((64-drawWidth)/2),y=Math.floor((64-drawHeight)/2);
    ctx.drawImage(bitmap,x,y,drawWidth,drawHeight);
    const thumbnail=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Thumbnail encoding failed")),"image/webp",0.82));
    return thumbnail;
  }finally{bitmap.close?.();}
}

function createHistoryEngine(){
  const schemaVersion=1;
  const now=()=>new Date().toISOString();
  const clone=value=>value==null?value:structuredClone(value);
  const nextId=()=>createImageId("history");
  function withStore(mode,work){
    return openImageEngineDatabase().then(db=>new Promise((resolve,reject)=>{
      const tx=db.transaction(HISTORY_ENGINE_STORE,mode);
      const store=tx.objectStore(HISTORY_ENGINE_STORE);
      let result;
      try{result=work(store,tx);}catch(error){db.close();reject(error);return;}
      tx.oncomplete=()=>{db.close();resolve(result);};
      tx.onerror=()=>{db.close();reject(tx.error||new Error("History transaction failed"));};
      tx.onabort=()=>{db.close();reject(tx.error||new Error("History transaction aborted"));};
    }));
  }
  async function append(input={}){
    if(!input.imageId) throw new Error("History entry requires an Image ID");
    let previousEntryId=input.previousEntryId||null;
    if(!previousEntryId){
      const existing=await timeline(input.imageId);
      const category=String(input.eventType||"updated").split("-")[0];
      previousEntryId=existing.filter(entry=>String(entry.eventType).split("-")[0]===category).at(-1)?.entryId||null;
    }
    const entry={
      schemaVersion:Math.max(2,Number(input.schemaVersion)||schemaVersion),
      entryId:input.entryId||nextId(),
      projectId:input.projectId||window.genreactrixProjectRuntimeEngine?.projectId?.()||null,
      runtimeId:input.runtimeId||window.genreactrixProjectRuntimeEngine?.runtimeId?.()||null,
      imageId:input.imageId,
      eventType:input.eventType||"updated",
      timestamp:input.timestamp||now(),
      actor:input.actor||"system",
      sourceEngine:input.sourceEngine||"unknown",
      batchId:input.batchId||null,
      jobId:input.jobId||null,
      previousEntryId,
      summary:input.summary||"",
      payload:clone(input.payload||{})
    };
    await withStore("readwrite",store=>store.add(entry));
    window.dispatchEvent(new CustomEvent("genreactrix:history",{detail:{type:"appended",entry:clone(entry)}}));
    return clone(entry);
  }
  function collectByIndex(indexName,value,direction="next"){
    return openImageEngineDatabase().then(db=>new Promise((resolve,reject)=>{
      const tx=db.transaction(HISTORY_ENGINE_STORE,"readonly");
      const store=tx.objectStore(HISTORY_ENGINE_STORE);
      const source=indexName?store.index(indexName):store;
      const request=indexName?source.openCursor(IDBKeyRange.only(value),direction):source.openCursor(null,direction);
      const results=[];
      request.onsuccess=()=>{const cursor=request.result;if(cursor){results.push(clone(cursor.value));cursor.continue();}};
      request.onerror=()=>reject(request.error);
      tx.oncomplete=()=>{db.close();resolve(results);};
      tx.onerror=()=>{db.close();reject(tx.error);};
    }));
  }
  async function timeline(imageId){
    const entries=await collectByIndex("imageId",imageId);
    return entries.sort((a,b)=>String(a.timestamp).localeCompare(String(b.timestamp)));
  }
  async function eventsByType(eventType){return collectByIndex("eventType",eventType);}
  async function latest(imageId,eventType=null){
    const entries=(await timeline(imageId)).filter(entry=>!eventType||entry.eventType===eventType);
    return entries.at(-1)||null;
  }
  async function aiHistory(imageId){return (await timeline(imageId)).filter(entry=>entry.eventType.startsWith("ai-"));}
  async function directorHistory(imageId){return (await timeline(imageId)).filter(entry=>entry.eventType.startsWith("director-"));}
  async function lifecycleHistory(imageId){return (await timeline(imageId)).filter(entry=>["stage-changed","recycled","recycle-restored","recycle-purged","archived"].includes(entry.eventType));}
  async function storageHistory(imageId){return (await timeline(imageId)).filter(entry=>["downloaded","download-fallback","reference-downloaded","reference-saved","reference-missing","recycled","recycle-restored","recycle-purged"].includes(entry.eventType));}
  function diffValues(previous,current){
    const before=previous?.payload?.analysis||previous?.payload?.director||previous?.payload?.current||null;
    const after=current?.payload?.analysis||current?.payload?.director||current?.payload?.current||null;
    return {before:clone(before),after:clone(after),changed:JSON.stringify(before)!==JSON.stringify(after)};
  }
  async function compareEntries(firstId,secondId){
    const all=await collectByIndex(null,null);
    const first=all.find(entry=>entry.entryId===firstId)||null;
    const second=all.find(entry=>entry.entryId===secondId)||null;
    return {first,second,...diffValues(first,second)};
  }
  async function verifyContinuity(imageRecords=[]){
    const entries=await collectByIndex(null,null);
    const issues=[];
    const entryIds=new Set();
    const recordIds=new Set(imageRecords.map(record=>record.id));
    for(const entry of entries){
      if(entryIds.has(entry.entryId))issues.push({type:"duplicate-entry-id",entryId:entry.entryId});
      entryIds.add(entry.entryId);
      if(!recordIds.has(entry.imageId))issues.push({type:"history-without-record",entryId:entry.entryId,imageId:entry.imageId});
      if(entry.previousEntryId&&!entries.some(candidate=>candidate.entryId===entry.previousEntryId))issues.push({type:"broken-previous-link",entryId:entry.entryId,previousEntryId:entry.previousEntryId});
      if(Number.isNaN(Date.parse(entry.timestamp)))issues.push({type:"invalid-timestamp",entryId:entry.entryId});
    }
    return {checkedAt:now(),entryCount:entries.length,issueCount:issues.length,issues};
  }
  return {append,timeline,eventsByType,latest,aiHistory,directorHistory,lifecycleHistory,storageHistory,compareEntries,verifyContinuity};
}
window.genreactrixHistoryEngine=createHistoryEngine();
function appendHistory(entry){
  window.genreactrixHistoryEngine?.append(entry).catch(error=>console.warn("History entry could not be stored",error));
}

function createImageRecordEngine(){
  const now=()=>new Date().toISOString();
  const legacySideKey=["par","ked"].join("");
  const legacySideAtKey=["par","kedAt"].join("");
  const legacyPriorSideKey=["priorPar","ked"].join("");
  let records=[];
  try{ records=JSON.parse(localStorage.getItem(IMAGE_RECORDS_KEY)||"[]"); }catch(error){ records=[]; }
  if(!Array.isArray(records)||!records.length){
    try{ records=JSON.parse(localStorage.getItem(LEGACY_IMAGE_ENGINE_MANIFEST_KEY)||"[]"); }catch(error){ records=[]; }
  }
  const defaultComponents=()=>({
    aiReactions:"missing",aiThemes:"missing",aiDescription:"missing",aiEmotion:"missing",
    aiReactionReasons:"missing",aiGenreReasons:"missing",directorReactions:"missing",
    directorThemes:"missing",primFusion:"missing"
  });
  function normalize(record={}){
    const projectRuntime=window.genreactrixProjectRuntimeEngine,projectId=record.projectId||projectRuntime?.projectId?.()||'';
    const red=Boolean(record.attributes?.rejectionFlagged);
    const hot=Boolean(record.attributes?.rejected);
    const depot=Boolean(record.attributes?.depot)&&!red&&!hot;
    const legacyYellow=Boolean(record.attributes?.[legacySideKey]);
    const yellow=Boolean(record.attributes?.flagged||record.flaggedAt||legacyYellow)&&!depot&&!red&&!hot;
    const priorFlagged=record.storage?.recycle?.priorFlagged ?? record.storage?.recycle?.[legacyPriorSideKey] ?? null;
    const ext=record.metadata?.extended||{};
    const currentBundles=[...(Array.isArray(ext.inboxBundleIds)?ext.inboxBundleIds:[]),...(Array.isArray(ext.inboxPackIds)?ext.inboxPackIds:[])];
    const historyBundles=[...(Array.isArray(ext.inboxHistoryBundleIds)?ext.inboxHistoryBundleIds:[]),...(Array.isArray(ext.inboxHistoryPackIds)?ext.inboxHistoryPackIds:[])];
    const originPacks=[...(Array.isArray(ext.originPackIds)?ext.originPackIds:[]),record.source?.packId,ext.originPackId].filter(Boolean).map(String);
    const primaryCurrent=["aiReactions","aiThemes","aiDescription"].every(key=>record.components?.[key]==="current");
    const rawStage=record.workflow?.stage||({available:"available",queued:"queued",processed:"director-complete"}[record.lifecycleState]||record.lifecycleState||"imported");
    let stage=rawStage;
    if(["available","imported"].includes(rawStage))stage=primaryCurrent?"staged":"queued";
    else if(["ready-for-director","ready-director","ai-complete"].includes(rawStage))stage=currentBundles.length?"inbox-working":(primaryCurrent?"staged":"queued");
    else if(rawStage==="queued"&&primaryCurrent&&!currentBundles.length)stage="staged";
    if(currentBundles.length&&!['post-processing','purgatory','quarantine','defective','batched','red-excluded','hot-magenta-excluded','archived'].includes(stage))stage="inbox-working";
    const sourceBatch=record.source?.firstBatchId||record.batchId||null;
    const batchIds=Array.isArray(record.batchIds)?record.batchIds.filter(Boolean):(record.batchId?[record.batchId]:[]);
    const sourceType=record.source?.type||record.sourceType||"unknown";
    const storageMode=record.storage?.mode||record.storageState||"temporary";
    const thumbnailKey=record.storage?.thumbnailKey||null;
    return {
      schemaVersion:Number(record.schemaVersion)>IMAGE_RECORD_SCHEMA_VERSION?Number(record.schemaVersion):IMAGE_RECORD_SCHEMA_VERSION,
      projectId,
      runtime:{createdRuntimeId:record.runtime?.createdRuntimeId||null,lastProcessedRuntimeId:record.runtime?.lastProcessedRuntimeId||null},
      id:record.id||createImageId(),
      name:record.name||"Untitled image",
      createdAt:record.createdAt||record.addedAt||now(),
      accessedAt:record.accessedAt||null,
      updatedAt:record.updatedAt||record.addedAt||now(),
      source:{
        type:sourceType,
        originalLocation:record.source?.originalLocation||record.originalLocation||"",
        originalUrl:record.source?.originalUrl||record.originalUrl||"",
        originalFilename:record.source?.originalFilename||record.name||"",
        importMethod:record.source?.importMethod||record.acquisitionMode||"unknown",
        importJobId:record.source?.importJobId||record.metadata?.extended?.importJobId||null,
        packId:record.source?.packId||originPacks[0]||null,
        firstBatchId:sourceBatch,
        dataset:record.source?.dataset||null,
        license:record.source?.license||null,
        attribution:record.source?.attribution||null
      },
      storage:{
        mode:storageMode,
        temporaryKey:record.storage?.temporaryKey ?? (["temporary","reference","recycle"].includes(storageMode)?record.id:null),
        referenceKey:record.storage?.referenceKey ?? (["reference","kept"].includes(storageMode)?record.id:null),
        thumbnailKey,
        thumbnailMimeType:record.storage?.thumbnailMimeType||"",
        thumbnailSize:Number(record.storage?.thumbnailSize)||0,
        keptImageFilename:record.storage?.keptImageFilename||null,
        keptIdFilename:record.storage?.keptIdFilename||null,
        hyperlink:record.storage?.hyperlink||record.originalUrl||"",
        recycle:{
          deletedAt:record.storage?.recycle?.deletedAt||null,
          priorMode:record.storage?.recycle?.priorMode||null,
          priorStage:record.storage?.recycle?.priorStage||null,
          priorSaved:record.storage?.recycle?.priorSaved??null,
          priorFlagged,
          priorDepot:record.storage?.recycle?.priorDepot??false,
          priorRejectionFlagged:record.storage?.recycle?.priorRejectionFlagged??null,
          priorRejected:record.storage?.recycle?.priorRejected??null
        },
        missingReference:Boolean(record.storage?.missingReference),
        mimeType:record.storage?.mimeType||record.mimeType||"",
        size:Number(record.storage?.size ?? record.size)||0,
        lastModified:Number(record.storage?.lastModified ?? record.lastModified)||0,
        hash:record.storage?.hash||record.fileHash||""
      },
      workflow:{stage},
      attributes:{
        saved:Boolean(record.attributes?.saved||record.savedAt||storageMode==="reference"||storageMode==="kept"),
        flagged:yellow,
        locked:Boolean(record.attributes?.locked),
        hyperlinkOnly:Boolean(record.attributes?.hyperlinkOnly||storageMode==="linked"),
        needsReview:yellow,
        failed:Boolean(record.attributes?.failed||record.error),
        archived:Boolean(record.attributes?.archived),
        inRecycleBin:Boolean(record.attributes?.inRecycleBin||storageMode==="recycle"),
        depot,
        rejectionFlagged:red&&!hot,
        rejected:hot,
        seen:Boolean(record.attributes?.seen)
      },
      components:{...defaultComponents(),...(record.components||{})},
      analysis:{ai:record.analysis?.ai||null,director:record.analysis?.director||null},
      metadata:{core:record.metadata?.core||{},extended:{...ext,originPackId:ext.originPackId||record.source?.packId||originPacks[0]||null,originPackIds:[...new Set(originPacks)],inboxBundleIds:Array.isArray(ext.inboxBundleIds)?ext.inboxBundleIds:[...new Set(currentBundles.map(String))],inboxHistoryBundleIds:Array.isArray(ext.inboxHistoryBundleIds)?ext.inboxHistoryBundleIds:[...new Set(historyBundles.map(String))],lastInboxBundleId:ext.lastInboxBundleId||ext.lastInboxPackId||null}},
      batchIds,
      timestamps:{
        savedAt:record.timestamps?.savedAt||record.savedAt||null,
        flaggedAt:yellow?(record.timestamps?.flaggedAt||record.flaggedAt||record.timestamps?.[legacySideAtKey]||null):null,
        processedAt:record.timestamps?.processedAt||record.processedAt||null,
        depotAt:depot?(record.timestamps?.depotAt||null):null,
        rejectionFlaggedAt:red?(record.timestamps?.rejectionFlaggedAt||null):null,
        rejectedAt:hot?(record.timestamps?.rejectedAt||null):null,
        seenAt:record.timestamps?.seenAt||null,
        batchedAt:record.timestamps?.batchedAt||null
      },
      error:record.error||""
    };
  }
  records=records.map(normalize);
  const persist=()=>localStorage.setItem(IMAGE_RECORDS_KEY,JSON.stringify(records));
  persist();
  localStorage.removeItem(LEGACY_IMAGE_ENGINE_MANIFEST_KEY);
  const emit=(type,record,detail={})=>window.dispatchEvent(new CustomEvent("genreactrix:image-record",{detail:{type,imageId:record?.id||null,record:record?structuredClone(record):null,...detail}}));
  const mutable=id=>records.find(r=>r.id===id)||null;
  const clone=value=>value?structuredClone(value):null;
  function create(input={}){const record=normalize(input);if(mutable(record.id))throw new Error("Duplicate Image ID");records.push(record);persist();emit("created",record);appendHistory({imageId:record.id,eventType:"record-created",actor:"system",sourceEngine:"image-record",batchId:record.batchIds?.[0]||null,summary:"Image record created",payload:{current:clone(record)}});return clone(record);}
  function get(id,{touch=true}={}){const record=mutable(id);if(!record)return null;if(touch){record.accessedAt=now();record.updatedAt=now();persist();emit("accessed",record);}return clone(record);}
  function update(id,patch={},reason="updated"){
    const record=mutable(id);if(!record)return null;if(record.attributes.locked&&reason!=="unlock"&&reason!=="integrity"&&!reason.includes("migration"))throw new Error("Image record is locked");
    const merged=normalize({...record,...patch,projectId:record.projectId||window.genreactrixProjectRuntimeEngine?.projectId?.()||'',runtime:{...record.runtime,...(patch.runtime||{}),lastProcessedRuntimeId:window.genreactrixProjectRuntimeEngine?.runtimeId?.()||record.runtime?.lastProcessedRuntimeId||null},source:{...record.source,...(patch.source||{})},storage:{...record.storage,...(patch.storage||{}),recycle:{...record.storage.recycle,...(patch.storage?.recycle||{})}},workflow:{...record.workflow,...(patch.workflow||{})},attributes:{...record.attributes,...(patch.attributes||{})},components:{...record.components,...(patch.components||{})},analysis:{...record.analysis,...(patch.analysis||{})},metadata:{core:{...record.metadata.core,...(patch.metadata?.core||{})},extended:{...record.metadata.extended,...(patch.metadata?.extended||{})}},timestamps:{...record.timestamps,...(patch.timestamps||{})}});
    const before=clone(record);Object.assign(record,merged,{updatedAt:now()});persist();emit(reason,record);
    if(reason!=="accessed")appendHistory({imageId:record.id,eventType:reason,actor:reason.startsWith("ai-")?"ai":reason.startsWith("director-")?"director":"system",sourceEngine:"image-record",batchId:record.batchIds?.at(-1)||null,summary:reason.replaceAll("-"," "),payload:{before,current:clone(record),patch:clone(patch)}});
    return clone(record);
  }
  function setStage(id,stage){return update(id,{workflow:{stage}},"stage-changed");}
  function setAttribute(id,key,value){return update(id,{attributes:{[key]:Boolean(value)}},"attribute-changed");}
  function setComponent(id,key,status){return update(id,{components:{[key]:status}},"component-changed");}
  function attachAI(id,data,componentUpdates={}){return update(id,{analysis:{ai:{...data,recordedAt:now()}},components:componentUpdates},"ai-attached");}
  function attachDirector(id,data,componentUpdates={}){return update(id,{analysis:{director:{...data,recordedAt:now()}},components:componentUpdates},"director-attached");}
  function setLocked(id,locked){return update(id,{attributes:{locked:Boolean(locked)}},locked?"locked":"unlock");}
  function query(filters={}){return records.filter(record=>Object.entries(filters).every(([key,value])=>{
    if(key==="stage")return record.workflow.stage===value;
    if(key in record.attributes)return record.attributes[key]===value;
    if(key==="batchId")return record.batchIds.includes(value);
    if(key==="sourceType")return record.source.type===value;
    if(key==="component")return record.components[value]&&record.components[value]!=="missing";
    return true;
  })).map(clone);}
  function integrity(){
    const issues=[];const ids=new Set();
    records.forEach(record=>{
      if(ids.has(record.id))issues.push({imageId:record.id,type:"duplicate-id"});ids.add(record.id);
      if(!record.source.originalLocation&&!record.source.originalUrl)issues.push({imageId:record.id,type:"missing-origin-metadata"});
      if(record.attributes.inRecycleBin&&!record.storage.recycle.deletedAt)issues.push({imageId:record.id,type:"recycle-without-date"});
      if(record.schemaVersion>IMAGE_RECORD_SCHEMA_VERSION)issues.push({imageId:record.id,type:"future-schema"});
      if(!record.projectId)issues.push({imageId:record.id,type:"missing-project-id"});
      const terminals=[record.attributes.flagged,record.attributes.depot,record.attributes.rejectionFlagged,record.attributes.rejected].filter(Boolean).length;
      if(terminals>1)issues.push({imageId:record.id,type:"multiple-inbox-terminals"});
    });
    return {checkedAt:now(),recordCount:records.length,issueCount:issues.length,issues};
  }
  function migrateScope(){const pid=window.genreactrixProjectRuntimeEngine?.projectId?.()||'',rid=window.genreactrixProjectRuntimeEngine?.runtimeId?.()||null;let changed=0;for(const record of records){if(!record.projectId&&pid){record.projectId=pid;changed++}if(record.schemaVersion<IMAGE_RECORD_SCHEMA_VERSION){record.schemaVersion=IMAGE_RECORD_SCHEMA_VERSION;changed++}if(!record.runtime)record.runtime={createdRuntimeId:null,lastProcessedRuntimeId:null};if(!record.runtime.lastProcessedRuntimeId&&rid&&record.createdAt===record.updatedAt){/* creation runtime for legacy records is unknowable; do not fabricate it */}}if(changed)persist();return{projectId:pid,runtimeId:rid,updated:changed};}
  function all(){return records.map(clone);}
  function clearAllInMemory(){const count=records.length;records.length=0;return count;}
  return {create,get,update,setStage,setAttribute,setComponent,attachAI,attachDirector,setLocked,query,integrity,migrateScope,all,clearAllInMemory,_mutable:mutable};
}
window.genreactrixImageRecordEngine=createImageRecordEngine();

function createImagesEngine(){
  const records=window.genreactrixImageRecordEngine;
  let activeSessionIds=[];
  let objectUrls=new Map();
  const linkedDisplayInFlight=new Map();
  const now=()=>new Date().toISOString();
  const clone=value=>value==null?value:structuredClone(value);
  function revokeObjectUrls(){objectUrls.forEach(url=>URL.revokeObjectURL(url));objectUrls.clear();}
  function snapshot(){
    const all=records.all(),count=p=>all.filter(p).length;
    return {
      total:all.length,
      available:count(r=>r.workflow.stage==="queued"),
      queued:count(r=>["queued","ai-processing","ai-partial"].includes(r.workflow.stage)),
      staged:count(r=>r.workflow.stage==="staged"),
      processed:count(r=>r.analysis?.director?.completion==="complete"||["batched","red-excluded","hot-magenta-excluded"].includes(r.workflow.stage)),
      temporary:count(r=>r.storage.mode==="temporary"),linked:count(r=>r.storage.mode==="linked"),kept:count(r=>r.attributes.saved),
      yellow:count(r=>r.attributes.flagged),depot:count(r=>r.attributes.depot),red:count(r=>r.attributes.rejectionFlagged),hotMagenta:count(r=>r.attributes.rejected),
      recycle:count(r=>r.attributes.inRecycleBin)
    };
  }
  async function storeImportedImage({id,blob,thumbnail=null,keepFull=true}){
    const thumb=thumbnail||await create64Thumbnail(blob);
    if(keepFull)await imageBlobPut(id,blob);
    await thumbnailBlobPut(id,thumb);
    return {thumbnailKey:id,thumbnailMimeType:thumb.type||"image/webp",thumbnailSize:thumb.size||0};
  }
  async function makeOriginThumbnail(blob){return create64Thumbnail(blob);}
  async function fullBlobForOriginCheck(id){return await imageBlobGet(id).catch(()=>null)||await keptBlobGet(id).catch(()=>null)||null;}
  async function admitOriginCandidate({blob,source={},name='',mode='temporary',fingerprint='',thumbnailHash='',thumbnail=null,originGateId=null}={}){
    if(!blob)throw new Error("Origin candidate has no readable full-resolution image");
    const id=createImageId(source.type==='url'?'url':'local'),keepFull=mode!=='link'&&mode!=='linked',stored=await storeImportedImage({id,blob,thumbnail,keepFull});
    const record=records.create({id,projectId:window.genreactrixProjectRuntimeEngine?.projectId?.()||'',runtime:{createdRuntimeId:window.genreactrixProjectRuntimeEngine?.runtimeId?.()||null,lastProcessedRuntimeId:window.genreactrixProjectRuntimeEngine?.runtimeId?.()||null},name:name||source.originalFilename||'Imported image',source:{...source,importJobId:source.importJobId||null},storage:{mode:keepFull?'temporary':'linked',temporaryKey:keepFull?id:null,hyperlink:source.originalUrl||'',...stored,mimeType:blob.type||source.mimeType||'',size:blob.size||source.size||0,lastModified:Number(source.lastModified)||0,hash:fingerprint||''},workflow:{stage:'queued'},attributes:{hyperlinkOnly:!keepFull},metadata:{extended:{originGateId:originGateId||null,originPackId:source.packId||null,originPackIds:source.packId?[source.packId]:[],originThumbnailHash:thumbnailHash||''}},batchIds:[]});
    activeSessionIds=[...new Set([...activeSessionIds,record.id])];return record;
  }
  const IMAGE_FILE_RE=/\.(?:jpe?g|png|gif|webp|bmp|avif|heic|heif)$/i;
  function isImageFile(file){const type=String(file?.type||"").toLowerCase();return type.startsWith("image/")||IMAGE_FILE_RE.test(String(file?.name||""))}
  function imageMimeForFile(file){const type=String(file?.type||"").toLowerCase();if(type.startsWith("image/"))return type;const name=String(file?.name||"").toLowerCase();if(/\.jpe?g$/.test(name))return "image/jpeg";if(/\.png$/.test(name))return "image/png";if(/\.gif$/.test(name))return "image/gif";if(/\.webp$/.test(name))return "image/webp";if(/\.bmp$/.test(name))return "image/bmp";if(/\.avif$/.test(name))return "image/avif";if(/\.heic$/.test(name))return "image/heic";if(/\.heif$/.test(name))return "image/heif";return type}
  async function importFiles(fileList,{limit=null,importJobId=null,packId=null}={}){
    const files=[...fileList].filter(isImageFile),selected=Number.isFinite(limit)&&limit>0?files.slice(0,limit):files,created=[],gates=[];
    for(const file of selected){
      const source={type:'file',originalLocation:file.webkitRelativePath||file.name,originalFilename:file.name,importMethod:'temporary-copy',importJobId:importJobId||null,packId:packId||null,firstBatchId:null,size:file.size,lastModified:file.lastModified,mimeType:imageMimeForFile(file)};
      try{
        const gate=window.genreactrixOriginGateEngine?await window.genreactrixOriginGateEngine.inspectCandidate({blob:file,source,name:file.name,mode:'temporary',importJobId}):{disposition:'admit',source,mode:'temporary'};
        if(gate.disposition==='admit')created.push(await admitOriginCandidate({blob:file,source:gate.source||source,name:file.name,mode:'temporary',fingerprint:gate.fingerprint||'',thumbnailHash:gate.thumbnailHash||'',thumbnail:gate.thumbnail||null}));
        else if(gate.case)gates.push(gate.case);
      }catch(error){
        const c=await window.genreactrixOriginGateEngine?.registerImportFailure?.({source,name:file.name,error:String(error?.message||error),importJobId,blob:file});if(c)gates.push(c);
      }
    }
    activeSessionIds=created.map(r=>r.id);created.originGates=gates;created.attempted=selected.length;return created;
  }
  async function prefetchUrls(text,{limit=null}={}){
    const raw=String(text||"").split(/\r?\n|,\s*(?=https?:)/).map(safeUrl).filter(Boolean);
    const urls=Number.isFinite(limit)&&limit>0?raw.slice(0,limit):raw;
    return urls.map((url,index)=>({url,index,host:new URL(url).host,name:decodeURIComponent(new URL(url).pathname.split("/").pop()||`remote-${index+1}`)}));
  }
  async function importUrls(text,{limit=null,mode="link",prefetch=true,importJobId=null,packId=null}={}){
    const sources=await prefetchUrls(text,{limit}),created=[],gates=[],keepFull=mode==='download';
    for(const sourceItem of sources){
      const source={type:'url',originalLocation:sourceItem.url,originalUrl:sourceItem.url,originalFilename:sourceItem.name,importMethod:keepFull?'temporary-copy':'hyperlink-only',importJobId:importJobId||null,packId:packId||null,firstBatchId:null};
      try{
        const suppressed=await window.genreactrixOriginGateEngine?.inspectCandidate?.({blob:null,source,name:sourceItem.name,mode:keepFull?'temporary':'link',importJobId}).catch(()=>null);
        if(suppressed?.disposition==='import-failure-suppressed'){gates.push(suppressed.case);continue}
        const blob=await fetchImageBlob(sourceItem.url);source.size=blob.size;source.mimeType=blob.type||'';
        const gate=window.genreactrixOriginGateEngine?await window.genreactrixOriginGateEngine.inspectCandidate({blob,source,name:sourceItem.name,mode:keepFull?'temporary':'link',importJobId}):{disposition:'admit',source,mode:keepFull?'temporary':'link'};
        if(gate.disposition==='admit')created.push(await admitOriginCandidate({blob,source:gate.source||source,name:sourceItem.name,mode:keepFull?'temporary':'link',fingerprint:gate.fingerprint||'',thumbnailHash:gate.thumbnailHash||'',thumbnail:gate.thumbnail||null}));
        else if(gate.case)gates.push(gate.case);
      }catch(error){
        const c=await window.genreactrixOriginGateEngine?.registerImportFailure?.({source,name:sourceItem.name,error:String(error?.message||error),importJobId});if(c)gates.push(c);
      }
    }
    activeSessionIds=created.map(r=>r.id);created.originGates=gates;created.attempted=sources.length;return created;
  }
  async function admitOriginGate(caseId){
    const gate=await window.genreactrixOriginGateEngine?.get?.(caseId);if(!gate)throw new Error('Origin case not found');let blob=await window.genreactrixOriginGateEngine.getAsset(caseId,'full');if(!blob&&gate.source?.originalUrl)blob=await fetchImageBlob(gate.source.originalUrl);if(!blob)throw new Error('Origin candidate full-resolution source is unavailable');const thumb=await window.genreactrixOriginGateEngine.getAsset(caseId,'thumbnail').catch(()=>null);return admitOriginCandidate({blob,source:gate.source,name:gate.candidate?.name||gate.source?.originalFilename,mode:gate.candidate?.mode||'temporary',fingerprint:gate.candidate?.fingerprint||'',thumbnailHash:gate.candidate?.thumbnailHash||'',thumbnail:thumb,originGateId:gate.id});
  }
  async function reevaluateOriginRepeat(caseId){
    const gate=await window.genreactrixOriginGateEngine?.get?.(caseId);if(!gate?.matchedImageId)throw new Error('Repeat case has no prior Image Record');let record=records.get(gate.matchedImageId,{touch:false});if(!record)throw new Error('Prior Image Record not found');let blob=await window.genreactrixOriginGateEngine.getAsset(caseId,'full');if(!blob&&gate.source?.originalUrl)blob=await fetchImageBlob(gate.source.originalUrl);if(!blob)throw new Error('Re-evaluation source is unavailable');await imageBlobPut(record.id,blob);const priorBatchedAt=record.timestamps?.batchedAt||null,mode=record.storage?.mode==='kept'?'kept':'temporary';record=records.update(record.id,{workflow:{stage:'queued'},storage:{mode,temporaryKey:record.id,missingReference:false,mimeType:blob.type||record.storage?.mimeType,size:blob.size||record.storage?.size,hash:gate.candidate?.fingerprint||record.storage?.hash,recycle:{deletedAt:null}},attributes:{flagged:false,needsReview:false,depot:false,rejectionFlagged:false,rejected:false,inRecycleBin:false,failed:false},components:{aiReactions:'missing',aiThemes:'missing',aiDescription:'missing',aiEmotion:'missing',aiReactionReasons:'missing',aiGenreReasons:'missing',directorReactions:'missing',directorThemes:'missing',primFusion:'missing'},analysis:{ai:null,director:null},metadata:{extended:{inboxBundleIds:[],reevaluationRequestedAt:now(),reevaluationOriginCaseId:gate.id,reevaluationCount:(Number(record.metadata?.extended?.reevaluationCount)||0)+1,priorBatchedAt:priorBatchedAt||record.metadata?.extended?.priorBatchedAt||null}},timestamps:{processedAt:null,batchedAt:null}},'reevaluation-started');activeSessionIds=[...new Set([...activeSessionIds,record.id])];return record;
  }
  async function retryOriginGate(caseId,{housekeeping=false}={}){
    const gate=await window.genreactrixOriginGateEngine?.get?.(caseId);if(!gate)throw new Error('Origin case not found');
    if(gate.type==='source-retry'){
      const record=records.get(gate.matchedImageId,{touch:false});if(!record)throw new Error('Known Image Record not found');const url=gate.source?.originalUrl||record.storage?.hyperlink||record.source?.originalUrl;if(!url)throw new Error('No automatically retrievable source is recorded');const tries=housekeeping?1:3;let lastError=null;for(let i=0;i<tries;i++){try{const blob=await fetchImageBlob(url);await imageBlobPut(record.id,blob);records.update(record.id,{workflow:{stage:gate.evidence?.priorStage||record.metadata?.extended?.sourceRetryPriorStage||'queued'},storage:{temporaryKey:record.id,missingReference:false,mimeType:blob.type||record.storage?.mimeType,size:blob.size||record.storage?.size},metadata:{extended:{sourceRetryResolvedAt:now()}}},'source-recovered');await window.genreactrixOriginGateEngine.recordRetry(caseId,{success:true,resultType:'source-recovered'});return records.get(record.id,{touch:false})}catch(error){lastError=error}}await window.genreactrixOriginGateEngine.recordRetry(caseId,{success:false,error:String(lastError?.message||lastError||'Source retry failed')});throw lastError||new Error('Source retry failed');
    }
    if(gate.type!=='import-failure')throw new Error('Origin case is not retryable');let blob=await window.genreactrixOriginGateEngine.getAsset(caseId,'full');try{if(!blob&&gate.source?.originalUrl)blob=await fetchImageBlob(gate.source.originalUrl);if(!blob)throw new Error('Original source is not available for manual Retry');const result=await window.genreactrixOriginGateEngine.inspectCandidate({blob,source:gate.source,name:gate.candidate?.name||gate.source?.originalFilename,mode:gate.source?.type==='url'&&gate.source?.importMethod==='hyperlink-only'?'link':'temporary',importJobId:gate.importJobId,manualRetry:true});if(result.disposition==='admit'){const record=await admitOriginCandidate({blob,source:result.source||gate.source,name:gate.candidate?.name||gate.source?.originalFilename,mode:result.mode||'temporary',fingerprint:result.fingerprint||'',thumbnailHash:result.thumbnailHash||'',thumbnail:result.thumbnail||null,originGateId:gate.id});await window.genreactrixOriginGateEngine.recordRetry(caseId,{success:true,resultType:'admitted'});await window.genreactrixOriginGateEngine.recordAdmission?.(caseId,record.id);return record}await window.genreactrixOriginGateEngine.recordRetry(caseId,{success:true,resultType:result.disposition});return result.case||result}catch(error){await window.genreactrixOriginGateEngine.recordRetry(caseId,{success:false,error:String(error?.message||error)});throw error}
  }
  async function recoverKnownSource(record,{attempts=3,context="source-recovery"}={}){
    if(!record)return null;const url=record.storage?.hyperlink||record.source?.originalUrl||"";let lastError=null;
    if(url){for(let i=0;i<Math.max(1,Number(attempts)||1);i++){try{const blob=await fetchImageBlob(url);await imageBlobPut(record.id,blob);records.update(record.id,{storage:{temporaryKey:record.id,missingReference:false,mimeType:blob.type||record.storage?.mimeType,size:blob.size||record.storage?.size}},"source-recovered");return blob}catch(error){lastError=error}}}
    const source={...record.source,size:record.storage?.size,lastModified:record.storage?.lastModified};await window.genreactrixOriginGateEngine?.registerSourceRetry?.({imageId:record.id,source,error:String(lastError?.message||lastError||"Full-resolution source is unavailable"),context});return null;
  }
  async function fileForRecord(record){
    if(!record)return null;
    if(record.storage.mode==="linked"&&!record.attributes.saved){
      const cachedUrl=objectUrls.get(record.id);
      if(cachedUrl)return{id:record.id,name:record.name,url:cachedUrl,imageRecord:record,isRemoteSource:true,isResolvedRemoteSource:true,sourceUrl:record.storage.hyperlink||record.source.originalUrl,thumbnailKey:record.storage.thumbnailKey||record.id};
      return{id:record.id,name:record.name,url:record.storage.hyperlink||record.source.originalUrl,imageRecord:record,thumbnailKey:record.storage.thumbnailKey||record.id};
    }
    let blob=await imageBlobGet(record.id).catch(()=>null);if(!blob&&record.storage.mode==="kept")blob=await keptBlobGet(record.id).catch(()=>null);
    if(!blob&&["temporary","reference"].includes(record.storage.mode))blob=await recoverKnownSource(record,{attempts:3,context:"working-copy-missing"});
    if(!blob){
      const thumbnail=await thumbnailBlobGet(record.storage.thumbnailKey||record.id).catch(()=>null);
      if(thumbnail){
        const prior=objectUrls.get(record.id);if(prior)URL.revokeObjectURL(prior);
        const url=URL.createObjectURL(thumbnail);objectUrls.set(record.id,url);
        records.update(record.id,{storage:{missingReference:true}},"thumbnail-used");
        return{id:record.id,name:record.name,url,imageRecord:records.get(record.id,{touch:false}),isThumbnail:true};
      }
      records.update(record.id,{storage:{missingReference:true}},"reference-missing");const fallback=record.storage.hyperlink||record.source.originalUrl;return fallback?{id:record.id,name:record.name,url:fallback,imageRecord:record}:null;
    }
    const prior=objectUrls.get(record.id);if(prior)URL.revokeObjectURL(prior);
    const url=URL.createObjectURL(blob);objectUrls.set(record.id,url);records.update(record.id,{storage:{missingReference:false}},"accessed");
    return{id:record.id,name:record.name,url,imageRecord:records.get(record.id,{touch:false}),isThumbnail:false};
  }
  function cachedDisplayForRecord(record,reuseCached=true){
    const cachedUrl=reuseCached?objectUrls.get(record?.id):null;
    return cachedUrl?{id:record.id,name:record.name,url:cachedUrl,imageRecord:record,isCachedDisplay:true,isThumbnail:Boolean(record.storage?.missingReference)}:null;
  }
  async function resolveLinkedDisplayForRecord(record,{failedSrc=""}={}){
    if(!record)throw new Error("Linked Image Record is unavailable");
    const remote=record.storage?.hyperlink||record.source?.originalUrl||"";
    if(!/^https:\/\//i.test(remote))throw new Error("Linked source URL is unavailable");
    const cached=cachedDisplayForRecord(record,true);
    if(cached)return{...cached,isRemoteSource:true,isResolvedRemoteSource:true,sourceUrl:remote};
    const key=String(record.id||remote);
    if(linkedDisplayInFlight.has(key))return linkedDisplayInFlight.get(key);
    const task=(async()=>{
      const cloudApi=/** @type {any} */(window).GenreactrixCloudApi;
      if(!cloudApi?.isConfigured?.()||!cloudApi?.getKey?.())throw new Error("AI Worker image proxy is not configured");
      const blob=await cloudApi.fetchImage(remote);
      if(!blob?.type?.startsWith("image/"))throw new Error("Worker image proxy did not return image bytes");
      const prior=objectUrls.get(record.id);if(prior)try{URL.revokeObjectURL(prior)}catch{}
      const url=URL.createObjectURL(blob);objectUrls.set(record.id,url);
      return{id:record.id,name:record.name,url,imageRecord:record,isRemoteSource:true,isResolvedRemoteSource:true,sourceUrl:remote,isThumbnail:false};
    })().finally(()=>linkedDisplayInFlight.delete(key));
    linkedDisplayInFlight.set(key,task);
    return task;
  }
  async function displayFileForRecord(record,{allowRecovery=false,reuseCached=true}={}){
    if(!record)return null;
    const cached=cachedDisplayForRecord(record,reuseCached);
    if(cached){
      if(record.storage?.mode==="linked"&&!record.attributes?.saved)return{...cached,isRemoteSource:true,isResolvedRemoteSource:true,sourceUrl:record.storage?.hyperlink||record.source?.originalUrl||""};
      return cached;
    }
    if(record.storage?.mode==="linked"&&!record.attributes?.saved){
      const remote=record.storage?.hyperlink||record.source?.originalUrl||"";
      return remote?{id:record.id,name:record.name,url:remote,imageRecord:record,isRemoteSource:true}:missingAssetPlaceholder(record,'Linked source URL is unavailable.');
    }
    // Director display must never block on network source recovery. Resolve the
    // runtime-local working/kept asset first, then the permanent thumbnail, then
    // a direct recorded URL. Source recovery remains an explicit/Housekeeping job.
    let blob=await imageBlobGet(record.id).catch(()=>null);
    if(!blob&&record.storage?.mode==="kept")blob=await keptBlobGet(record.id).catch(()=>null);
    if(blob){
      const raced=cachedDisplayForRecord(record,reuseCached);if(raced)return raced;
      const prior=objectUrls.get(record.id);if(prior)URL.revokeObjectURL(prior);
      const url=URL.createObjectURL(blob);objectUrls.set(record.id,url);
      records.update(record.id,{storage:{missingReference:false}},"display-asset-accessed");
      return{id:record.id,name:record.name,url,imageRecord:records.get(record.id,{touch:false}),isThumbnail:false};
    }
    const thumbnail=await thumbnailBlobGet(record.storage?.thumbnailKey||record.id).catch(()=>null);
    if(thumbnail){
      const raced=cachedDisplayForRecord(record,reuseCached);if(raced)return raced;
      const prior=objectUrls.get(record.id);if(prior)URL.revokeObjectURL(prior);
      const url=URL.createObjectURL(thumbnail);objectUrls.set(record.id,url);
      records.update(record.id,{storage:{missingReference:true}},"display-thumbnail-used");
      return{id:record.id,name:record.name,url,imageRecord:records.get(record.id,{touch:false}),isThumbnail:true,fullResolutionUnavailable:true};
    }
    if(allowRecovery){
      const recovered=await recoverKnownSource(record,{attempts:1,context:"display-source-recovery"}).catch(()=>null);
      if(recovered){
        const raced=cachedDisplayForRecord(record,reuseCached);if(raced)return raced;
        const prior=objectUrls.get(record.id);if(prior)URL.revokeObjectURL(prior);
        const url=URL.createObjectURL(recovered);objectUrls.set(record.id,url);
        return{id:record.id,name:record.name,url,imageRecord:records.get(record.id,{touch:false}),isThumbnail:false};
      }
    }
    const remote=record.storage?.hyperlink||record.source?.originalUrl||"";
    if(remote)return{id:record.id,name:record.name,url:remote,imageRecord:record,isRemoteSource:true,fullResolutionUnavailable:true};
    records.update(record.id,{storage:{missingReference:true}},"display-reference-missing");
    return missingAssetPlaceholder(record,'No runtime-local full-resolution asset, thumbnail, or recorded source URL is available.');
  }
  function missingAssetPlaceholder(record,error=''){
    const name=String(record?.source?.originalFilename||record?.name||record?.id||'Image').slice(0,80),message=String(error||'Image asset unavailable').slice(0,120);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect width="900" height="900" fill="#100d16"/><rect x="34" y="34" width="832" height="832" rx="28" fill="none" stroke="#6b5c78" stroke-width="4"/><text x="450" y="410" text-anchor="middle" fill="#f4eef8" font-family="system-ui,sans-serif" font-size="42" font-weight="700">Image unavailable</text><text x="450" y="470" text-anchor="middle" fill="#b8aabd" font-family="system-ui,sans-serif" font-size="25">${name.replace(/[&<>]/g,'')}</text><text x="450" y="520" text-anchor="middle" fill="#8f8396" font-family="system-ui,sans-serif" font-size="20">${message.replace(/[&<>]/g,'')}</text></svg>`;
    return{id:record?.id||'',name:record?.name||name,url:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,imageRecord:record,isMissingAsset:true,error:String(error||'')};
  }
  async function workingFiles(ids=null){
    const selected=Array.isArray(ids)?ids:(activeSessionIds.length?activeSessionIds:records.query({stage:"queued"}).map(r=>r.id));
    const files=[];
    for(const id of selected){
      const record=records.get(id,{touch:false});if(!record)continue;
      try{const file=await fileForRecord(record);files.push(file||missingAssetPlaceholder(record,'No displayable full-resolution source or thumbnail is available.'))}
      catch(error){console.warn('Working image could not be materialized; preserving it in the visible population with a placeholder.',id,error);files.push(missingAssetPlaceholder(record,error?.message||error));}
    }
    return files;
  }
  async function displayFile(id,options={}){
    const record=records.get(id,{touch:false});if(!record)return null;
    try{return await displayFileForRecord(record,options)}
    catch(error){console.warn('Display image could not be materialized.',id,error);return missingAssetPlaceholder(record,error?.message||error)}
  }
  function setLifecycle(id,lifecycleState){const record=records.get(id,{touch:false});if(!record)return null;const processed=lifecycleState==="processed",stage=processed?(window.genreactrixLifecycleEngine?.inInbox?.(record)?"inbox-working":record.workflow.stage):lifecycleState;return records.update(id,{workflow:{stage},timestamps:processed?{processedAt:now()}:{}},"stage-changed");}
  function restoreStageFromHot(record){return record.workflow.stage==="rejected-hold"?(record.metadata?.extended?.rejectPriorStage||"inbox-working"):record.workflow.stage;}
  function setDepot(id,value=true){
    const record=records.get(id,{touch:false});if(!record)return null;
    if(!value)return records.update(id,{attributes:{depot:false},timestamps:{depotAt:null}},"depot-changed");
    const stage=restoreStageFromHot(record);
    return records.update(id,{workflow:{stage},attributes:{depot:true,flagged:false,needsReview:false,rejectionFlagged:false,rejected:false,inRecycleBin:false},metadata:{extended:{rejectPriorStage:null}},timestamps:{depotAt:now(),flaggedAt:null,rejectionFlaggedAt:null,rejectedAt:null}},"depot-changed");
  }
  function setFlagged(id,value=true){
    const record=records.get(id,{touch:false});if(!record)return null;
    if(value)return setFlagSeverity(id,"review");
    if(!record.attributes.flagged)return record;
    return records.update(id,{attributes:{flagged:false,needsReview:false},timestamps:{flaggedAt:null}},"flag-changed");
  }
  function setRejectionFlagged(id,value=true){
    const record=records.get(id,{touch:false});if(!record)return null;
    if(value)return setFlagSeverity(id,"delete");
    if(!record.attributes.rejectionFlagged)return record;
    return records.update(id,{attributes:{rejectionFlagged:false},timestamps:{rejectionFlaggedAt:null}},"rejection-flag-changed");
  }
  function setFlagSeverity(id,severity="none"){
    const record=records.get(id,{touch:false});if(!record)return null;
    const normalized=["none","review","delete","reject"].includes(severity)?severity:"none";
    const leavingHot=Boolean(record.attributes.rejected)&&normalized!=="reject";
    const stage=normalized==="reject"?restoreStageFromHot(record):(leavingHot?restoreStageFromHot(record):record.workflow.stage);
    const enteringHot=normalized==="reject"&&!record.attributes.rejected;
    return records.update(id,{
      workflow:{stage},
      attributes:{
        flagged:normalized==="review",needsReview:normalized==="review",depot:false,
        rejectionFlagged:normalized==="delete",rejected:normalized==="reject",inRecycleBin:false
      },
      metadata:{extended:{rejectPriorStage:enteringHot?record.workflow.stage:(normalized==="reject"?record.metadata?.extended?.rejectPriorStage||record.workflow.stage:null)}},
      timestamps:{flaggedAt:normalized==="review"?now():null,depotAt:null,rejectionFlaggedAt:normalized==="delete"?now():null,rejectedAt:normalized==="reject"?now():null}
    },"flag-severity-changed");
  }
  function setSeen(id,seen=true){return records.update(id,{attributes:{seen:Boolean(seen)},timestamps:{seenAt:seen?now():null}},"landscape-seen");}
  async function setKeep(id,value=true){
    let record=records.get(id,{touch:false});if(!record)throw new Error("Image record not found");
    const keep=Boolean(value);
    if(!keep){
      if(record.storage.mode==="kept")throw new Error("This kept asset has already been committed by Batch");
      if(record.metadata?.extended?.keepFetchedFromOrigin){await imageBlobDelete(id).catch(()=>{});}
      return records.update(id,{storage:{temporaryKey:record.metadata?.extended?.keepFetchedFromOrigin?null:record.storage.temporaryKey},attributes:{saved:false},metadata:{extended:{keepFetchedFromOrigin:false}},timestamps:{savedAt:null}},"keep-changed");
    }
    let fetchedForKeep=false;
    if(!await imageBlobGet(id).catch(()=>null)){
      const blob=await recoverKnownSource(record,{attempts:3,context:"keep-source-recovery"});
      if(!blob)throw new Error("Full-resolution source is unavailable; moved to Retry Import Source");
      fetchedForKeep=true;record=records.update(id,{storage:{temporaryKey:id,mimeType:blob.type,size:blob.size},metadata:{extended:{keepFetchedFromOrigin:true}}},"keep-source-fetched");
    }
    return records.update(id,{attributes:{saved:true},metadata:{extended:{keepFetchedFromOrigin:fetchedForKeep||Boolean(record.metadata?.extended?.keepFetchedFromOrigin)}},timestamps:{savedAt:now()}},"keep-changed");
  }
  async function saveReference(id){return setKeep(id,true);}
  async function commitKeptAsset(id){
    let record=records.get(id,{touch:false});if(!record)throw new Error("Image record not found");
    if(!record.attributes.saved)return record;
    if(record.storage.mode==="kept")return record;
    let blob=await imageBlobGet(id).catch(()=>null);
    if(!blob){const url=record.storage.hyperlink||record.source.originalUrl;if(url)blob=await fetchImageBlob(url);}
    if(!blob)throw new Error("Keep is on but the full-resolution image is unavailable");
    const extension=extensionForMime(blob.type||record.storage.mimeType),imageFilename=`${record.id}${extension}`,idFilename=`${record.id}.json`;
    await keptBlobPut(record.id,blob);
    await keptIdPut(record.id,{imageId:record.id,imageFilename,idFilename,mimeType:blob.type||record.storage.mimeType||"",size:blob.size||record.storage.size||0,thumbnailKey:record.storage.thumbnailKey||record.id,originMetadata:clone(record.source),recordedAt:now()});
    await imageBlobDelete(record.id).catch(()=>{});
    record=records.update(id,{storage:{mode:"kept",temporaryKey:null,referenceKey:id,keptImageFilename:imageFilename,keptIdFilename:idFilename,mimeType:blob.type||record.storage.mimeType,size:blob.size||record.storage.size,missingReference:false},attributes:{saved:true,hyperlinkOnly:false,inRecycleBin:false},metadata:{extended:{keepFetchedFromOrigin:false}}},"kept-asset-committed");
    return record;
  }
  async function writeExclusionRecord(id,category){
    const normalized=category==="red"?"red":"hot-magenta",record=records.get(id,{touch:false});if(!record)throw new Error("Image record not found");
    const payload={imageId:record.id,category:normalized,recordedAt:now(),reasonCode:null,thumbnailKey:record.storage.thumbnailKey||record.id,originMetadata:clone(record.source),workflow:clone(record.workflow),analysis:clone(record.analysis),metadata:clone(record.metadata),batchIds:clone(record.batchIds),timestamps:clone(record.timestamps)};
    await exclusionRecordPut(normalized==="red"?"red":"hot",record.id,payload);
    records.update(id,{metadata:{extended:{exclusionRecordCategory:normalized,exclusionRecordStoredAt:payload.recordedAt}}},normalized==="red"?"red-flag-recorded":"hot-magenta-flag-recorded");
    return payload;
  }
  async function finalizeDefective(id,{quarantineCaseId=null}={}){
    let record=records.get(id,{touch:false});if(!record)throw new Error("Image record not found");
    if(record.workflow?.stage!=="quarantine")throw new Error("Only a Quarantined image can be finalized as Defective");
    if(record.attributes?.locked)throw new Error("Image record is locked");
    const deletedAt=now();
    await imageBlobDelete(record.id).catch(()=>{});
    await keptBlobDelete(record.id).catch(()=>{});
    await keptIdDelete(record.id).catch(()=>{});
    const oldUrl=objectUrls.get(record.id);if(oldUrl){URL.revokeObjectURL(oldUrl);objectUrls.delete(record.id);}
    record=records.update(record.id,{
      storage:{mode:"none",temporaryKey:null,referenceKey:null,keptImageFilename:null,keptIdFilename:null,hyperlink:"",missingReference:false,recycle:{deletedAt:null,priorMode:null,priorStage:null,priorSaved:null,priorFlagged:null,priorDepot:false,priorRejectionFlagged:null,priorRejected:null}},
      workflow:{stage:"defective"},
      attributes:{saved:false,flagged:false,needsReview:false,depot:false,rejectionFlagged:false,rejected:false,inRecycleBin:false},
      metadata:{extended:{problemImage:true,quarantineCaseId:quarantineCaseId||record.metadata?.extended?.quarantineCaseId||null,finalDisposition:"defective",defectiveAt:deletedAt,fullResolutionDeletedAt:deletedAt}},
      timestamps:{savedAt:null,flaggedAt:null,depotAt:null,rejectionFlaggedAt:null,rejectedAt:null}
    },"defective-finalized");
    return record;
  }
  async function finalizePostProcessingPlan(plan={}){
    const id=String(plan.imageId||""),batchId=String(plan.batchId||""),planId=String(plan.id||"");
    if(!id||!batchId||!planId)throw new Error("Post-processing plan is incomplete");
    let record=records.get(id,{touch:false});if(!record)throw new Error("Image record not found");
    if(record.attributes?.locked)throw new Error("Image record is locked");
    const terminal=["depot","red","hot"].includes(plan.terminal)?plan.terminal:null;if(!terminal)throw new Error("Post-processing terminal decision is invalid");
    const keep=Boolean(plan.keep),finalStage=terminal==="red"?"red-excluded":terminal==="hot"?"hot-magenta-excluded":"batched";
    if(record.metadata?.extended?.lastPostProcessingPlanId===planId&&record.timestamps?.batchedAt){
      return{record,recycled:Boolean(record.attributes?.inRecycleBin),kept:record.storage?.mode==="kept",idempotent:true};
    }
    const exclusionCategory=terminal==="red"?"red":terminal==="hot"?"hot":null;
    const beforeKeptBlob=keep?await keptBlobGet(id).catch(()=>null):null;
    const beforeKeptId=keep?await keptIdGet(id).catch(()=>null):null;
    const beforeExclusion=exclusionCategory?await exclusionRecordGet(exclusionCategory,id).catch(()=>null):null;
    let wroteKeptBlob=false,wroteKeptId=false,wroteExclusion=false;
    try{
      let keepBlob=null,keepIdRecord=null;
      if(keep){
        keepBlob=await imageStoreGet(IMAGE_ENGINE_BLOB_STORE,id).catch(()=>null);
        if(!keepBlob)keepBlob=beforeKeptBlob||null;
        if(!keepBlob){const url=record.storage?.hyperlink||record.source?.originalUrl;if(url)keepBlob=await fetchImageBlob(url);}
        if(!keepBlob)throw new Error("Keep is on but the full-resolution image is unavailable");
        const extension=extensionForMime(keepBlob.type||record.storage?.mimeType),imageFilename=`${record.id}${extension}`,idFilename=`${record.id}.json`;
        keepIdRecord={imageId:record.id,imageFilename,idFilename,mimeType:keepBlob.type||record.storage?.mimeType||"",size:keepBlob.size||record.storage?.size||0,thumbnailKey:record.storage?.thumbnailKey||record.id,originMetadata:clone(record.source),recordedAt:now(),batchId,postProcessingPlanId:planId};
        await keptBlobPut(id,keepBlob);wroteKeptBlob=true;
        await keptIdPut(id,keepIdRecord);wroteKeptId=true;
      }
      let exclusionPayload=null;
      if(exclusionCategory){
        const normalized=exclusionCategory==="red"?"red":"hot-magenta";
        exclusionPayload={imageId:record.id,category:normalized,recordedAt:now(),reasonCode:null,thumbnailKey:record.storage?.thumbnailKey||record.id,originMetadata:clone(record.source),workflow:clone(record.workflow),analysis:clone(record.analysis),metadata:clone(record.metadata),batchIds:clone(record.batchIds),timestamps:clone(record.timestamps),batchId,postProcessingPlanId:planId};
        await exclusionRecordPut(exclusionCategory,id,exclusionPayload);wroteExclusion=true;
      }
      const committedAt=now(),storagePatch={},attributePatch={};let recycled=false;
      if(keep){
        const imageFilename=keepIdRecord?.imageFilename||record.storage?.keptImageFilename||null,idFilename=keepIdRecord?.idFilename||record.storage?.keptIdFilename||null;
        Object.assign(storagePatch,{mode:"kept",temporaryKey:null,referenceKey:id,keptImageFilename:imageFilename,keptIdFilename:idFilename,mimeType:keepBlob?.type||record.storage?.mimeType,size:keepBlob?.size||record.storage?.size,missingReference:false});
        Object.assign(attributePatch,{saved:true,hyperlinkOnly:false,inRecycleBin:false});
      }else if(record.storage?.mode==="temporary"||record.storage?.temporaryKey){
        const blob=await imageStoreGet(IMAGE_ENGINE_BLOB_STORE,id).catch(()=>null);if(!blob)throw new Error("Full-resolution working copy is unavailable for Recycle Bin routing");
        Object.assign(storagePatch,{mode:"recycle",recycle:recycleSnapshot(record)});Object.assign(attributePatch,{inRecycleBin:true});recycled=true;
      }
      const metadataExtended={lastBatchSubmissionId:batchId,lastBatchTerminal:terminal,lastPostProcessingPlanId:planId,postProcessingCompletedAt:committedAt};
      if(exclusionPayload){metadataExtended.exclusionRecordCategory=exclusionPayload.category;metadataExtended.exclusionRecordStoredAt=exclusionPayload.recordedAt;}
      record=records.update(id,{workflow:{stage:finalStage},storage:storagePatch,attributes:attributePatch,timestamps:{batchedAt:committedAt},metadata:{extended:metadataExtended}},"post-processing-committed");
      if(!record)throw new Error("Image record commit did not complete");
      if(keep)await imageBlobDelete(id).catch(error=>console.warn("Post-processing working-copy cleanup deferred",error));
      else if(recycled)await window.genreactrixProjectRuntimeEngine?.markAsset?.(id,'working-fullres','recycle',{database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_BLOB_STORE,storageKey:id,retention:{kind:'recycle-bin'}}).catch?.(()=>{});
      return{record,recycled,kept:keep,idempotent:false};
    }catch(error){
      const cleanupErrors=[];
      if(wroteExclusion)try{beforeExclusion?await exclusionRecordPut(exclusionCategory,id,beforeExclusion):await exclusionRecordDelete(exclusionCategory,id)}catch(cleanup){cleanupErrors.push(`exclusion cleanup: ${cleanup?.message||cleanup}`)}
      if(wroteKeptId)try{beforeKeptId?await keptIdPut(id,beforeKeptId):await keptIdDelete(id)}catch(cleanup){cleanupErrors.push(`kept ID cleanup: ${cleanup?.message||cleanup}`)}
      if(wroteKeptBlob)try{beforeKeptBlob?await keptBlobPut(id,beforeKeptBlob):await keptBlobDelete(id)}catch(cleanup){cleanupErrors.push(`kept image cleanup: ${cleanup?.message||cleanup}`)}
      if(cleanupErrors.length)error.postProcessingCleanupErrors=cleanupErrors;
      throw error;
    }
  }
  function recycleSnapshot(record){return{deletedAt:now(),priorMode:record.storage.mode,priorStage:record.workflow.stage,priorSaved:Boolean(record.attributes.saved),priorFlagged:Boolean(record.attributes.flagged),priorDepot:Boolean(record.attributes.depot),priorRejectionFlagged:Boolean(record.attributes.rejectionFlagged),priorRejected:Boolean(record.attributes.rejected)};}
  async function moveToRecycle(id){
    const record=records.get(id,{touch:false});if(!record||record.attributes.saved||record.attributes.inRecycleBin)return null;
    const blob=await imageStoreGet(IMAGE_ENGINE_BLOB_STORE,id).catch(()=>null);if(!blob)return record;
    const updated=records.update(id,{storage:{mode:"recycle",recycle:recycleSnapshot(record)},attributes:{inRecycleBin:true}},"recycled");
    await window.genreactrixProjectRuntimeEngine?.markAsset?.(id,'working-fullres','recycle',{database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_BLOB_STORE,storageKey:id,retention:{kind:'recycle-bin'}}).catch?.(()=>{});return updated;
  }
  async function moveAiFailureToRecycle(id){
    const record=records.get(id,{touch:false});if(!record)return null;if(record.attributes.inRecycleBin)return record;
    const updated=records.update(id,{storage:{mode:"recycle",referenceKey:null,recycle:recycleSnapshot(record)},workflow:{stage:"ai-failure-exported"},attributes:{saved:false,flagged:false,needsReview:false,depot:false,rejectionFlagged:false,rejected:false,inRecycleBin:true},timestamps:{savedAt:null,flaggedAt:null,depotAt:null,rejectionFlaggedAt:null,rejectedAt:null}},"ai-failure-exported");
    await window.genreactrixProjectRuntimeEngine?.markAsset?.(id,'working-fullres','recycle',{database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_BLOB_STORE,storageKey:id,retention:{kind:'recycle-bin'}}).catch?.(()=>{});return updated;
  }
  async function rejectImage(id){return setFlagSeverity(id,"reject");}
  async function cleanupProcessed(){return 0;}
  async function restoreFromRecycle(id){
    const record=records.get(id,{touch:false});if(!record?.attributes.inRecycleBin)return null;const prior=record.storage.recycle||{};
    const updated=records.update(id,{storage:{mode:prior.priorMode||"temporary",recycle:{deletedAt:null,priorMode:null,priorStage:null,priorSaved:null,priorFlagged:null,priorDepot:false,priorRejectionFlagged:null,priorRejected:null}},attributes:{inRecycleBin:false}},"recycle-restored");
    await window.genreactrixProjectRuntimeEngine?.markAsset?.(id,'working-fullres','working',{database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_BLOB_STORE,storageKey:id,retention:null}).catch?.(()=>{});return updated;
  }
  async function purgeRecycle({before=null,freeBytes=null,all=false}={}){
    let candidates=records.all().filter(r=>r.attributes.inRecycleBin&&!r.attributes.saved).sort((a,b)=>String(a.storage.recycle.deletedAt).localeCompare(String(b.storage.recycle.deletedAt)));
    if(before)candidates=candidates.filter(r=>r.storage.recycle.deletedAt&&new Date(r.storage.recycle.deletedAt)<new Date(before));
    let freed=0,purged=0;
    for(const record of candidates){
      if(!all&&!before&&Number.isFinite(freeBytes)&&freed>=freeBytes)break;
      await imageBlobDelete(record.id).catch(()=>{});freed+=record.storage.size||0;purged++;
      records.update(record.id,{storage:{mode:record.storage.hyperlink?"linked":"none",temporaryKey:null,referenceKey:null,recycle:{deletedAt:null,priorMode:null,priorStage:null,priorSaved:null,priorFlagged:null,priorDepot:false,priorRejectionFlagged:null,priorRejected:null}},attributes:{inRecycleBin:false,hyperlinkOnly:Boolean(record.storage.hyperlink)}},"recycle-purged");
    }
    return{purged,freed};
  }
  async function purgeExpired(){const days=Math.max(0,Number(window.genreactrixSettingsEngine?.get?.("recycle.retentionDays",30) ?? localStorage.getItem(RECYCLE_RETENTION_KEY))||30);if(days<=0)return{purged:0,freed:0};const before=new Date(Date.now()-days*86400000).toISOString();return purgeRecycle({before});}
  async function backfillMissingThumbnails({limit=50,includeRemote=false}={}){
    let updated=0,failed=0;
    for(const record of records.all().filter(r=>!r.storage.thumbnailKey).slice(0,Math.max(0,Number(limit)||0))){
      try{
        let blob=await imageBlobGet(record.id).catch(()=>null);
        if(!blob&&includeRemote&&(record.storage.hyperlink||record.source.originalUrl))blob=await fetchImageBlob(record.storage.hyperlink||record.source.originalUrl);
        if(!blob)continue;
        const thumb=await create64Thumbnail(blob);await thumbnailBlobPut(record.id,thumb);
        records.update(record.id,{storage:{thumbnailKey:record.id,thumbnailMimeType:thumb.type||"image/webp",thumbnailSize:thumb.size||0}},"thumbnail-backfilled");updated++;
      }catch(error){failed++;}
    }
    return{updated,failed};
  }
  async function backfillRuntimeAssetLocations(){const ctx=window.genreactrixProjectRuntimeEngine;if(!ctx?.registerAssets)return{registered:0};await ctx.ready;const runtimeId=ctx.runtimeId?.()||'runtime-local',projectId=ctx.projectId?.()||'project-local',marker=`genreactrix-runtime-asset-backfill-v2:${projectId}:${runtimeId}`;try{if(localStorage.getItem(marker)==='1')return{registered:0,skipped:true}}catch{}const [working,thumbs,kept]=await Promise.all([imageStoreGetAllKeys(IMAGE_ENGINE_BLOB_STORE),imageStoreGetAllKeys(IMAGE_ENGINE_THUMBNAIL_STORE),imageStoreGetAllKeys(IMAGE_ENGINE_KEPT_STORE)]),byId=new Map(records.all().map(r=>[String(r.id),r])),rows=[];for(const key of working){const r=byId.get(String(key));rows.push({imageId:key,kind:'working-fullres',state:r?.attributes?.inRecycleBin?'recycle':'working',database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_BLOB_STORE,storageKey:key,mimeType:r?.storage?.mimeType||'',size:r?.storage?.size||0,metadata:{backfilled:true}})}for(const key of thumbs){const r=byId.get(String(key));rows.push({imageId:key,kind:'thumbnail',state:'present',database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_THUMBNAIL_STORE,storageKey:key,mimeType:r?.storage?.thumbnailMimeType||'',size:r?.storage?.thumbnailSize||0,metadata:{backfilled:true}})}for(const key of kept){const r=byId.get(String(key));rows.push({imageId:key,kind:'kept-fullres',state:'kept',database:IMAGE_ENGINE_DB_NAME,store:IMAGE_ENGINE_KEPT_STORE,storageKey:key,mimeType:r?.storage?.mimeType||'',size:r?.storage?.size||0,metadata:{backfilled:true}})}await ctx.registerAssets(rows);try{localStorage.setItem(marker,'1')}catch{}return{registered:rows.length,working:working.length,thumbnails:thumbs.length,kept:kept.length};}
  async function verifyStorage(){
    const issues=[];
    for(const record of records.all()){
      if(record.workflow.stage!=="import-failed"){
        const thumbKey=record.storage.thumbnailKey||record.id,thumb=await thumbnailBlobGet(thumbKey).catch(()=>null);
        if(!thumb)issues.push({imageId:record.id,type:"missing-thumbnail"});
      }
      if(["temporary","reference","recycle"].includes(record.storage.mode)){
        const blob=await imageStoreGet(IMAGE_ENGINE_BLOB_STORE,record.id).catch(()=>null);if(!blob)issues.push({imageId:record.id,type:"missing-working-blob"});
      }else if(record.storage.mode==="kept"){
        const [blob,idRecord]=await Promise.all([keptBlobGet(record.id).catch(()=>null),keptIdGet(record.id).catch(()=>null)]);if(!blob)issues.push({imageId:record.id,type:"missing-kept-image"});if(!idRecord)issues.push({imageId:record.id,type:"missing-kept-id-record"});
      }
    }
    const recordIntegrity=records.integrity(),historyIntegrity=await window.genreactrixHistoryEngine.verifyContinuity(records.all());
    return{...recordIntegrity,storageIssues:issues,historyIntegrity,issueCount:recordIntegrity.issueCount+issues.length+historyIntegrity.issueCount};
  }
  function allRecords(){return records.all();}
  async function keptIdRecords(){return imageStoreGetAll(IMAGE_ENGINE_KEPT_ID_STORE);}
  async function exclusionRecords(category){return imageStoreGetAll(category==="red"?IMAGE_ENGINE_RED_FLAG_STORE:IMAGE_ENGINE_HOT_MAGENTA_FLAG_STORE);}
  return{snapshot,importFiles,prefetchUrls,importUrls,admitOriginCandidate,admitOriginGate,reevaluateOriginRepeat,retryOriginGate,makeOriginThumbnail,fullBlobForOriginCheck,workingFiles,displayFile,resolveLinkedDisplay:(id,options={})=>resolveLinkedDisplayForRecord(records.get(id,{touch:false}),options),missingAssetPlaceholder,setLifecycle,setFlagged,setDepot,setRejectionFlagged,setFlagSeverity,setSeen,setKeep,saveReference,commitKeptAsset,writeExclusionRecord,finalizeDefective,finalizePostProcessingPlan,cleanupProcessed,moveToRecycle,moveAiFailureToRecycle,rejectImage,restoreFromRecycle,purgeRecycle,purgeExpired,backfillMissingThumbnails,backfillRuntimeAssetLocations,verifyStorage,allRecords,recordById:id=>records.get(id,{touch:false}),thumbnailBlobGet,keptBlobGet,keptIdGet,keptIdRecords,exclusionRecordGet,exclusionRecords,revokeObjectUrls};
}
window.genreactrixImagesEngine=createImagesEngine();
window.genreactrixProjectRuntimeEngine?.ready?.then(()=>{window.genreactrixImageRecordEngine?.migrateScope?.();return window.genreactrixImagesEngine?.backfillRuntimeAssetLocations?.()}).catch(error=>console.warn('Project/runtime image migration could not complete',error));
if(window.genreactrixSettingsEngine?.ready)window.genreactrixOriginPackEngine?.migrateLegacy?.().catch(error=>console.warn('Origin Pack migration could not complete',error));
else window.addEventListener('genreactrix:settings-ready',()=>window.genreactrixOriginPackEngine?.migrateLegacy?.().catch(error=>console.warn('Origin Pack migration could not complete',error)),{once:true});
window.genreactrixImagesStartupReady=window.genreactrixImagesEngine.backfillMissingThumbnails({limit:50,includeRemote:false});
window.genreactrixImagesStartupReady.then(()=>rehydrateLandscapeFeed()).catch(error=>{console.warn(error);rehydrateLandscapeFeed().catch(console.warn);});
window.addEventListener('genreactrix:housekeeping',()=>{rehydrateLandscapeFeed().catch(console.warn);renderPortraitControlStation();});
window.addEventListener("genreactrix:image-record",event=>{
  const type=event.detail?.type||"external-refresh";
  if(["created","flag-changed","rejection-flag-changed","flag-severity-changed","depot-changed","keep-changed","red-flag-recorded","hot-magenta-flag-recorded","recycled","recycle-restored","recycle-purged","external-refresh","inbox-pack-pushed","ai-failure-exported","defective-finalized"].includes(type)||type.startsWith("theme-rerun-lifecycle-"))scheduleLandscapeRehydrate();
  if(type==="ai-attached"&&String(event.detail?.imageId||"")===String(currentKey())){
    delete state.aiRuns[String(event.detail.imageId)];
    renderTabletWorkbench();
  }
  renderPortraitInboxControls();
});

// v0.9.8.0 adds the persistent modular AI Analysis Engine while preserving the Control Station, Images, Image Record, and History engines.
// Portrait remains a client of shared capabilities. Quick buttons store references
// to engine actions plus validated parameter snapshots; they do not duplicate action logic.
const PORTRAIT_DEFAULT_AMOUNT_KEY="genreactrix-portrait-default-amount";
const AI_BUFFER_TARGET_KEY="genreactrix-ai-buffer-target";
const AI_QUICK_ADD_KEY="genreactrix-ai-quick-add";
const PORTRAIT_AI_OUTPUTS_KEY="genreactrix-portrait-ai-outputs";
const QUICK_PRESETS_KEY="genreactrix-quick-action-presets-v1";

function portraitDefaultAmount(){
  const input=document.getElementById("portraitDefaultAmount");
  const parsed=Math.max(1,Math.floor(Number(input?.value)||100));
  if(input) input.value=String(parsed);
  return parsed;
}
function syncPortraitDefaultAmount(){
  const input=document.getElementById("portraitDefaultAmount");
  if(!input) return;
  const saved=Math.max(1,Math.floor(Number(window.genreactrixSettingsEngine?.get?.("defaults.images.amount",100) ?? localStorage.getItem(PORTRAIT_DEFAULT_AMOUNT_KEY))||100));
  input.value=String(saved);
  input.addEventListener("change",()=>{
    const amount=portraitDefaultAmount();
    window.genreactrixSettingsEngine?.set?.("defaults.images.amount",amount);
    renderQuickButtons();
    setPortraitStationStatus(`Quick-add default set to ${amount} images.`);
  });
}

function selectedPortraitAiOutputs(){
  return Object.fromEntries([...document.querySelectorAll("[data-portrait-ai-output]")].map(item=>[item.dataset.portraitAiOutput,item.checked]));
}
function syncPortraitAiOutputs(){
  const controls=[...document.querySelectorAll("[data-portrait-ai-output]")];
  if(!controls.length) return;
  let saved={};
  try{ saved=window.genreactrixSettingsEngine?.get?.("ai.components.default",{}) || JSON.parse(localStorage.getItem(PORTRAIT_AI_OUTPUTS_KEY)||"{}"); }catch(error){ saved={}; }
  controls.forEach(control=>{
    if(Object.prototype.hasOwnProperty.call(saved,control.dataset.portraitAiOutput)) control.checked=Boolean(saved[control.dataset.portraitAiOutput]);
    control.addEventListener("change",()=>window.genreactrixSettingsEngine?.set?.("ai.components.default",selectedPortraitAiOutputs()));
  });
}


const QUICK_ACTIONS={
  "images.add-files":{
    module:"images",name:"Add image files",defaultLabel:"Add File",
    fields:[{key:"quantity",label:"Images",type:"number",min:1,getDefault:()=>portraitDefaultAmount()}],
    summarize:p=>[`Source: Files`,`Quantity: ${p.quantity}`],
    run:p=>{ const limit=Math.max(1,Number(p.quantity)||portraitDefaultAmount()); chooseImageFiles({limit}); }
  },
  "images.add-urls":{
    module:"images",name:"Add from URLs",defaultLabel:"URLs · Add",
    fields:[{key:"quantity",label:"Images",type:"number",min:1,getDefault:()=>portraitDefaultAmount()}],
    summarize:p=>[`Source: URLs`,`Quantity: ${p.quantity}`],
    run:p=>openImageIntakeDialog({quantity:p.quantity})
  },
  "batch.current":{
    module:"batch",name:"Batch eligible Inbox work",defaultLabel:"Batch current",
    fields:[],summarize:()=>["Eligible: Depot, Delete, Reject","Keep: independent full-resolution retention"],
    run:async()=>{try{const result=await window.genreactrixBatchEngine?.quickSubmit?.();if(result)setPortraitStationStatus(`Batch candidates loaded · ${result.outcomes.total} image${result.outcomes.total===1?"":"s"} · choose the images to Batch`)}catch(error){setPortraitStationStatus(error.message||String(error))}}
  },
  "ai.analyze-more":{
    module:"ai",name:"Analyze more images",defaultLabel:"Analyze more",
    fields:[
      {key:"quantity",label:"Images",type:"number",min:1,getDefault:()=>Math.max(1,Number(window.genreactrixSettingsEngine?.get?.("defaults.ai.quickAdd",100) ?? localStorage.getItem(AI_QUICK_ADD_KEY))||100)},
      {key:"outputs",label:"Outputs",type:"ai-outputs",getDefault:()=>selectedPortraitAiOutputs()}
    ],
    summarize:p=>{
      const labels={reactions:"Reactions",themes:"Themes",description:"Description",reactionReasons:"Reactions Info",genreReasons:"Themes Info"};
      const selected=Object.entries(p.outputs||{}).filter(([,on])=>on).map(([key])=>labels[key]);
      return [`Quantity: ${p.quantity}`,`Outputs: ${selected.join(", ")||"None"}`];
    },
    validate:p=>Object.values(p.outputs||{}).some(Boolean)?"":"Choose at least one AI output.",
    run:async p=>{
      const added=await window.genreactrixAiAnalysisEngine.queueNext(Math.max(1,Number(p.quantity)||100),p.outputs);
      setPortraitStationStatus(added?`${added} images added to the AI queue.`:"No additional unanalyzed images are available.");
    }
  },
  "queue.open":{module:"queue",name:"Open queue",defaultLabel:"Open queue",fields:[],summarize:()=>["View: Queue"],run:()=>window.genreactrixQueueEngine?.openConsole?.()},
  "reports.open":{module:"reports",name:"Open reports",defaultLabel:"Open reports",fields:[],summarize:()=>["View: Reports"],run:()=>window.genreactrixReportsEngine?.openConsole?.()}
};

const DEFAULT_QUICK_PRESETS={
  batch:{1:{visible:true,actionId:"batch.current",label:"Batch current",params:{}},2:{visible:false,actionId:"",label:"",params:{}}},
  images:{1:{visible:true,actionId:"images.add-files",label:"Add File",params:{}},2:{visible:true,actionId:"images.add-urls",label:"URLs · Add",params:{}}},
  ai:{1:{visible:true,actionId:"ai.analyze-more",label:"Analyze more",params:{}},2:{visible:false,actionId:"",label:"",params:{}}},
  queue:{1:{visible:false,actionId:"",label:"",params:{}},2:{visible:false,actionId:"",label:"",params:{}}},
  reports:{1:{visible:false,actionId:"",label:"",params:{}},2:{visible:false,actionId:"",label:"",params:{}}}
};

function loadQuickPresets(){
  let saved={};
  try{ saved=window.genreactrixSettingsEngine?.get?.("quick.presets",{}) || JSON.parse(localStorage.getItem(QUICK_PRESETS_KEY)||"{}"); }catch(error){ saved={}; }
  const merged=structuredClone(DEFAULT_QUICK_PRESETS);
  Object.keys(merged).forEach(module=>[1,2].forEach(slot=>{
    if(saved?.[module]?.[slot]){
      const legacy={...saved[module][slot]};
      if(legacy.actionId==="images.add-folder")legacy.actionId="images.add-files";
      if(legacy.label==="Folder · Add")legacy.label="Add File";
      merged[module][slot]={...merged[module][slot],...legacy,params:{...merged[module][slot].params,...(legacy.params||{})}};
    }
  }));
  return merged;
}
let quickPresets=loadQuickPresets();
function saveQuickPresets(){ window.genreactrixSettingsEngine?.set?.("quick.presets",quickPresets); }
function resolveActionParams(action,preset={}){
  const params={...(preset.params||{})};
  (action.fields||[]).forEach(field=>{
    if(params[field.key]===undefined || params[field.key]===null || params[field.key]==="") params[field.key]=field.getDefault?field.getDefault():"";
  });
  return params;
}
function renderQuickButtons(){
  document.querySelectorAll("[data-quick-slot]").forEach(button=>{
    const [module,slotText]=button.dataset.quickSlot.split(":");
    const preset=quickPresets?.[module]?.[Number(slotText)];
    const action=preset?.actionId?QUICK_ACTIONS[preset.actionId]:null;
    const visible=Boolean(preset?.visible&&action);
    button.hidden=!visible;
    if(!visible){ button.textContent=""; button.removeAttribute("data-action-id"); return; }
    const params=resolveActionParams(action,preset);
    let label=preset.label||action.defaultLabel||action.name;
    if(preset.actionId==="ai.analyze-more" && !preset.label) label=`Analyze +${params.quantity}`;
    button.textContent=label;
    button.dataset.actionId=preset.actionId;
    button.title="Long-press to edit this quick action";
  });
}
function executeQuickSlot(button){
  const [module,slotText]=button.dataset.quickSlot.split(":");
  const preset=quickPresets?.[module]?.[Number(slotText)];
  const action=preset?.actionId?QUICK_ACTIONS[preset.actionId]:null;
  if(!action) return;
  const params=resolveActionParams(action,preset);
  const error=action.validate?.(params);
  if(error){ openQuickAssignment(action,preset,Number(slotText)); return; }
  action.run(params);
}

let quickAssignment=null;
function fieldInputValue(field,root){
  if(field.type==="ai-outputs") return Object.fromEntries([...root.querySelectorAll("[data-assign-ai-output]")].map(input=>[input.dataset.assignAiOutput,input.checked]));
  const input=root.querySelector(`[data-assign-field="${field.key}"]`);
  return field.type==="number"?Math.max(Number(field.min)||0,Number(input?.value)||0):(input?.value||"");
}
function buildQuickFields(action,params){
  const root=document.getElementById("quickAssignFields");
  root.innerHTML="";
  (action.fields||[]).forEach(field=>{
    if(field.type==="ai-outputs"){
      const box=document.createElement("fieldset");
      box.className="quick-output-fields";
      box.innerHTML="<legend>Outputs</legend>";
      const labels={reactions:"Reactions",themes:"Themes",description:"Description",reactionReasons:"Reactions Info",genreReasons:"Themes Info"};
      Object.entries(labels).forEach(([key,label])=>{
        const item=document.createElement("label");
        item.innerHTML=`<input type="checkbox" data-assign-ai-output="${key}" ${params[field.key]?.[key]?"checked":""}> ${label}`;
        box.appendChild(item);
      });
      root.appendChild(box);
      return;
    }
    const label=document.createElement("label");
    label.textContent=field.label;
    const input=document.createElement("input");
    input.dataset.assignField=field.key;
    input.type=field.type||"text";
    if(field.min!==undefined) input.min=String(field.min);
    input.value=String(params[field.key]??"");
    label.appendChild(input);
    root.appendChild(label);
  });
}
function collectQuickAssignment(){
  const action=quickAssignment.action;
  const params={};
  (action.fields||[]).forEach(field=>params[field.key]=fieldInputValue(field,document.getElementById("quickAssignFields")));
  return {
    module:action.module,
    slot:Number(document.getElementById("quickAssignSlot").value),
    visible:document.getElementById("quickAssignVisible").checked,
    actionId:quickAssignment.actionId,
    label:document.getElementById("quickAssignLabel").value.trim()||action.defaultLabel||action.name,
    params
  };
}
function showQuickConfigure(){
  document.getElementById("quickAssignConfigure").hidden=false;
  document.getElementById("quickAssignReview").hidden=true;
}
function showQuickReview(){
  const candidate=collectQuickAssignment();
  const error=quickAssignment.action.validate?.(candidate.params);
  if(error){ setPortraitStationStatus(error); return; }
  quickAssignment.candidate=candidate;
  const lines=quickAssignment.action.summarize?.(candidate.params)||[];
  document.getElementById("quickAssignSummary").innerHTML=`
    <dl>
      <div><dt>Module</dt><dd>${candidate.module}</dd></div>
      <div><dt>Slot</dt><dd>Quick ${candidate.slot}</dd></div>
      <div><dt>Label</dt><dd>${candidate.label}</dd></div>
      <div><dt>Visible</dt><dd>${candidate.visible?"Yes":"No"}</dd></div>
      <div><dt>Action</dt><dd>${quickAssignment.action.name}</dd></div>
      ${lines.map(line=>{const [key,...rest]=line.split(":");return `<div><dt>${key}</dt><dd>${rest.join(":").trim()}</dd></div>`;}).join("")}
    </dl>`;
  document.getElementById("quickAssignConfigure").hidden=true;
  document.getElementById("quickAssignReview").hidden=false;
}
function openQuickAssignment(actionOrId,preset={},preferredSlot=1){
  const actionId=typeof actionOrId==="string"?actionOrId:Object.keys(QUICK_ACTIONS).find(key=>QUICK_ACTIONS[key]===actionOrId);
  const action=QUICK_ACTIONS[actionId];
  if(!action) return;
  const params=resolveActionParams(action,preset);
  quickAssignment={actionId,action,candidate:null};
  document.getElementById("quickAssignSlot").value=String(preferredSlot||1);
  document.getElementById("quickAssignLabel").value=preset.label||action.defaultLabel||action.name;
  document.getElementById("quickAssignVisible").checked=preset.visible!==false;
  buildQuickFields(action,params);
  showQuickConfigure();
  document.getElementById("quickAssignDialog")?.showModal();
}
function openModuleQuickManager(module){
  const existing=quickPresets[module]?.[1];
  const actionId=existing?.actionId || Object.keys(QUICK_ACTIONS).find(key=>QUICK_ACTIONS[key].module===module);
  if(actionId) openQuickAssignment(actionId,existing||{},1);
  else setPortraitStationStatus(`No quick actions are available for ${module} yet.`);
}

function bindLongPress(element,onLongPress){
  let timer=null,longPressed=false;
  const start=event=>{
    if(event.button!==undefined&&event.button!==0) return;
    longPressed=false;
    timer=setTimeout(()=>{ longPressed=true; onLongPress(event); },550);
  };
  const cancel=()=>{ if(timer) clearTimeout(timer); timer=null; };
  element.addEventListener("pointerdown",start);
  ["pointerup","pointercancel","pointerleave"].forEach(type=>element.addEventListener(type,cancel));
  element.addEventListener("click",event=>{
    if(longPressed){ event.preventDefault(); event.stopImmediatePropagation(); longPressed=false; }
  },true);
}

syncPortraitDefaultAmount();
syncPortraitAiOutputs();
window.addEventListener("genreactrix:settings-ready",()=>{ syncPortraitDefaultAmount(); syncPortraitAiOutputs(); renderQuickButtons(); },{once:true});
window.genreactrixAiAnalysisEngine?.maintainActiveMode?.();
renderQuickButtons();

document.querySelectorAll("[data-quick-slot]").forEach(button=>{
  button.addEventListener("click",()=>executeQuickSlot(button));
  bindLongPress(button,()=>{
    const [module,slotText]=button.dataset.quickSlot.split(":");
    const preset=quickPresets[module][Number(slotText)];
    if(preset?.actionId) openQuickAssignment(preset.actionId,preset,Number(slotText));
  });
});
document.querySelectorAll("[data-module-button]").forEach(button=>{
  const module=button.dataset.moduleButton;
  button.addEventListener("click",()=>{
    if(module==="images") window.genreactrixImagesConsole?.open?.();
    else if(module==="ai") window.genreactrixAiAnalysisEngine?.openConsole?.();
    else if(module==="batch") window.genreactrixBatchEngine?.openConsole?.();
    else if(module==="reports") window.genreactrixReportsEngine?.openConsole?.();
    else if(module==="queue") window.genreactrixQueueEngine?.openConsole?.();
    else setPortraitStationStatus(`Open the full ${button.textContent.trim()} console.`);
  });
  bindLongPress(button,()=>openModuleQuickManager(module));
});
document.getElementById("portraitMailboxBtn")?.addEventListener("click",()=>window.genreactrixNotificationsEngine?.openConsole?.());
document.querySelectorAll("[data-portrait-status]").forEach(button=>button.addEventListener("click",()=>{
  const target=button.dataset.portraitStatus||"";
  if(target.startsWith("batch-")||target==="inbox-total"||target==="saved-total"||target==="flagged-total") window.genreactrixBatchEngine?.openConsole?.();
  else if(target.startsWith("queue-")) window.genreactrixQueueEngine?.openConsole?.();
  else if(target==="post-processing"||target==="purgatory") window.genreactrixMaintenanceEngine?.openConsole?.();
  else if(target==="active-total") window.genreactrixHomeCountEngine?.snapshot?.().then(s=>setPortraitStationStatus(`Active ${s.activeImageTotal} = Origin ${s.originActive} + Queue ${s.queueTotal} + Quarantine ${s.quarantine} + Inbox ${s.inbox.total} + Post ${s.postProcessing} + Purgatory ${s.purgatory}`)).catch(console.warn);
  else if(target==="ai-main") window.genreactrixAiAnalysisEngine?.openConsole?.();
  else if(target.startsWith("reports-")) window.genreactrixReportsEngine?.openConsole?.();
  else if(target==="images-origin") { window.genreactrixImagesConsole?.open?.(); setTimeout(()=>document.querySelector('[data-images-section="dashboard"]')?.click(),0); }
  else if(target.startsWith("images-")) { window.genreactrixImagesConsole?.open?.(); const section=target.replace("images-",""); setTimeout(()=>document.querySelector(`[data-images-section="${section}"]`)?.click(),0); }
}));

document.querySelectorAll("[data-quick-dialog='cancel']").forEach(button=>button.addEventListener("click",()=>document.getElementById("quickAssignDialog")?.close()));
document.querySelector("[data-quick-dialog='review']")?.addEventListener("click",showQuickReview);
document.querySelector("[data-quick-dialog='edit']")?.addEventListener("click",showQuickConfigure);
document.querySelector("[data-quick-dialog='save']")?.addEventListener("click",()=>{
  const candidate=quickAssignment?.candidate;
  if(!candidate) return;
  quickPresets[candidate.module][candidate.slot]={visible:candidate.visible,actionId:candidate.actionId,label:candidate.label,params:candidate.params};
  saveQuickPresets();
  renderQuickButtons();
  document.getElementById("quickAssignDialog")?.close();
  setPortraitStationStatus(`${candidate.label} assigned to ${candidate.module} Quick ${candidate.slot}.`);
});


["genreactrix:image-record","genreactrix:batch","genreactrix:queue","genreactrix:bundle","genreactrix:post-processing","genreactrix:import-job","genreactrix:report","genreactrix:notification","genreactrix:settings"].forEach(type=>window.addEventListener(type,()=>refreshPortraitControlStation().catch(console.warn)));
window.addEventListener("orientationchange",()=>setTimeout(()=>{refreshPortraitControlStation().catch(console.warn);renderTabletWorkbench();},120));

function parseImageIntakeUrls(){ return document.getElementById("imageUrlList")?.value || ""; }
function openImageIntakeDialog({quantity=null}={}){
  const amount=Math.max(1,Number(quantity)||portraitDefaultAmount());
  if($("imageUrlQuantity")) $("imageUrlQuantity").value=String(amount);
  if($("imageIntakePreview")) $("imageIntakePreview").textContent="";
  $("imageIntakeDialog")?.showModal();
}
$("imageIntakeClose")?.addEventListener("click",()=>$("imageIntakeDialog")?.close());
$("imageIntakeFolderBtn")?.addEventListener("click",()=>{
  const limit=Math.max(1,Number($("imageUrlQuantity")?.value)||portraitDefaultAmount());
  $("imageIntakeDialog")?.close();
  chooseImageFiles({limit});
});
$("imageUrlPreviewBtn")?.addEventListener("click",async()=>{
  const quantity=Math.max(1,Number($("imageUrlQuantity")?.value)||portraitDefaultAmount());
  const sources=await window.genreactrixImagesEngine.prefetchUrls(parseImageIntakeUrls(),{limit:quantity});
  const mode=$("imageUrlMode")?.value||"link";
  $("imageIntakePreview").textContent=sources.length?`${sources.length} valid URL${sources.length===1?"":"s"} · ${mode==="download"?"working copies":"hyperlinks"}`:"No valid HTTP/HTTPS URLs found.";
});
$("imageUrlAddBtn")?.addEventListener("click",async()=>{
  const quantity=Math.max(1,Number($("imageUrlQuantity")?.value)||portraitDefaultAmount());
  const mode=$("imageUrlMode")?.value||"link";
  const prefetch=Boolean($("imageUrlPrefetch")?.checked);
  const button=$("imageUrlAddBtn"); button.disabled=true;
  try{
    const result=await window.genreactrixImportEngine.runUrls(parseImageIntakeUrls(),{limit:quantity,mode:mode==="download"?"temporary":"link",prefetch,target:"active-batch"});
    const records=result?.records||[];
    await rehydrateLandscapeFeed();
    const failures=records.filter(record=>record.error).length;
    $("imageIntakeDialog")?.close();
    setPortraitStationStatus(`${records.length} URL image${records.length===1?"":"s"} added as a Pack${failures?` · ${failures} download fallback${failures===1?"":"s"}`:""}.`);
    window.genreactrixAiAnalysisEngine?.maintainActiveMode?.().catch?.(()=>{});
  }catch(error){ $("imageIntakePreview").textContent=`Add failed: ${error.message||error}`; }
  finally{ button.disabled=false; renderPortraitControlStation(); }
});

renderPortraitControlStation();

// v0.9.22.0 Research Session Manager UI
(()=>{
'use strict';
let selectedSessionId=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function renderSessionLists(){const eng=window.genreactrixResearchSessionEngine;if(!eng)return;const sessions=await eng.allSessions();const active=await eng.active();selectedSessionId=selectedSessionId||active?.id||sessions[0]?.id||null;$('researchSessionStatus').textContent=active?`Active · ${active.name}`:'No active session';$('researchSessionList').innerHTML=sessions.map(s=>`<button class="research-session-item ${s.id===selectedSessionId?'active':''}" data-session-id="${s.id}"><strong>${esc(s.name)}</strong><div class="research-session-meta">${esc(s.status)} · ${new Date(s.updatedAt).toLocaleString()}</div></button>`).join('')||'<p>No sessions yet.</p>';await loadSelectedSession()}
async function loadSelectedSession(){const eng=window.genreactrixResearchSessionEngine;if(!eng||!selectedSessionId)return;const sessions=await eng.allSessions(),s=sessions.find(x=>x.id===selectedSessionId);if(!s)return;for(const [id,key] of [['researchSessionName','name'],['researchSessionDescription','description'],['researchSessionObjectives','objectives'],['researchSessionQuestions','questions'],['researchSessionConclusions','conclusions']])$(id).value=s[key]||'';const [sn,bm,ws,ac]=await Promise.all([eng.snapshots(s.id),eng.bookmarks(s.id),eng.workingSets(s.id),eng.activity(s.id)]);$('researchSnapshotList').innerHTML=sn.map(x=>`<button class="research-session-subitem" data-restore-snapshot="${x.id}">${esc(x.label)}<div class="research-session-meta">${new Date(x.createdAt).toLocaleString()}</div></button>`).join('')||'<p>None.</p>';$('researchBookmarkList').innerHTML=bm.map(x=>`<button class="research-session-subitem">${esc(x.type)} · ${esc(x.label)}</button>`).join('')||'<p>None.</p>';$('researchWorkingSetList').innerHTML=ws.map(x=>`<button class="research-session-subitem">${esc(x.name)} · ${x.imageIds.length} images</button>`).join('')||'<p>None.</p>';$('researchActivityList').innerHTML=ac.slice(0,30).map(x=>`<div class="research-session-subitem">${esc(x.summary)}<div class="research-session-meta">${new Date(x.createdAt).toLocaleString()}</div></div>`).join('')||'<p>None.</p>'}
async function openSessions(){await renderSessionLists();$('researchSessionDialog')?.showModal()}
window.addEventListener('DOMContentLoaded',()=>{
$('researchSessionsOpen')?.addEventListener('click',openSessions);$('researchSessionClose')?.addEventListener('click',()=>$('researchSessionDialog')?.close());$('researchSessionNew')?.addEventListener('click',async()=>{const name=prompt('Session name','Research session');if(!name)return;const s=await window.genreactrixResearchSessionEngine.createSession({name});selectedSessionId=s.id;await renderSessionLists()});$('researchSessionList')?.addEventListener('click',async e=>{const b=e.target.closest('[data-session-id]');if(!b)return;selectedSessionId=b.dataset.sessionId;await window.genreactrixResearchSessionEngine.setActive(selectedSessionId);await renderSessionLists()});$('researchSessionSave')?.addEventListener('click',async()=>{if(!selectedSessionId)return;await window.genreactrixResearchSessionEngine.updateSession(selectedSessionId,{name:$('researchSessionName').value,description:$('researchSessionDescription').value,objectives:$('researchSessionObjectives').value,questions:$('researchSessionQuestions').value,conclusions:$('researchSessionConclusions').value});await renderSessionLists()});$('researchSessionSnapshot')?.addEventListener('click',async()=>{const label=prompt('Snapshot label','Manual snapshot');if(label){await window.genreactrixResearchSessionEngine.snapshot(label);await renderSessionLists()}});$('researchSessionRestore')?.addEventListener('click',async()=>{const s=(await window.genreactrixResearchSessionEngine.allSessions()).find(x=>x.id===selectedSessionId);if(s)await window.genreactrixResearchSessionEngine.restoreWorkspace(s.workspace)});$('researchSessionBookmarkImage')?.addEventListener('click',async()=>{const id=window.genreactrixDirectorEngine?.getCurrentImageId?.()||window.currentImageId;if(id){await window.genreactrixResearchSessionEngine.bookmark('image',id,`Image ${id}`,window.genreactrixResearchSessionEngine.captureWorkspace());await renderSessionLists()}});$('researchSessionSearch')?.addEventListener('input',async e=>{const q=e.target.value.trim();if(!q){await renderSessionLists();return}const rows=await window.genreactrixResearchSessionEngine.search(q);$('researchSessionList').innerHTML=rows.map(x=>`<button class="research-session-item" data-session-id="${x.sessionId}"><strong>${esc(x.label)}</strong><div class="research-session-meta">${esc(x.kind)}</div></button>`).join('')||'<p>No matches.</p>'});$('researchSnapshotList')?.addEventListener('click',async e=>{const b=e.target.closest('[data-restore-snapshot]');if(!b)return;const list=await window.genreactrixResearchSessionEngine.snapshots(selectedSessionId),snap=list.find(x=>x.id===b.dataset.restoreSnapshot);if(snap)await window.genreactrixResearchSessionEngine.restoreWorkspace(snap.workspace)});
});
})();



// v0.9.39.24 — structured customs, editing/reordering, and evaluation-vocabulary versioning.
const EVALUATION_VERSION_KEY="genreactrix-evaluation-vocabulary-version-v1";
const EVALUATION_USED_KEY="genreactrix-evaluation-vocabulary-used-v1";
const CUSTOM_PLACEHOLDER_CLEANUP_KEY="genreactrix-custom-placeholder-cleanup-v1";
const customThemeDraft={reactionRefs:[],editingId:null};
const customReactionDraft={editingId:null};
const CUSTOM_REORDER_HOLD_MS=360;
function currentEvaluationVersion(){return localStorage.getItem(projectLocalKey(EVALUATION_VERSION_KEY))||localStorage.getItem(EVALUATION_VERSION_KEY)||"0.0.0";}
function setEvaluationVersion(v){localStorage.setItem(projectLocalKey(EVALUATION_VERSION_KEY),v);window.genreactrixProjectRuntimeEngine?.setProjectValue?.(EVALUATION_VERSION_KEY,v).catch?.(()=>{});window.dispatchEvent(new CustomEvent("genreactrix:evaluation-version",{detail:{version:v}}));return v;}
function bumpEvaluationVersion(kind){const parts=currentEvaluationVersion().split(".").map(n=>Number(n)||0);if(kind==="major")return setEvaluationVersion(`${parts[0]+1}.0.0`);if(kind==="minor")return setEvaluationVersion(`${parts[0]}.${parts[1]+1}.0`);return setEvaluationVersion(`${parts[0]}.${parts[1]}.${parts[2]+1}`);}
function taxonomyHasBeenUsed(){return (localStorage.getItem(projectLocalKey(EVALUATION_USED_KEY))||localStorage.getItem(EVALUATION_USED_KEY))==="1";}
async function lockBatchEvaluationVersion(){const engine=window.genreactrixBatchEngine;if(!engine?.active||!engine?.update)return;const batch=await engine.active();if(!batch)return;const version=batch.evaluationVersion||currentEvaluationVersion();if(!batch.evaluationVersion)await engine.update(batch.id,{evaluationVersion:version},"evaluation-version-locked");}
async function flagCurrentBatchForReevaluation(reason,previousVersion,newVersion){const batch=await window.genreactrixBatchEngine?.active?.();const records=window.genreactrixImageRecordEngine;if(!batch||!records?.get||!records?.update)return;for(const id of batch.imageIds||[]){const record=records.get(id,{touch:false});if(!record?.analysis?.director)continue;records.update(id,{attributes:{needsReevaluation:true},analysis:{evaluationVersion:record.analysis?.evaluationVersion||previousVersion,reevaluationReason:reason,reevaluationTargetVersion:newVersion}},"evaluation-recheck-required");}await window.genreactrixBatchEngine.update(batch.id,{reevaluationRequired:true,reevaluationTargetVersion:newVersion},"batch-evaluation-vocabulary-changed");}
async function registerVocabularyMutation(kind,reason){if(!taxonomyHasBeenUsed())return currentEvaluationVersion();const previous=currentEvaluationVersion(),next=bumpEvaluationVersion(kind);await flagCurrentBatchForReevaluation(reason,previous,next);return next;}
function cleanupPlaceholderCustoms(){const placeholders=new Set(["horror","dreamcore","horny","none"]);const themes=(state.customThemes||[]).filter(x=>!placeholders.has(String(x.label||"").trim().toLowerCase()));const reactions=(state.customReactions||[]).filter(x=>!placeholders.has(String(x.label||"").trim().toLowerCase()));if(themes.length!==(state.customThemes||[]).length)saveCustomThemes(themes);if(reactions.length!==(state.customReactions||[]).length)saveCustomReactions(reactions);localStorage.setItem(CUSTOM_PLACEHOLDER_CLEANUP_KEY,"2");}
function customThemeValidation(){const label=$("customThemeLabel")?.value.trim()||"";const id=`custom-theme:${slugifyCustom(label)}`;const keys=customThemeDraft.reactionRefs.map(reactionRefKey);if(!label)return{valid:false,message:"Theme name is required."};if((state.customThemes||[]).some(item=>item.id===id&&item.id!==customThemeDraft.editingId))return{valid:false,message:"A custom theme with that name already exists."};if(new Set(keys).size!==keys.length)return{valid:false,message:"Duplicate reactions are not allowed. Edit the expression before saving."};return{valid:true,message:""};}
function customReactionValidation(){const label=$("customReactionLabel")?.value.trim()||"",emoji=$("customReactionEmoji")?.value.trim()||"";const id=`custom-reaction:${slugifyCustom(label)}`;if(!label||!emoji)return{valid:false,message:"Reaction word/name and emoji are required."};if((state.customReactions||[]).some(item=>item.id===id&&item.id!==customReactionDraft.editingId))return{valid:false,message:"A custom reaction with that name already exists."};return{valid:true,message:""};}
function updateCustomDialogValidation(showMessage=false){const tv=customThemeValidation(),rv=customReactionValidation();if($("customThemeSaveBtn"))$("customThemeSaveBtn").disabled=!tv.valid;if($("customReactionSaveBtn"))$("customReactionSaveBtn").disabled=!rv.valid;if($("customThemeStatus"))$("customThemeStatus").textContent=showMessage&&!tv.valid?tv.message:"";if($("customReactionStatus"))$("customReactionStatus").textContent=showMessage&&!rv.valid?rv.message:"";}
function moveDraftReaction(chip,target){const from=Number(chip.dataset.index),to=Number(target.dataset.index);if(from===to||!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=customThemeDraft.reactionRefs.length||to>=customThemeDraft.reactionRefs.length)return;const[item]=customThemeDraft.reactionRefs.splice(from,1);customThemeDraft.reactionRefs.splice(to,0,item);renderCustomThemePicker();}
function wireLongPressReorder(chip){let timer=0,active=false,pointerId=null;const stop=()=>{clearTimeout(timer);timer=0;if(active){active=false;chip.classList.remove("reordering");document.body.classList.remove("custom-reorder-active");}if(pointerId!==null&&chip.hasPointerCapture?.(pointerId))chip.releasePointerCapture(pointerId);pointerId=null;};chip.addEventListener("pointerdown",e=>{if(e.button!==undefined&&e.button!==0)return;pointerId=e.pointerId;timer=setTimeout(()=>{active=true;chip.classList.add("reordering");document.body.classList.add("custom-reorder-active");chip.setPointerCapture?.(e.pointerId);navigator.vibrate?.(25);},CUSTOM_REORDER_HOLD_MS);});chip.addEventListener("pointermove",e=>{if(!active)return;e.preventDefault();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest?.(".custom-expression-chip");if(target&&target!==chip)moveDraftReaction(chip,target);});chip.addEventListener("pointerup",stop);chip.addEventListener("pointercancel",stop);chip.addEventListener("lostpointercapture",stop);}
function renderCustomExpressionPreview(){const preview=$("customThemeExpressionPreview");if(!preview)return;preview.innerHTML="";if(!customThemeDraft.reactionRefs.length){preview.classList.add("empty");return;}preview.classList.remove("empty");customThemeDraft.reactionRefs.forEach((ref,index)=>{const record=reactionRecordFromRef(ref);const chip=document.createElement("button");chip.type="button";chip.className="custom-expression-chip";chip.dataset.index=String(index);chip.title=record?.label||"Missing reaction";chip.innerHTML=`<span aria-hidden="true">${record?.emoji||"?"}</span><i aria-hidden="true">×</i>`;chip.querySelector("i")?.addEventListener("click",e=>{e.stopPropagation();customThemeDraft.reactionRefs.splice(index,1);renderCustomThemePicker();});wireLongPressReorder(chip);preview.appendChild(chip);});}
function renderCustomThemePicker(){const root=$("customThemeReactionPicker");if(!root)return;root.innerHTML="";allReactionRecords().forEach(record=>{const ref={type:record.type,id:record.id},key=reactionRefKey(ref),selected=customThemeDraft.reactionRefs.some(item=>reactionRefKey(item)===key);const b=document.createElement("button");b.type="button";b.className="custom-reaction-choice"+(selected?" selected":"");b.innerHTML=`<span>${record.emoji}</span>`;b.title=record.label;b.setAttribute("aria-label",record.label);b.addEventListener("click",()=>{const index=customThemeDraft.reactionRefs.findIndex(item=>reactionRefKey(item)===key);if(index>=0)customThemeDraft.reactionRefs.splice(index,1);else customThemeDraft.reactionRefs.push(ref);renderCustomThemePicker();});root.appendChild(b);});renderCustomExpressionPreview();updateCustomDialogValidation();}
function safelyShowDialog(dialog){
  if(!dialog)return false;
  dialog.hidden=false;
  dialog.style.removeProperty("display");
  try{
    if(!dialog.open&&typeof dialog.showModal==="function")dialog.showModal();
    if(!dialog.open)dialog.setAttribute("open","");
  }catch(error){
    console.warn("Dialog fallback",error);
    dialog.setAttribute("open","");
  }
  dialog.style.zIndex="2147483000";
  return true;
}
function openCustomReactionDialog(record=null){customReactionDraft.editingId=record?.id||null;if($("customReactionDialogTitle"))$("customReactionDialogTitle").textContent=record?"Edit Custom Reaction":"Add Custom Reaction";if($("customReactionLabel"))$("customReactionLabel").value=record?.label||"";if($("customReactionEmoji"))$("customReactionEmoji").value=record?.emoji||"";if($("customReactionDeleteBtn"))$("customReactionDeleteBtn").hidden=!record;if($("customReactionStatus"))$("customReactionStatus").textContent="";updateCustomDialogValidation();const dialog=$("customReactionDialog");safelyShowDialog(dialog);requestAnimationFrame(()=>$("customReactionLabel")?.focus());}
function openCustomThemeDialog(record=null){customThemeDraft.editingId=record?.id||null;customThemeDraft.reactionRefs=normalizedReactionRefs(record||{});if($("customThemeDialogTitle"))$("customThemeDialogTitle").textContent=record?"Edit Custom Theme":"Add Custom Theme";if($("customThemeLabel"))$("customThemeLabel").value=record?.label||"";if($("customThemeDeleteBtn"))$("customThemeDeleteBtn").hidden=!record;if($("customThemeStatus"))$("customThemeStatus").textContent="";renderCustomThemePicker();const dialog=$("customThemeDialog");safelyShowDialog(dialog);requestAnimationFrame(()=>$("customThemeLabel")?.focus());}
window.openCustomReactionDialog=openCustomReactionDialog;window.openCustomThemeDialog=openCustomThemeDialog;window.saveCustomReactionFromDialog=saveCustomReactionFromDialog;window.saveCustomThemeFromDialog=saveCustomThemeFromDialog;
async function saveCustomReactionFromDialog(){const validation=customReactionValidation();if(!validation.valid){updateCustomDialogValidation(true);return;}const label=$("customReactionLabel").value.trim(),emoji=$("customReactionEmoji").value.trim(),id=`custom-reaction:${slugifyCustom(label)}`,before=(state.customReactions||[]).find(x=>x.id===customReactionDraft.editingId);const record=normalizeCustomReaction({...(before||{}),id,label,emoji,updatedAt:new Date().toISOString()});saveCustomReactions([...(state.customReactions||[]).filter(x=>x.id!==customReactionDraft.editingId),record]);try{if(before)await registerVocabularyMutation("major","custom reaction edited");else if(taxonomyHasBeenUsed())await registerVocabularyMutation("major","custom reaction added");}catch(error){console.warn("Custom reaction vocabulary log failed",error);}$("customReactionDialog")?.close();tabletLandscapeView.face="judgment";tabletLandscapeView.customs=true;renderAll();renderLandscapeCustoms();renderCustomThemePicker();}
async function saveCustomThemeFromDialog(){const validation=customThemeValidation();if(!validation.valid){updateCustomDialogValidation(true);return;}const label=$("customThemeLabel").value.trim(),id=`custom-theme:${slugifyCustom(label)}`,before=(state.customThemes||[]).find(x=>x.id===customThemeDraft.editingId);const record=normalizeCustomThemeRecord({...(before||{}),id,label,reactionRefs:customThemeDraft.reactionRefs,updatedAt:new Date().toISOString()});saveCustomThemes([...(state.customThemes||[]).filter(x=>x.id!==customThemeDraft.editingId),record]);try{if(before)await registerVocabularyMutation("patch","custom theme edited");else if(taxonomyHasBeenUsed())await registerVocabularyMutation("minor","custom theme added");}catch(error){console.warn("Custom theme vocabulary log failed",error);}$("customThemeDialog")?.close();tabletLandscapeView.face="judgment";tabletLandscapeView.customs=true;renderWriteIns();renderAll();renderLandscapeCustoms();}
async function deleteCustomTheme(){const id=customThemeDraft.editingId,record=(state.customThemes||[]).find(x=>x.id===id);if(!record||!confirm(`Delete custom theme “${record.label}”?`))return;saveCustomThemes((state.customThemes||[]).filter(x=>x.id!==id));try{if(taxonomyHasBeenUsed())await registerVocabularyMutation("minor","custom theme deleted");}catch(error){console.warn("Custom theme delete log failed",error);}$("customThemeDialog")?.close();tabletLandscapeView.face="judgment";tabletLandscapeView.customs=true;renderAll();renderLandscapeCustoms();}
async function deleteCustomReaction(){const id=customReactionDraft.editingId,record=(state.customReactions||[]).find(x=>x.id===id);if(!record||!confirm(`Delete custom reaction “${record.label}”? Themes using it will retain a missing-reference marker until edited.`))return;saveCustomReactions((state.customReactions||[]).filter(x=>x.id!==id));state.selectedReactions=state.selectedReactions.filter(x=>x!==customReactionSelectionToken(id));saveCurrent("director-custom-reaction-delete");try{if(taxonomyHasBeenUsed())await registerVocabularyMutation("major","custom reaction deleted");}catch(error){console.warn("Custom reaction delete log failed",error);}$("customReactionDialog")?.close();tabletLandscapeView.face="judgment";tabletLandscapeView.customs=true;renderAll();renderLandscapeCustoms();renderCustomThemePicker();}
function reorderCustomLibrary(kind,fromId,toId){const isTheme=kind==="theme",items=[...(isTheme?state.customThemes:state.customReactions)],from=items.findIndex(x=>x.id===fromId),to=items.findIndex(x=>x.id===toId);if(from<0||to<0||from===to)return;const[item]=items.splice(from,1);items.splice(to,0,item);isTheme?saveCustomThemes(items):saveCustomReactions(items);renderLandscapeCustoms();}
function wireLibraryReorder(node,kind,id){let timer=0,active=false,pointerId=null,moved=false,suppressClick=false;const list=node.parentElement;const saveDomOrder=()=>{if(!list)return;const ids=[...list.querySelectorAll(`.landscape-custom-item[data-kind="${kind}"]`)].map(item=>item.dataset.id);const source=kind==="theme"?(state.customThemes||[]):(state.customReactions||[]);const byId=new Map(source.map(item=>[item.id,item]));const ordered=ids.map(key=>byId.get(key)).filter(Boolean);source.forEach(item=>{if(!ids.includes(item.id))ordered.push(item);});kind==="theme"?saveCustomThemes(ordered):saveCustomReactions(ordered);};const finish=e=>{clearTimeout(timer);timer=0;if(active){active=false;node.classList.remove("reordering");document.body.classList.remove("custom-reorder-active");if(moved)saveDomOrder();suppressClick=true;setTimeout(()=>{suppressClick=false;},0);}if(pointerId!==null&&node.hasPointerCapture?.(pointerId))node.releasePointerCapture(pointerId);pointerId=null;moved=false;};node.addEventListener("click",e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();}},true);node.addEventListener("pointerdown",e=>{if(e.button!==undefined&&e.button!==0)return;pointerId=e.pointerId;moved=false;timer=setTimeout(()=>{active=true;node.classList.add("reordering");document.body.classList.add("custom-reorder-active");node.setPointerCapture?.(e.pointerId);navigator.vibrate?.(25);},CUSTOM_REORDER_HOLD_MS);});node.addEventListener("pointermove",e=>{if(!active)return;e.preventDefault();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest?.(`.landscape-custom-item[data-kind="${kind}"]`);if(!target||target===node||target.parentElement!==list)return;const rect=target.getBoundingClientRect();const after=e.clientY>rect.top+rect.height/2;list.insertBefore(node,after?target.nextSibling:target);moved=true;});node.addEventListener("pointerup",finish);node.addEventListener("pointercancel",finish);node.addEventListener("lostpointercapture",finish);}
function customUsageCounts(){
  const reactionCounts=new Map(),themeCounts=new Map();
  const countRecord=record=>{
    (record?.selectedReactions||record?.reactions||[]).forEach(value=>{
      if(typeof value!=="string"||!value.startsWith("custom:"))return;
      const id=value.slice(7);reactionCounts.set(id,(reactionCounts.get(id)||0)+1);
    });
    (record?.themes||[]).forEach(value=>{
      const theme=normalizeTheme(value);if(!theme?.id||!(theme.kind==="customTheme"||String(theme.id).startsWith("custom-theme:")))return;
      themeCounts.set(theme.id,(themeCounts.get(theme.id)||0)+1);
    });
  };
  Object.values(state.records||{}).forEach(countRecord);
  return {reactionCounts,themeCounts};
}
function sortLandscapeCustoms(items,kind){
  const cfg=landscapeCustomSort[kind],usage=customUsageCounts(),counts=kind==="reactions"?usage.reactionCounts:usage.themeCounts;
  const direction=cfg.direction==="desc"?-1:1;
  return [...items].sort((a,b)=>{
    let result=0;
    if(cfg.mode==="date") result=String(a.createdAt||"").localeCompare(String(b.createdAt||""));
    else if(cfg.mode==="top") result=(counts.get(a.id)||0)-(counts.get(b.id)||0);
    else result=String(a.label||"").localeCompare(String(b.label||""),undefined,{sensitivity:"base"});
    if(result===0) result=String(a.label||"").localeCompare(String(b.label||""),undefined,{sensitivity:"base"});
    return result*direction;
  });
}
function createLandscapeCustomChip(item,kind){
  const isReaction=kind==="reaction";
  const chip=document.createElement("div");
  chip.className="customs-chip";
  chip.dataset.kind=kind;chip.dataset.id=item.id;
  const main=document.createElement("button");
  main.type="button";main.className="customs-chip-main";
  if(isReaction){
    const token=customReactionSelectionToken(item.id);
    main.classList.toggle("selected",state.selectedReactions.includes(token));
    main.innerHTML=`<span class="customs-chip-emoji">${item.emoji}</span><span>${item.label}</span>`;
    main.setAttribute("aria-pressed",String(state.selectedReactions.includes(token)));
    main.addEventListener("click",()=>{pushHistory();const n=state.selectedReactions.indexOf(token);if(n>=0)state.selectedReactions.splice(n,1);else state.selectedReactions.push(token);saveCurrent("director-custom-reaction-auto");renderAll();});
  }else{
    main.textContent=item.label;
    main.addEventListener("click",()=>{if(tabletLandscapeView.activeThemeSlot===null)return;state.targetSlot=tabletLandscapeView.activeThemeSlot;selectTheme(item);});
  }
  const edit=document.createElement("button");
  edit.type="button";edit.className="customs-chip-edit";edit.textContent="✎";edit.title="Edit";edit.setAttribute("aria-label",`Edit ${item.label}`);
  edit.addEventListener("click",e=>{e.stopPropagation();isReaction?openCustomReactionDialog(item):openCustomThemeDialog(item);});
  chip.append(main,edit);
  return chip;
}
function setLandscapeCustomsTab(tab,{focusSearch=false}={}){
  const valid=["search","reactions","themes"];if(!valid.includes(tab))tab="search";
  tabletLandscapeView.customsTab=tab;
  const map={search:["tabletCustomSearchTab","tabletCustomSearchPanel"],reactions:["tabletCustomReactionsTab","tabletCustomReactionsPanel"],themes:["tabletCustomThemesTab","tabletCustomThemesPanel"]};
  Object.entries(map).forEach(([key,[tabId,panelId]])=>{
    const active=key===tab,b=$(tabId),panel=$(panelId);if(b){b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active));}if(panel)panel.hidden=!active;
  });
  if(focusSearch&&tab==="search")requestAnimationFrame(()=>$('tabletCustomSearch')?.focus());
}
function renderLandscapeCustoms(){
  const reactionScroller=$("tabletCustomReactionList"),themeScroller=$("tabletCustomThemeList"),searchScroller=document.querySelector("#tabletCustomSearchPanel .customs-search-results");
  if(reactionScroller)landscapeCustomScroll.reactions=reactionScroller.scrollTop;
  if(themeScroller)landscapeCustomScroll.themes=themeScroller.scrollTop;
  if(searchScroller)landscapeCustomScroll.search=searchScroller.scrollTop;
  const q=$('tabletCustomSearch')?.value.trim().toLowerCase()||"";
  const themes=state.customThemes||[],reactions=state.customReactions||[];
  const themeList=$('tabletCustomThemeList'),reactionList=$('tabletCustomReactionList');
  if(themeList){themeList.innerHTML="";sortLandscapeCustoms(themes,"themes").forEach(item=>themeList.appendChild(createLandscapeCustomChip(item,"theme")));}
  if(reactionList){reactionList.innerHTML="";sortLandscapeCustoms(reactions,"reactions").forEach(item=>reactionList.appendChild(createLandscapeCustomChip(item,"reaction")));}
  const searchThemes=$('tabletCustomSearchThemeList'),searchReactions=$('tabletCustomSearchReactionList');
  const themeMatches=themes.filter(item=>!q||item.label.toLowerCase().includes(q));
  const reactionMatches=reactions.filter(item=>!q||item.label.toLowerCase().includes(q)||item.emoji.includes(q));
  if(searchThemes){searchThemes.innerHTML="";[...themeMatches].sort((a,b)=>a.label.localeCompare(b.label,undefined,{sensitivity:"base"})).forEach(item=>searchThemes.appendChild(createLandscapeCustomChip(item,"theme")));}
  if(searchReactions){searchReactions.innerHTML="";[...reactionMatches].sort((a,b)=>a.label.localeCompare(b.label,undefined,{sensitivity:"base"})).forEach(item=>searchReactions.appendChild(createLandscapeCustomChip(item,"reaction")));}
  if($('tabletCustomSearchThemeGroup'))$('tabletCustomSearchThemeGroup').hidden=themeMatches.length===0;
  if($('tabletCustomSearchReactionGroup'))$('tabletCustomSearchReactionGroup').hidden=reactionMatches.length===0;
  setLandscapeCustomsTab(tabletLandscapeView.customsTab||"search");
  requestAnimationFrame(()=>{
    if($("tabletCustomReactionList"))$("tabletCustomReactionList").scrollTop=landscapeCustomScroll.reactions;
    if($("tabletCustomThemeList"))$("tabletCustomThemeList").scrollTop=landscapeCustomScroll.themes;
    const scroller=document.querySelector("#tabletCustomSearchPanel .customs-search-results");if(scroller)scroller.scrollTop=landscapeCustomScroll.search;
  });
}
$("addCustomReactionBtn")?.addEventListener("click",()=>openCustomReactionDialog());
$("addCustomThemeBtn")?.addEventListener("click",()=>openCustomThemeDialog());
if($("tabletAddCustomThemeBtn")) $("tabletAddCustomThemeBtn").onclick=e=>{e.preventDefault();e.stopPropagation();openCustomThemeDialog();};
if($("tabletAddCustomReactionBtn")) $("tabletAddCustomReactionBtn").onclick=e=>{e.preventDefault();e.stopPropagation();openCustomReactionDialog();};
// v0.9.39.40: hard entry routing for Customs controls on mobile/Fold.
document.addEventListener("click",e=>{const target=e.target?.closest?.("#tabletAddCustomThemeBtn,#tabletAddCustomReactionBtn");if(!target)return;e.preventDefault();e.stopImmediatePropagation();if(target.id==="tabletAddCustomThemeBtn")openCustomThemeDialog();else openCustomReactionDialog();},true);
$("customReactionSaveBtn")?.addEventListener("click",saveCustomReactionFromDialog);
$("customThemeSaveBtn")?.addEventListener("click",saveCustomThemeFromDialog);
$("customReactionDeleteBtn")?.addEventListener("click",deleteCustomReaction);
$("customThemeDeleteBtn")?.addEventListener("click",deleteCustomTheme);
$("customThemeLabel")?.addEventListener("input",()=>updateCustomDialogValidation());
$("customReactionLabel")?.addEventListener("input",()=>updateCustomDialogValidation());
$("customReactionEmoji")?.addEventListener("input",()=>updateCustomDialogValidation());
$("tabletCustomSearch")?.addEventListener("input",renderLandscapeCustoms);
$("tabletCustomSearch")?.addEventListener("focus",()=>{document.documentElement.classList.add("landscape-keyboard-open");document.documentElement.classList.add("customs-search-focused");});
$("tabletCustomSearch")?.addEventListener("blur",()=>{document.documentElement.classList.remove("landscape-keyboard-open");document.documentElement.classList.remove("customs-search-focused");});
$("tabletCustomSearchTab")?.addEventListener("click",()=>setLandscapeCustomsTab("search",{focusSearch:false}));
$("tabletCustomReactionsTab")?.addEventListener("click",()=>setLandscapeCustomsTab("reactions"));
$("tabletCustomThemesTab")?.addEventListener("click",()=>setLandscapeCustomsTab("themes"));
$("tabletReturnAiBtn")?.addEventListener("click",()=>{tabletLandscapeView.customs=false;renderTabletWorkbench();});
[["tabletCustomReactionSort","reactions"],["tabletCustomThemeSort","themes"]].forEach(([id,kind])=>$(id)?.addEventListener("change",e=>{
  const cfg=landscapeCustomSort[kind];cfg.mode=e.target.value;cfg.direction=cfg.mode==="alpha"?"asc":"desc";
  const dir=$(kind==="reactions"?"tabletCustomReactionSortDirection":"tabletCustomThemeSortDirection");
  if(dir){dir.textContent=cfg.direction==="asc"?"↑":"↓";dir.setAttribute("aria-label",cfg.direction==="asc"?"Sort ascending":"Sort descending");dir.setAttribute("aria-pressed",String(cfg.direction==="desc"));}
  renderLandscapeCustoms();
}));
[["tabletCustomReactionSortDirection","reactions"],["tabletCustomThemeSortDirection","themes"]].forEach(([id,kind])=>$(id)?.addEventListener("click",e=>{const cfg=landscapeCustomSort[kind];cfg.direction=cfg.direction==="asc"?"desc":"asc";e.currentTarget.textContent=cfg.direction==="asc"?"↑":"↓";e.currentTarget.setAttribute("aria-label",cfg.direction==="asc"?"Sort ascending":"Sort descending");e.currentTarget.setAttribute("aria-pressed",String(cfg.direction==="desc"));renderLandscapeCustoms();}));
$$("[data-close-custom-dialog]").forEach(button=>button.addEventListener("click",()=>$(button.dataset.closeCustomDialog)?.close()));

window.addEventListener("resize",()=>requestAnimationFrame(fitLandscapeAiDescription));

// v0.9.39.24 — keep the focused Customs search visible above Android keyboards.
if(window.visualViewport){
  const syncViewport=()=>{document.documentElement.style.setProperty("--visual-viewport-height",`${window.visualViewport.height}px`);document.documentElement.style.setProperty("--visual-viewport-offset-top",`${window.visualViewport.offsetTop||0}px`);document.documentElement.style.setProperty("--visual-viewport-offset-left",`${window.visualViewport.offsetLeft||0}px`);};
  window.visualViewport.addEventListener("resize",syncViewport);
  window.visualViewport.addEventListener("scroll",syncViewport);
  syncViewport();
}
