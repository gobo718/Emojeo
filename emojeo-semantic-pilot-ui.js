/* Emojeo Semantic Pilot UI — resumable checkpoint pass */
(()=>{'use strict';
const $=id=>document.getElementById(id),CHECKPOINT='emojeo-semantic-pilot-checkpoint-v1';
const state={manifest:null,lastRun:null,controller:null,liveTestPassed:false,timer:null,stage:null,startedAt:0,rows:[]};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const elapsed=ms=>`${(Math.max(0,ms)/1000).toFixed(1)}s`;
const stageLabel=s=>({'preparing':'Preparing','awaiting-worker':'Awaiting Worker response','validating':'Validating/parsing response','retaining-result':'Retaining result','completed':'Completed','failed':'Failed'}[s]||s);
function setProgress(done,total){$('pilotProgress').style.width=`${total?Math.round(done/total*100):0}%`}
function summarize(m){const sg=m.selection.completeSubgroups;const n=sg.reduce((a,x)=>a+x.count,0);return `${m.subjects.length} subjects · ${sg.length} complete subgroups (${n}) + ${m.selection.random.count} seeded random · seed: ${m.seed}`}
function providerText(info){const p=info?.provider;if(!p)return 'provider/model: awaiting response';if(typeof p==='string')return `provider/model: ${p}`;return `provider/model: ${p.provider||p.name||p.id||'reported'}${p.model?` / ${p.model}`:''}`}
function errorText(err){const bits=[String(err?.message||err)];if(err?.name)bits.push(`type ${err.name}`);if(err?.httpStatus)bits.push(`HTTP ${err.httpStatus}`);if(err?.providerDiagnostic)bits.push(`provider ${JSON.stringify(err.providerDiagnostic)}`);if(err?.responsePayload)bits.push(`response ${JSON.stringify(err.responsePayload)}`);return bits.join(' · ')}
function status(info,now=Date.now()){if(!info)return;const done=Number(info.completed||0),failed=Number(info.failed||0),remaining=Math.max(0,Number(info.total||0)-done-failed),subject=info.subject?`${info.subject.glyph} ${info.subject.name} · ${info.index}/${info.total}`:'';$('pilotStatus').textContent=[subject,stageLabel(info.stage),`elapsed ${elapsed(info.elapsedMs??(now-state.startedAt))}`,providerText(info),`completed ${done} · failed ${failed} · remaining ${remaining}`,info.httpStatus?`HTTP ${info.httpStatus}`:'',info.providerRouting?`routing ${JSON.stringify(info.providerRouting)}`:'',info.error?`ERROR ${errorText(info.error)}`:''].filter(Boolean).join(' · ')}
function renderRows(run){const rows=run?.results||[];$('pilotResults').innerHTML=rows.slice(-8).map(r=>`<div>${esc(r.subject.glyph)} ${esc(r.subject.name)} — ${esc(r.raw?.rawDiscovery?.summary||r.raw?.summary||'completed')}</div>`).join('')}
function snapshot(){return{schemaVersion:1,kind:'emojeo-semantic-pilot-run',pilotSeed:state.manifest?.seed||null,startedSubjectCount:state.manifest?.subjects?.length||0,completedSubjectCount:state.rows.length,results:state.rows}}
function save(){if(!state.manifest)return;localStorage.setItem(CHECKPOINT,JSON.stringify(snapshot()));state.lastRun=snapshot();$('pilotDownload').disabled=!state.rows.length}
function load(){try{const x=JSON.parse(localStorage.getItem(CHECKPOINT)||'null');if(x?.pilotSeed===state.manifest?.seed&&Array.isArray(x.results))return x.results}catch{}return[]}
function download(){const run=state.lastRun||snapshot();if(!run.results?.length)return;const blob=new Blob([JSON.stringify(run,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`emojeo-semantic-pilot-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function execute(limit,isTest){
 const btnTest=$('pilotTestRun'),btnFull=$('pilotFullRun'),stop=$('pilotStop');btnTest.disabled=true;btnFull.disabled=true;stop.disabled=false;state.controller=new AbortController();state.stage=null;state.startedAt=Date.now();
 if(isTest){state.rows=[]}else{state.rows=load()}
 const startIndex=isTest?0:Math.min(state.rows.length,limit);setProgress(state.rows.length,limit);renderRows({results:state.rows});$('pilotDownload').disabled=!state.rows.length;state.timer=setInterval(()=>status(state.stage),100);
 try{
  const runner=globalThis.emojeoSemanticPilotRunner.create();
  const run=await runner(state.manifest,{limit,startIndex,initialRows:state.rows,signal:state.controller.signal,onStage:info=>{state.stage=info;status(info)},onResult:(row,done,total)=>{state.rows.push(row);save();setProgress(done,total);renderRows({results:state.rows})}});
  state.rows=run.results;state.lastRun=run;save();renderRows(run);$('pilotDownload').disabled=false;
  if(isTest){state.liveTestPassed=true;$('pilotStatus').textContent=`LIVE TEST PASSED · ${run.completedSubjectCount}/${run.startedSubjectCount} retained · full pilot unlocked`}
  else{$('pilotStatus').textContent=`FULL PILOT COMPLETE · ${run.completedSubjectCount}/${run.startedSubjectCount} results retained`;localStorage.removeItem(CHECKPOINT)}
 }catch(err){
  save();const current=state.stage||{total:limit,completed:state.rows.length,failed:1};const aborted=err?.name==='AbortError'||state.controller?.signal.aborted;
  $('pilotStatus').textContent=`${aborted?'STOPPED BY USER':'STOPPED'} · ${current.subject?`${current.subject.glyph} ${current.subject.name} · ${current.index}/${current.total} · `:''}${stageLabel(current.stage||'failed')} · elapsed ${elapsed(Date.now()-state.startedAt)} · ${errorText(err)} · ${state.rows.length}/${limit} retained · RUN FULL PILOT will resume at ${Math.min(state.rows.length+1,limit)}/${limit}`;
 }finally{clearInterval(state.timer);state.timer=null;state.controller=null;stop.disabled=true;btnTest.disabled=false;btnFull.disabled=!state.liveTestPassed}
}
async function init(){
 const required=['pilotMeta','pilotTestRun','pilotFullRun','pilotStop','pilotDownload'];if(required.some(id=>!$(id)))return;
 try{const loaded=await globalThis.emojeoUnicodeCatalog.loadOfficial();state.manifest=globalThis.emojeoSemanticPilot.create(loaded.records);$('pilotMeta').textContent=summarize(state.manifest);state.rows=load();state.lastRun=state.rows.length?snapshot():null;$('pilotTestRun').disabled=false;$('pilotDownload').disabled=!state.rows.length;if(state.rows.length){state.liveTestPassed=true;$('pilotFullRun').disabled=false;setProgress(state.rows.length,state.manifest.subjects.length);renderRows({results:state.rows});$('pilotStatus').textContent=`RESUME READY · ${state.rows.length}/${state.manifest.subjects.length} retained · RUN FULL PILOT resumes at ${state.rows.length+1}/${state.manifest.subjects.length}`}else $('pilotStatus').textContent='Ready · no AI calls made · run the 1-emoji live test first.'}
 catch(err){$('pilotMeta').textContent='Pilot unavailable';$('pilotStatus').textContent=String(err?.message||err);return}
 $('pilotTestRun').onclick=()=>execute(1,true);$('pilotFullRun').onclick=()=>execute(state.manifest.subjects.length,false);$('pilotStop').onclick=()=>state.controller?.abort();$('pilotDownload').onclick=download;
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);globalThis.emojeoSemanticPilotUi=Object.freeze({summarize});
})();
