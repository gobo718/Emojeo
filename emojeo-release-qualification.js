/* Emojeo Release Qualification — Pass 26
   Read-only qualification of the integrated design runtime. It reports release
   blockers and invariants; it never repairs, approves, reconciles, or mutates. */
(()=>{'use strict';
function createReleaseQualification({runtime}={}){
 if(!runtime?.status||!runtime?.exportState)throw new Error('Release qualification requires an integrated design runtime.');
 function stableState(){const s=runtime.services||{};return JSON.stringify({graph:s.graph?.snapshot?.(),canon:s.ledger?.snapshot?.(),decisions:s.decisions?.snapshot?.(),reconciliation:s.reconciliation?.snapshot?.()})}
 function inspect(){
  const before=stableState(),status=runtime.status(),state=runtime.exportState();
  const checks=[
   {id:'runtime-ready',pass:status.ready===true},
   {id:'shared-graph',pass:status.policy?.singleSharedGraph===true},
   {id:'shared-canon',pass:status.policy?.singleSharedCanonLedger===true},
   {id:'human-mutation-boundaries',pass:status.policy?.humanMutationBoundariesPreserved===true},
   {id:'no-seeded-game-content',pass:status.policy?.noSeededGameContent===true},
   {id:'portable-runtime-state',pass:state.kind==='emojeo-design-runtime-state'&&state.schemaVersion===2&&state.policy?.noImplicitRestore===true},
   {id:'required-services',pass:['graph','ledger','progression','health','impact','decisions','application','reconciliation','workbench','operations','recovery'].every(x=>status.services.includes(x))}
  ];
  const after=stableState();
  checks.push({id:'qualification-read-only',pass:before===after});
  const blockers=checks.filter(x=>!x.pass).map(x=>x.id);
  return {kind:'emojeo-release-qualification',qualified:blockers.length===0,checks,blockers,policy:{readOnly:true,noAutomaticRepairs:true,noImplicitApproval:true}};
 }
 return Object.freeze({inspect});
}
const api=Object.freeze({createReleaseQualification});if(typeof window!=='undefined')window.emojeoReleaseQualification=api;if(typeof globalThis!=='undefined')globalThis.emojeoReleaseQualification=api;
})();
