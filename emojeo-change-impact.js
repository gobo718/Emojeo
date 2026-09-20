/* Emojeo Change Impact — Pass 16
   Read-only what-if analysis for proposed design changes. It never mutates the
   live graph or canon ledger; it shows what a human decision could affect. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v), clean=v=>String(v??'').trim(), key=t=>`${clean(t?.type)}:${clean(t?.id)}`;
function createChangeImpact({graph,ledger,progression,health}={}){
 if(!graph)throw new Error('Change impact requires a design graph.');
 const exists=t=>!!graph.getThing(clean(t?.type),clean(t?.id));
 function affectedThings(subject,{maxDepth=4,includeAdvisory=false}={}){
  if(!exists(subject))throw new Error('Impact subject must exist in the design graph.');
  const start=key(subject), seen=new Set([start]), q=[{thing:clone(subject),depth:0}], out=[];
  while(q.length){const cur=q.shift();if(cur.depth>=maxDepth)continue;for(const n of graph.neighbors(cur.thing.type,cur.thing.id)){if(!includeAdvisory&&n.relationship.advisory)continue;const k=key(n.thing);if(seen.has(k))continue;seen.add(k);const row={thing:n.thing,depth:cur.depth+1,via:n.relationship,direction:n.direction};out.push(row);q.push({thing:n.thing,depth:row.depth})}}
  return out;
 }
 function claimsFor(subject){return ledger?ledger.listClaims({subject}):[]}
 function propose(change={}){
  const subject=clone(change.subject||{});if(!exists(subject))throw new Error('Change subject must exist in the design graph.');
  const kind=clean(change.kind);if(!['retire-thing','change-claim','remove-connection','add-connection'].includes(kind))throw new Error('Unsupported change kind.');
  const affected=affectedThings(subject,change.options||{}), claims=claimsFor(subject);
  const currentClaims=claims.filter(c=>c.state==='current');
  const warnings=[];
  if(kind==='retire-thing'&&affected.length)warnings.push({kind:'connected-content',count:affected.length});
  if(kind==='retire-thing'&&currentClaims.length)warnings.push({kind:'current-canon-on-subject',count:currentClaims.length});
  if(kind==='change-claim'&&ledger){const field=clean(change.field);if(!field)throw new Error('Claim change requires a field.');const existing=claims.filter(c=>c.field===field&&!['retired','rejected'].includes(c.state));if(existing.length)warnings.push({kind:'existing-claims',count:existing.length,claims:clone(existing)});}
  if((kind==='remove-connection'||kind==='add-connection')&&!change.relationship)throw new Error('Connection change requires relationship details.');
  return {kind:'emojeo-change-impact-preview',change:clone(change),subject,affected,claims,currentClaims,warnings,policy:{previewOnly:true,mutatesGraph:false,mutatesCanon:false,humanDecisionRequired:true}};
 }
 function compare(change={}){const beforeHealth=health?health.report():null,beforeProgression=progression?progression.report?.()||null:null;return {...propose(change),baseline:{health:beforeHealth,progression:beforeProgression},note:'Baseline is live state; proposed change is not applied automatically.'}}
 function snapshot(change={}){return {schemaVersion:1,...compare(change)}}
 return Object.freeze({affectedThings,propose,compare,snapshot});
}
const api=Object.freeze({createChangeImpact});if(typeof window!=='undefined')window.emojeoChangeImpact=api;if(typeof globalThis!=='undefined')globalThis.emojeoChangeImpact=api;
})();
