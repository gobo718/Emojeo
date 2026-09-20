/* Emojeo Cluster Discovery — Pass 8
   Finds intersections and recurring trait signatures across emoji. Results are
   advisory candidates only: discovery never creates Mosaics or canonical traits. */
(()=>{'use strict';
const clean=v=>String(v??'').trim(), clone=v=>v==null?v:structuredClone(v);
const key=t=>`${t.type}:${t.id}`;
function subjectTraitSets({records=[],assignments=globalThis.reusableTagAssignments||globalThis.window?.reusableTagAssignments,includeUncertain=false}={}){
 if(!assignments)throw new Error('StringBoard tag assignment engine is required.');
 const out=new Map(records.map(r=>[r.id,{subject:{type:'emoji',id:r.id,emoji:r.emoji,name:r.names?.cldr||r.name||''},traits:new Map()}]));
 for(const [id,row] of out){
   const found=assignments.forSubject?assignments.forSubject({type:'emoji',id}):assignments.list?.({subject:{type:'emoji',id}})||[];
   for(const a of found||[]){if(a.status&&a.status!=='active')continue;if(a.metadata?.decision==='uncertain'&&!includeUncertain)continue;const t=a.tag;if(t?.type&&t?.id)row.traits.set(key(t),{type:t.type,id:t.id,label:t.label||t.id,authority:a.metadata?.authority||t.authority||null});}
 }
 return out;
}
function combinations(items,size,start=0,prefix=[],out=[]){if(prefix.length===size){out.push(prefix.slice());return out}for(let i=start;i<=items.length-(size-prefix.length);i++){prefix.push(items[i]);combinations(items,size,i+1,prefix,out);prefix.pop()}return out;}
function discoverIntersections(options={}){
 const rows=subjectTraitSets(options), minSize=Math.max(2,Number(options.minTraits)||2), maxSize=Math.max(minSize,Math.min(Number(options.maxTraits)||4,8)), minSubjects=Math.max(2,Number(options.minSubjects)||2), map=new Map();
 for(const row of rows.values()){
   const traits=[...row.traits.values()].sort((a,b)=>key(a).localeCompare(key(b)));
   for(let n=minSize;n<=Math.min(maxSize,traits.length);n++)for(const combo of combinations(traits,n)){const id=combo.map(key).join('&');let x=map.get(id);if(!x){x={id,traits:clone(combo),subjects:[]};map.set(id,x)}x.subjects.push(clone(row.subject));}
 }
 return [...map.values()].filter(x=>x.subjects.length>=minSubjects).map(x=>({...x,subjectCount:x.subjects.length})).sort((a,b)=>b.subjectCount-a.subjectCount||b.traits.length-a.traits.length||a.id.localeCompare(b.id));
}
function similarityClusters(options={}){
 const rows=[...subjectTraitSets(options).values()], threshold=Math.max(0,Math.min(1,Number(options.threshold??0.6))), minSubjects=Math.max(2,Number(options.minSubjects)||2), edges=[];
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){const A=new Set(rows[i].traits.keys()),B=new Set(rows[j].traits.keys()),inter=[...A].filter(x=>B.has(x)).length,union=new Set([...A,...B]).size,score=union?inter/union:0;if(score>=threshold)edges.push([i,j,score]);}
 const parent=rows.map((_,i)=>i),find=x=>parent[x]===x?x:(parent[x]=find(parent[x])),join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a};edges.forEach(e=>join(e[0],e[1]));
 const groups=new Map();rows.forEach((r,i)=>{const k=find(i);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r)});
 return [...groups.values()].filter(g=>g.length>=minSubjects).map((g,i)=>{const common=[...g[0].traits.values()].filter(t=>g.every(r=>r.traits.has(key(t))));return{id:`cluster-${i+1}`,status:'candidate',subjectCount:g.length,subjects:g.map(r=>clone(r.subject)),commonTraits:clone(common),method:'jaccard-connected-components',threshold}}).sort((a,b)=>b.subjectCount-a.subjectCount);
}
function mosaicCandidates(options={}){return similarityClusters(options).map(c=>({...c,kind:'mosaic-candidate',canonical:false,advisory:true,decisionRequired:true}));}
function createDiscoverySnapshot(options={}){return{schemaVersion:1,kind:'emojeo-cluster-discovery',generatedAt:new Date().toISOString(),intersections:discoverIntersections(options),clusters:similarityClusters(options),mosaicCandidates:mosaicCandidates(options),policy:{advisoryOnly:true,createsCanon:false,createsMosaics:false}};}
const api=Object.freeze({subjectTraitSets,discoverIntersections,similarityClusters,mosaicCandidates,createDiscoverySnapshot});if(typeof window!=='undefined')window.emojeoClusterDiscovery=api;if(typeof globalThis!=='undefined')globalThis.emojeoClusterDiscovery=api;
})();
