(()=>{'use strict';
const $=id=>document.getElementById(id),KBASE='emojeo-step4-pass76-runner-base',KJOB='emojeo-step4-pass76-job';
let U,R,O,A=new Map(),M=new Map(),items=[];
const fixed=[
 [3,'A0003'],[3,'A0007'],[54,'A0014'],[54,'A0017'],[0,'A0001'],[1,'A0021'],
 [54,'A0010'],[24,'A0004'],[38,'A0019'],[46,'A0022'],[29,'A0011'],[72,'A0017']
];
const routes=a=>({HAS_EXPRESSION:['DIRECT_VISUAL'],HAS_OBJECT:['DIRECT_VISUAL'],HAS_PART:['DIRECT_VISUAL'],HAS_FUNCTION:['FUNCTIONAL'],HAS_SYMPTOM:['CONDITION_SYMPTOM','CONVENTIONAL_SEMANTIC'],IMPLIES_SETTING:['CONTEXTUAL','CONVENTIONAL_SEMANTIC'],CONTRASTS_WITH:['SHARED_AXIS','CONVENTIONAL_SEMANTIC'],SIMILAR_TO:['SHARED_AXIS','CONVENTIONAL_SEMANTIC'],HAS_POSITIVE_VALENCE:['CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC'],HAS_NEGATIVE_VALENCE:['CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC'],SYMBOLIZES_ASSOCIATES_WITH:['CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC']}[a.relationshipType]||['CONVENTIONAL_SEMANTIC','SYMBOLIC_METAPHORIC','DIRECT_VISUAL','FUNCTIONAL','CONTEXTUAL','SHARED_AXIS']);
const guard=a=>({HAS_OBJECT:'A hypothetical interaction alone is weak support.',HAS_PART:'Mere resemblance or metaphor is not automatically a part.',HAS_FUNCTION:'A possible creative use alone is weak support.',HAS_SYMPTOM:'A recognizable manifestation can qualify even if non-universal; do not require visual depiction.',IMPLIES_SETTING:'A sound, emotion, or event that could happen somewhere is not by itself an environment.',CONTRASTS_WITH:'Use UNCERTAIN when a real comparison axis is debatable.',SIMILAR_TO:'Co-occurrence alone is weak support.',CONVEYS_EMOTION:'Literal facial expression and universality are not required.',HAS_POSITIVE_VALENCE:'The domain label is not a hard gate.',HAS_NEGATIVE_VALENCE:'The domain label is not a hard gate.'}[a.relationshipType]||'Use the sealed ontology definition; do not narrow it.');
function prompt(caseId,s,a,m){const fmt=`${caseId}|STATE=<PRESENT|ABSENT|UNCERTAIN>|ROUTE=<route>`;return[
'EMOJEO STEP 4 PRODUCTION SEMANTIC JUDGMENT — PASS 76 ACCEPTANCE',
'Judge ONE emoji against ONE exact assertion. The SEALED ONTOLOGY DEFINITION is authoritative.',
'The ontology domain is descriptive context, NOT a hard applicability gate.',
'Do NOT require universality, necessity, diagnostic certainty, or truth in every use.',
'If a recognizable and defensible relationship satisfies the exact predicate, favor surfacing it as PRESENT.',
'Use UNCERTAIN freely when PRESENT and ABSENT are both understandable readings.',
'ABSENT is for invented scenarios, possible-consequence-only reasoning, co-occurrence-only reasoning, category difference, or reasoning that clearly proves another predicate.',
`SUBJECT=${s.glyph} ${s.name}`,`ASSERTION=${a.assertionId}|${a.relationshipType}|${a.tag}`,
`ONTOLOGY_DOMAIN=${m.domain||'(none)'}`,`ONTOLOGY_DEFINITION=${m.definition}`,
`PREFERRED_ROUTE_LABELS=${routes(a).join(', ')}`,`ANTI_DRIFT=${guard(a)}`,
'Return exactly ONE observation.',`Put a verdict token in BOTH summary and observations[0].phrase: ${fmt}`,
'Use observations[0].description for reasoning, observations[0].evidence for concrete support, and numeric confidence 0.0-1.0.',
'Do not try to match a hidden expected answer. There is no expected answer.'
].join('\n')}
function make(si,aid,n){const s=R.subjects[si],a=A.get(aid),m=M.get(a.relationshipType);return{caseId:`AC${String(n).padStart(2,'0')}`,subject:{index:si,glyph:s.glyph,name:s.name},assertion:{assertionId:a.assertionId,relationshipType:a.relationshipType,tag:a.tag},prompt:prompt(`AC${String(n).padStart(2,'0')}`,s,a,m)}}
function build(){
 let picks=[...fixed],seen=new Set(picks.map(x=>x.join('|')));
 const desired=['HAS_EXPRESSION','HAS_OBJECT','HAS_PART','HAS_FUNCTION','HAS_SYMPTOM','IMPLIES_SETTING','CONTRASTS_WITH','SIMILAR_TO','HAS_POSITIVE_VALENCE','HAS_NEGATIVE_VALENCE','SYMBOLIZES_ASSOCIATES_WITH','CONVEYS_EMOTION','HAS_STATE_CONDITION'];
 const assertions=U.assertions;
 for(let k=0;picks.length<40&&k<5000;k++){
  const type=desired[k%desired.length],pool=assertions.filter(a=>a.relationshipType===type);if(!pool.length)continue;
  const a=pool[(k*17+5)%pool.length],si=(k*23+7)%R.subjects.length,key=`${si}|${a.assertionId}`;
  if(seen.has(key))continue;seen.add(key);picks.push([si,a.assertionId]);
 }
 items=picks.slice(0,40).map((x,i)=>make(x[0],x[1],i+1));
 $('sample').textContent=items.map(x=>`${x.caseId} ${x.subject.glyph} ${x.assertion.relationshipType} → ${x.assertion.tag}`).join('\n');
}
const base=()=>String($('base').value||'').trim().replace(/\/+$/,'');
const key=()=>window.GenreactrixCloudApi?.getKey?.()||'';
async function req(path,opt={}){const r=await fetch(base()+path,{...opt,headers:{'content-type':'application/json','x-analysis-key':key(),...(opt.headers||{})}}),j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||`HTTP ${r.status}`);return j}
async function init(){
 $('base').value=localStorage.getItem(KBASE)||'';
 const [u,r,o]=await Promise.all(['Emojeo_STEP4_Assertion_Universe_v001.json','Emojeo_STEP4_RunSpec_v001.json','Emojeo_STEP3_Semantic_Inventory_1211_v013.json'].map(x=>fetch(x,{cache:'no-cache'}).then(y=>y.json())));
 U=u;R=r;O=o;U.assertions.forEach(x=>A.set(x.assertionId,x));O.relationships.forEach(x=>M.set(x.relationshipType,{domain:x.domain||'',definition:x.definition||''}));build();
 const old=localStorage.getItem(KJOB);if(old)$('job').value=old;
 $('status').textContent='READY · 40 production-format cells selected. Initialize the Cloudflare runner, then start acceptance.';
}
$('setup').onclick=async()=>{try{localStorage.setItem(KBASE,base());const h=await req('/health');$('status').textContent=`RUNNER HEALTHY · D1 ${h.d1?'✓':'✗'} · Queue ${h.queue?'✓':'✗'} · AI ${h.ai?'✓':'✗'}\nInitializing access…`;await req('/setup',{method:'POST',body:'{}'});$('status').textContent='RUNNER INITIALIZED · ready to start the 40-cell acceptance run.'}catch(e){$('status').textContent='SETUP FAILED · '+e.message}};
$('start').onclick=async()=>{try{localStorage.setItem(KBASE,base());const j=await req('/jobs',{method:'POST',body:JSON.stringify({items})});$('job').value=j.jobId;localStorage.setItem(KJOB,j.jobId);$('status').textContent=`STARTED ${j.jobId} · ${j.total} cells are now running on Cloudflare.\nYou may close this page and come back later.`}catch(e){$('status').textContent='START FAILED · '+e.message}};
$('check').onclick=async()=>{try{const id=$('job').value.trim(),j=await req('/jobs/'+encodeURIComponent(id));$('status').textContent=`${j.job.state.toUpperCase()} · ${j.job.completed}/${j.job.total} complete · ${j.job.failed} failed\n${j.job.message||''}`}catch(e){$('status').textContent='CHECK FAILED · '+e.message}};
$('download').onclick=async()=>{try{const id=$('job').value.trim(),j=await req('/jobs/'+encodeURIComponent(id)+'/results');const blob=new Blob([JSON.stringify(j,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`emojeo-pass76-acceptance-${id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$('status').textContent=`DOWNLOADED · ${j.job.completed}/${j.job.total} complete · ${j.job.failed} failed.\nUpload that JSON here for semantic review.`}catch(e){$('status').textContent='DOWNLOAD FAILED · '+e.message}};
init().catch(e=>$('status').textContent='INIT FAILED · '+e.message);
})();