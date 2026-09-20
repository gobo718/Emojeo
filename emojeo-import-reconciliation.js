/* Emojeo Import Reconciliation — Pass 19
   Identity matching and conflict-aware reconciliation for incoming design evidence.
   Matching is advisory until a human explicitly resolves an item; no graph/canon mutation occurs here. */
(()=>{'use strict';
const clean=v=>String(v??'').trim(), norm=v=>clean(v).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim(), clone=v=>v==null?v:structuredClone(v);
const human=a=>{a=clean(a);return !!a&&!['machine','system'].includes(a)};
const subjectKey=s=>`${clean(s?.type)}:${clean(s?.id)}`;
function createImportReconciliation({graph,ledger}={}){
 if(!graph||!ledger)throw new Error('Import reconciliation requires graph and canon ledger.');
 const sessions=new Map();let seq=0;
 function candidatesFor(item){
  const p=item.payload||{}, type=clean(p.type||p.subject?.type), id=clean(p.id||p.subject?.id), name=norm(p.name||p.title||p.label);
  if(!type)return [];
  const out=[];
  for(const t of graph.listThings({type})){
   let score=0, reasons=[];
   if(id&&t.id===id){score=1;reasons.push('exact-id')}
   else if(name&&norm(t.name)===name){score=.9;reasons.push('exact-name')}
   else if(name&&norm(t.name)&&(norm(t.name).includes(name)||name.includes(norm(t.name)))){score=.65;reasons.push('name-overlap')}
   if(score)out.push({subject:{type:t.type,id:t.id},name:t.name,score,reasons});
  }
  return out.sort((a,b)=>b.score-a.score||subjectKey(a.subject).localeCompare(subjectKey(b.subject)));
 }
 function inspectConflict(item,candidate){
  if(!candidate)return [];
  const p=item.payload||{}, s=candidate.subject, conflicts=[];
  if(item.kind==='claim'){
   const field=clean(p.field), current=field?ledger.listClaims({subject:s,field}).filter(x=>x.state==='current'):[];
   for(const c of current)if(JSON.stringify(c.value)!==JSON.stringify(p.value))conflicts.push({kind:'canon-value',field,existing:clone(c.value),incoming:clone(p.value),claimId:c.id});
  }else if(item.kind==='thing'){
   const existing=graph.getThing(s.type,s.id);if(existing&&clean(p.name)&&norm(existing.name)!==norm(p.name))conflicts.push({kind:'name',existing:existing.name,incoming:clean(p.name)});
  }
  return conflicts;
 }
 function open(input={}){
  const source=clone(input.source||{});if(!clean(source.id||source.locator||source.title))throw new Error('Reconciliation session requires source provenance.');
  const id=clean(input.id)||`reconcile-${++seq}`, items=(input.items||[]).map((raw,i)=>{const row={id:clean(raw.id)||`${id}-item-${i+1}`,kind:clean(raw.kind),payload:clone(raw.payload||{}),status:'unresolved'};const candidates=candidatesFor(row);return {...row,candidates,conflicts:inspectConflict(row,candidates[0]),suggestion:candidates[0]&&candidates[0].score>=.9?{action:'match',subject:clone(candidates[0].subject),confidence:candidates[0].score}:null}});
  const s={id,source,items,status:'open',createdAt:clean(input.createdAt),notes:clean(input.notes),history:[]};sessions.set(id,s);return clone(s);
 }
 const get=id=>clone(sessions.get(clean(id))||null), list=()=>[...sessions.values()].map(clone);
 function preview(id){const s=sessions.get(clean(id));if(!s)throw new Error('Unknown reconciliation session.');return {id:s.id,source:clone(s.source),status:s.status,items:clone(s.items),summary:{total:s.items.length,unresolved:s.items.filter(x=>x.status==='unresolved').length,conflicted:s.items.filter(x=>x.conflicts.length).length,suggested:s.items.filter(x=>x.suggestion).length},policy:{previewOnly:true,noMutation:true,machineMatchesAdvisory:true,humanResolutionRequired:true}}}
 function resolve(id,itemId,{actor,action,subject,note=''}={}){
  if(!human(actor))throw new Error('Reconciliation resolution requires an identified human actor.');const s=sessions.get(clean(id));if(!s)throw new Error('Unknown reconciliation session.');const item=s.items.find(x=>x.id===clean(itemId));if(!item)throw new Error('Unknown reconciliation item.');if(item.status!=='unresolved')throw new Error('Reconciliation item is already resolved.');
  action=clean(action);if(!['match','create-new','skip'].includes(action))throw new Error('Unsupported reconciliation action.');
  let chosen=null;if(action==='match'){chosen=clone(subject||item.suggestion?.subject);if(!chosen?.type||!chosen?.id||!graph.getThing(chosen.type,chosen.id))throw new Error('Matched subject must exist in the design graph.');}
  item.status='resolved';item.resolution={action,subject:chosen,actor:clean(actor),note:clean(note)};s.history.push({itemId:item.id,...clone(item.resolution)});if(s.items.every(x=>x.status==='resolved'))s.status='resolved';return clone(item);
 }
 function exportPlan(id){const s=sessions.get(clean(id));if(!s)throw new Error('Unknown reconciliation session.');if(s.status!=='resolved')throw new Error('All reconciliation items must be resolved before export.');return {schemaVersion:1,kind:'emojeo-reconciled-import-plan',sessionId:s.id,source:clone(s.source),items:s.items.filter(x=>x.resolution.action!=='skip').map(x=>({sourceItemId:x.id,kind:x.kind,payload:clone(x.payload),resolution:clone(x.resolution)})),history:clone(s.history),policy:{humanResolved:true,mutatesGraph:false,mutatesCanon:false,downstreamCommitRequired:true}}}
 const snapshot=()=>({schemaVersion:1,kind:'emojeo-import-reconciliation',sessions:list(),policy:{sourceProvenanceRequired:true,identityMatchingAdvisory:true,conflictsSurfaced:true,humanResolutionRequired:true,noSilentMerge:true,noMutation:true}});
 return Object.freeze({open,get,list,preview,resolve,exportPlan,snapshot});
}
const api=Object.freeze({createImportReconciliation});if(typeof window!=='undefined')window.emojeoImportReconciliation=api;if(typeof globalThis!=='undefined')globalThis.emojeoImportReconciliation=api;
})();
