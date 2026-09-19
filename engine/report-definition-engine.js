(()=>{
'use strict';
const DB='genreactrix-report-definitions-v1', STORE='definitions', VERSION=1;
const now=()=>new Date().toISOString();
const clone=v=>v==null?v:structuredClone(v);
const uid=()=>`reportdef-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:'id'});s.createIndex('name','name');s.createIndex('updatedAt','updatedAt')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function all(){const db=await openDb();return new Promise((res,rej)=>{const q=db.transaction(STORE).objectStore(STORE).getAll();q.onsuccess=()=>res((q.result||[]).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))));q.onerror=()=>rej(q.error)})}
async function get(id){const db=await openDb();return new Promise((res,rej)=>{const q=db.transaction(STORE).objectStore(STORE).get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}
function normalize(input={}){return{id:input.id||uid(),schemaVersion:1,name:String(input.name||'Untitled report'),description:String(input.description||''),author:String(input.author||'Director'),scope:clone(input.scope||{type:'all-records'}),filters:clone(input.filters||{logic:'and',conditions:[]}),fields:[...(input.fields||['imageId','batch','directorReactions','directorThemes','primFusion','aiAgreement'])],groupBy:input.groupBy||'none',sortBy:input.sortBy||'imageId',sortDirection:input.sortDirection==='desc'?'desc':'asc',statistics:[...(input.statistics||['count','percentage'])],modules:[...(input.modules||['summary','reactions','themes','primfusion','agreement'])],outputFormat:input.outputFormat||'json',createdAt:input.createdAt||now(),updatedAt:now(),lastRunAt:input.lastRunAt||null,lastResultSize:Number(input.lastResultSize)||0,builtIn:Boolean(input.builtIn)}}
async function save(input){const value=normalize(input),db=await openDb();return new Promise((res,rej)=>{const q=db.transaction(STORE,'readwrite').objectStore(STORE).put(value);q.onsuccess=()=>res(value);q.onerror=()=>rej(q.error)})}
async function remove(id){const db=await openDb();return new Promise((res,rej)=>{const q=db.transaction(STORE,'readwrite').objectStore(STORE).delete(id);q.onsuccess=()=>res(true);q.onerror=()=>rej(q.error)})}
const BUILT_INS=[
 {id:'builtin-batch-summary',name:'Batch Summary',scope:{type:'current-batch'},modules:['summary','reactions','themes','primfusion','sources','workflow'],groupBy:'none'},
 {id:'builtin-theme-distribution',name:'Theme Distribution',modules:['summary','themes'],groupBy:'directorTheme'},
 {id:'builtin-reaction-distribution',name:'Reaction Distribution',modules:['summary','reactions'],groupBy:'directorReaction'},
 {id:'builtin-primfusion-matrix',name:'PrimFusion Matrix',modules:['summary','primfusion'],groupBy:'primFusion'},
 {id:'builtin-ai-accuracy',name:'AI Accuracy',modules:['summary','agreement'],groupBy:'aiAgreement'},
 {id:'builtin-ai-disagreements',name:'AI Disagreements',filters:{logic:'and',conditions:[{field:'ai-disagreement',op:'has',value:true}]},modules:['summary','agreement'],groupBy:'aiAgreement'},
 {id:'builtin-saved-images',name:'Saved Images',scope:{type:'saved'},modules:['summary','reactions','themes']},
 {id:'builtin-flagged-review',name:'Flagged Review',scope:{type:'flagged'},modules:['summary','reactions','themes','workflow']},
 {id:'builtin-queue-health',name:'Queue Health',modules:['summary','workflow'],groupBy:'workflowStage'},
 {id:'builtin-director-productivity',name:'Director Productivity',modules:['summary','workflow'],groupBy:'classifiedDate'}
];
async function ensureBuiltIns(){for(const d of BUILT_INS){if(!(await get(d.id)))await save({...d,builtIn:true,description:`Built-in ${d.name} definition`})}}
async function markRun(id,size){const d=await get(id);if(!d)return null;return save({...d,lastRunAt:now(),lastResultSize:Number(size)||0})}
async function integrity(){const defs=await all(),issues=[],ids=new Set();for(const d of defs){if(ids.has(d.id))issues.push({type:'duplicate-definition-id',id:d.id});ids.add(d.id);if(!d.name)issues.push({type:'missing-name',id:d.id});if(!Array.isArray(d.fields)||!Array.isArray(d.modules))issues.push({type:'invalid-definition-shape',id:d.id})}return{checkedAt:now(),definitionCount:defs.length,issueCount:issues.length,issues}}
const api={all,get,save,remove,normalize,ensureBuiltIns,markRun,integrity};window.genreactrixReportDefinitionEngine=api;window.addEventListener('DOMContentLoaded',()=>ensureBuiltIns());
})();
