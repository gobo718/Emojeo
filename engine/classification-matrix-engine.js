/* Reusable Classification Matrix Engine
   Product-neutral registry + pair/intersection mechanics extracted from Genreactrix.
   It knows nothing about Prims, Themes, emoji, colors, or any future application's vocabulary. */
(()=>{'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const normalizeItem=(row,index)=>Object.freeze({
  id:String(row?.id ?? `I${String(index+1).padStart(2,'0')}`),
  label:String(row?.label ?? row?.name ?? `Item ${index+1}`),
  symbol:String(row?.symbol ?? row?.emoji ?? ''),
  ...row
});
const pairKey=(a,b)=>[String(a),String(b)].sort().join('|');
let definition=Object.freeze({id:'empty',items:Object.freeze([]),intersections:Object.freeze({}),orderedPairs:false,allowSelfPairs:true});
function configure(input={}){
  const items=Object.freeze((input.items||[]).map(normalizeItem));
  const ids=new Set(items.map(x=>x.id));
  if(ids.size!==items.length) throw new Error('Classification Matrix item IDs must be unique.');
  const intersections={};
  for(const [rawKey,value] of Object.entries(input.intersections||{})){
    const parts=rawKey.split('|');
    if(parts.length!==2) continue;
    intersections[pairKey(parts[0],parts[1])]=value;
  }
  definition=Object.freeze({
    id:String(input.id||'classification-matrix'),
    label:String(input.label||'Classification Matrix'),
    items,
    intersections:Object.freeze(intersections),
    orderedPairs:Boolean(input.orderedPairs),
    allowSelfPairs:input.allowSelfPairs!==false
  });
  return api.snapshot();
}
function item(id){return definition.items.find(x=>x.id===String(id))||null;}
function intersection(a,b){
  const left=item(a),right=item(b); if(!left||!right)return null;
  if(left.id===right.id && !definition.allowSelfPairs)return null;
  const key=definition.orderedPairs?`${left.id}|${right.id}`:pairKey(left.id,right.id);
  const explicit=definition.intersections[key];
  const label=typeof explicit==='string'?explicit:(explicit?.label|| (left.id===right.id?left.label:`${left.label} + ${right.label}`));
  return {id:`CELL:${key}`,key,label,leftId:left.id,rightId:right.id,definition:explicit??null};
}
function snapshot(){return clone(definition);}
const api=Object.freeze({configure,snapshot,item,items:()=>definition.items.slice(),pairKey,intersection});
window.classificationMatrixEngine=api;
})();
