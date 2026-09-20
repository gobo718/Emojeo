/* Emojeo Design Recovery — Pass 22
   Portable checkpoints and explicit recovery for the shared MASHPEDITION design state.
   Recovery reconstructs a fresh graph/ledger; it never silently overwrites a live design. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v), clean=v=>String(v??'').trim();
const stable=v=>{if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=stable(v[k]);return o}return v};
function hashText(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')}
function checksum(payload){return `fnv1a32:${hashText(JSON.stringify(stable(payload)))}`}
function createDesignRecovery({graph,ledger=null,storage=null,graphApi=null,ledgerApi=null}={}){
 if(!graph?.snapshot)throw new Error('Design recovery requires a design graph.');
 const checkpoints=new Map();let seq=0;
 function payload(){return {graph:graph.snapshot(),canon:ledger?.snapshot?ledger.snapshot():null}}
 function createCheckpoint({label='',reason='',actor='human'}={}){const body=payload(),row={schemaVersion:1,kind:'emojeo-design-checkpoint',id:`checkpoint-${++seq}`,createdAt:new Date().toISOString(),label:clean(label),reason:clean(reason),actor:clean(actor)||'human',payload:body,checksum:checksum(body),policy:{portable:true,readOnlySnapshot:true,restoreRequiresExplicitApproval:true,noLiveOverwrite:true}};checkpoints.set(row.id,row);return clone(row)}
 function list(){return [...checkpoints.values()].map(clone)}
 function get(id){return clone(checkpoints.get(clean(id))||null)}
 function verify(row){if(!row||row.kind!=='emojeo-design-checkpoint'||!row.payload)return {valid:false,reason:'invalid-checkpoint'};const actual=checksum(row.payload);return {valid:actual===row.checksum,expected:row.checksum,actual,reason:actual===row.checksum?'verified':'checksum-mismatch'}}
 function exportCheckpoint(id){const row=get(id);if(!row)throw new Error('Unknown checkpoint.');return JSON.stringify(row,null,2)}
 function importCheckpoint(input){const row=typeof input==='string'?JSON.parse(input):clone(input);const check=verify(row);if(!check.valid)throw new Error(`Checkpoint rejected: ${check.reason}.`);const id=clean(row.id)||`checkpoint-${++seq}`;const stored={...row,id};checkpoints.set(id,stored);return clone(stored)}
 function save(id,key='emojeo-design-checkpoint'){if(!storage?.setItem)throw new Error('Checkpoint storage is unavailable.');const text=exportCheckpoint(id);storage.setItem(clean(key)||'emojeo-design-checkpoint',text);return {key:clean(key)||'emojeo-design-checkpoint',bytes:text.length}}
 function load(key='emojeo-design-checkpoint'){if(!storage?.getItem)throw new Error('Checkpoint storage is unavailable.');const text=storage.getItem(clean(key)||'emojeo-design-checkpoint');if(!text)return null;return importCheckpoint(text)}
 function recoveryPlan(id){const row=get(id);if(!row)throw new Error('Unknown checkpoint.');const check=verify(row);const g=row.payload.graph||{},c=row.payload.canon;return {kind:'emojeo-design-recovery-plan',checkpointId:row.id,valid:check.valid,checksum:check,counts:{types:(g.types||[]).length,relationshipTypes:(g.relationshipTypes||[]).length,things:(g.things||[]).length,relationships:(g.relationships||[]).length,claims:(c?.claims||[]).length},requiresExplicitApproval:true,willCreateFreshState:true,willOverwriteLiveState:false}}
 function restoreFresh(id,{approved=false,actor=''}={}){if(approved!==true||!clean(actor))throw new Error('Recovery requires explicit human approval and actor identity.');const row=get(id);if(!row)throw new Error('Unknown checkpoint.');const check=verify(row);if(!check.valid)throw new Error('Checkpoint checksum verification failed.');const G=graphApi||globalThis.emojeoDesignGraph,L=ledgerApi||globalThis.emojeoCanonLedger;if(!G?.createDesignGraph)throw new Error('Design graph API is unavailable for recovery.');const snap=row.payload.graph;const baseTypes=new Set(['emoji','mosaic']);const baseRels=new Set(['mosaic-member']);const fresh=G.createDesignGraph({types:(snap.types||[]).filter(x=>!baseTypes.has(x.id)),relationshipTypes:(snap.relationshipTypes||[]).filter(x=>!baseRels.has(x.id))});for(const t of snap.things||[])fresh.createThing(t);for(const r of snap.relationships||[])fresh.relate(r);let freshLedger=null;if(row.payload.canon){if(!L?.createCanonLedger)throw new Error('Canon ledger API is unavailable for recovery.');freshLedger=L.createCanonLedger(fresh);freshLedger.importClaims(row.payload.canon.claims||[])}return {graph:fresh,ledger:freshLedger,audit:{kind:'emojeo-design-recovery',checkpointId:row.id,recoveredAt:new Date().toISOString(),actor:clean(actor),checksum:row.checksum,createdFreshState:true,overwroteLiveState:false}}}
 return Object.freeze({createCheckpoint,list,get,verify,exportCheckpoint,importCheckpoint,save,load,recoveryPlan,restoreFresh});
}
const api=Object.freeze({createDesignRecovery,checksum});if(typeof window!=='undefined')window.emojeoDesignRecovery=api;if(typeof globalThis!=='undefined')globalThis.emojeoDesignRecovery=api;
})();
