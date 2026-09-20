/* Reusable Record Store Engine v1
   Product-neutral records, schema migration, provenance, history/undo,
   status/flags, import/export, and pluggable persistence.
   Application meaning belongs outside this file. */
(()=>{'use strict';
const API_VERSION=1;
const clone=v=>v==null?v:structuredClone(v);
const iso=()=>new Date().toISOString();
const uid=p=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
function memoryAdapter(seed){let state=clone(seed)||null;return{async load(){return clone(state)},async save(next){state=clone(next);return clone(state)},async clear(){state=null}}}
function normalizeFlag(v){return String(v||'').trim()}
function createStore(options={}){
 const id=String(options.id||'records').trim()||'records';
 const schemaVersion=Math.max(1,Number(options.schemaVersion)||1);
 const adapter=options.adapter||memoryAdapter();
 const migrate=typeof options.migrate==='function'?options.migrate:async r=>r;
 const validate=typeof options.validate==='function'?options.validate:()=>true;
 const maxHistory=Math.max(0,Number(options.maxHistory??100)||0);
 let state={storeId:id,schemaVersion,revision:0,records:{},history:[],updatedAt:null,metadata:clone(options.metadata||{})};
 const snapshot=()=>clone(state);
 const save=async()=>{state.updatedAt=iso();await adapter.save(state);return snapshot()};
 async function initialize(){const loaded=await adapter.load();if(loaded){state={...state,...clone(loaded),records:clone(loaded.records||{}),history:clone(loaded.history||[])};await migrateAll()}return snapshot()}
 async function migrateRecord(record){let r=clone(record),from=Math.max(1,Number(r.schemaVersion)||1);if(from>schemaVersion)throw new Error(`Record ${r.id||''} schema ${from} is newer than store schema ${schemaVersion}`);while(from<schemaVersion){const next=await migrate(clone(r),from,from+1);if(!next)throw new Error(`Migration ${from}->${from+1} returned no record`);r={...clone(next),schemaVersion:from+1};from++}r.schemaVersion=schemaVersion;return r}
 async function migrateAll(){let changed=false;for(const [key,value] of Object.entries(state.records)){const migrated=await migrateRecord(value);if(JSON.stringify(migrated)!==JSON.stringify(value)){state.records[key]=migrated;changed=true}}state.schemaVersion=schemaVersion;if(changed)await save()}
 function provenance(input,previous){const p=clone(input||{});return{createdAt:previous?.provenance?.createdAt||p.createdAt||iso(),createdBy:previous?.provenance?.createdBy||p.createdBy||null,updatedAt:iso(),updatedBy:p.updatedBy??p.actor??null,source:p.source??previous?.provenance?.source??null,evidence:clone(p.evidence??previous?.provenance?.evidence??null),metadata:{...(previous?.provenance?.metadata||{}),...(p.metadata||{})}}}
 function canonical(input,previous){const now=iso(),rid=String(input.id||previous?.id||uid('record'));return{id:rid,schemaVersion,status:String(input.status??previous?.status??'active'),flags:[...new Set((input.flags??previous?.flags??[]).map(normalizeFlag).filter(Boolean))],data:clone(input.data??previous?.data??{}),metadata:{...(previous?.metadata||{}),...(clone(input.metadata||{}))},provenance:provenance(input.provenance,previous),createdAt:previous?.createdAt||input.createdAt||now,updatedAt:now,revision:Number(previous?.revision||0)+1}}
 function pushHistory(action,before,after,meta={}){state.revision++;state.history.push({id:uid('change'),storeRevision:state.revision,action,recordId:after?.id||before?.id||null,before:clone(before),after:clone(after),at:iso(),actor:meta.actor??null,source:meta.source??null,reason:meta.reason??null,metadata:clone(meta.metadata||{})});if(maxHistory>=0&&state.history.length>maxHistory)state.history.splice(0,state.history.length-maxHistory)}
 async function put(input={},meta={}){const previous=input.id?state.records[String(input.id)]||null:null;let record=canonical(input,previous);record=await migrateRecord(record);const valid=await validate(clone(record),{previous:clone(previous),store:snapshot()});if(valid===false)throw new Error(`Record ${record.id} failed validation`);state.records[record.id]=record;pushHistory(previous?'update':'create',previous,record,meta);await save();return clone(record)}
 async function remove(recordId,meta={}){const key=String(recordId),previous=state.records[key];if(!previous)return false;delete state.records[key];pushHistory('delete',previous,null,meta);await save();return true}
 const get=recordId=>clone(state.records[String(recordId)]||null);
 function all(filter){let rows=Object.values(state.records).map(clone);if(typeof filter==='function')rows=rows.filter(filter);return rows}
 async function patch(recordId,changes={},meta={}){const old=get(recordId);if(!old)throw new Error(`Record not found: ${recordId}`);return put({...old,...clone(changes),id:old.id,data:changes.data===undefined?old.data:changes.data,metadata:{...old.metadata,...(changes.metadata||{})},provenance:{...old.provenance,...(changes.provenance||{})}},meta)}
 async function setStatus(recordId,status,meta={}){return patch(recordId,{status:String(status||'active')},meta)}
 async function setFlag(recordId,flag,enabled=true,meta={}){const old=get(recordId);if(!old)throw new Error(`Record not found: ${recordId}`);const flags=new Set(old.flags||[]),f=normalizeFlag(flag);if(f){if(enabled)flags.add(f);else flags.delete(f)}return patch(recordId,{flags:[...flags]},meta)}
 function history({recordId,limit}={}){let rows=state.history;if(recordId!=null)rows=rows.filter(h=>h.recordId===String(recordId));if(limit!=null)rows=rows.slice(-Math.max(0,Number(limit)||0));return clone(rows)}
 async function undo(meta={}){const change=state.history[state.history.length-1];if(!change)return null;state.history.pop();if(change.before)state.records[change.recordId]=clone(change.before);else delete state.records[change.recordId];state.revision++;state.history.push({id:uid('change'),storeRevision:state.revision,action:'undo',recordId:change.recordId,before:clone(change.after),after:clone(change.before),at:iso(),actor:meta.actor??null,source:meta.source??null,reason:meta.reason??null,metadata:{undid:change.id,...clone(meta.metadata||{})}});if(maxHistory>=0&&state.history.length>maxHistory)state.history.splice(0,state.history.length-maxHistory);await save();return clone(change)}
 function exportData({includeHistory=true}={}){return{type:'reusable-record-store',formatVersion:1,storeId:id,schemaVersion,exportedAt:iso(),metadata:clone(state.metadata),records:all(),history:includeHistory?history():[]}}
 async function importData(payload,{mode='merge',meta={}}={}){if(payload?.type!=='reusable-record-store')throw new Error('Unsupported record-store payload');if(!['merge','replace'].includes(mode))throw new Error('Import mode must be merge or replace');const incoming=Array.isArray(payload.records)?payload.records:[];if(mode==='replace'){const before=clone(state.records);state.records={};pushHistory('replace-import',{id:'__store__',data:before},{id:'__store__',data:{}},meta)}let count=0;for(const raw of incoming){const migrated=await migrateRecord(raw);const valid=await validate(clone(migrated),{previous:get(migrated.id),store:snapshot(),importing:true});if(valid===false)throw new Error(`Imported record ${migrated.id} failed validation`);const previous=get(migrated.id);state.records[migrated.id]=clone(migrated);pushHistory(previous?'import-update':'import-create',previous,migrated,meta);count++}await save();return{mode,count,schemaVersion}}
 async function clear(meta={}){const before=clone(state.records);state.records={};pushHistory('clear',{id:'__store__',data:before},{id:'__store__',data:{}},meta);await save();return snapshot()}
 return{id,schemaVersion,initialize,snapshot,get,all,put,patch,remove,setStatus,setFlag,history,undo,exportData,importData,clear};
}
const api={API_VERSION,createStore,memoryAdapter};
if(typeof window!=='undefined')window.reusableRecordStore=api;
if(typeof globalThis!=='undefined')globalThis.reusableRecordStore=api;
})();
