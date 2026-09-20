/* Emojeo Vocabulary Lab — Pass 6
   Corpus-wide vocabulary proposal layer. Raw discovery remains immutable evidence.
   This module groups recurring phrases and accepts advisory synonym-family proposals,
   but nothing becomes a canonical Emojeo trait until explicitly approved. */
(()=>{'use strict';
const clean=v=>String(v??'').trim(), clone=v=>v==null?v:structuredClone(v);
const slug=v=>clean(v).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const norm=v=>clean(v).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
function inventory(corpus){
 const rows=typeof corpus?.observations==='function'?corpus.observations():[]; const map=new Map();
 for(const o of rows){const key=norm(o.phrase);if(!key)continue;let x=map.get(key);if(!x){x={key,forms:new Map(),count:0,subjects:new Set(),dimensions:new Map(),observations:[]};map.set(key,x)}x.count++;x.forms.set(o.phrase,(x.forms.get(o.phrase)||0)+1);if(o.subject?.id)x.subjects.add(o.subject.id);x.dimensions.set(o.dimension,(x.dimensions.get(o.dimension)||0)+1);x.observations.push(clone(o));}
 return [...map.values()].map(x=>({key:x.key,label:[...x.forms.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0][0],count:x.count,subjectCount:x.subjects.size,subjects:[...x.subjects],forms:Object.fromEntries(x.forms),dimensions:Object.fromEntries(x.dimensions),observations:x.observations})).sort((a,b)=>b.subjectCount-a.subjectCount||b.count-a.count||a.label.localeCompare(b.label));
}
function createProposal(input={},inv=[]){
 const byKey=new Map(inv.map(x=>[x.key,x])); const members=[...new Set((input.members||input.phrases||[]).map(norm).filter(Boolean))];
 const found=members.map(k=>byKey.get(k)).filter(Boolean); const subjects=[...new Set(found.flatMap(x=>x.subjects))];
 return {id:clean(input.id)||`proposal-${slug(input.label||input.canonical||members[0]||'trait')}`,status:'proposed',canonical:clean(input.canonical||input.label),members,memberLabels:found.map(x=>x.label),subjectCount:subjects.length,subjects,occurrenceCount:found.reduce((n,x)=>n+x.count,0),rationale:clean(input.rationale),source:clone(input.source||{}),confidence:Number.isFinite(Number(input.confidence))?Math.max(0,Math.min(1,Number(input.confidence))):null,metadata:clone(input.metadata||{})};
}
function createLab(corpus,{proposals=[]}={}){
 const inv=inventory(corpus); const state=new Map(); proposals.forEach(p=>{const x=createProposal(p,inv);state.set(x.id,x)});
 const propose=p=>{const x=createProposal(p,inv);state.set(x.id,x);return clone(x)};
 const list=()=>[...state.values()].map(clone);
 const get=id=>state.has(clean(id))?clone(state.get(clean(id))):null;
 const decide=(id,status,metadata={})=>{if(!['approved','rejected','proposed'].includes(status))throw new Error('Vocabulary decision must be proposed, approved, or rejected.');const old=state.get(clean(id));if(!old)throw new Error('Unknown vocabulary proposal.');const next={...old,status,decision:{...clone(metadata),at:metadata.at||new Date().toISOString()}};state.set(old.id,next);return clone(next)};
 const snapshot=()=>({schemaVersion:1,kind:'emojeo-vocabulary-lab',inventory:clone(inv),proposals:list()});
 return Object.freeze({inventory:()=>clone(inv),propose,list,get,decide,snapshot});
}
function materializeApproved(proposal,{tagEngine=globalThis.reusableTagEngine||globalThis.window?.reusableTagEngine,assignments=globalThis.reusableTagAssignments||globalThis.window?.reusableTagAssignments,source={id:'emojeo-curation',name:'Emojeo curation'}}={}){
 if(proposal?.status!=='approved')throw new Error('Only explicitly approved vocabulary proposals can become traits.');if(!tagEngine||!assignments)throw new Error('StringBoard tag and assignment engines are required.');
 const id=slug(proposal.canonical);if(!id)throw new Error('Approved vocabulary requires a canonical label.');tagEngine.registerType({id:'emojeo-trait',label:'Emojeo Trait',multiple:true,authority:'curated'});tagEngine.registerTag({type:'emojeo-trait',id,label:proposal.canonical,authority:'curated',metadata:{proposalId:proposal.id,members:clone(proposal.members)}});
 const out=[];for(const subjectId of proposal.subjects||[])out.push(assignments.assign({subject:{type:'emoji',id:subjectId},tag:{type:'emojeo-trait',id},source,confidence:proposal.confidence,status:'active',evidence:[`Approved from vocabulary proposal ${proposal.id}`],metadata:{authority:'curated',proposalId:proposal.id}}));return {tag:{type:'emojeo-trait',id},assignments:out};
}
const api=Object.freeze({normalizePhrase:norm,inventory,createProposal,createLab,materializeApproved});if(typeof window!=='undefined')window.emojeoVocabularyLab=api;if(typeof globalThis!=='undefined')globalThis.emojeoVocabularyLab=api;
})();
