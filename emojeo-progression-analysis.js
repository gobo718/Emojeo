/* Emojeo Progression Analysis — Pass 14
   Reads the shared design graph as a progression/dependency network.
   Finds roots, sinks, unreachable content, dependency cycles, bottlenecks,
   and prerequisite chains without inventing or changing canon. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v), clean=v=>String(v??'').trim();
const DEFAULT_FLOW=new Set(['unlocks','awards','progresses','contains']);
const DEFAULT_REQUIRE=new Set(['requires','depends-on']);
const k=x=>`${x.type}:${x.id}`;
function createProgressionAnalysis({graph}={}){
 if(!graph)throw new Error('Progression analysis requires a design graph.');
 const snap=()=>graph.snapshot();
 function network({flowTypes=[...DEFAULT_FLOW],requirementTypes=[...DEFAULT_REQUIRE],includeAdvisory=false}={}){
  const s=snap(), flows=new Set(flowTypes), reqs=new Set(requirementTypes), nodes=new Map(s.things.map(t=>[k(t),t])), edges=[];
  for(const r of s.relationships){if(!includeAdvisory&&r.advisory)continue;if(flows.has(r.type))edges.push({from:k(r.from),to:k(r.to),relationship:clone(r),semantic:'flow'});if(reqs.has(r.type))edges.push({from:k(r.to),to:k(r.from),relationship:clone(r),semantic:'requirement'});}
  return {nodes,edges};
 }
 function adjacency(net){const out=new Map(),inc=new Map();for(const id of net.nodes.keys()){out.set(id,[]);inc.set(id,[])}for(const e of net.edges){out.get(e.from)?.push(e);inc.get(e.to)?.push(e)}return {out,inc};}
 function roots(options={}){const n=network(options),{inc}=adjacency(n);return [...n.nodes].filter(([id])=>!(inc.get(id)||[]).length).map(([,t])=>clone(t));}
 function sinks(options={}){const n=network(options),{out}=adjacency(n);return [...n.nodes].filter(([id])=>!(out.get(id)||[]).length).map(([,t])=>clone(t));}
 function reachableFrom(starts=[],options={}){const n=network(options),{out}=adjacency(n),seen=new Set(),q=[];for(const s of starts){const id=typeof s==='string'?s:k(s);if(n.nodes.has(id)&&!seen.has(id)){seen.add(id);q.push(id)}}while(q.length){const id=q.shift();for(const e of out.get(id)||[])if(!seen.has(e.to)){seen.add(e.to);q.push(e.to)}}return [...seen].map(id=>clone(n.nodes.get(id)));}
 function unreachable({starts,rootTypes=['emoji','event','item','npc'],...options}={}){const n=network(options);let seeds=starts;if(!seeds)seeds=[...n.nodes.values()].filter(t=>rootTypes.includes(t.type)).map(k);const reached=new Set(reachableFrom(seeds,options).map(k));return [...n.nodes.values()].filter(t=>!reached.has(k(t))).map(clone);}
 function cycles(options={}){const n=network(options),{out}=adjacency(n),state=new Map(),stack=[],found=[],signatures=new Set();function visit(id){state.set(id,1);stack.push(id);for(const e of out.get(id)||[]){if(state.get(e.to)===1){const i=stack.indexOf(e.to),path=[...stack.slice(i),e.to],core=path.slice(0,-1),sig=[...core].sort().join('|');if(!signatures.has(sig)){signatures.add(sig);found.push({path,things:core.map(x=>clone(n.nodes.get(x)))})}}else if(!state.get(e.to))visit(e.to)}stack.pop();state.set(id,2)}for(const id of n.nodes.keys())if(!state.get(id))visit(id);return found;}
 function bottlenecks({minimumDependents=2,...options}={}){const n=network(options),{out}=adjacency(n);return [...n.nodes].map(([id,t])=>({thing:clone(t),dependentCount:(out.get(id)||[]).length,connections:(out.get(id)||[]).map(clone)})).filter(x=>x.dependentCount>=minimumDependents).sort((a,b)=>b.dependentCount-a.dependentCount);}
 function paths(from,to,{maxDepth=8,...options}={}){const n=network(options),{out}=adjacency(n),start=typeof from==='string'?from:k(from),target=typeof to==='string'?to:k(to);if(!n.nodes.has(start)||!n.nodes.has(target))return[];const results=[],q=[{id:start,path:[start],edges:[]}];while(q.length){const cur=q.shift();if(cur.path.length-1>=maxDepth)continue;for(const e of out.get(cur.id)||[]){if(cur.path.includes(e.to))continue;const path=[...cur.path,e.to],edges=[...cur.edges,e];if(e.to===target)results.push({path,things:path.map(x=>clone(n.nodes.get(x))),relationships:edges.map(x=>clone(x.relationship))});else q.push({id:e.to,path,edges})}}return results;}
 function report(options={}){const n=network(options);return {kind:'emojeo-progression-report',nodeCount:n.nodes.size,edgeCount:n.edges.length,roots:roots(options),sinks:sinks(options),unreachable:unreachable(options),cycles:cycles(options),bottlenecks:bottlenecks(options),policy:{readOnly:true,noCanonMutation:true,advisoryExcludedByDefault:true,relationshipDirectionAware:true}}}
 return Object.freeze({network,roots,sinks,reachableFrom,unreachable,cycles,bottlenecks,paths,report});
}
const api=Object.freeze({createProgressionAnalysis});if(typeof window!=='undefined')window.emojeoProgressionAnalysis=api;if(typeof globalThis!=='undefined')globalThis.emojeoProgressionAnalysis=api;
})();
