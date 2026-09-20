/* Emojeo Mosaic Review — Pass 9
   Human decision layer for advisory cluster discoveries. Discovery may propose;
   only an explicit human approval can create a canonical Mosaic definition. */
(()=>{'use strict';
const clean=v=>String(v??'').trim(), clone=v=>v==null?v:structuredClone(v);
const slug=v=>clean(v).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function createReviewBoard({candidates=[]}={}){
 const state=new Map();
 const importCandidate=c=>{if(!c||c.kind!=='mosaic-candidate')throw new Error('Only Mosaic candidates can enter review.');const id=clean(c.id);if(!id)throw new Error('Mosaic candidate requires an id.');const row={id,status:'proposed',candidate:clone(c),decision:null,canonicalMosaic:null};state.set(id,row);return clone(row)};
 candidates.forEach(importCandidate);
 const list=()=>[...state.values()].map(clone);
 const get=id=>state.has(clean(id))?clone(state.get(clean(id))):null;
 const decide=(id,status,{human=false,decidedBy='',rationale='',at}={})=>{if(!['proposed','approved','rejected'].includes(status))throw new Error('Mosaic review status must be proposed, approved, or rejected.');const old=state.get(clean(id));if(!old)throw new Error('Unknown Mosaic candidate.');if(status==='approved'&&!human)throw new Error('Mosaic approval requires an explicit human decision.');const next={...old,status,decision:status==='proposed'?null:{status,human:!!human,decidedBy:clean(decidedBy),rationale:clean(rationale),at:at||new Date().toISOString()},canonicalMosaic:status==='approved'?old.canonicalMosaic:null};state.set(old.id,next);return clone(next)};
 const materialize=(id,{name,description='',gem=null,metadata={}}={})=>{const old=state.get(clean(id));if(!old)throw new Error('Unknown Mosaic candidate.');if(old.status!=='approved'||old.decision?.human!==true)throw new Error('Only a human-approved candidate can become a Mosaic.');const mosaicName=clean(name);if(!mosaicName)throw new Error('Canonical Mosaic requires a name.');const mosaic={id:`mosaic-${slug(mosaicName)}`,kind:'mosaic',status:'canonical',name:mosaicName,description:clean(description),emoji:(old.candidate.subjects||[]).map(s=>clone(s)),definingTraits:clone(old.candidate.commonTraits||[]),gem:clone(gem),sourceCandidateId:old.id,decision:clone(old.decision),metadata:clone(metadata)};const next={...old,canonicalMosaic:mosaic};state.set(old.id,next);return clone(mosaic)};
 const snapshot=()=>({schemaVersion:1,kind:'emojeo-mosaic-review',reviews:list(),policy:{discoveryIsAdvisory:true,humanApprovalRequired:true,materializationRequiresApproval:true}});
 return Object.freeze({importCandidate,list,get,decide,materialize,snapshot});
}
const api=Object.freeze({createReviewBoard});if(typeof window!=='undefined')window.emojeoMosaicReview=api;if(typeof globalThis!=='undefined')globalThis.emojeoMosaicReview=api;
})();
