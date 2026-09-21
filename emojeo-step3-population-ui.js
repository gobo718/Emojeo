/* Emojeo Step 3 Population UI — Pass 41 percentage + resume repair */
(()=>{'use strict';
const $=id=>document.getElementById(id);let controller=null,lastRun=null;
const pct=(done,total)=>total?Math.min(100,Math.max(0,done/total*100)):0;
const pctText=(done,total)=>`${pct(done,total).toFixed(2)}%`;
const dl=(name,obj)=>{const b=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
async function start(){
 const run=$('step3Run'),stop=$('step3Stop'),down=$('step3Download'),status=$('step3Status'),bar=$('step3Progress');run.disabled=true;stop.disabled=false;controller=new AbortController();
 try{lastRun=await globalThis.emojeoStep3Population.run({signal:controller.signal,onStage:s=>{const p=pctText(s.completedUnits,s.totalUnits);status.textContent=`${p} · ${s.subject.glyph} ${s.subject.name} · ${s.index}/${s.total} · ${s.domainIndex}/${s.domainTotal} ${s.domain} · ${s.completedUnits}/${s.totalUnits} units retained`;bar.style.width=p}});
 status.textContent=`100.00% · STEP 3 BATCH COMPLETE · ${lastRun.subjectCount} subjects · ${lastRun.relationshipCount} relationships · ${lastRun.completedUnits}/${lastRun.totalUnits} domain units retained`;bar.style.width='100%';down.disabled=false}
 catch(e){const cp=globalThis.emojeoStep3Population.loadCheckpoint('step3-diverse-001'),d=cp?.results?.length||cp?.completedUnits||0,t=cp?.totalUnits||0;status.textContent=`${pctText(d,t)} · ${e?.name==='AbortError'?'STOPPED BY USER':'STOPPED'} · ${e?.message||e} · ${d}/${t} units retained · RUN resumes at ${Math.min(d+1,t)}/${t}`;down.disabled=!cp;lastRun=cp||lastRun;bar.style.width=`${pct(d,t)}%`}
 finally{controller=null;run.disabled=false;stop.disabled=true}
}
function init(){
 if(!$('step3Run'))return;const cp=globalThis.emojeoStep3Population.loadCheckpoint('step3-diverse-001'),d=cp?.results?.length||cp?.completedUnits||0,t=cp?.totalUnits||0;
 $('step3Status').textContent=cp?`${pctText(d,t)} · RESUME READY · ${d}/${t} units retained · next ${Math.min(d+1,t)}/${t}`:'0.00% · Ready · 79 subjects × 857 relationships · no calls made.';
 $('step3Progress').style.width=`${pct(d,t)}%`;$('step3Run').textContent=cp?'RESUME STEP 3 BATCH':'RUN STEP 3 BATCH';
 $('step3Run').onclick=start;$('step3Stop').onclick=()=>controller?.abort();$('step3Download').disabled=!cp;$('step3Download').onclick=()=>dl(`emojeo-step3-${new Date().toISOString().replace(/[:.]/g,'-')}.json`,lastRun||globalThis.emojeoStep3Population.loadCheckpoint('step3-diverse-001'));
}
document.addEventListener('DOMContentLoaded',init);
})();