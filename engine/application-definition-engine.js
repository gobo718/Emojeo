/* Reusable Application Definition Engine v1
   Detaches reusable engine capability from any one application's vocabulary,
   identity, defaults, namespaces, or instance data. Application definitions
   are declarative overlays; specialized implementations may remain intact. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v);
const definitions=new Map(); let activeId=null;
const normalizeList=v=>Array.isArray(v)?v.map(clone):[];
function normalize(input={}){
  const id=String(input.id||'').trim(); if(!id) throw new Error('Application definition ID is required.');
  return Object.freeze({
    id,
    name:String(input.name||id),
    version:String(input.version||'1'),
    namespaces:Object.freeze({...clone(input.namespaces||{})}),
    capabilities:Object.freeze({...clone(input.capabilities||{})}),
    tagTypes:Object.freeze(normalizeList(input.tagTypes)),
    tags:Object.freeze(normalizeList(input.tags)),
    relationships:Object.freeze(normalizeList(input.relationships)),
    defaults:Object.freeze({...clone(input.defaults||{})}),
    compatibility:Object.freeze({...clone(input.compatibility||{})}),
    metadata:Object.freeze({...clone(input.metadata||{})})
  });
}
function register(input={}){const value=normalize(input);definitions.set(value.id,value);return clone(value);}
function get(id){const value=definitions.get(String(id));return value?clone(value):null;}
function list(){return [...definitions.values()].map(clone);}
function activate(id,{registerTags=true}={}){
  const def=definitions.get(String(id)); if(!def) throw new Error(`Unknown application definition: ${id}`);
  activeId=def.id;
  const tagEngine=window.reusableTagEngine;
  if(registerTags&&tagEngine){
    for(const type of def.tagTypes) tagEngine.registerType(type);
    for(const tag of def.tags) tagEngine.registerTag(tag);
    for(const relation of def.relationships) tagEngine.relate(relation);
  }
  window.dispatchEvent?.(new CustomEvent('reusable-engine:application-activated',{detail:{application:clone(def)}}));
  return clone(def);
}
function active(){return activeId?get(activeId):null;}
function namespace(kind,fallback=''){const def=activeId&&definitions.get(activeId);return String(def?.namespaces?.[kind]??fallback);}
function capability(id,fallback=undefined){const def=activeId&&definitions.get(activeId);const value=def?.capabilities?.[id];return value===undefined?fallback:value;}
function reset(){definitions.clear();activeId=null;}
window.reusableApplicationDefinitions=Object.freeze({register,get,list,activate,active,namespace,capability,reset});
})();
