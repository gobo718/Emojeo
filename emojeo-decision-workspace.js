/* Emojeo Decision Workspace — Pass 17
   Human-controlled design decision records built on Pass 16 what-if previews.
   A decision can be drafted, reviewed, approved/rejected, and converted into an
   implementation plan. Approval records intent; it does not silently mutate canon. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v), clean=v=>String(v??'').trim();
const STATES=Object.freeze(['draft','review','approved','rejected','implemented','withdrawn']);
function createDecisionWorkspace({impact}={}){
 if(!impact)throw new Error('Decision workspace requires change-impact analysis.');
 const decisions=new Map();let seq=0;
 function create(input={}){
  const title=clean(input.title),change=clone(input.change||{});if(!title)throw new Error('Decision requires a title.');
  const preview=impact.compare(change);const id=clean(input.id)||`decision-${++seq}`;
  if(decisions.has(id))throw new Error('Decision id already exists.');
  const row={id,title,question:clean(input.question),rationale:clean(input.rationale),state:'draft',change,preview,provenance:clone(input.provenance||{}),notes:[],history:[{state:'draft',actor:clean(input.actor||'human'),note:'Decision drafted.'}]};
  decisions.set(id,row);return clone(row);
 }
 const get=id=>clone(decisions.get(clean(id))||null);
 const list=({state}={})=>[...decisions.values()].filter(d=>!state||d.state===state).map(clone);
 function note(id,text,{actor='human'}={}){const d=decisions.get(clean(id));if(!d)throw new Error('Unknown decision.');const value=clean(text);if(!value)throw new Error('Note cannot be empty.');d.notes.push({text:value,actor:clean(actor)});return clone(d)}
 function refresh(id){const d=decisions.get(clean(id));if(!d)throw new Error('Unknown decision.');if(['implemented','withdrawn'].includes(d.state))throw new Error('Closed decisions cannot be refreshed.');d.preview=impact.compare(d.change);d.history.push({state:d.state,actor:'system',note:'Impact preview refreshed.'});return clone(d)}
 function submit(id,{actor='human',note='' }={}){const d=decisions.get(clean(id));if(!d)throw new Error('Unknown decision.');if(d.state!=='draft')throw new Error('Only draft decisions can enter review.');d.state='review';d.history.push({state:'review',actor:clean(actor),note:clean(note)});return clone(d)}
 function decide(id,{approved,actor,note='' }={}){const d=decisions.get(clean(id));if(!d)throw new Error('Unknown decision.');if(d.state!=='review')throw new Error('Only decisions in review can be decided.');if(approved!==true&&approved!==false)throw new Error('Decision requires an explicit approval or rejection.');if(!clean(actor)||clean(actor)==='machine'||clean(actor)==='system')throw new Error('Approval/rejection requires an identified human actor.');d.state=approved?'approved':'rejected';d.history.push({state:d.state,actor:clean(actor),note:clean(note)});return clone(d)}
 function implementationPlan(id){const d=decisions.get(clean(id));if(!d)throw new Error('Unknown decision.');if(d.state!=='approved')throw new Error('Only approved decisions can produce an implementation plan.');return {kind:'emojeo-implementation-plan',decisionId:d.id,title:d.title,change:clone(d.change),impact:clone(d.preview),policy:{humanApproved:true,planOnly:true,autoMutatesGraph:false,autoMutatesCanon:false,verifyAfterImplementation:true}}}
 function markImplemented(id,{actor,note='' }={}){const d=decisions.get(clean(id));if(!d)throw new Error('Unknown decision.');if(d.state!=='approved')throw new Error('Only approved decisions can be marked implemented.');if(!clean(actor)||['machine','system'].includes(clean(actor)))throw new Error('Implementation confirmation requires an identified human actor.');d.state='implemented';d.history.push({state:'implemented',actor:clean(actor),note:clean(note)});return clone(d)}
 function snapshot(){return {schemaVersion:1,kind:'emojeo-decision-workspace',decisions:list(),policy:{impactBeforeDecision:true,explicitHumanDecision:true,approvalDoesNotMutateCanon:true,approvalDoesNotMutateGraph:true,historyPreserved:true}}}
 return Object.freeze({STATES,create,get,list,note,refresh,submit,decide,implementationPlan,markImplemented,snapshot});
}
const api=Object.freeze({STATES,createDecisionWorkspace});if(typeof window!=='undefined')window.emojeoDecisionWorkspace=api;if(typeof globalThis!=='undefined')globalThis.emojeoDecisionWorkspace=api;
})();
