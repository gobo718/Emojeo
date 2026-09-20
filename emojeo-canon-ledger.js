/* Emojeo Canon Ledger — Pass 12
   Provenance-aware design assertions and lifecycle states for the shared MASHPEDITION graph.
   Conflicting historical/current/proposed claims are preserved instead of silently overwritten. */
(()=>{'use strict';
const clean=v=>String(v??'').trim(), clone=v=>v==null?v:structuredClone(v);
const STATES=Object.freeze(['proposed','current','historical','retired','rejected','unknown']);
const AUTHORITIES=Object.freeze(['human-canon','authoritative','curated','discovered','advisory']);
const key=t=>`${clean(t.type)}:${clean(t.id)}`;
function createCanonLedger(graph){
 if(!graph)throw new Error('Design graph is required.');
 const claims=new Map(); let seq=0;
 const endpointExists=subject=>!!graph.getThing(clean(subject?.type),clean(subject?.id));
 function assertClaim(input={}){
  const subject={type:clean(input.subject?.type),id:clean(input.subject?.id)};
  if(!endpointExists(subject))throw new Error('Claim subject must already exist in the design graph.');
  const field=clean(input.field);if(!field)throw new Error('Claim requires a field.');
  const state=clean(input.state||'unknown');if(!STATES.includes(state))throw new Error(`Unsupported claim state: ${state}`);
  const authority=clean(input.authority||'curated');if(!AUTHORITIES.includes(authority))throw new Error(`Unsupported claim authority: ${authority}`);
  if(state==='current'&&authority!=='human-canon'&&authority!=='authoritative')throw new Error('Current canon/fact requires human-canon or authoritative authority.');
  const id=clean(input.id)||`claim-${++seq}`;
  const row={id,subject,field,value:clone(input.value),state,authority,confidence:input.confidence??null,evidence:clone(input.evidence||[]),provenance:clone(input.provenance||{}),notes:clean(input.notes),supersedes:[...(input.supersedes||[])].map(clean).filter(Boolean)};
  claims.set(id,row);return clone(row);
 }
 function getClaim(id){return clone(claims.get(clean(id))||null)}
 function removeClaim(id){const k=clean(id),old=claims.get(k);if(!old)throw new Error('Unknown claim.');claims.delete(k);return clone(old)}
 function restoreClaim(row={}){const id=clean(row.id);if(!id)throw new Error('Restored claim requires an id.');claims.set(id,clone(row));return clone(row)}
 function listClaims({subject,field,state,authority}={}){return [...claims.values()].filter(c=>(!subject||key(c.subject)===key(subject))&&(!field||c.field===field)&&(!state||c.state===state)&&(!authority||c.authority===authority)).map(clone)}
 function transition(id,state,{authority,provenance,notes}={}){const old=claims.get(clean(id));if(!old)throw new Error('Unknown claim.');if(!STATES.includes(clean(state)))throw new Error('Unsupported claim state.');const next={...old,state:clean(state),authority:clean(authority||old.authority),provenance:{...old.provenance,...clone(provenance||{})},notes:clean(notes||old.notes)};if(next.state==='current'&&!['human-canon','authoritative'].includes(next.authority))throw new Error('Current canon/fact requires human-canon or authoritative authority.');claims.set(old.id,next);return clone(next)}
 function conflicts({subject,field}={}){const pool=listClaims({subject,field}).filter(c=>!['rejected','retired'].includes(c.state));const groups=new Map();for(const c of pool){const k=`${key(c.subject)}|${c.field}`;(groups.get(k)||groups.set(k,[]).get(k)).push(c)}const out=[];for(const rows of groups.values()){const values=new Set(rows.map(r=>JSON.stringify(r.value)));if(values.size>1)out.push({subject:clone(rows[0].subject),field:rows[0].field,claims:clone(rows),states:[...new Set(rows.map(r=>r.state))]})}return out}
 function currentView(subject){const rows=listClaims({subject});const byField=new Map();for(const c of rows){if(!['current'].includes(c.state))continue;(byField.get(c.field)||byField.set(c.field,[]).get(c.field)).push(c)}const fields={};const unresolved=[];for(const [field,cs] of byField){const vals=new Set(cs.map(c=>JSON.stringify(c.value)));if(vals.size===1)fields[field]=clone(cs[0].value);else unresolved.push({field,claims:clone(cs)})}return {subject:clone(subject),fields,unresolved}}
 function importClaims(rows=[]){return rows.map(assertClaim)}
 function snapshot(){return {schemaVersion:1,kind:'emojeo-canon-ledger',claims:listClaims(),conflicts:conflicts(),policy:{preserveContradictions:true,noSilentOverwrite:true,currentRequiresHumanCanonOrAuthority:true}}}
 return Object.freeze({STATES,AUTHORITIES,assertClaim,getClaim,removeClaim,restoreClaim,listClaims,transition,conflicts,currentView,importClaims,snapshot});
}
const api=Object.freeze({STATES,AUTHORITIES,createCanonLedger});if(typeof window!=='undefined')window.emojeoCanonLedger=api;if(typeof globalThis!=='undefined')globalThis.emojeoCanonLedger=api;
})();
