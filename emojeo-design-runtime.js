/* Emojeo Design Runtime — Pass 23
   Assembles the established MASHPEDITION design-intelligence subsystems around one
   shared graph/canon state. Assembly is explicit; it creates no content and performs
   no mutation beyond installing the already-defined design catalog vocabulary. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v);
function createDesignRuntime({apis={},storage=null,initialState=null}={}){
 const A={
  graph:apis.graph||globalThis.emojeoDesignGraph,
  catalog:apis.catalog||globalThis.emojeoDesignCatalog,
  ledger:apis.ledger||globalThis.emojeoCanonLedger,
  progression:apis.progression||globalThis.emojeoProgressionAnalysis,
  health:apis.health||globalThis.emojeoDesignHealth,
  impact:apis.impact||globalThis.emojeoChangeImpact,
  decisions:apis.decisions||globalThis.emojeoDecisionWorkspace,
  application:apis.application||globalThis.emojeoDesignChangeApplication,
  reconciliation:apis.reconciliation||globalThis.emojeoImportReconciliation,
  workbench:apis.workbench||globalThis.emojeoDesignWorkbench,
  operations:apis.operations||globalThis.emojeoDesignOperations,
  recovery:apis.recovery||globalThis.emojeoDesignRecovery
 };
 const required=[['graph','createDesignGraph'],['catalog','installDesignCatalog'],['ledger','createCanonLedger'],['progression','createProgressionAnalysis'],['health','createDesignHealth'],['impact','createChangeImpact'],['decisions','createDecisionWorkspace'],['application','createDesignChangeApplication'],['reconciliation','createImportReconciliation'],['workbench','createDesignWorkbench'],['operations','createDesignOperations'],['recovery','createDesignRecovery']];
 for(const [name,method] of required)if(!A[name]?.[method])throw new Error(`Design runtime dependency unavailable: ${name}.${method}`);
 const graph=A.graph.createDesignGraph();A.catalog.installDesignCatalog(graph);
 if(initialState?.graph){for(const t of initialState.graph.things||[])graph.createThing(t);for(const r of initialState.graph.relationships||[])graph.relate(r)}
 const ledger=A.ledger.createCanonLedger(graph);if(initialState?.canon?.claims)ledger.importClaims(initialState.canon.claims);
 const progression=A.progression.createProgressionAnalysis({graph});
 const health=A.health.createDesignHealth({graph,catalog:A.catalog,progression,ledger});
 const impact=A.impact.createChangeImpact({graph,ledger,progression,health});
 const decisions=A.decisions.createDecisionWorkspace({impact});
 if(initialState?.decisions?.decisions)for(const old of initialState.decisions.decisions){const d=decisions.create({...old,actor:old.history?.[0]?.actor||'human'});for(const n of old.notes||[])decisions.note(d.id,n.text,{actor:n.actor||'human'});if(old.state!=='draft'){decisions.submit(d.id,{actor:old.history?.find(x=>x.state==='review')?.actor||'human'});if(['approved','rejected','implemented'].includes(old.state))decisions.decide(d.id,{approved:old.state!=='rejected',actor:old.history?.find(x=>['approved','rejected'].includes(x.state))?.actor||'human'});if(old.state==='implemented')decisions.markImplemented(d.id,{actor:old.history?.find(x=>x.state==='implemented')?.actor||'human'})}}
 const application=A.application.createDesignChangeApplication({graph,ledger,impact,workspace:decisions});
 const reconciliation=A.reconciliation.createImportReconciliation({graph,ledger});
 if(initialState?.reconciliation?.sessions)for(const old of initialState.reconciliation.sessions){const rs=reconciliation.open({...old,items:old.items.map(x=>({id:x.id,kind:x.kind,payload:x.payload}))});for(const item of old.items||[])if(item.resolution)reconciliation.resolve(rs.id,item.id,item.resolution)}
 const workbench=A.workbench.createDesignWorkbench({graph,catalog:A.catalog,ledger,health});
 const operations=A.operations.createDesignOperations({workbench,health,decisions,reconciliation});
 const recovery=A.recovery.createDesignRecovery({graph,ledger,storage,graphApi:A.graph,ledgerApi:A.ledger});
 const services=Object.freeze({graph,ledger,progression,health,impact,decisions,application,reconciliation,workbench,operations,recovery});
 function status(){const snap=graph.snapshot(),canon=ledger.snapshot(),ops=operations.summary();return {kind:'emojeo-design-runtime-status',ready:true,things:snap.things.length,relationships:snap.relationships.length,claims:canon.claims.length,openOperations:ops.open,services:Object.keys(services),policy:{singleSharedGraph:true,singleSharedCanonLedger:true,noSeededGameContent:true,humanMutationBoundariesPreserved:true}}}
 function checkpoint(input={}){return recovery.createCheckpoint(input)}
 function exportState(){return {schemaVersion:2,kind:'emojeo-design-runtime-state',generatedAt:new Date().toISOString(),graph:graph.snapshot(),canon:ledger.snapshot(),decisions:decisions.snapshot(),reconciliation:reconciliation.snapshot(),operations:operations.exportQueue(),policy:{readOnlyExport:true,noImplicitRestore:true}}}
 function save(key='emojeo-design-runtime-state'){if(!storage?.setItem)throw new Error('Design runtime storage is unavailable.');const text=JSON.stringify(exportState());storage.setItem(String(key||'emojeo-design-runtime-state'),text);return {key:String(key||'emojeo-design-runtime-state'),bytes:text.length}}
 return Object.freeze({services,status,checkpoint,exportState,save});
}
function loadDesignRuntime({apis={},storage,key='emojeo-design-runtime-state'}={}){if(!storage?.getItem)throw new Error('Design runtime storage is unavailable.');const text=storage.getItem(String(key||'emojeo-design-runtime-state'));if(!text)return null;const state=JSON.parse(text);if(state?.kind!=='emojeo-design-runtime-state')throw new Error('Stored design runtime state is invalid.');return createDesignRuntime({apis,storage,initialState:state})}
const api=Object.freeze({createDesignRuntime,loadDesignRuntime});if(typeof window!=='undefined')window.emojeoDesignRuntime=api;if(typeof globalThis!=='undefined')globalThis.emojeoDesignRuntime=api;
})();
