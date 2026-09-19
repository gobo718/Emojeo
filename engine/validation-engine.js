(()=>{
'use strict';
const rules=new Map(),listeners=new Set();
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
function register(id,validator,{label=id,owner='core',severity='warning'}={}){if(!id||typeof validator!=='function')throw new Error('Validation rule requires id and function');if(rules.has(id))throw new Error(`Duplicate validation rule: ${id}`);rules.set(id,{id,label,owner,severity,validator});return id}
function unregister(id){return rules.delete(id)}
async function run(id,context={}){const r=rules.get(id);if(!r)throw new Error(`Unknown validation rule: ${id}`);const started=performance.now();try{const result=await r.validator(context);return {id,label:r.label,owner:r.owner,severity:r.severity,ok:result===true||result?.ok!==false,issues:Array.isArray(result?.issues)?result.issues:[],details:result?.details||null,durationMs:Math.round(performance.now()-started)}}catch(error){return {id,label:r.label,owner:r.owner,severity:'critical',ok:false,issues:[{severity:'critical',ownerEngine:r.owner,issueType:'validator-error',summary:`${r.label} failed`,technicalDetails:error.message}],durationMs:Math.round(performance.now()-started),error:error.message}}
}
async function runMany(ids=[...rules.keys()],context={}){const out=[];for(const id of ids)out.push(await run(id,context));listeners.forEach(fn=>{try{fn(clone(out))}catch(e){console.warn(e)}});return out}
function list(){return [...rules.values()].map(({validator,...r})=>clone(r))}
function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}
window.genreactrixValidationEngine={register,unregister,run,runMany,list,subscribe};
})();
