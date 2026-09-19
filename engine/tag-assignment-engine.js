/* Reusable Tag Assignment Engine v1
   Product-neutral classification records for applying any registered tag to any
   subject. Preserves weights/confidence, provenance, evidence, status, metadata,
   and multiple independent sources instead of collapsing application meaning. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v);
const state={assignments:new Map()};
const clean=v=>String(v??'').trim();
const tagRef=(ref={})=>({type:clean(ref.type||'tag'),id:clean(ref.id)});
const subjectRef=(ref={})=>typeof ref==='string'?{type:'item',id:clean(ref)}:{type:clean(ref.type||'item'),id:clean(ref.id)};
const sourceRef=source=>source==null?null:(typeof source==='string'?{id:clean(source)}:clone(source));
function defaultId(subject,tag,source){const s=source?.id||source?.type||'unspecified';return `${subject.type}:${subject.id}::${tag.type}:${tag.id}::${s}`;}
function assign(input={}){
  const subject=subjectRef(input.subject),tag=tagRef(input.tag||{type:input.tagType,id:input.tagId});
  if(!subject.id)throw new Error('Tag assignment requires a subject ID.');
  if(!tag.id)throw new Error('Tag assignment requires a tag ID.');
  const source=sourceRef(input.source);
  const id=clean(input.id)||defaultId(subject,tag,source);
  const current=state.assignments.get(id)||{};
  const value=Object.freeze({...current,...clone(input),id,subject,tag,source,
    weight:input.weight??current.weight??null,
    confidence:input.confidence??current.confidence??null,
    status:clean(input.status||current.status||'active'),
    evidence:clone(input.evidence??current.evidence??[]),
    metadata:clone(input.metadata??current.metadata??{})
  });
  state.assignments.set(id,value);return clone(value);
}
function assignMany(rows=[]){return rows.map(assign);}
function remove(id){return state.assignments.delete(String(id));}
function matches(row,q={}){
  return (!q.subjectType||row.subject.type===q.subjectType)&&(!q.subjectId||row.subject.id===q.subjectId)&&
    (!q.tagType||row.tag.type===q.tagType)&&(!q.tagId||row.tag.id===q.tagId)&&
    (!q.status||row.status===q.status)&&(!q.sourceId||row.source?.id===q.sourceId);
}
function list(query={}){return [...state.assignments.values()].filter(row=>matches(row,query)).map(clone);}
function forSubject(subject,query={}){const s=subjectRef(subject);return list({...query,subjectType:s.type,subjectId:s.id});}
function forTag(tag,query={}){const t=tagRef(tag);return list({...query,tagType:t.type,tagId:t.id});}
function snapshot(){return list();}
function clear(){state.assignments.clear();}
window.reusableTagAssignments=Object.freeze({assign,assignMany,remove,list,forSubject,forTag,snapshot,clear});
})();
