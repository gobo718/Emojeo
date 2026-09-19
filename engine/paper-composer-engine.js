(()=>{
'use strict';
const DB='genreactrix-paper-composer-v1',VERSION=1,STORE='papers';
const now=()=>new Date().toISOString();
const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:'id'});s.createIndex('status','status');s.createIndex('updatedAt','updatedAt');s.createIndex('title','title')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function all(){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))));r.onerror=()=>reject(r.error)})}
async function get(id){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function put(v){const db=await openDb();return new Promise((resolve,reject)=>{const r=db.transaction(STORE,'readwrite').objectStore(STORE).put(v);r.onsuccess=()=>resolve(v);r.onerror=()=>reject(r.error)})}
const cleanIds=v=>[...new Set((v||[]).map(x=>String(x||'').trim()).filter(Boolean))];
async function gatherSources(){
 const kb=window.genreactrixKnowledgeBaseEngine;
 const ce=window.genreactrixCitationEvidenceEngine;
 const dv=window.genreactrixDatasetVersionEngine;
 const methods=window.genreactrixMethodologyEngine;
 const terms=window.genreactrixTerminologyEngine;
 const [entries,citationsGraph,datasets,snapshots,methodRows,termRows]=await Promise.all([
  kb?.allEntries?.().catch?.(()=>[])||[],
  ce?.graphFor?.().catch?.(()=>({citations:[],links:[],bundles:[]}))||{citations:[],links:[],bundles:[]},
  dv?.allDatasets?.().catch?.(()=>[])||[],
  dv?.allSnapshots?.().catch?.(()=>[])||[],
  methods?.getAll?.().catch?.(()=>[])||[],
  terms?.getAll?.().catch?.(()=>[])||[]
 ]);
 return {entries,citationsGraph,datasets,snapshots,methods:methodRows,terms:termRows};
}
function buildDefaultSections(source,title){
 const published=source.entries.filter(e=>e.status==='published');
 const findings=published.filter(e=>e.type==='finding');
 const methods=source.methods.filter(m=>m.status==='published');
 const latestSnapshot=[...source.snapshots].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))[0]||null;
 const evidenceCount=source.citationsGraph.links?.length||0;
 return [
  {id:uid('section'),kind:'abstract',title:'Abstract',body:`${title} synthesizes ${published.length} published knowledge entries, ${findings.length} accepted findings, and ${evidenceCount} evidence relationships from the current Genreactrix research corpus.`},
  {id:uid('section'),kind:'introduction',title:'Introduction',body:'This paper examines how reaction combinations, themes, PrimFusion classifications, and AI–Director comparisons can reveal structure in the image population studied by Genreactrix.'},
  {id:uid('section'),kind:'methodology',title:'Methodology',body:methods.length?methods.map(m=>`### ${m.title} (${m.versionLabel||m.version||'1.0'})\n${m.summary||''}\n\n${m.body||''}`).join('\n\n'):'No published methodology records are currently available.'},
  {id:uid('section'),kind:'dataset',title:'Dataset Description',body:latestSnapshot?`Dataset: ${latestSnapshot.manifest?.datasetName||latestSnapshot.datasetId}\nVersion: ${latestSnapshot.versionLabel}\nSnapshot ID: ${latestSnapshot.id}\nImages: ${latestSnapshot.manifest?.recordCount||latestSnapshot.manifest?.imageIds?.length||0}\nContent hash: ${latestSnapshot.manifest?.contentHash||'Unavailable'}`:'No frozen dataset snapshot has been selected.'},
  {id:uid('section'),kind:'results',title:'Results',body:findings.length?findings.map(f=>`### ${f.title}\n${f.summary||f.body||''}\n\nSample size: ${f.evidence?.sampleSize||0}; confidence: ${f.evidence?.confidence||0}.`).join('\n\n'):'No published findings are currently available.'},
  {id:uid('section'),kind:'discussion',title:'Discussion',body:'Interpret the observed relationships, limitations, contradictory evidence, and implications for MASHPEDITION classification and community voting.'},
  {id:uid('section'),kind:'conclusion',title:'Conclusions',body:'Summarize the strongest supported conclusions and identify the next empirical questions.'},
  {id:uid('section'),kind:'references',title:'References',body:(source.citationsGraph.citations||[]).map((c,i)=>`${i+1}. ${c.authors?`${c.authors}. `:''}${c.title}${c.publisher?`. ${c.publisher}`:''}${c.publishedDate?` (${c.publishedDate})`:''}${c.locator?`. ${c.locator}`:''}`).join('\n')||'No citations recorded.'},
  {id:uid('section'),kind:'appendix',title:'Appendix',body:`Canonical terminology records: ${source.terms.length}\nPublished methodology records: ${methods.length}\nEvidence links: ${evidenceCount}.`}
 ];
}
async function createPaper(input={}){
 const title=String(input.title||'').trim();if(!title)throw new Error('Paper title required');
 const source=await gatherSources();
 const paper={id:uid('paper'),schemaVersion:1,title,subtitle:String(input.subtitle||''),authors:String(input.authors||''),status:'draft',sections:input.sections?.length?input.sections:buildDefaultSections(source,title),selectedKnowledgeIds:cleanIds(input.selectedKnowledgeIds||source.entries.filter(e=>e.status==='published').map(e=>e.id)),selectedCitationIds:cleanIds(input.selectedCitationIds||source.citationsGraph.citations.map(c=>c.id)),datasetSnapshotId:input.datasetSnapshotId||[...source.snapshots].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))[0]?.id||null,methodologyIds:cleanIds(input.methodologyIds||source.methods.filter(m=>m.status==='published').map(m=>m.id)),revision:1,revisionHistory:[],createdAt:now(),updatedAt:now(),finalizedAt:null};
 return put(paper);
}
async function savePaper(id,patch={}){const old=await get(id);if(!old)throw new Error('Paper not found');const snapshot={revision:old.revision,title:old.title,status:old.status,sections:old.sections,updatedAt:old.updatedAt};const next={...old,...patch,sections:patch.sections||old.sections,revision:Number(old.revision||1)+1,revisionHistory:[...(old.revisionHistory||[]),snapshot],updatedAt:now()};return put(next)}
async function setSection(id,sectionId,patch={}){const paper=await get(id);if(!paper)throw new Error('Paper not found');const sections=paper.sections.map(s=>s.id===sectionId?{...s,...patch}:s);return savePaper(id,{sections})}
async function reorderSections(id,sectionIds=[]){const paper=await get(id);if(!paper)throw new Error('Paper not found');const map=new Map(paper.sections.map(s=>[s.id,s]));const ordered=sectionIds.map(x=>map.get(x)).filter(Boolean);for(const s of paper.sections)if(!sectionIds.includes(s.id))ordered.push(s);return savePaper(id,{sections:ordered})}
function markdown(p){const front=[`# ${p.title}`,p.subtitle?`## ${p.subtitle}`:'',p.authors?`**Authors:** ${p.authors}`:''].filter(Boolean).join('\n\n');return `${front}\n\n${p.sections.map(s=>`## ${s.title}\n\n${s.body||''}`).join('\n\n')}\n`}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function html(p){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(p.title)}</title><style>body{font:16px/1.55 system-ui;max-width:900px;margin:40px auto;padding:0 24px;color:#17171b}h1{font-size:2.4rem}h2{margin-top:2.25rem;border-bottom:1px solid #ddd;padding-bottom:.35rem}pre{white-space:pre-wrap}</style></head><body><article><h1>${esc(p.title)}</h1>${p.subtitle?`<h3>${esc(p.subtitle)}</h3>`:''}${p.authors?`<p><strong>Authors:</strong> ${esc(p.authors)}</p>`:''}${p.sections.map(s=>`<section><h2>${esc(s.title)}</h2><div>${esc(s.body||'').replace(/\n/g,'<br>')}</div></section>`).join('')}</article></body></html>`}
function download(body,name,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function exportPaper(id,format='json'){const p=await get(id);if(!p)throw new Error('Paper not found');const stem=p.title.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'genreactrix-paper';if(format==='markdown')download(markdown(p),`${stem}.md`,'text/markdown');else if(format==='html')download(html(p),`${stem}.html`,'text/html');else download(JSON.stringify(p,null,2),`${stem}.json`,'application/json');return p}
async function verify(){const rows=await all(),issues=[];for(const p of rows){if(!p.title)issues.push({severity:'warning',type:'paper-title-missing',id:p.id});if(!p.sections?.length)issues.push({severity:'attention',type:'paper-sections-missing',id:p.id});if(p.status==='final'&&!p.finalizedAt)issues.push({severity:'attention',type:'paper-finalized-date-missing',id:p.id})}return {checked:rows.length,issues}}
window.genreactrixPaperComposerEngine={createPaper,savePaper,setSection,reorderSections,get,all,exportPaper,markdown,html,verify};
})();
