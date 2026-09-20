/* Emojeo Design Health — Pass 15
   Combines graph gaps, progression diagnostics, and canon contradictions into
   one read-only design-health surface. Findings are evidence, not automatic fixes. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v), key=t=>`${t.type}:${t.id}`;
function createDesignHealth({graph,catalog,progression,ledger}={}){
 if(!graph)throw new Error('Design health requires a design graph.');
 if(!catalog)throw new Error('Design health requires the design catalog.');
 if(!progression)throw new Error('Design health requires progression analysis.');
 const finding=(kind,severity,data={})=>({kind,severity,...clone(data)});
 function findings(options={}){
  const out=[];
  for(const g of catalog.findGaps(graph)) out.push(finding(g.kind,g.kind==='disconnected'?'notice':'warning',{thing:g.thing,source:'catalog'}));
  for(const t of progression.unreachable(options.progression||{})) out.push(finding('unreachable','warning',{thing:t,source:'progression'}));
  for(const c of progression.cycles(options.progression||{})) out.push(finding('dependency-cycle','critical',{path:c.path,things:c.things,source:'progression'}));
  for(const b of progression.bottlenecks({minimumDependents:options.minimumDependents??3,...(options.progression||{})})) out.push(finding('bottleneck','notice',{thing:b.thing,dependentCount:b.dependentCount,source:'progression'}));
  if(ledger) for(const c of ledger.conflicts()) out.push(finding('canon-conflict','critical',{subject:c.subject,field:c.field,claims:c.claims,source:'canon-ledger'}));
  const seen=new Set();return out.filter(f=>{const sig=JSON.stringify([f.kind,f.thing&&key(f.thing),f.subject&&key(f.subject),f.field,f.path]);if(seen.has(sig))return false;seen.add(sig);return true});
 }
 function domainCoverage(){return catalog.domainSummary(graph).map(d=>({...d,connectionDensity:d.count?d.connections/d.count:0,status:d.count===0?'empty':d.disconnected===d.count?'isolated':d.disconnected?'partial':'connected'}));}
 function attentionQueue(options={}){const rank={critical:0,warning:1,notice:2};return findings(options).sort((a,b)=>rank[a.severity]-rank[b.severity]||a.kind.localeCompare(b.kind));}
 function inspectThing(thing,options={}){const id=key(thing);return attentionQueue(options).filter(f=>(f.thing&&key(f.thing)===id)||(f.subject&&key(f.subject)===id)||(f.things||[]).some(t=>key(t)===id));}
 function report(options={}){const fs=findings(options),counts={critical:0,warning:0,notice:0};for(const f of fs)counts[f.severity]++;return {kind:'emojeo-design-health-report',counts,total:fs.length,findings:attentionQueue(options),domains:domainCoverage(),policy:{readOnly:true,noAutomaticFixes:true,noCanonMutation:true,advisoryProgressionExcludedByDefault:true}}}
 return Object.freeze({findings,domainCoverage,attentionQueue,inspectThing,report});
}
const api=Object.freeze({createDesignHealth});if(typeof window!=='undefined')window.emojeoDesignHealth=api;if(typeof globalThis!=='undefined')globalThis.emojeoDesignHealth=api;
})();
