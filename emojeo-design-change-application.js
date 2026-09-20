/* Emojeo Design Change Application — Pass 18
   Human-authorized transactional application of approved Pass 17 decisions.
   Plans are revalidated against live state, previewed exactly, applied atomically,
   retain before/after provenance, and can be safely undone by an identified human. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v), clean=v=>String(v??'').trim();
const human=a=>{a=clean(a);return !!a&&!['machine','system'].includes(a)};
const stable=v=>JSON.stringify(v);
function createDesignChangeApplication({graph,ledger,impact,workspace}={}){
 if(!graph||!ledger||!impact||!workspace)throw new Error('Design change application requires graph, ledger, impact, and decision workspace.');
 const transactions=new Map();let seq=0;
 function validate(plan){
  if(plan?.kind!=='emojeo-implementation-plan')throw new Error('Invalid implementation plan.');
  const d=workspace.get(plan.decisionId);if(!d||d.state!=='approved')throw new Error('Plan decision is not currently approved.');
  if(stable(d.change)!==stable(plan.change))throw new Error('Plan change no longer matches the approved decision.');
  const fresh=impact.compare(plan.change);
  if(stable(fresh)!==stable(plan.impact))throw new Error('Implementation plan is stale; refresh/reapprove before applying.');
  return {decision:d,fresh};
 }
 function resolve(plan){
  const c=clone(plan.change), ops=[];
  if(c.kind==='retire-thing'){
   const before=graph.getThing(c.subject.type,c.subject.id);if(!before)throw new Error('Retirement subject no longer exists.');
   ops.push({kind:'retire-thing',subject:clone(c.subject),before,after:{...before,status:'retired'}});
  }else if(c.kind==='change-claim'){
   const field=clean(c.field);if(!field)throw new Error('Claim change requires a field.');
   const old=ledger.listClaims({subject:c.subject,field}).filter(x=>x.state==='current');
   ops.push({kind:'change-claim',subject:clone(c.subject),field,value:clone(c.value),before:old,after:{state:'current',authority:'human-canon',value:clone(c.value)}});
  }else if(c.kind==='add-connection'){
   const r=clone(c.relationship||{});if(!r.type||!r.from||!r.to)throw new Error('Added connection is incomplete.');
   const id=clean(r.id)||`${r.type}:${r.from.type}:${r.from.id}>${r.to.type}:${r.to.id}`;
   if(graph.getRelationship(id))throw new Error('Connection already exists.');
   ops.push({kind:'add-connection',relationship:{...r,id,advisory:false,humanApproved:true},before:null});
  }else if(c.kind==='remove-connection'){
   const r=clone(c.relationship||{});let old=r.id?graph.getRelationship(r.id):null;
   if(!old){old=graph.listRelationships({type:r.type}).find(x=>stable(x.from)===stable(r.from)&&stable(x.to)===stable(r.to))||null}
   if(!old)throw new Error('Connection to remove no longer exists.');
   ops.push({kind:'remove-connection',relationship:old,before:old,after:null});
  }else throw new Error('Unsupported approved change kind.');
  return ops;
 }
 function preview(plan){const checked=validate(plan),operations=resolve(plan);return {kind:'emojeo-design-change-application-preview',decisionId:plan.decisionId,operations:clone(operations),impact:checked.fresh,policy:{previewOnly:true,mutatesGraph:false,mutatesCanon:false,humanApplyRequired:true,transactional:true,undoSupported:true}}}
 function apply(plan,{actor,note=''}={}){
  if(!human(actor))throw new Error('Application requires an identified human actor.');
  const p=preview(plan), undo=[];let failed=null;
  try{for(const op of p.operations){
   if(op.kind==='retire-thing'){graph.createThing(op.after);undo.unshift(()=>graph.createThing(op.before));}
   else if(op.kind==='change-claim'){
    for(const old of op.before){ledger.transition(old.id,'historical',{authority:old.authority,provenance:{supersededByDecision:plan.decisionId}});undo.unshift(()=>ledger.restoreClaim(old));}
    const made=ledger.assertClaim({subject:op.subject,field:op.field,value:op.value,state:'current',authority:'human-canon',provenance:{decisionId:plan.decisionId,actor:clean(actor)},notes:clean(note),supersedes:op.before.map(x=>x.id)});undo.unshift(()=>ledger.removeClaim(made.id));op.after=made;
   }else if(op.kind==='add-connection'){const made=graph.relate({...op.relationship,provenance:{...(op.relationship.provenance||{}),decisionId:plan.decisionId,actor:clean(actor)}});undo.unshift(()=>graph.removeRelationship(made.id));op.after=made;
   }else if(op.kind==='remove-connection'){const gone=graph.removeRelationship(op.relationship.id);undo.unshift(()=>graph.relate(gone));}
  }}catch(e){failed=e;for(const fn of undo){try{fn()}catch{}}}
  if(failed)throw new Error(`Transaction rolled back: ${failed.message}`);
  const tx={id:`design-change-${++seq}`,decisionId:plan.decisionId,actor:clean(actor),note:clean(note),state:'applied',operations:clone(p.operations),before:{impact:clone(plan.impact)},after:{impact:impact.compare(plan.change)},history:[{state:'applied',actor:clean(actor),note:clean(note)}]};transactions.set(tx.id,tx);workspace.markImplemented(plan.decisionId,{actor,note:`Applied transaction ${tx.id}${note?`: ${clean(note)}`:''}`});return clone(tx);
 }
 function undo(id,{actor,note=''}={}){
  if(!human(actor))throw new Error('Undo requires an identified human actor.');const tx=transactions.get(clean(id));if(!tx)throw new Error('Unknown transaction.');if(tx.state!=='applied')throw new Error('Only applied transactions can be undone.');
  for(const op of [...tx.operations].reverse()){
   if(op.kind==='retire-thing')graph.createThing(op.before);
   else if(op.kind==='change-claim'){if(op.after?.id&&ledger.getClaim(op.after.id))ledger.removeClaim(op.after.id);for(const old of op.before)ledger.restoreClaim(old)}
   else if(op.kind==='add-connection'){if(op.after?.id&&graph.getRelationship(op.after.id))graph.removeRelationship(op.after.id)}
   else if(op.kind==='remove-connection')graph.relate(op.before);
  }
  tx.state='undone';tx.history.push({state:'undone',actor:clean(actor),note:clean(note)});return clone(tx);
 }
 const get=id=>clone(transactions.get(clean(id))||null), list=()=>[...transactions.values()].map(clone);
 const snapshot=()=>({schemaVersion:1,kind:'emojeo-design-change-application',transactions:list(),policy:{humanApplyRequired:true,stalePlansRejected:true,transactionalRollback:true,undoSupported:true,beforeAfterProvenance:true}});
 return Object.freeze({validate,preview,apply,undo,get,list,snapshot});
}
const api=Object.freeze({createDesignChangeApplication});if(typeof window!=='undefined')window.emojeoDesignChangeApplication=api;if(typeof globalThis!=='undefined')globalThis.emojeoDesignChangeApplication=api;
})();
