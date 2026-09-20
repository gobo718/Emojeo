/* Emojeo Evidence Intake — Pass 13
   Stages recovered/design evidence before it enters the shared design graph or canon ledger.
   Intake preserves source provenance, supports deduplication/preview, and requires explicit
   human approval before staged material is committed. */
(()=>{'use strict';
const clean=v=>String(v??'').trim(), clone=v=>v==null?v:structuredClone(v);
const stable=v=>{if(Array.isArray(v))return `[${v.map(stable).join(',')}]`;if(v&&typeof v==='object')return `{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;return JSON.stringify(v)};
function createEvidenceIntake({graph,catalog,ledger}={}){
 if(!graph||!catalog||!ledger)throw new Error('Evidence intake requires graph, catalog, and canon ledger.');
 const batches=new Map();let seq=0;
 const fingerprint=(kind,payload,source)=>`${kind}|${stable(payload)}|${clean(source?.id||source?.locator||source?.title)}`;
 function stage(input={}){
  const id=clean(input.id)||`intake-${++seq}`, title=clean(input.title||id);
  const source=clone(input.source||{});if(!clean(source.id||source.locator||source.title))throw new Error('Intake batch requires source provenance.');
  const seen=new Set(),items=[];
  for(const raw of input.items||[]){const kind=clean(raw.kind);if(!['thing','relationship','claim'].includes(kind))throw new Error(`Unsupported intake item kind: ${kind}`);const payload=clone(raw.payload||{}),fp=fingerprint(kind,payload,source);if(seen.has(fp))continue;seen.add(fp);items.push({id:clean(raw.id)||`${id}-item-${items.length+1}`,kind,payload,notes:clean(raw.notes),fingerprint:fp,status:'staged'});}
  const row={id,title,source,items,status:'staged',createdAt:clean(input.createdAt),notes:clean(input.notes),provenance:{...(clone(input.provenance||{})),intake:true}};batches.set(id,row);return clone(row);
 }
 const get=id=>clone(batches.get(clean(id))||null);
 const list=({status}={})=>[...batches.values()].filter(b=>!status||b.status===status).map(clone);
 function preview(id){const b=batches.get(clean(id));if(!b)throw new Error('Unknown intake batch.');const counts={thing:0,relationship:0,claim:0};for(const i of b.items)counts[i.kind]++;return {id:b.id,title:b.title,source:clone(b.source),status:b.status,total:b.items.length,counts,items:clone(b.items),policy:{previewOnly:true,noMutation:true,humanApprovalRequired:true}}}
 function reject(id,{reviewer,notes}={}){const b=batches.get(clean(id));if(!b)throw new Error('Unknown intake batch.');b.status='rejected';b.review={decision:'rejected',reviewer:clean(reviewer),notes:clean(notes)};return clone(b)}
 function commit(id,{humanApproved=false,reviewer,notes}={}){
  const b=batches.get(clean(id));if(!b)throw new Error('Unknown intake batch.');if(b.status!=='staged')throw new Error('Only staged intake batches can be committed.');if(humanApproved!==true)throw new Error('Evidence intake commit requires explicit human approval.');
  const created={things:[],relationships:[],claims:[]};
  for(const item of b.items){const p=clone(item.payload),baseProv={source:clone(b.source),intakeBatchId:b.id,intakeItemId:item.id,...clone(p.provenance||{})};
   if(item.kind==='thing'){created.things.push(catalog.createCatalogThing(graph,{...p,authority:p.authority||'curated',provenance:baseProv}));}
   else if(item.kind==='relationship'){created.relationships.push(catalog.connect(graph,{...p,advisory:p.advisory!==false,humanApproved:p.advisory===false?true:p.humanApproved===true,provenance:baseProv}));}
   else {const state=clean(p.state||'proposed'),authority=clean(p.authority||(state==='current'?'human-canon':'curated'));created.claims.push(ledger.assertClaim({...p,state,authority,provenance:baseProv}));}
   item.status='committed';
  }
  b.status='committed';b.review={decision:'committed',reviewer:clean(reviewer),notes:clean(notes),humanApproved:true};return {batch:clone(b),created:clone(created)};
 }
 function snapshot(){return {schemaVersion:1,kind:'emojeo-evidence-intake',batches:list(),policy:{stageBeforeMutation:true,preserveSourceProvenance:true,deduplicateWithinBatch:true,humanApprovalRequiredToCommit:true,rejectionPreservesEvidence:true}}}
 return Object.freeze({stage,get,list,preview,reject,commit,snapshot});
}
const api=Object.freeze({createEvidenceIntake});if(typeof window!=='undefined')window.emojeoEvidenceIntake=api;if(typeof globalThis!=='undefined')globalThis.emojeoEvidenceIntake=api;
})();
