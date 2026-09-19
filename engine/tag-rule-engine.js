/* Reusable Tag Rule Engine v1
   Product-neutral evaluator for relationships between typed tags.
   It does not replace specialized application logic and does not silently
   mutate classifications. It can expand explicit tags through relationship
   rules and suggest composite tags whose required components are present.
   Applications decide whether derived results are advisory or materialized. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v);
const clean=v=>String(v??'').trim();
const ref=v=>typeof v==='string'?{type:'tag',id:clean(v)}:{type:clean(v?.type||'tag'),id:clean(v?.id)};
const key=v=>{const r=ref(v);return `${r.type}:${r.id}`};
function engines(){return {tags:window.reusableTagEngine,assignments:window.reusableTagAssignments};}
function activeRows(subject,query={}){
  const {assignments}=engines();if(!assignments)return[];
  return assignments.forSubject(subject,{status:'active',...query});
}
function expand(subject,{kinds=['implies','composed-from'],recursive=true,includeExplicit=true}={}){
  const {tags}=engines();if(!tags)return {explicit:[],derived:[],all:[]};
  const explicitRows=activeRows(subject),explicit=explicitRows.map(row=>({tag:clone(row.tag),via:'explicit',assignmentId:row.id,source:clone(row.source)}));
  const known=new Map(explicit.map(x=>[key(x.tag),x])),queue=[...explicit.map(x=>x.tag)],derived=[];
  while(queue.length){
    const from=queue.shift();
    for(const kind of kinds){
      for(const relation of tags.relations({kind,fromType:from.type,fromId:from.id})){
        const k=key(relation.to);if(known.has(k))continue;
        const item={tag:clone(relation.to),via:kind,from:clone(from),relationId:relation.id,relation:clone(relation)};
        known.set(k,item);derived.push(item);if(recursive)queue.push(item.tag);
      }
    }
  }
  return {explicit:clone(explicit),derived:clone(derived),all:clone(includeExplicit?[...explicit,...derived]:derived)};
}
function compositeSuggestions(subject,{kind='composed-from',includeDerived=true}={}){
  const {tags}=engines();if(!tags)return[];
  const expanded=expand(subject,{includeExplicit:true});
  const present=new Set((includeDerived?expanded.all:expanded.explicit).map(x=>key(x.tag)));
  const grouped=new Map();
  for(const relation of tags.relations({kind})){
    const k=key(relation.from);if(!grouped.has(k))grouped.set(k,{tag:clone(relation.from),relations:[]});grouped.get(k).relations.push(relation);
  }
  const out=[];
  for(const group of grouped.values()){
    if(present.has(key(group.tag)))continue;
    const ordered=[...group.relations].sort((a,b)=>(Number(a.position)||0)-(Number(b.position)||0));
    const components=ordered.map(r=>clone(r.to)),missing=components.filter(c=>!present.has(key(c)));
    if(!missing.length&&components.length)out.push({tag:clone(group.tag),kind,components,relationIds:ordered.map(r=>r.id),satisfied:true});
  }
  return out;
}
function evaluate(subject,options={}){
  const expansion=expand(subject,options),composites=compositeSuggestions(subject,options);
  return {subject:typeof subject==='string'?{type:'item',id:subject}:clone(subject),expansion,composites};
}
function materialize(subject,derived=[],{sourceId='tag-rule-engine',status='active',metadata={}}={}){
  const {assignments}=engines();if(!assignments)throw new Error('Tag assignment engine unavailable.');
  return derived.map(item=>assignments.assign({subject,tag:item.tag,source:{id:sourceId,type:'derived-rule'},status,evidence:[{kind:'tag-rule',via:item.via||item.kind||'derived',relationId:item.relationId||null,relationIds:item.relationIds||[]}],metadata:{...clone(metadata),derived:true}}));
}
window.reusableTagRules=Object.freeze({expand,compositeSuggestions,evaluate,materialize});
})();
