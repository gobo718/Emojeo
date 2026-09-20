/* Emojeo Unicode Emoji Catalog — Pass 3
   Loads the current official Unicode emoji-test data and converts the RGI set
   into Emojeo Emoji Records. Application data comes from Unicode; StringBoard
   remains the persistence/query engine. No interpretive tags are created here. */
(()=>{'use strict';
const SOURCE=Object.freeze({
  version:'18.0',
  url:'https://www.unicode.org/Public/emoji/latest/emoji-test.txt',
  dated:'2026-04-30',
  standard:'UTS #51',
  expectedRgiCount:3972
});
const clean=v=>String(v??'').trim();
const cpLabel=s=>clean(s).split(/\s+/).filter(Boolean).map(x=>`U+${x.toUpperCase().padStart(4,'0')}`);
const glyphFrom=s=>String.fromCodePoint(...clean(s).split(/\s+/).filter(Boolean).map(x=>parseInt(x,16)));
const signature=cps=>cps.filter(cp=>cp!=='U+FE0F').join('-');
function parse(text=''){
  const lines=String(text).split(/\r?\n/); let group='',subgroup='',order=0; const rows=[];
  let version=''; let date='';
  for(const raw of lines){
    const line=raw.trim();
    if(line.startsWith('# Version:')){version=clean(line.split(':').slice(1).join(':'));continue}
    if(line.startsWith('# Date:')){date=clean(line.split(':').slice(1).join(':'));continue}
    if(line.startsWith('# group:')){group=clean(line.slice(8));continue}
    if(line.startsWith('# subgroup:')){subgroup=clean(line.slice(11));continue}
    if(!line||line.startsWith('#')||!line.includes(';')||!line.includes('#'))continue;
    const [left,right0]=line.split(';',2); const right=line.slice(line.indexOf('#')+1).trim();
    const status=clean(right0.split('#')[0]);
    const m=right.match(/^(\S+)\s+E([0-9.]+)\s+(.+)$/); if(!m)continue;
    const cps=cpLabel(left); const glyph=m[1]; const emojiVersion=m[2]; const name=m[3].trim();
    rows.push({codePoints:cps,glyph,status,emojiVersion,name,group,subgroup,sourceOrder:++order,signature:signature(cps)});
  }
  return {version,date,rows};
}
function buildRecords(parsed){
  const model=globalThis.emojeoEmojiRecord||globalThis.window?.emojeoEmojiRecord;
  if(!model)throw new Error('Emojeo Emoji Record model is not loaded.');
  const canonical=parsed.rows.filter(r=>r.status==='fully-qualified'||r.status==='component');
  const variants=new Map();
  for(const row of parsed.rows.filter(r=>r.status!=='fully-qualified'&&r.status!=='component')){
    if(!variants.has(row.signature))variants.set(row.signature,[]); variants.get(row.signature).push(row);
  }
  return canonical.map(row=>model.normalize({
    glyph:row.glyph,codePoints:row.codePoints,
    unicode:{version:row.emojiVersion,qualified:row.status==='fully-qualified',sequenceType:row.status},
    names:{cldr:row.name},
    taxonomy:{group:row.group,subgroup:row.subgroup,order:row.sourceOrder},
    presentation:{variants:(variants.get(row.signature)||[]).map(v=>({glyph:v.glyph,codePoints:v.codePoints,qualification:v.status}))},
    metadata:{unicodeEmojiVersion:parsed.version||SOURCE.version,unicodeSourceDate:parsed.date||SOURCE.dated,source:'Unicode emoji-test.txt'}
  }));
}
async function fetchOfficial({url=SOURCE.url,fetchImpl=globalThis.fetch}={}){
  if(typeof fetchImpl!=='function')throw new Error('Fetch is unavailable.');
  const res=await fetchImpl(url,{cache:'no-cache'}); if(!res.ok)throw new Error(`Unicode emoji catalog fetch failed: ${res.status}`);
  return res.text();
}
async function loadOfficial(options={}){const text=await fetchOfficial(options);const parsed=parse(text);return{source:SOURCE,parsed,records:buildRecords(parsed)}}
async function importIntoStore(store,records,{sourceUrl=SOURCE.url}={}){
  if(!store)throw new Error('A StringBoard record store is required.');
  let imported=0;
  for(const record of records){await store.put((globalThis.emojeoEmojiRecord||window.emojeoEmojiRecord).toStoreRecord(record,{provenance:{source:'Unicode Consortium',sourceUrl,standard:SOURCE.standard,emojiVersion:SOURCE.version,importedAt:new Date().toISOString()}}));imported++}
  return {imported};
}
const api=Object.freeze({SOURCE,cpLabel,glyphFrom,parse,buildRecords,fetchOfficial,loadOfficial,importIntoStore});
if(typeof window!=='undefined')window.emojeoUnicodeCatalog=api;if(typeof globalThis!=='undefined')globalThis.emojeoUnicodeCatalog=api;
})();
