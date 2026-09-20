/* Emojeo Emoji Record Model — Pass 2
   Application-owned schema for one emoji subject. StringBoard supplies storage,
   tagging, provenance, history, and analysis machinery; Emojeo supplies meaning.
   No emoji catalog or classification vocabulary is seeded here. */
(()=>{'use strict';
const SCHEMA_VERSION=1;
const clean=v=>String(v??'').trim();
const clone=v=>v==null?v:structuredClone(v);
const unique=rows=>[...new Set((rows||[]).map(clean).filter(Boolean))];
const codePoints=glyph=>Array.from(clean(glyph)).map(ch=>`U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}`);
const canonicalId=(input={})=>clean(input.id)||unique(input.codePoints).join('-')||codePoints(input.glyph).join('-');
function normalize(input={}){
  const glyph=clean(input.glyph);
  const cps=unique(input.codePoints?.length?input.codePoints:codePoints(glyph));
  const id=canonicalId({...input,codePoints:cps,glyph});
  if(!id)throw new Error('Emoji record requires an ID, code point sequence, or glyph.');
  return {
    id,
    glyph,
    codePoints:cps,
    unicode:{version:clean(input.unicode?.version),qualified:input.unicode?.qualified??null,sequenceType:clean(input.unicode?.sequenceType)},
    names:{cldr:clean(input.names?.cldr),unicode:clean(input.names?.unicode),aliases:unique(input.names?.aliases),keywords:unique(input.names?.keywords)},
    taxonomy:{group:clean(input.taxonomy?.group),subgroup:clean(input.taxonomy?.subgroup),order:Number.isFinite(Number(input.taxonomy?.order))?Number(input.taxonomy.order):null},
    presentation:{defaultStyle:clean(input.presentation?.defaultStyle),hasEmojiPresentation:input.presentation?.hasEmojiPresentation??null,variants:clone(input.presentation?.variants||[])},
    descriptions:{canonical:clean(input.descriptions?.canonical),human:clean(input.descriptions?.human),analysis:clean(input.descriptions?.analysis)},
    relationships:clone(input.relationships||[]),
    analysis:{state:clean(input.analysis?.state||'unanalysed'),lastRunAt:input.analysis?.lastRunAt??null,metadata:clone(input.analysis?.metadata||{})},
    metadata:clone(input.metadata||{})
  };
}
function validateData(data={}){
  if(!clean(data.id))return false;
  if(!Array.isArray(data.codePoints))return false;
  if(!data.names||!data.taxonomy||!data.descriptions||!data.analysis)return false;
  return true;
}
function toStoreRecord(input={},options={}){
  const data=normalize(input);
  return {id:data.id,schemaVersion:SCHEMA_VERSION,status:clean(options.status||input.status||'active'),flags:unique(options.flags||input.flags),data,metadata:{recordType:'emoji',...(clone(input.recordMetadata||{})),...(clone(options.metadata||{}))},provenance:clone(options.provenance||input.provenance||{})};
}
function fromStoreRecord(record={}){if(record?.metadata?.recordType!=='emoji')return null;return clone(record.data||null)}
function createStore(options={}){
  const engine=globalThis.reusableRecordStore||globalThis.window?.reusableRecordStore;
  if(!engine)throw new Error('StringBoard record-store engine is not loaded.');
  return engine.createStore({id:'emojeo-emoji-records',schemaVersion:SCHEMA_VERSION,validate:r=>r?.metadata?.recordType==='emoji'&&validateData(r.data),...options});
}
const api=Object.freeze({SCHEMA_VERSION,canonicalId,codePoints,normalize,validateData,toStoreRecord,fromStoreRecord,createStore});
if(typeof window!=='undefined')window.emojeoEmojiRecord=api;
if(typeof globalThis!=='undefined')globalThis.emojeoEmojiRecord=api;
})();
