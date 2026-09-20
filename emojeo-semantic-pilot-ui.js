/* Emojeo Semantic Pilot UI — Pass 38
   Adds truthful client-visible progress/diagnostics before another paid run.
   The one-subject test remains separate so a failure costs at most one call. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const state={manifest:null,lastRun:null,controller:null,liveTestPassed:false,timer:null,stage:null,startedAt:0,rows:[]};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const elapsed=ms=>`${(Math.max(0,ms)/1000).toFixed(1)}s`;
const stageLabel=s=>({'preparing':'Preparing','awaiting-worker':'Awaiting Worker response','validating':'Validating/parsing response','retaining-result':'Retaining result','completed':'Completed','failed':'Failed'}[s]||s);
function setProgress(done,total){const pct=total?Math.round(done/total*100):0;$('pilotProgress').style.width=`${pct}%`}
function summarize(m){const sg=m.selection.completeSubgroups;const subgroupSubjects=sg.reduce((n,x)=>n+x.count,0);return `${m.subjects.length} subjects · ${sg.length} complete subgroups (${subgroupSubjects}) + ${m.selection.random.count} seeded random · seed: ${m.seed}`}
function providerText(info){const p=info?.provider;if(!p)return 'provider/model: awaiting response';if(typeof p==='string')return `provider/model: ${p}`;return `provider/model: ${p.provider||p.name||p.id||'reported'}${p.model?` / ${p.model}`:''}`}
function errorText(err){const bits=[String(err?.message||err)];if(err?.name)bits.push(`type ${err.name}`);if(err?.httpStatus)bits.push(`HTTP ${err.httpStatus}`);if(err?.providerDiagnostic)bits.push(`provider ${JSON.stringify(err.providerDiagnostic)}`);if(err?.responsePayload)bits.push(`response ${JSON.stringify(err.responsePayload)}`);return bits.join(' · ')}
function status(info,now=Date.now()){
 if(!info)return;
 const done=Number(info.completed||0),failed=Number(info.failed||0),remaining=Math.max(0,Number(info.total||0)-done-failed);
 const subject=info.subject?`${info.subject.glyph} ${info.subject.name} · ${info.index}/${info.total}`:'';
 const parts=[subject,stageLabel(info.stage),`elapsed ${elapsed(info.elapsedMs??(now-state.startedAt))}`,providerText(info),`completed ${done} · failed ${failed} · remaining ${remaining}`];
 if(info.httpStatus)parts.push(`HTTP ${info.httpStatus}`);
 if(info.providerRouting)parts.push(`routing ${JSON.stringify(info.providerRouting)}`);
 if(info.error)parts.push(`ERROR ${errorText(info.error)}`);
 $('pilotStatus').textContent=parts.filter(Boolean).join(' · ');
}
function renderRows(run){const rows=run?.results||[];$('pilotResults').innerHTML=rows.slice(-8).map(r=>`<div>${esc(r.subject.glyph)} ${esc(r.subject.name)} — ${esc(r.raw?.rawDiscovery?.summary||r.raw?.summary||'completed')}</div>`).join('')}
function download(){if(!state.lastRun)return;const blob=new Blob([JSON.stringify(state.lastRun,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`emojeo-semantic-pilot-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function execute(limit,isTest){
 const btnTest=$('pilotTestRun'),btnFull=$('pilotFullRun'),stop=$('pilotStop');
 btnTest.disabled=true;btnFull.disabled=true;stop.disabled=false;$('pilotDownload').disabled=true;state.controller=new AbortController();state.rows=[];state.stage=null;state.startedAt=Date.now();setProgress(0,limit);$('pilotResults').textContent='';
 state.timer=setInterval(()=>status(state.stage),100);
 try{
  const runner=globalThis.emojeoSemanticPilotRunner.create();
  const run=await runner(state.manifest,{limit,signal:state.controller.signal,
   onStage:info=>{state.stage=info;status(info);},
   onResult:(row,done,total)=>{state.rows.push(row);setProgress(done,total);renderRows({results:state.rows})}
  });
  state.lastRun=run;renderRows(run);$('pilotDownload').disabled=false;
  if(isTest){state.liveTestPassed=true;$('pilotStatus').textContent=`LIVE TEST PASSED · ${run.completedSubjectCount}/${run.startedSubjectCount} retained · full pilot unlocked`;}
  else $('pilotStatus').textContent=`FULL PILOT COMPLETE · ${run.completedSubjectCount}/${run.startedSubjectCount} results retained`;
 }catch(err){
  const current=state.stage||{total:limit,completed:state.rows.length,failed:1,remaining:Math.max(0,limit-state.rows.length-1)};
  const aborted=err?.name==='AbortError'||state.controller?.signal.aborted;
  $('pilotStatus').textContent=`${aborted?'STOPPED BY USER':'STOPPED'} · ${current.subject?`${current.subject.glyph} ${current.subject.name} · ${current.index}/${current.total} · `:''}${stageLabel(current.stage||'failed')} · elapsed ${elapsed(Date.now()-state.startedAt)} · ${errorText(err)}`;
 }finally{
  clearInterval(state.timer);state.timer=null;state.controller=null;stop.disabled=true;btnTest.disabled=false;btnFull.disabled=!state.liveTestPassed;
 }
}
async function init(){
 const required=['pilotMeta','pilotTestRun','pilotFullRun','pilotStop','pilotDownload'];if(required.some(id=>!$(id)))return;
 try{const loaded=await globalThis.emojeoUnicodeCatalog.loadOfficial();state.manifest=globalThis.emojeoSemanticPilot.create(loaded.records);$('pilotMeta').textContent=summarize(state.manifest);$('pilotTestRun').disabled=false;$('pilotStatus').textContent='Ready · no AI calls made · run the 1-emoji live test first.';}
 catch(err){$('pilotMeta').textContent='Pilot unavailable';$('pilotStatus').textContent=String(err?.message||err);return}
 $('pilotTestRun').onclick=()=>execute(1,true);$('pilotFullRun').onclick=()=>execute(state.manifest.subjects.length,false);$('pilotStop').onclick=()=>state.controller?.abort();$('pilotDownload').onclick=download;
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
globalThis.emojeoSemanticPilotUi=Object.freeze({summarize});
})();
