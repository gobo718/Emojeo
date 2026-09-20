/* Genreactrix Investigation UI v0.9.40.40
   Two reusable human-judgment surfaces:
   - Single Image Inspector
   - Two-Image Comparator
   Workflow owners retain their actions/state; this UI only presents evidence and dispatches commands. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const urls=new Set();
const nowLabel=v=>{if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleString()};
const bytes=v=>{const n=Number(v)||0;if(!n)return'';if(n<1024)return`${n} B`;if(n<1048576)return`${(n/1024).toFixed(n<10240?1:0)} KB`;return`${(n/1048576).toFixed(n<10485760?1:0)} MB`};
const shorten=(v,n=28)=>{v=String(v||'');return v.length>n?`${v.slice(0,n)}…`:v};
function releaseUrls(){for(const u of urls)URL.revokeObjectURL(u);urls.clear()}
function urlForBlob(blob){if(!(blob instanceof Blob))return'';const u=URL.createObjectURL(blob);urls.add(u);return u}
function imageRecord(id){return window.genreactrixImageRecordEngine?.get?.(String(id),{touch:false})||window.genreactrixImagesEngine?.recordById?.(String(id))||null}
async function loadDimensions(url){if(!url)return null;return new Promise(resolve=>{const img=new Image(),done=()=>resolve(img.naturalWidth&&img.naturalHeight?{width:img.naturalWidth,height:img.naturalHeight}:null);img.onload=done;img.onerror=()=>resolve(null);img.src=url;if(img.complete)queueMicrotask(done)})}
async function visualForRecord(record){
  if(!record)return{url:'',quality:'none',dimensions:null};
  const e=window.genreactrixImagesEngine;
  const display=await e?.displayFile?.(record.id,{allowRecovery:false,reuseCached:true}).catch?.(()=>null)||null;
  if(display?.url&&!display.isMissingAsset){
    const quality=display.isThumbnail?'thumbnail':display.isRemoteSource?'linked':'full',dimensions=await loadDimensions(display.url);
    return{url:display.url,quality,dimensions,blob:null,sharedDisplay:true};
  }
  let blob=await e?.fullBlobForOriginCheck?.(record.id).catch?.(()=>null)||null,quality='full';
  if(!blob){blob=await e?.thumbnailBlobGet?.(record.storage?.thumbnailKey||record.id).catch?.(()=>null)||null;quality=blob?'thumbnail':'none'}
  let url=blob?urlForBlob(blob):'';
  if(!url){url=record.storage?.hyperlink||record.source?.originalUrl||'';quality=url?'linked':'none'}
  if(!url&&display?.url){url=display.url;quality='placeholder'}
  const dimensions=await loadDimensions(url);
  return{url,quality,dimensions,blob};
}
async function visualForOriginCase(c){
  const g=window.genreactrixOriginGateEngine;let blob=await g?.getAsset?.(c.id,'full').catch?.(()=>null)||null,quality='full';
  if(!blob){blob=await g?.getAsset?.(c.id,'thumbnail').catch?.(()=>null)||null;quality=blob?'thumbnail':'none'}
  let url=blob?urlForBlob(blob):'';
  if(!url){url=c.source?.originalUrl||'';quality=url?'linked':'none'}
  const dimensions=await loadDimensions(url);
  return{url,quality,dimensions,blob};
}
function dimensionValue(visual){if(!visual?.dimensions)return'';const d=`${visual.dimensions.width} × ${visual.dimensions.height}`;return visual.quality==='thumbnail'?`Unavailable · preview ${d}`:d}
function value(v,fallback='—'){if(v===0)return'0';return v?String(v):fallback}
function row(label,left,right){return `<div class="investigation-compare-row"><strong>${esc(label)}</strong><span>${esc(value(left))}</span><span>${esc(value(right))}</span></div>`}
function singleRow(label,v){return v||v===0?`<div class="investigation-meta-row"><strong>${esc(label)}</strong><span>${esc(String(v))}</span></div>`:''}
function recordMeta(record,visual={}){const ext=record?.metadata?.extended||{};return{
  filename:record?.source?.originalFilename||record?.name||record?.id||'',dimensions:dimensionValue(visual),size:bytes(record?.storage?.size),format:record?.storage?.mimeType||'',source:record?.source?.type||'',location:record?.source?.originalLocation||record?.source?.originalUrl||'',pack:record?.source?.packId||ext.originPackId||'',importJob:record?.source?.importJobId||'',created:nowLabel(record?.createdAt),modified:record?.storage?.lastModified?nowLabel(record.storage.lastModified):'',hash:record?.storage?.hash||'',thumbHash:ext.originThumbnailHash||'',imageId:record?.id||'',project:record?.projectId||'',runtime:record?.runtime?.createdRuntimeId||record?.runtime?.lastProcessedRuntimeId||'',stage:record?.workflow?.stage||'',dataset:record?.source?.dataset||'',license:record?.source?.license||'',attribution:record?.source?.attribution||'',provenance:(record?.metadata?.core?.provenance||record?.metadata?.extended?.provenance)?JSON.stringify(record.metadata.core?.provenance||record.metadata.extended?.provenance):''
}}
function caseMeta(c,visual={}){return{
  filename:c?.source?.originalFilename||c?.candidate?.name||c?.id||'',dimensions:dimensionValue(visual),size:bytes(c?.candidate?.size||c?.source?.size||visual?.blob?.size),format:c?.candidate?.mimeType||c?.source?.mimeType||visual?.blob?.type||'',source:c?.source?.type||'',location:c?.source?.originalLocation||c?.source?.originalUrl||'',pack:c?.packId||c?.source?.packId||'',importJob:c?.importJobId||'',created:nowLabel(c?.createdAt),modified:c?.source?.lastModified?nowLabel(c.source.lastModified):'',hash:c?.candidate?.fingerprint||'',thumbHash:c?.candidate?.thumbnailHash||'',imageId:c?.candidate?.id||'',project:c?.projectId||'',runtime:c?.runtimeId||'',stage:c?.status||'',dataset:c?.source?.dataset||'',license:c?.source?.license||'',attribution:c?.source?.attribution||'',provenance:c?.source?.provenance?JSON.stringify(c.source.provenance):''
}}
function setImage(img,empty,visual,label){if(!img||!empty)return;if(visual?.url){img.src=visual.url;img.hidden=false;img.alt=label||'Image preview';empty.hidden=true;img.dataset.zoomLabel=label||'Image';}else{img.removeAttribute('src');img.hidden=true;empty.hidden=false;empty.textContent='Image data unavailable';}}
function renderActions(target,actions=[]){target.innerHTML='';for(const a of actions){const b=document.createElement('button');b.type='button';b.textContent=a.label;b.className=a.className||'';b.addEventListener('click',async()=>{b.disabled=true;try{await a.run?.();if(a.close!==false)closeAll();}catch(error){$('investigationStatus').textContent=String(error?.message||error)}finally{b.disabled=false}});target.appendChild(b)}}
function closeAll(){try{$('singleImageInspector')?.close()}catch{}try{$('twoImageComparator')?.close()}catch{}releaseUrls()}
function openZoom(src,label){if(!src)return;const d=$('investigationZoomDialog'),img=$('investigationZoomImage'),title=$('investigationZoomTitle');if(!d||!img)return;img.src=src;img.alt=label||'Close-up';if(title)title.textContent=label||'Close-up';d.showModal()}
async function recentHistory(imageId){try{return (await window.genreactrixHistoryEngine?.timeline?.(imageId)||[]).slice(-10).reverse()}catch{return[]}}
async function contextDiagnostics(record){const out=[];if(!record)return out;
  const q=window.genreactrixQuarantineEngine?.openForImage?.(record.id);if(q){out.push(['Quarantine',`${q.trigger||'problem image'} · ${q.streak||0} isolated failures`]);if(q.lastError)out.push(['Last AI error',q.lastError]);for(const [i,a] of (q.attempts||[]).entries())out.push([`AI attempt ${i+1}`,`${nowLabel(a.at)}${a.jobId?` · Job ${a.jobId}`:''}${a.attemptId?` · Attempt ${a.attemptId}`:''}${a.error?` · ${a.error}`:''}`])}
  try{const plans=(await window.genreactrixPostProcessingEngine?.purgatoryPlans?.()||[]).filter(p=>String(p.imageId)===String(record.id));for(const p of plans){out.push(['Purgatory',`Batch ${p.batchId||'—'} · Director ${p.decision?.terminal||'—'} · route ${p.decision?.route|| (p.decision?.keep?'keep':'recycle')} · ${p.lastError?.message||p.lastError||'unresolved'}`]);for(const a of p.attempts||[])out.push([`Post attempt ${a.attemptNumber||''}`.trim(),`${a.kind||'attempt'} · ${nowLabel(a.startedAt)} · ${a.status||''}${a.error?.message?` · ${a.error.message}`:''}`])}}catch{}
  if(record.error)out.push(['Record error',record.error]);return out;
}
async function openImage(imageId,{title='Image Inspector',extraDiagnostics=[],actions=[]}={}){
  closeAll();const record=imageRecord(imageId);if(!record)throw new Error('Image Record not found');const visual=await visualForRecord(record),m=recordMeta(record,visual),history=await recentHistory(record.id),diagnostics=[...await contextDiagnostics(record),...extraDiagnostics];
  $('singleInspectorTitle').textContent=title;setImage($('singleInspectorImage'),$('singleInspectorImageEmpty'),visual,m.filename);
  $('singleInspectorMeta').innerHTML=[singleRow('Filename',m.filename),singleRow('Pixel dimensions',m.dimensions),singleRow('File size',m.size),singleRow('Format',m.format),singleRow('Image ID',m.imageId),singleRow('Lifecycle',m.stage),singleRow('Source',m.source),singleRow('Original location',m.location),singleRow('Origin Pack',m.pack),singleRow('Import Job',m.importJob),singleRow('Created',m.created),singleRow('Last modified',m.modified),singleRow('SHA-256',m.hash),singleRow('Thumbnail hash',m.thumbHash),singleRow('Dataset',m.dataset),singleRow('License',m.license),singleRow('Attribution',m.attribution),singleRow('Provenance',m.provenance),singleRow('Project',m.project),singleRow('Runtime',m.runtime)].join('');
  $('singleInspectorDiagnostics').innerHTML=diagnostics.length?`<h3>Diagnostics / history</h3>${diagnostics.map(([k,v])=>singleRow(k,v)).join('')}${history.length?`<h3>Recent record history</h3>${history.map(h=>singleRow(nowLabel(h.timestamp),`${h.summary||h.eventType}${h.sourceEngine?` · ${h.sourceEngine}`:''}`)).join('')}`:''}`:(history.length?`<h3>Recent record history</h3>${history.map(h=>singleRow(nowLabel(h.timestamp),`${h.summary||h.eventType}${h.sourceEngine?` · ${h.sourceEngine}`:''}`)).join('')}`:'');
  const contextual=[...actions];if(record.workflow?.stage==='purgatory')contextual.push({label:'Retry',run:async()=>{await window.genreactrixPostProcessingEngine?.retryForImage?.(record.id);window.genreactrixImagesConsole?.render?.()}});if(record.attributes?.inRecycleBin)contextual.push({label:'Restore',run:async()=>{await window.genreactrixImagesEngine?.restoreFromRecycle?.(record.id);window.genreactrixImagesConsole?.render?.()}});renderActions($('singleInspectorActions'),contextual);$('investigationStatus').textContent='';$('singleImageInspector').showModal();
}
async function openOriginCase(caseId){
  closeAll();const g=window.genreactrixOriginGateEngine,c=await g?.get?.(caseId);if(!c)throw new Error('Origin case not found');const label=c.type==='dupe'?'Dupe':c.type==='repeat'?'Repeat':c.type==='import-failure'?'Import Failure':c.type==='source-retry'?'Retry Import Source':'Origin case';
  if(['dupe','repeat'].includes(c.type)&&c.matchedImageId){const original=imageRecord(c.matchedImageId),[candidateVisual,originalVisual]=await Promise.all([visualForOriginCase(c),visualForRecord(original)]),cm=caseMeta(c,candidateVisual),om=recordMeta(original,originalVisual);
    $('comparatorTitle').textContent=`${label} Comparison`;$('comparatorLeftLabel').textContent='Candidate';$('comparatorRightLabel').textContent='Original';setImage($('comparatorLeftImage'),$('comparatorLeftEmpty'),candidateVisual,cm.filename);setImage($('comparatorRightImage'),$('comparatorRightEmpty'),originalVisual,om.filename);
    const fields=[['Filename','filename'],['Pixel dimensions','dimensions'],['File size','size'],['Format','format'],['Image ID','imageId'],['Lifecycle / case','stage'],['Source','source'],['Original location','location'],['Origin Pack','pack'],['Import Job','importJob'],['Created','created'],['Last modified','modified'],['SHA-256','hash'],['Thumbnail hash','thumbHash'],['Dataset','dataset'],['License','license'],['Attribution','attribution'],['Provenance','provenance'],['Project','project'],['Runtime','runtime']];$('comparatorMeta').innerHTML=`<div class="investigation-compare-head"><strong>Field</strong><strong>Candidate</strong><strong>Original</strong></div>${fields.map(([l,k])=>row(l,cm[k],om[k])).join('')}<div class="investigation-compare-row"><strong>Match evidence</strong><span>${esc(c.evidence?.kind||'—')}</span><span>${esc(c.evidence?.exact?'Exact match':'Matched record')}</span></div>`;
    const actions=[];if(c.type==='dupe'&&c.status==='pending-review'){actions.push({label:'Sustain',run:async()=>g.sustainDupe(c.id)},{label:'Overrule',className:'primary-action',run:async()=>g.overruleDupe(c.id)})}if(c.type==='repeat'&&c.status==='blocked-repeat')actions.push({label:'Re-evaluate',className:'primary-action',run:async()=>g.reevaluateRepeat(c.id)});for(const a of actions){const originalRun=a.run;a.run=async()=>{await originalRun();window.genreactrixImagesConsole?.render?.();window.dispatchEvent(new CustomEvent('genreactrix:image-record'))}}renderActions($('comparatorActions'),actions);$('investigationStatus').textContent='';$('twoImageComparator').showModal();return;
  }
  const diagnostic=[];if(c.error)diagnostic.push(['Error',c.error]);if(c.evidence&&Object.keys(c.evidence).length)diagnostic.push(['Evidence',Object.entries(c.evidence).map(([k,v])=>`${k}: ${typeof v==='object'?JSON.stringify(v):v}`).join(' · ')]);for(const [i,a] of (c.attempts||[]).entries())diagnostic.push([`Attempt ${i+1}`,`${nowLabel(a.at)} · ${a.success===true?'success':a.success===false?'failed':a.kind||'attempt'}${a.error?` · ${a.error}`:''}`]);
  const actions=[];if(['import-failure','source-retry'].includes(c.type)&&['blocked','retry-pending'].includes(c.status))actions.push({label:'Retry',className:'primary-action',run:async()=>{await g.retry(c.id);window.genreactrixImagesConsole?.render?.();window.dispatchEvent(new CustomEvent('genreactrix:image-record'))}});
  if(c.type==='source-retry'&&c.matchedImageId)return openImage(c.matchedImageId,{title:'Retry Import Source',extraDiagnostics:diagnostic,actions});
  const visual=await visualForOriginCase(c),m=caseMeta(c,visual);$('singleInspectorTitle').textContent=label;setImage($('singleInspectorImage'),$('singleInspectorImageEmpty'),visual,m.filename);$('singleInspectorMeta').innerHTML=[singleRow('Filename',m.filename),singleRow('Pixel dimensions',m.dimensions),singleRow('File size',m.size),singleRow('Format',m.format),singleRow('Case status',c.status),singleRow('Source',m.source),singleRow('Original location',m.location),singleRow('Origin Pack',m.pack),singleRow('Import Job',m.importJob),singleRow('Created',m.created),singleRow('Last modified',m.modified),singleRow('SHA-256',m.hash),singleRow('Thumbnail hash',m.thumbHash),singleRow('Dataset',m.dataset),singleRow('License',m.license),singleRow('Attribution',m.attribution),singleRow('Provenance',m.provenance),singleRow('Project',m.project),singleRow('Runtime',m.runtime)].join('');$('singleInspectorDiagnostics').innerHTML=diagnostic.length?`<h3>Diagnostics / history</h3>${diagnostic.map(([k,v])=>singleRow(k,v)).join('')}`:'';renderActions($('singleInspectorActions'),actions);$('investigationStatus').textContent='';$('singleImageInspector').showModal();
}
async function openQuarantineCase(caseId){const c=window.genreactrixQuarantineEngine?.get?.(caseId);if(!c)throw new Error('Quarantine case not found');const diagnostics=[['Quarantine reason',c.trigger||'three-isolated-ai-failures'],['Isolated failure count',c.streak||3],['Last error',c.lastError||'']];if(c.evidence&&Object.keys(c.evidence).length)diagnostics.push(['Evidence',Object.entries(c.evidence).map(([k,v])=>`${k}: ${typeof v==='object'?JSON.stringify(v):v}`).join(' · ')]);for(const [i,a] of (c.attempts||[]).entries())diagnostics.push([`AI attempt ${i+1}`,`${nowLabel(a.at)}${a.jobId?` · Job ${a.jobId}`:''}${a.attemptId?` · Attempt ${a.attemptId}`:''}${a.error?` · ${a.error}`:''}`]);const actions=[];if(c.status==='open'){actions.push({label:'Release',run:async()=>window.genreactrixQuarantineEngine.release(c.id)},{label:'Defective',className:'danger-action',run:async()=>{if(!confirm('Finalize this image as Defective? The full-resolution image will be deleted directly. The permanent thumbnail, Image Record, and diagnostic history will remain.'))throw new Error('Defective finalization cancelled');return window.genreactrixQuarantineEngine.finalizeDefective(c.id)}})}return openImage(c.imageId,{title:'Quarantine Inspector',extraDiagnostics:diagnostics,actions})}
function wire(){
  ['singleInspectorClose','comparatorClose'].forEach(id=>$(id)?.addEventListener('click',closeAll));$('investigationZoomClose')?.addEventListener('click',()=>$('investigationZoomDialog')?.close());
  [$('singleInspectorImage'),$('comparatorLeftImage'),$('comparatorRightImage')].forEach(img=>img?.addEventListener('click',()=>openZoom(img.src,img.dataset.zoomLabel||img.alt)));
  $('investigationZoomDialog')?.addEventListener('close',()=>{const img=$('investigationZoomImage');if(img)img.removeAttribute('src')});
  $('singleImageInspector')?.addEventListener('close',releaseUrls);$('twoImageComparator')?.addEventListener('close',releaseUrls);
}
window.genreactrixInvestigationUI={openImage,openOriginCase,openQuarantineCase,close:closeAll};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
