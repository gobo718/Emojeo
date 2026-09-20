/* Emojeo Semantic Pilot UI — Pass 32
   Makes the Pass 31 runner reachable. The one-subject test is deliberately
   separate from the full pilot so a Worker-route failure costs at most one call. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const state={manifest:null,lastRun:null,controller:null,liveTestPassed:false};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setProgress(done,total){const pct=total?Math.round(done/total*100):0;$('pilotProgress').style.width=`${pct}%`}
function summarize(m){const sg=m.selection.completeSubgroups;const subgroupSubjects=sg.reduce((n,x)=>n+x.count,0);return `${m.subjects.length} subjects · ${sg.length} complete subgroups (${subgroupSubjects}) + ${m.selection.random.count} seeded random · seed: ${m.seed}`}
function renderRows(run){const rows=run?.results||[];$('pilotResults').innerHTML=rows.slice(-8).map(r=>`<div>${esc(r.subject.glyph)} ${esc(r.subject.name)} — ${esc(r.raw?.rawDiscovery?.summary||r.raw?.summary||'completed')}</div>`).join('')}
function download(){if(!state.lastRun)return;const blob=new Blob([JSON.stringify(state.lastRun,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`emojeo-semantic-pilot-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function execute(limit,isTest){
 const btnTest=$('pilotTestRun'),btnFull=$('pilotFullRun'),stop=$('pilotStop');
 btnTest.disabled=true;btnFull.disabled=true;stop.disabled=false;$('pilotDownload').disabled=true;state.controller=new AbortController();setProgress(0,limit);$('pilotResults').textContent='';
 $('pilotStatus').textContent=isTest?'Running one paid/live semantic discovery call…':`Running ${limit} semantic discovery calls…`;
 try{
  const runner=globalThis.emojeoSemanticPilotRunner.create();
  const run=await runner(state.manifest,{limit,signal:state.controller.signal,onResult:(row,done,total)=>{setProgress(done,total);$('pilotStatus').textContent=`Completed ${done}/${total} · ${row.subject.glyph} ${row.subject.name}`;renderRows({results:[...(state.lastRun?.results||[]),row]})}});
  state.lastRun=run;renderRows(run);$('pilotDownload').disabled=false;
  if(isTest){state.liveTestPassed=true;$('pilotStatus').textContent='LIVE TEST PASSED · semantic discovery endpoint returned a result · full pilot unlocked';}
  else $('pilotStatus').textContent=`FULL PILOT COMPLETE · ${run.completedSubjectCount}/${run.startedSubjectCount} results retained`;
 }catch(err){$('pilotStatus').textContent=`STOPPED · ${String(err?.message||err)}${String(err?.message||err).toLowerCase().includes('not found')?' · Worker semantic endpoint is not deployed yet.':''}`;}
 finally{state.controller=null;stop.disabled=true;btnTest.disabled=false;btnFull.disabled=!state.liveTestPassed;}
}
async function init(){
 const required=['pilotMeta','pilotTestRun','pilotFullRun','pilotStop','pilotDownload'];if(required.some(id=>!$(id)))return;
 try{const loaded=await globalThis.emojeoUnicodeCatalog.loadOfficial();state.manifest=globalThis.emojeoSemanticPilot.create(loaded.records);$('pilotMeta').textContent=summarize(state.manifest);$('pilotTestRun').disabled=false;$('pilotStatus').textContent='Ready · no AI calls made · run the 1-emoji live test first.';}
 catch(err){$('pilotMeta').textContent='Pilot unavailable';$('pilotStatus').textContent=String(err?.message||err);return}
 $('pilotTestRun').onclick=()=>execute(1,true);$('pilotFullRun').onclick=()=>execute(state.manifest.subjects.length,false);$('pilotStop').onclick=()=>state.controller?.abort();$('pilotDownload').onclick=download;
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();}
globalThis.emojeoSemanticPilotUi=Object.freeze({summarize,init});
})();
