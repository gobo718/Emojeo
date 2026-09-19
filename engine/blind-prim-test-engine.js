/* Genreactrix Blind Prim Test Engine v1
   Disposable diagnostic runner for a genuinely blind Prim-selection experiment.
   It never writes AI analysis/components, lifecycle state, Queue/Bundle membership,
   Director data, Theme Sweep state, or image history. Results live only in the
   dedicated diagnostic store below and export as JSON. */
(()=>{'use strict';
 const KEY='genreactrix-blind-prim-tests-v1',EXPECTED_POPULATION=60,MAX_SITE_ATTEMPTS=2;
 const clone=v=>v==null?v:structuredClone(v),now=()=>new Date().toISOString();
 const uid=()=>`blind_prim_${Date.now().toString(36)}_${crypto.randomUUID?.()?.slice?.(0,8)||Math.random().toString(16).slice(2,10)}`;
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
 const write=rows=>{localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('genreactrix:blind-prim-test'));};
 const projectId=()=>String(window.genreactrixProjectRuntimeEngine?.projectId?.()||'');
 const latest=()=>{const pid=projectId(),rows=read().filter(row=>!pid||!row.projectId||String(row.projectId)===pid);return clone(rows.slice().sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||''))).at(-1)||null)};
 function replaceRun(run){const rows=read(),i=rows.findIndex(row=>row.id===run.id);if(i>=0)rows[i]=clone(run);else rows.push(clone(run));write(rows);return clone(run)}
 function sourceSweep(){const sweep=window.genreactrixThemeSweepEngine?.latest?.();if(!sweep)return null;const ids=[...new Set((sweep.imageIds||[]).map(String))];return{...sweep,imageIds:ids};}
 function record(id){return window.genreactrixImageRecordEngine?.get?.(String(id),{touch:false})||null}
 function safeName(r,id){return String(r?.source?.originalFilename||r?.name||id||'image')}
 const AI_MAX=1280,AI_QUALITY=.82;
 async function blobDataUrl(blob){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=()=>reject(fr.error);fr.readAsDataURL(blob)})}
 async function normalizedInput(r){
  if(r?.storage?.hyperlink)return{imageUrl:r.storage.hyperlink};
  const blob=await window.imageBlobGet?.(r.id).catch(()=>null);if(!blob)throw new Error('Image source is unavailable');
  let bitmap=null;try{
   bitmap=await createImageBitmap(blob);const sw=Math.max(1,bitmap.width||1),sh=Math.max(1,bitmap.height||1),scale=Math.min(1,AI_MAX/Math.max(sw,sh)),w=Math.max(1,Math.round(sw*scale)),h=Math.max(1,Math.round(sh*scale));
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas unavailable for Blind Prim image preparation');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(bitmap,0,0,w,h);
   const prepared=await new Promise((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error('Could not prepare Blind Prim image')),'image/jpeg',AI_QUALITY));
   return{imageDataUrl:await blobDataUrl(prepared)};
  }finally{try{bitmap?.close?.()}catch{}}
 }
 function globalFailure(error){return /unauthorized|access is not configured|worker url is not configured|analysis key|failed to fetch|networkerror|load failed|rate limit|quota|provider call timed out/i.test(String(error?.message||error))}
 function providerMeta(payload){const result=payload?.result||{},routing=payload?.providerRouting||result?.providerRouting||{};const model=String(result.model||routing.successfulModels?.[0]||'');const provider=String(result.provider||routing.successfulProviders?.[0]||'');return{model,provider,providerRouting:clone(routing)}}
 async function callOne(imageId){
  const r=record(imageId);if(!r)throw new Error('Image record is unavailable');const input=await normalizedInput(r);let last=null;
  for(let attempt=1;attempt<=MAX_SITE_ATTEMPTS;attempt++){
   try{return await window.GenreactrixCloudApi.blindPrims({imageId,...input},window.GenreactrixCloudApi.getKey())}
   catch(error){last=error;if(attempt<MAX_SITE_ATTEMPTS&&([429,500,502,503,504].includes(Number(error?.httpStatus))||/failed to fetch|networkerror|load failed|timed out|timeout|429|500|502|503|504/i.test(String(error?.message||error)))){await sleep(600*attempt);continue}throw error}
  }
  throw last||new Error('Blind Prim request failed');
 }
 function summarize(run){
  const counts=Object.fromEntries(Array.from({length:14},(_,i)=>[`P${String(i+1).padStart(2,'0')}`,0])),models={},providers={};let blank=0,complete=0,failed=0;
  for(const item of run?.items||[]){if(item.state==='complete'){complete++;if(!(item.picks||[]).length)blank++;for(const pick of item.picks||[])if(Object.prototype.hasOwnProperty.call(counts,pick.code))counts[pick.code]++;if(item.model)models[item.model]=(models[item.model]||0)+1;if(item.provider)providers[item.provider]=(providers[item.provider]||0)+1}else if(item.state==='failed')failed++;}
  return{population:run?.items?.length||0,complete,failed,blank,primCounts:counts,modelCounts:models,providerCounts:providers,mixedModels:Object.keys(models).length>1,mixedProviders:Object.keys(providers).length>1};
 }
 function newRun(){
  const sweep=sourceSweep();if(!sweep)throw new Error('No Theme Sweep population is available');if(sweep.imageIds.length!==EXPECTED_POPULATION)throw new Error(`Latest Theme Sweep has ${sweep.imageIds.length} images; this Blind Prim test is frozen to ${EXPECTED_POPULATION}.`);
  const rows=read(),runNumber=rows.reduce((m,row)=>Math.max(m,Number(row.runNumber)||0),0)+1,created=now();
  const items=sweep.imageIds.map((imageId,order)=>{const r=record(imageId);return{imageId,order,filename:safeName(r,imageId),state:'pending',attempts:0,picks:[],error:'',model:'',provider:'',providerRouting:null,completedAt:null}});
  const run={id:uid(),schemaVersion:1,type:'blind-prim-test',projectId:projectId(),protocol:'image-plus-14-prim-definitions-only-v1',runNumber,createdAt:created,updatedAt:created,state:'paused',source:{kind:'theme-sweep',sweepId:sweep.id,rootJobId:sweep.rootJobId||null,populationCount:items.length,imageIds:items.map(x=>x.imageId)},constraints:{expectedPopulation:EXPECTED_POPULATION,maxPicks:4,minPicks:0,noThemes:true,noDescriptions:true,noPriorResults:true,noReactionScores:true,noLifecycleWrites:true},items,summary:null};
  replaceRun(run);return run;
 }
 let running=false,stopRequested=false;
 async function runTest(runId=null){
  if(running)return latest();if(!window.GenreactrixCloudApi?.isConfigured?.())throw new Error('Save a Worker URL before running Blind Prims');if(!window.GenreactrixCloudApi?.getKey?.())throw new Error('Analysis key is missing');
  let run=runId?read().find(x=>x.id===runId):latest();if(!run||['complete','complete-with-failures'].includes(run.state))run=newRun();
  if(run.source?.populationCount!==EXPECTED_POPULATION)throw new Error(`Blind Prim run population is ${run.source?.populationCount||0}; expected ${EXPECTED_POPULATION}`);
  running=true;stopRequested=false;run.state='running';run.startedAt=run.startedAt||now();run.updatedAt=now();replaceRun(run);render();
  try{
   for(const item of run.items){if(stopRequested)break;if(item.state==='complete')continue;
    const r=record(item.imageId);if(!r){item.state='failed';item.error='Image record is unavailable';item.attempts++;run.updatedAt=now();replaceRun(run);continue}
    item.state='running';item.error='';item.attempts++;run.updatedAt=now();replaceRun(run);render();
    try{
      const payload=await callOne(item.imageId),result=payload?.result||payload;if(!result||result.protocol!=='blind-prim-image-only-v1'||!Array.isArray(result.picks))throw new Error('Worker returned an invalid Blind Prim result');
      item.state='complete';item.picks=clone(result.picks);item.rawResult=clone(result);const meta=providerMeta(payload);item.model=meta.model;item.provider=meta.provider;item.providerRouting=meta.providerRouting;item.completedAt=now();
    }catch(error){item.state='failed';item.error=String(error?.message||error);item.failedAt=now();if(globalFailure(error)){run.state='paused';run.pauseReason=item.error;run.updatedAt=now();replaceRun(run);render();break}}
    run.summary=summarize(run);run.updatedAt=now();replaceRun(run);render();
   }
   if(stopRequested){run.state='paused';run.pauseReason='Paused by user'}else if(run.state!=='paused'){const remaining=run.items.filter(x=>x.state!=='complete'&&x.state!=='failed').length,failed=run.items.filter(x=>x.state==='failed').length;run.state=remaining?'paused':(failed?'complete-with-failures':'complete');run.completedAt=remaining?null:now();}
   run.summary=summarize(run);run.updatedAt=now();replaceRun(run);return clone(run);
  }finally{running=false;render()}
 }
 function pause(){stopRequested=true;const run=latest();if(run&&run.state==='running'){run.state='paused';run.pauseReason='Paused by user';run.updatedAt=now();replaceRun(run)}render()}
 function retryFailed(){const run=latest();if(!run)throw new Error('No Blind Prim run exists');for(const item of run.items)if(item.state==='failed'){item.state='pending';item.error=''}run.state='paused';run.completedAt=null;run.updatedAt=now();replaceRun(run);return runTest(run.id)}
 function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
 function exportLatest(){const run=latest();if(!run)throw new Error('No Blind Prim run exists');const out=clone(run);out.exportedAt=now();out.summary=summarize(out);const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),stamp=String(out.exportedAt).replace(/[:.]/g,'-');download(blob,`genreactrix-blind-prim-test-${out.runNumber}-${stamp}.json`);return out}
 function render(){
  const status=document.getElementById('aiBlindPrimStatus'),runBtn=document.getElementById('aiBlindPrimRun'),pauseBtn=document.getElementById('aiBlindPrimPause'),retryBtn=document.getElementById('aiBlindPrimRetry'),exportBtn=document.getElementById('aiBlindPrimExport'),sweep=sourceSweep(),run=latest();if(!status||!runBtn)return;
  if(!run){status.textContent=sweep?`Ready · latest Theme Sweep ${sweep.imageIds.length} images`:'No Theme Sweep population';runBtn.textContent=`Run Blind Prims · ${sweep?.imageIds?.length||0}`;runBtn.disabled=!sweep||sweep.imageIds.length!==EXPECTED_POPULATION;}
  else{const s=summarize(run),modelNames=Object.keys(s.modelCounts),modelText=modelNames.length?` · model ${s.mixedModels?'MIXED':modelNames[0]}`:'';status.textContent=`Blind Prim #${run.runNumber} · ${run.state} · ${s.complete}/${s.population} complete${s.failed?` · ${s.failed} failed`:''}${s.blank?` · ${s.blank} blank`:''}${modelText}`;runBtn.textContent=['complete','complete-with-failures'].includes(run.state)?`New Blind Prim Test · ${EXPECTED_POPULATION}`:`Resume Blind Prims · ${s.complete}/${s.population}`;runBtn.disabled=running||(!['complete','complete-with-failures'].includes(run.state)&&run.source?.populationCount!==EXPECTED_POPULATION);}
  if(pauseBtn){pauseBtn.disabled=!running;pauseBtn.hidden=!running}if(retryBtn){const hasFailed=Boolean(run?.items?.some(x=>x.state==='failed'));retryBtn.disabled=running||!hasFailed;retryBtn.hidden=!hasFailed}if(exportBtn){exportBtn.disabled=!run;exportBtn.hidden=!run}
 }
 function init(){
  const run=latest();if(run?.state==='running'){run.state='paused';run.pauseReason='Browser/session interrupted; resume continues from saved item state';run.updatedAt=now();replaceRun(run)}
  document.getElementById('aiBlindPrimRun')?.addEventListener('click',()=>runTest().catch(error=>{const el=document.getElementById('aiBlindPrimStatus');if(el)el.textContent=error.message}));
  document.getElementById('aiBlindPrimPause')?.addEventListener('click',pause);
  document.getElementById('aiBlindPrimRetry')?.addEventListener('click',()=>retryFailed().catch(error=>{const el=document.getElementById('aiBlindPrimStatus');if(el)el.textContent=error.message}));
  document.getElementById('aiBlindPrimExport')?.addEventListener('click',()=>{try{exportLatest()}catch(error){const el=document.getElementById('aiBlindPrimStatus');if(el)el.textContent=error.message}});
  render();
 }
 window.genreactrixBlindPrimTestEngine=Object.freeze({run:runTest,pause,retryFailed,exportLatest,latest,summarize});
 window.addEventListener('DOMContentLoaded',init);window.addEventListener('genreactrix:blind-prim-test',render);window.addEventListener('genreactrix:theme-sweep',render);
})();
