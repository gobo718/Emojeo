/* Emojeo Application Definition — Pass 1
   Emojeo is a child application of StringBoard Engine v1.
   This pass establishes application identity and namespaces only; emoji content,
   vocabularies, classifications, and design canon are intentionally not included. */
(()=>{'use strict';
const registry=window.reusableApplicationDefinitions;if(!registry)return;
registry.register({
  id:'emojeo',
  name:'Emojeo',
  version:'1',
  namespaces:{storage:'emojeo',database:'emojeo',events:'emojeo',globals:'emojeo',api:'emojeo'},
  capabilities:{tags:true,matrix:true,interlockedMatrix:true,aiPipeline:true,promptLibrary:true,themeSweep:true,slopDetection:true,reactions:true,themes:true,director:true,queue:true,batch:true,reports:true,research:true,publication:true,prediction:true,persistence:true,maintenance:true},
  tagTypes:[],tags:[],relationships:[],defaults:{},
  compatibility:{parentEngine:'stringboard-engine-v1',preserveSpecializedImplementations:true},
  metadata:{kind:'stringboard-child-application',contentSeeded:false,instanceDataIncluded:false}
});
registry.activate('emojeo');
})();
