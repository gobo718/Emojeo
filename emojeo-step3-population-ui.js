/* Emojeo Step 3 Population UI — Pass 43 download snapshot repair */
(()=>{'use strict';
const $=id=>document.getElementById(id);let controller=null,lastRun=null,manualStop=false;
const pct=(d,t)=>t?Math.min(100,Math.max(0,d/t*100)):0,pctText=(d,t)=>`${pct(d,t).toFixed(2)}%`;
function currentSnapshot(){return lastRun||globalThis.emojeoStep3Population.loadCheckpoint('step3-diverse-001')}
function dl(name,obj){
 if(!obj){alert('No Step 3 results are saved yet.');return}
 const b=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(b),a=document.createElement('a');
 a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function downloadCurrent(){dl(`emojeo-step3-${new Date().toISOString().replace(/[:.]/g,'-')}.json`,currentSnapshot())}
function paint(s,status,bar){
 const bp=pctText(s.batchDone,s.batchTotal),op=pctText(s.completedUnits,s.totalUnits);
 status.textContent=`BATCH ${s.batchIndex+1}/${s.batchCount} · ${bp} · ${s.batchDone}/${s.batchTotal} | OVERALL ${op} · ${s.completedUnits}/${s.totalUnits} · ${s.subject.glyph} ${s.subject.name} · ${s.domainIndex}/${s.domainTotal} ${s.domain}`;
 bar.style.width=`${pct(s.completedUnits,s.totalUnits)}%`;
}
async function start(auto=false){
 if(controller)return;
 const run=$('step3Run'),stop=$('step3Stop'),down=$('step3Download'),status=$('step3Status'),bar=$('step3Progress');
 manualStop=false;run.disabled=true;stop.disabled=false;down.disabled=false;controller=new AbortController();
 try{
  lastRun=await globalThis.emojeoStep3Population.run({signal:controller.signal,onStage:s=>paint(s,status,bar),onResult:(r,out,s)=>{paint({...s,subject:r.subject,domain:r.domain,domainIndex:(out.completedUnits-1)%81+1,domainTotal:81,completedUnits:out.completedUnits,totalUnits:out.totalUnits},status,bar);down.disabled=false;lastRun=out},onRetry:r=>{status.textContent=`AUTO-RESUME · retry ${r.attempt} in ${Math.round(r.delay/1000)}s · saved through ${r.done}/${r.total} · ${r.error?.message||r.error}`}});
  status.textContent=`100.00% · STEP 3 COMPLETE · ${lastRun.completedUnits}/${lastRun.totalUnits} items saved`;bar.style.width='100%';down.disabled=false;
 }catch(e){
  const cp=globalThis.emojeoStep3Population.loadCheckpoint('step3-diverse-001'),d=cp?.results?.length||0,t=cp?.totalUnits||6399;lastRun=cp||lastRun;down.disabled=false;bar.style.width=`${pct(d,t)}%`;
  status.textContent=manualStop?`${pctText(d,t)} · STOPPED BY USER · ${d}/${t} items saved · RESUME starts at ${Math.min(d+1,t)}/${t}`:`${pctText(d,t)} · PAUSED · ${e?.message||e} · ${d}/${t} items saved`;
 }finally{controller=null;run.disabled=false;stop.disabled=true;run.textContent='RESUME STEP 3 BATCH'}
}
function init(){
 if(!$('step3Run'))return;const cp=globalThis.emojeoStep3Population.loadCheckpoint('step3-diverse-001'),d=cp?.results?.length||0,t=cp?.totalUnits||6399;
 $('step3Status').textContent=cp?`${pctText(d,t)} · SAVED · ${d}/${t} items · ready to resume at ${Math.min(d+1,t)}/${t}`:'0.00% · Ready · 79 subjects × 857 relationships · no calls made.';
 $('step3Progress').style.width=`${pct(d,t)}%`;$('step3Run').textContent=cp?'RESUME STEP 3 BATCH':'RUN STEP 3 BATCH';
 $('step3Run').onclick=()=>start(false);$('step3Stop').onclick=()=>{manualStop=true;controller?.abort()};$('step3Download').disabled=false;$('step3Download').onclick=downloadCurrent;
 /* If a run was interrupted by reload/crash, continue automatically. A deliberate STOP in this page never restarts itself. */
 if(cp&&d<t)setTimeout(()=>start(true),750);
}
document.addEventListener('DOMContentLoaded',init);
})();
