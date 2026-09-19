/* Genreactrix Application Definition Compatibility v1
   Preserves Genreactrix identity/namespace knowledge as an optional application
   definition. This does not replace its specialized code and does not contain
   user records, images, credentials, histories, or analysis results. */
(()=>{'use strict';
const registry=window.reusableApplicationDefinitions;if(!registry)return;
registry.register({
  id:'genreactrix',name:'Genreactrix',
  namespaces:{storage:'genreactrix',database:'genreactrix',events:'genreactrix',globals:'genreactrix'},
  capabilities:{tags:true,matrix:true,interlockedMatrix:true,aiPipeline:true,promptLibrary:true,themeSweep:true,slopDetection:true,reactions:true,themes:true,director:true,queue:true,batch:true,reports:true,research:true,publication:true,prediction:true,persistence:true,maintenance:true},
  compatibility:{legacyStoragePrefix:'genreactrix-',preserveLegacyGlobals:true,preserveSpecializedImplementations:true},
  metadata:{kind:'preserved-specialized-application-definition',instanceDataIncluded:false}
});
})();
