/* Reusable Namespace Boundary Engine v1
   Resolves application-owned storage/database/event/global/API names without
   rewriting preserved legacy contracts. Applications supply namespace meaning;
   compatibility aliases remain explicit and non-destructive. */
(()=>{'use strict';
const clean=v=>String(v??'').trim();
const app=()=>window.reusableApplicationDefinitions?.active?.()||null;
function namespace(kind,fallback=''){
  const def=app(); return clean(def?.namespaces?.[kind]??fallback);
}
function join(prefix,name,separator='-'){
  prefix=clean(prefix); name=clean(name); separator=String(separator??'');
  if(separator){
    const escaped=separator.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    prefix=prefix.replace(new RegExp(`${escaped}+$`),'');
    name=name.replace(new RegExp(`^${escaped}+`),'');
  }
  return prefix&&name?`${prefix}${separator}${name}`:prefix||name;
}
function storageKey(name,{namespace:ns,separator='-',version}={}){
  let key=join(ns??namespace('storage'),name,separator);
  if(version!==undefined&&version!==null&&clean(version)) key=join(key,`v${clean(version).replace(/^v/i,'')}`,separator);
  return key;
}
function databaseName(name,{namespace:ns,separator='-'}={}){return join(ns??namespace('database'),name,separator);}
function eventName(name,{namespace:ns,separator=':'}={}){return join(ns??namespace('events'),name,separator);}
function globalName(name,{namespace:ns,separator=''}={}){return join(ns??namespace('globals'),name,separator);}
function apiPath(name='',{namespace:ns,base='/api'}={}){
  const parts=[clean(base).replace(/\/+$/,''),clean(ns??namespace('api')).replace(/^\/+|\/+$/g,''),clean(name).replace(/^\/+/, '')].filter(Boolean);
  return parts.join('/').replace(/([^:])\/{2,}/g,'$1/');
}
function compatibility(){const def=app();return def?.compatibility?structuredClone(def.compatibility):{};}
function legacyStorageKey(name){const c=compatibility();return c.legacyStoragePrefix?`${c.legacyStoragePrefix}${clean(name).replace(/^-+/,'')}`:null;}
function candidates(kind,name,options={}){
  const current=kind==='storage'?storageKey(name,options):kind==='database'?databaseName(name,options):kind==='event'?eventName(name,options):kind==='global'?globalName(name,options):kind==='api'?apiPath(name,options):clean(name);
  const out=[current]; const c=compatibility();
  if(kind==='storage'&&c.legacyStoragePrefix){const legacy=legacyStorageKey(name);if(legacy&&!out.includes(legacy))out.push(legacy);}
  if(kind==='api'&&c.legacyApiBase){const legacy=apiPath(name,{...options,namespace:'',base:c.legacyApiBase});if(legacy&&!out.includes(legacy))out.push(legacy);}
  return out.filter(Boolean);
}
window.reusableNamespaceEngine=Object.freeze({namespace,storageKey,databaseName,eventName,globalName,apiPath,compatibility,legacyStorageKey,candidates});
})();
