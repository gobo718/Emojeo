/* Reusable Tag Engine v1
   Product-neutral, preservation-first tag vocabulary + relationship engine.
   Tags are not limited to a fixed taxonomy or count. Applications supply tag
   types, tags, and rules. Specialized systems (for example Genreactrix
   Reactions/Themes/PrimFusions) may register compatibility vocabularies without
   surrendering their existing implementation. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v);
const state={types:new Map(),tags:new Map(),relations:new Map()};
const key=(type,id)=>`${String(type)}:${String(id)}`;
function registerType(input={}){
  const id=String(input.id||'tag').trim(); if(!id) throw new Error('Tag type ID is required.');
  const current=state.types.get(id)||{};
  const value=Object.freeze({...current,...clone(input),id,label:String(input.label||current.label||id),multiple:input.multiple??current.multiple??true});
  state.types.set(id,value); return clone(value);
}
function registerTag(input={}){
  const type=String(input.type||'tag'),id=String(input.id||'').trim();
  if(!id) throw new Error('Tag ID is required.');
  if(!state.types.has(type)) registerType({id:type,label:type});
  const k=key(type,id),current=state.tags.get(k)||{};
  const value=Object.freeze({...current,...clone(input),type,id,label:String(input.label||current.label||id)});
  state.tags.set(k,value); return clone(value);
}
function registerTags(rows=[]){return rows.map(registerTag);}
function normalizeRef(ref,defaultType='tag'){
  if(typeof ref==='string') return {type:defaultType,id:ref};
  return {type:String(ref?.type||defaultType),id:String(ref?.id||'')};
}
function relationId(kind,from,to){return `${kind}:${key(from.type,from.id)}=>${key(to.type,to.id)}`;}
function relate(input={}){
  const kind=String(input.kind||'related'),from=normalizeRef(input.from,input.fromType),to=normalizeRef(input.to,input.toType);
  if(!from.id||!to.id) throw new Error('Tag relationship requires from and to tag references.');
  const id=String(input.id||relationId(kind,from,to));
  const value=Object.freeze({...clone(input),id,kind,from,to}); state.relations.set(id,value); return clone(value);
}
function implies(from,to,metadata={}){return relate({kind:'implies',from,to,...metadata});}
function composedFrom(tag,components=[],metadata={}){
  const target=normalizeRef(tag,metadata.type||'tag');
  return components.map((component,index)=>relate({kind:'composed-from',from:target,to:normalizeRef(component,metadata.componentType||target.type),position:index,...metadata}));
}
function get(type,id){const v=state.tags.get(key(type,id));return v?clone(v):null;}
function tags(type){return [...state.tags.values()].filter(v=>!type||v.type===type).map(clone);}
function types(){return [...state.types.values()].map(clone);}
function relations(query={}){return [...state.relations.values()].filter(r=>(!query.kind||r.kind===query.kind)&&(!query.fromType||r.from.type===query.fromType)&&(!query.fromId||r.from.id===query.fromId)&&(!query.toType||r.to.type===query.toType)&&(!query.toId||r.to.id===query.toId)).map(clone);}
function impliedBy(ref,{recursive=true}={}){
  const start=normalizeRef(ref),seen=new Set(),out=[]; let frontier=[start];
  while(frontier.length){const cur=frontier.shift();for(const r of relations({kind:'implies',fromType:cur.type,fromId:cur.id})){const k=key(r.to.type,r.to.id);if(seen.has(k))continue;seen.add(k);out.push(r.to);if(recursive)frontier.push(r.to);}}
  return out;
}
function snapshot(){return {types:types(),tags:tags(),relations:relations()};}
function clear(){state.types.clear();state.tags.clear();state.relations.clear();}
window.reusableTagEngine=Object.freeze({registerType,registerTag,registerTags,relate,implies,composedFrom,get,tags,types,relations,impliedBy,snapshot,clear});
})();
