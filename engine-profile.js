/* Reusable Engine Profile — extraction baseline
   This layer disables product-specific surfaces without deleting their proven
   implementation. Future applications can selectively re-enable/adapt them.
   Storage/global names remain unchanged in this pass to avoid destructive migrations. */
(()=>{'use strict';
const profile=Object.freeze({
  id:'reusable-engine-extraction-pass9',
  appName:'Reusable Engine',
  mode:'engine-extraction',
  preserveLegacyStorage:true,
  // Capabilities are preservation-first. false means dormant for this profile,
  // never deleted from the engine. Specialized implementations remain assets.
  capabilities:Object.freeze({
    tags:true,matrix:true,interlockedMatrix:true,aiPipeline:true,promptLibrary:true,
    themeSweep:true,slopDetection:true,reactions:true,themes:true,director:true,
    queue:true,batch:true,reports:true,research:false,publication:false,prediction:false,
    persistence:true,maintenance:true
  }),
  features:Object.freeze({
    coreRuntime:true,
    persistence:true,
    importExport:true,
    queue:true,
    batch:true,
    maintenance:true,
    settings:true,
    notifications:true,
    lifecycle:true,
    aiPipeline:true,
    matrixShell:true,
    reports:true,
    analytics:true,
    // Genreactrix research/publication surfaces are preserved but dormant here.
    researchDashboard:false,
    researchSessions:false,
    predictionLab:false,
    adaptiveResearch:false,
    publication:false,
    communityResearch:false,
    publicResearch:false,
    aiTrainingComparison:false
  })
});
window.engineProfile=profile;
const disabledSelectors=[
  '#portraitDashboardBtn','#researchSessionsOpen','#openKnowledgeBase',
  '#openTerminologyMethodology','#openCitationEvidence','#openDatasetVersioning',
  '#openPaperComposer','#openCommunityInput','#openConsensus',
  '#openAiTrainingComparison','#openPublicResearch'
];
document.addEventListener('DOMContentLoaded',()=>{
  for(const selector of disabledSelectors){
    const el=document.querySelector(selector);
    if(el){el.hidden=true;el.setAttribute('data-engine-disabled','true');}
  }
});
})();
