/* Emojeo Discovery Corpus — Pass 5
   A lossless pool of raw observations. This intentionally does not normalize,
   merge synonyms, promote vocabulary, or create StringBoard tag assignments. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v), clean=v=>String(v??'').trim();
function createCorpus(seed=[]){
 const runs=[]; const add=result=>{if(!globalThis.emojeoOpenDiscovery?.validateResult(result))throw new Error('Corpus accepts only valid open-discovery results.');runs.push(clone(result));return clone(result)};
 seed.forEach(add);
 const all=()=>clone(runs);
 const forSubject=id=>clone(runs.filter(r=>r.subject.id===clean(id)));
 const observations=()=>runs.flatMap(r=>r.observations.map(o=>({...clone(o),subject:clone(r.subject),run:clone(r.run),source:clone(r.source)})));
 const phrases=()=>observations().map(o=>o.phrase);
 const snapshot=()=>({schemaVersion:1,kind:'emojeo-open-discovery-corpus',runCount:runs.length,observationCount:observations().length,runs:all()});
 return Object.freeze({add,all,forSubject,observations,phrases,snapshot});
}
const api=Object.freeze({createCorpus});
if(typeof window!=='undefined')window.emojeoDiscoveryCorpus=api;
if(typeof globalThis!=='undefined')globalThis.emojeoDiscoveryCorpus=api;
})();
