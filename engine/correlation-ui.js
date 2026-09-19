(()=>{
'use strict';
let latest=null,view='discoveries';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function render(){const body=document.getElementById('correlationBody');if(!body)return;if(view==='discoveries'){const rows=latest?.findings||[];body.innerHTML=rows.length?`<div class="correlation-finding-list">${rows.map((f,i)=>`<article><div><strong>${esc(f.title)}</strong><span>${esc(f.kind)} · ${f.count||0} records · strength ${Number(f.strength||0).toFixed(2)}</span><p>${esc(f.description)}</p></div><button data-correlation-drill="${i}" type="button">Open evidence</button></article>`).join('')}</div>`:'<p>Run discovery to generate candidate findings.</p>';return}
 if(view==='library'){const rows=await window.genreactrixFindingLibraryEngine.allFindings();body.innerHTML=rows.length?`<div class="correlation-finding-list">${rows.map(f=>`<article><div><strong>${esc(f.title)}</strong><span>${esc(f.status)} · ${esc(f.kind)}</span><p>${esc(f.description)}</p></div><select data-finding-status="${f.id}"><option ${f.status==='new'?'selected':''}>new</option><option ${f.status==='reviewed'?'selected':''}>reviewed</option><option ${f.status==='accepted'?'selected':''}>accepted</option><option ${f.status==='rejected'?'selected':''}>rejected</option></select></article>`).join('')}</div>`:'<p>No saved findings yet.</p>';return}
 const rows=await window.genreactrixFindingLibraryEngine.allHypotheses();body.innerHTML=`<div class="hypothesis-form"><input id="hypothesisStatement" placeholder="Research hypothesis"><button id="hypothesisAdd" type="button">Add hypothesis</button></div>${rows.length?`<div class="correlation-finding-list">${rows.map(h=>`<article><div><strong>${esc(h.statement)}</strong><span>${esc(h.status)}</span><p>${esc(h.notes||'')}</p></div></article>`).join('')}</div>`:'<p>No hypotheses yet.</p>'}`}
async function discover(){document.getElementById('correlationStatus').textContent='Discovering…';latest=await window.genreactrixCorrelationEngine.run({minCount:document.getElementById('correlationMinCount').value,minStrength:document.getElementById('correlationMinStrength').value});document.getElementById('correlationStatus').textContent=`${latest.findings.length} candidate findings from ${latest.recordCount} records`;document.getElementById('correlationImport').disabled=!latest.findings.length;view='discoveries';await render()}
async function openEvidence(i){
 const f=latest?.findings?.[i];
 if(!f)return;
 const all=window.genreactrixImageRecordEngine?.all?.()||[];
 let ids=[];
 if(f.kind==='theme-reaction'){
  ids=all.filter(r=>{const d=r.analysis?.director||r.director||{};const rs=d.reactions||d.selectedReactions||[];const ts=(d.themes||[]).map(x=>typeof x==='string'?x:(x.label||x.id));return rs.includes(f.reaction)&&ts.includes(f.theme)}).map(r=>r.id);
 }else if(f.kind==='rare-pair'){
  const parts=f.pair.split(' × ');
  ids=all.filter(r=>{const rs=(r.analysis?.director?.reactions||r.director?.reactions||[]);return parts.every(x=>rs.includes(x))}).map(r=>r.id);
 }else{
  ids=all.filter(r=>String(r.batchId||r.batch?.id||'')===f.batch||String(r.source?.type||r.sourceType||'')===f.source).map(r=>r.id);
 }
 await window.genreactrixReportsEngine?.generate?.({title:f.title,scope:{type:'selected',imageIds:ids},filters:{logic:'and',conditions:[]},modules:['summary','reactions','themes','agreement']});
 window.genreactrixReportsEngine?.openConsole?.();
}
function openConsole(){document.getElementById('correlationDialog')?.showModal();render()}
function bind(){document.getElementById('correlationClose')?.addEventListener('click',()=>document.getElementById('correlationDialog')?.close());document.getElementById('correlationRun')?.addEventListener('click',discover);document.getElementById('correlationImport')?.addEventListener('click',async()=>{const n=await window.genreactrixFindingLibraryEngine.importRun(latest);document.getElementById('correlationStatus').textContent=`Saved ${n} new findings`;view='library';render()});document.getElementById('correlationDialog')?.addEventListener('click',async e=>{const tab=e.target.closest('[data-correlation-view]')?.dataset.correlationView;if(tab){view=tab;render()}const i=e.target.closest('[data-correlation-drill]')?.dataset.correlationDrill;if(i!=null)openEvidence(Number(i));const id=e.target.closest('[data-finding-status]')?.dataset.findingStatus;if(id&&e.target.tagName==='SELECT'){await window.genreactrixFindingLibraryEngine.updateFinding(id,{status:e.target.value});render()}if(e.target.id==='hypothesisAdd'){const statement=document.getElementById('hypothesisStatement')?.value.trim();if(statement){await window.genreactrixFindingLibraryEngine.createHypothesis({statement});document.getElementById('hypothesisStatement').value='';render()}}});window.addEventListener('genreactrix:open-correlation',openConsole)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind):bind();window.genreactrixCorrelationUi={openConsole};
})();
