/* Genreactrix Tag Compatibility Adapter
   Preserves Genreactrix's proven Reaction/Theme semantics while exposing them
   to the reusable tag engine. This is additive: existing Genreactrix code,
   storage, prompts, matrices, SLOP logic, and workflows remain untouched. */
(()=>{'use strict';
function register(){
  const e=window.reusableTagEngine;if(!e)return {ok:false,reason:'tag-engine-unavailable'};
  e.registerType({id:'reaction',label:'Reaction',multiple:true,specializedSystem:'Genreactrix'});
  e.registerType({id:'theme',label:'Theme',multiple:true,specializedSystem:'Genreactrix'});
  const primitives=Array.isArray(window.genreactrixTagSource?.reactions)?window.genreactrixTagSource.reactions:[];
  const themes=Array.isArray(window.genreactrixTagSource?.themes)?window.genreactrixTagSource.themes:[];
  e.registerTags(primitives.map(x=>({type:'reaction',...x})));
  e.registerTags(themes.map(x=>({type:'theme',...x})));
  for(const theme of themes){
    const refs=theme.reactionRefs||theme.primitiveIds?.map(id=>({type:'reaction',id}))||[];
    if(refs.length)e.composedFrom({type:'theme',id:theme.id},refs,{componentType:'reaction',source:'genreactrix-theme-semantics'});
    for(const implied of theme.implies||[])e.implies({type:'theme',id:theme.id},typeof implied==='string'?{type:'theme',id:implied}:implied,{source:'genreactrix-theme-semantics'});
  }
  return {ok:true,reactions:primitives.length,themes:themes.length};
}
window.genreactrixTagCompatibility=Object.freeze({register});
})();
