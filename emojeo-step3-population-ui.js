/* Emojeo Step 3 Population UI — Pass 40 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
let controller=null,lastRun=null;
const dl=(name,obj)=>{const b=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
async function start(){
 const run=$('step3Run'),stop=$('step3Stop'),down=$('step3Download'),status=$('step3Status'),bar=$('step3Progress');
 run.disabled=true;stop.disabled=false;controller=new AbortController();
 try{
  lastRun=await globalThis.emojeoStep3Population.run({signal:controller.signal,onStage:s=>{
   status.textContent=`${s.subject.glyph} ${s.subject.name} · ${s.index}/${s.total} · ${s.domainIndex}/${s.domainTotal} ${s.domain} · ${s.completedUnits}/${s.totalUnits} units retained`;
   bar.style.width=`${Math.round(s.completedUnits/s.totalUnits*100)}%`;
  }});
  status.textContent=`STEP 3 BATCH COMPLETE · ${lastRun.subjectCount} subjects · ${lastRun.relationshipCount} relationships · ${lastRun.completedUnits}/${lastRun.totalUnits} domain units retained`;
  bar.style.width='100%';down.disabled=false;
 }catch(e){
  const cp=globalThis.emojeoStep3Population.loadCheckpoint('step3-diverse-001');
  status.textContent=`${e?.name==='AbortError'?'STOPPED BY USER':'STOPPED'} · ${e?.message||e} · ${cp?.completedUnits||0}/${cp?.totalUnits||0} units retained · RUN resumes`;
  down.disabled=!cp;lastRun=cp||lastRun;
 }finally{controller=null;run.disabled=false;stop.disabled=true}
}
function init(){
 if(!$('step3Run'))return;
 const cp=globalThis.emojeoStep3Population.loadCheckpoint('step3-diverse-001');
 $('step3Status').textContent=cp?`RESUME READY · ${cp.completedUnits}/${cp.totalUnits} units retained`:'Ready · 79 subjects × 857 relationships · no calls made.';
 $('step3Run').onclick=start;$('step3Stop').onclick=()=>controller?.abort();
 $('step3Download').disabled=!cp;$('step3Download').onclick=()=>dl(`emojeo-step3-${new Date().toISOString().replace(/[:.]/g,'-')}.json`,lastRun||globalThis.emojeoStep3Population.loadCheckpoint('step3-diverse-001'));
}
document.addEventListener('DOMContentLoaded',init);
})();