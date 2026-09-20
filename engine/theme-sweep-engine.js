/* Genreactrix Theme Sweep Engine v1
   Pack-level Theme decontamination layer.
   Pass 1 uses canonical Theme order. Passes 2-3 use one fixed shuffled order per pass.
   Only the most-repeated exact triplet is held after passes 1-2; pass 3 verifies and releases valid results. */
(()=>{'use strict';
 const KEY='genreactrix-theme-sweeps-v1';
 const clone=v=>v==null?v:structuredClone(v),now=()=>new Date().toISOString();
 const uid=()=>`theme_sweep_${Date.now().toString(36)}_${crypto.randomUUID?.()?.slice?.(0,8)||Math.random().toString(16).slice(2,10)}`;
 function read(){try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(rows)?rows:[]}catch{return[]}}
 function write(rows){localStorage.setItem(KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('genreactrix:theme-sweep'));render();}
 function updateSweep(id,patch){const rows=read(),index=rows.findIndex(row=>row.id===id);if(index<0)return null;rows[index]={...rows[index],...clone(patch),updatedAt:now()};write(rows);return clone(rows[index]);}
 function get(id){return clone(read().find(row=>row.id===String(id))||null)}
 function latest(){const projectId=window.genreactrixProjectRuntimeEngine?.projectId?.()||'',rows=read().filter(row=>!projectId||!row.projectId||row.projectId===projectId);return clone(rows.slice().sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||''))).at(-1)||null)}
 function record(id){return window.genreactrixImageRecordEngine?.get?.(String(id),{touch:false})||null}
 function setHold(imageId,held,sweepId,pass,detail={}){const r=record(imageId);if(!r)return null;return window.genreactrixImageRecordEngine?.update?.(String(imageId),{metadata:{extended:{themeSweepHold:Boolean(held),themeSweepId:sweepId||null,themeSweepPass:Number(pass)||null,themeSweepHoldReason:held?String(detail.reason||'theme-sweep'):null,themeSweepReleasedAt:held?null:now(),themeSweepReleasedPass:held?null:(Number(pass)||null)}}},held?'theme-sweep-held':'theme-sweep-released')||null}
 function holdMany(ids,sweepId,pass,reason='theme-sweep'){for(const id of ids||[])setHold(id,true,sweepId,pass,{reason});}
 function releaseMany(ids,sweepId,pass){for(const id of ids||[])setHold(id,false,sweepId,pass);}
 function themeRows(r){const rows=r?.analysis?.ai?.components?.themes;return Array.isArray(rows)?rows.slice(0,3):[]}
 function triplet(r){
  if(String(r?.components?.aiThemes||'')!=='current')return null;
  const rows=themeRows(r),codes=rows.map(row=>String(row?.code||row?.id||row?.value||'').trim().toUpperCase()).filter(Boolean);
  if(codes.length!==3||new Set(codes).size!==3||codes.some(code=>!/^PFM\d{4}$/.test(code)))return null;
  const labels=rows.map((row,index)=>String(row?.name||row?.label||codes[index]));
  return{key:codes.join('|'),codes,labels};
 }
 function evaluate(imageIds,pass){
  const successful=[],failed=[];
  for(const id of imageIds||[]){const r=record(id),t=triplet(r);if(t)successful.push({imageId:String(id),...t});else failed.push(String(id));}
  if(Number(pass)>=3)return{pass:Number(pass),analyzed:(imageIds||[]).length,successful:successful.length,failedIds:failed,releaseIds:successful.map(row=>row.imageId),holdIds:[...failed],triplet:null};
  const counts=new Map(),firstIndex=new Map();successful.forEach((row,index)=>{counts.set(row.key,(counts.get(row.key)||0)+1);if(!firstIndex.has(row.key))firstIndex.set(row.key,index)});
  let winner=null;
  for(const [key,count] of counts){if(count<2)continue;const idx=firstIndex.get(key);if(!winner||count>winner.count||(count===winner.count&&idx<winner.firstIndex)){const row=successful[idx];winner={key,count,firstIndex:idx,codes:[...row.codes],labels:[...row.labels]};}}
  const cursedIds=winner?successful.filter(row=>row.key===winner.key).map(row=>row.imageId):[];
  const cursedSet=new Set(cursedIds),releaseIds=successful.filter(row=>!cursedSet.has(row.imageId)).map(row=>row.imageId),holdIds=[...cursedIds,...failed];
  return{pass:Number(pass),analyzed:(imageIds||[]).length,successful:successful.length,failedIds:failed,releaseIds,holdIds,triplet:winner};
 }
 function recoverResidualPass(sweepId){
  const current=get(sweepId);if(!current)return null;
  const pass=Math.max(1,Math.min(3,Number(current.currentPass)||1)),key=String(pass),currentPass=current.passes?.[key]||current.passes?.[pass];
  if(currentPass?.state!=='blocked'||currentPass?.residualRecoveryApplied)return current;
  const residualIds=[...new Set((currentPass.imageIds||[]).map(String))];if(!residualIds.length)return current;
  const residualOutcome=evaluate(residualIds,pass);
  // This migration is only for a stranded residual job: all images in the new, smaller
  // sweep still fail, while an earlier sweep contains those same failed images plus
  // valid siblings from the original pass.
  if(residualOutcome.successful>0||residualOutcome.failedIds.length!==residualIds.length)return current;
  const residualSet=new Set(residualIds),projectId=String(current.projectId||''),createdAt=String(current.createdAt||'');
  const candidates=read().filter(row=>row.id!==current.id&&(!projectId||!row.projectId||String(row.projectId)===projectId)&&String(row.createdAt||'')<=createdAt).map(row=>{
    const candidatePass=row.passes?.[key]||row.passes?.[pass],ids=[...new Set((candidatePass?.imageIds||row.imageIds||[]).map(String))];
    if(ids.length<=residualIds.length||!residualIds.every(id=>ids.includes(id)))return null;
    const outcome=evaluate(ids,pass),failedSet=new Set(outcome.failedIds.map(String));
    if(outcome.successful<=0||outcome.failedIds.length!==residualIds.length||!residualIds.every(id=>failedSet.has(id)))return null;
    return{row,candidatePass,ids,outcome};
  }).filter(Boolean).sort((a,b)=>String(b.row.createdAt||'').localeCompare(String(a.row.createdAt||''))||b.ids.length-a.ids.length);
  const match=candidates[0];if(!match)return current;
  const passes=clone(current.passes||{}),prior=clone(match.candidatePass||{});
  passes[key]={...prior,...clone(match.outcome),pass,state:'blocked',jobId:currentPass.jobId||prior.jobId||null,imageIds:[...match.ids],blockedAt:currentPass.blockedAt||prior.blockedAt||now(),residualRecoveryApplied:true,residualRecoveryAt:now(),recoveredFromSweepId:match.row.id,recoveredResidualImageIds:[...residualIds]};
  holdMany(match.ids,current.id,pass,`theme-sweep-pass-${pass}-recovered-incomplete`);
  return updateSweep(current.id,{imageIds:[...match.ids],rootJobId:match.row.rootJobId||current.rootJobId,passes,currentPass:pass,state:'blocked',residualRecoveryApplied:true,residualRecoveryAt:now(),recoveredFromSweepId:match.row.id});
 }
 function makeSeed(sweepId,pass){const rnd=crypto.getRandomValues?.(new Uint32Array(2));return `${sweepId}:pass${pass}:${rnd?`${rnd[0].toString(16)}${rnd[1].toString(16)}`:`${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`}`}
 function begin({jobId,imageIds}){
  const ids=[...new Set((imageIds||[]).map(String))];if(!ids.length)return null;
  const sweep={id:uid(),schemaVersion:1,projectId:window.genreactrixProjectRuntimeEngine?.projectId?.()||'',state:'running',createdAt:now(),updatedAt:now(),rootJobId:String(jobId||''),imageIds:ids,currentPass:1,passes:{1:{pass:1,state:'running',orderMode:'canonical',orderSeed:null,imageIds:ids,startedAt:now()},2:{pass:2,state:'waiting',orderMode:'shuffled',orderSeed:null,imageIds:[]},3:{pass:3,state:'waiting',orderMode:'shuffled',orderSeed:null,imageIds:[]}}};
  const rows=read();rows.push(sweep);write(rows);holdMany(ids,sweep.id,1,'theme-sweep-pass-1');return clone(sweep);
 }
 function attachPassJob(sweepId,pass,jobId,imageIds,orderSeed=null){const sweep=get(sweepId);if(!sweep)return null;const passes=clone(sweep.passes||{}),key=String(pass);passes[key]={...(passes[key]||{}),pass:Number(pass),state:'running',jobId:String(jobId||''),imageIds:[...new Set((imageIds||[]).map(String))],orderMode:Number(pass)===1?'canonical':'shuffled',orderSeed:orderSeed||passes[key]?.orderSeed||null,startedAt:passes[key]?.startedAt||now()};return updateSweep(sweepId,{currentPass:Number(pass),passes,state:'running'});}
 function blockPassForFailures(sweepId,pass,result){
  const sweep=get(sweepId);if(!sweep)return null;const passes=clone(sweep.passes||{}),key=String(pass),failedIds=[...(result?.failedIds||[])];
  // Atomic pass rule: keep the entire pass population held. No release and no next pass
  // until every assigned image has a valid three-Theme result.
  holdMany(result?.imageIds||passes[key]?.imageIds||[],sweepId,pass,`theme-sweep-pass-${pass}-incomplete`);
  passes[key]={...(passes[key]||{}),...clone(result),state:'blocked',blockedAt:now(),failedIds};
  return updateSweep(sweepId,{passes,currentPass:Number(pass),state:'blocked'});
 }
 function markPassRetrying(sweepId,pass){
  const sweep=get(sweepId);if(!sweep)return null;const passes=clone(sweep.passes||{}),key=String(pass),p=passes[key]||{};
  passes[key]={...p,state:'running',retryCount:(Number(p.retryCount)||0)+1,lastRetryAt:now()};
  return updateSweep(sweepId,{passes,currentPass:Number(pass),state:'running'});
 }
 function finishPass(sweepId,pass,result){
  const sweep=get(sweepId);if(!sweep)return null;const passes=clone(sweep.passes||{}),key=String(pass),summary={...clone(result),completedAt:now()};passes[key]={...(passes[key]||{}),...summary,state:'complete'};
  releaseMany(result.releaseIds,sweepId,pass);
  if(result.holdIds.length)holdMany(result.holdIds,sweepId,pass,Number(pass)>=3?'theme-sweep-unresolved':'theme-sweep-next-pass');
  const patch={passes,currentPass:Number(pass),updatedAt:now()};
  if(Number(pass)>=3||!result.holdIds.length){patch.state=result.holdIds.length?'complete-with-failures':'complete';patch.completedAt=now();}
  return updateSweep(sweepId,patch);
 }
 function forceFinishPass(sweepId,pass,result){
  const sweep=get(sweepId);if(!sweep)return null;const failedIds=[...new Set((result?.failedIds||[]).map(String))],failedSet=new Set(failedIds),recoveryIds=[...new Set((result?.holdIds||[]).map(String))].filter(id=>!failedSet.has(id)),releaseIds=[...new Set((result?.releaseIds||[]).map(String))].filter(id=>!failedSet.has(id));
  const passes=clone(sweep.passes||{}),key=String(pass),summary={...clone(result),holdIds:recoveryIds,releaseIds,abandonedFailedIds:failedIds,forcedContinue:true,completedAt:now()};
  passes[key]={...(passes[key]||{}),...summary,state:'complete'};
  releaseMany(releaseIds,sweepId,pass);
  if(recoveryIds.length)holdMany(recoveryIds,sweepId,pass,Number(pass)>=3?'theme-sweep-unresolved':'theme-sweep-next-pass');
  if(failedIds.length)holdMany(failedIds,sweepId,pass,'theme-sweep-catastrophic-failure-excluded');
  const patch={passes,currentPass:Number(pass),updatedAt:now()};
  if(Number(pass)>=3||!recoveryIds.length){patch.state=failedIds.length?'complete-with-failures':'complete';patch.completedAt=now();}
  else patch.state='running';
  return updateSweep(sweepId,patch);
 }
 function prepareNext(sweepId,nextPass,imageIds){const sweep=get(sweepId);if(!sweep)return null;const ids=[...new Set((imageIds||[]).map(String))],seed=makeSeed(sweepId,nextPass),passes=clone(sweep.passes||{}),key=String(nextPass);passes[key]={...(passes[key]||{}),pass:Number(nextPass),state:'queued',orderMode:'shuffled',orderSeed:seed,imageIds:ids,queuedAt:now()};holdMany(ids,sweepId,nextPass,`theme-sweep-pass-${nextPass}`);updateSweep(sweepId,{passes,currentPass:Number(nextPass),state:'running'});return{pass:Number(nextPass),imageIds:ids,orderMode:'shuffled',orderSeed:seed};}
 function formatPass(sweep,pass){const p=sweep?.passes?.[String(pass)]||sweep?.passes?.[pass];if(!p)return'Not started';if(p.state==='bypassed')return`${p.imageIds?.length||0} staged · manual move to Pass 2`;if(p.state==='waiting')return String(sweep?.state||'').startsWith('complete')?'Not needed':'Not needed yet';if(p.state==='queued')return`${p.imageIds?.length||0} queued`;
  if(p.state==='running')return`${p.imageIds?.length||0} analyzing${p.retryCount?` · retry ${p.retryCount}`:''}…`;
  if(p.state==='blocked'){const total=Number(p.imageIds?.length)||Number(p.analyzed)||0,failed=Array.isArray(p.failedIds)?p.failedIds.length:0,valid=Math.max(0,total-failed);return`${valid}/${total} valid · ${failed} failed · automatic recovery`;}
  if(p.state==='complete'){
   const analyzed=Number(p.analyzed)||Number(p.imageIds?.length)||0,failed=Array.isArray(p.failedIds)?p.failedIds.length:0;
   if(Number(pass)===3)return`${analyzed} verification rerun${analyzed===1?'':'s'} · ${Number(p.releaseIds?.length)||0} released${failed?` · ${failed} unresolved`:''}`;
   if(p.triplet?.count){const label=(p.triplet.labels||p.triplet.codes||[]).join(' / ');return`${analyzed} analyzed · ${p.triplet.count} rerunning: ${label}${failed?` · ${failed} failed`:''}`;}
   return`${analyzed} analyzed · no repeated triplet${failed?` · ${failed} failed`:''}`;
  }
  return String(p.state||'');
 }
 function render(){const sweep=latest();for(const pass of [1,2,3]){const el=document.getElementById(`aiThemeSweepPass${pass}`);if(el)el.textContent=sweep?formatPass(sweep,pass):'Idle';}const wrap=document.getElementById('aiThemeSweepStatus');if(wrap)wrap.dataset.state=sweep?.state||'idle';}
 function clearCompletedHolds(){const activeIds=new Set(read().filter(row=>['running','blocked'].includes(String(row.state||''))).map(row=>row.id));for(const r of window.genreactrixImageRecordEngine?.all?.()||[]){const ext=r.metadata?.extended||{};if(ext.themeSweepHold&&ext.themeSweepId&&!activeIds.has(String(ext.themeSweepId))&&String(r.components?.aiThemes||'')==='current')setHold(r.id,false,ext.themeSweepId,ext.themeSweepPass||3);}}
 const api={begin,get,latest,evaluate,recoverResidualPass,attachPassJob,blockPassForFailures,markPassRetrying,finishPass,forceFinishPass,prepareNext,render,clearCompletedHolds};
 window.genreactrixThemeSweepEngine=Object.freeze(api);
 window.addEventListener('DOMContentLoaded',()=>{try{clearCompletedHolds();render();}catch(error){console.warn('Theme Sweep initialization failed',error)}});
 window.addEventListener('genreactrix:theme-sweep',render);
})();
