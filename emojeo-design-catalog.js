/* Emojeo Design Catalog — Pass 11
   MASHPEDITION-facing domain registry and connection vocabulary.
   Defines minimal identities and semantic links without inventing game content. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v);
const DOMAINS=Object.freeze([
 {id:'emoji',label:'Emoji',kind:'source'},
 {id:'mosaic',label:'Mosaic',kind:'collection'},
 {id:'gem',label:'Gem',kind:'reward'},
 {id:'setting',label:'Setting',kind:'content'},
 {id:'unlockable',label:'Unlockable',kind:'content'},
 {id:'achievement',label:'Achievement',kind:'milestone'},
 {id:'trophy',label:'Trophy',kind:'award'},
 {id:'metric',label:'Metric',kind:'measurement'},
 {id:'reward',label:'Reward',kind:'reward'},
 {id:'item',label:'Item',kind:'content'},
 {id:'npc',label:'NPC',kind:'actor'},
 {id:'event',label:'Event',kind:'activity'}
]);
const RELATIONSHIPS=Object.freeze([
 {id:'requires',label:'Requires',directed:true},
 {id:'unlocks',label:'Unlocks',directed:true},
 {id:'awards',label:'Awards',directed:true},
 {id:'tracks',label:'Tracks',directed:true},
 {id:'progresses',label:'Progresses',directed:true},
 {id:'participates-in',label:'Participates in',directed:true},
 {id:'associated-with',label:'Associated with',directed:false},
 {id:'contains',label:'Contains',directed:true},
 {id:'depends-on',label:'Depends on',directed:true},
 {id:'derived-from',label:'Derived from',directed:true}
]);
function installDesignCatalog(graph){if(!graph)throw new Error('Design graph is required.');for(const d of DOMAINS)graph.registerType({id:d.id,label:d.label,metadata:{catalogKind:d.kind,definedBy:'emojeo-pass11'}});for(const r of RELATIONSHIPS)graph.registerRelationshipType({...r,metadata:{definedBy:'emojeo-pass11'}});return graph;}
function createCatalogThing(graph,input={}){if(!graph)throw new Error('Design graph is required.');const type=String(input.type||'').trim();if(!DOMAINS.some(d=>d.id===type))throw new Error(`Unknown Emojeo catalog domain: ${type}`);return graph.createThing({...input,authority:input.authority||'curated',metadata:{...(clone(input.metadata||{})),catalogDomain:type}});}
function connect(graph,input={}){if(!graph)throw new Error('Design graph is required.');if(!RELATIONSHIPS.some(r=>r.id===input.type)&&input.type!=='mosaic-member')throw new Error(`Unknown Emojeo catalog relationship: ${input.type}`);return graph.relate(input);}
function domainSummary(graph){const snap=graph.snapshot();return DOMAINS.map(d=>{const things=snap.things.filter(x=>x.type===d.id);const ids=new Set(things.map(x=>`${x.type}:${x.id}`));const relationships=snap.relationships.filter(r=>ids.has(`${r.from.type}:${r.from.id}`)||ids.has(`${r.to.type}:${r.to.id}`));return {id:d.id,label:d.label,kind:d.kind,count:things.length,connections:relationships.length,disconnected:things.filter(t=>!relationships.some(r=>(r.from.type===t.type&&r.from.id===t.id)||(r.to.type===t.type&&r.to.id===t.id))).length};});}
function findGaps(graph){const snap=graph.snapshot(), incoming=new Map(),outgoing=new Map();for(const r of snap.relationships){const f=`${r.from.type}:${r.from.id}`,t=`${r.to.type}:${r.to.id}`;(outgoing.get(f)||outgoing.set(f,[]).get(f)).push(r);(incoming.get(t)||incoming.set(t,[]).get(t)).push(r)}const gaps=[];for(const t of snap.things){const k=`${t.type}:${t.id}`,ins=incoming.get(k)||[],outs=outgoing.get(k)||[];if(!ins.length&&!outs.length)gaps.push({kind:'disconnected',thing:clone(t)});if(['reward','gem','unlockable'].includes(t.type)&&!ins.some(r=>['awards','unlocks','contains','derived-from'].includes(r.type)))gaps.push({kind:'no-source',thing:clone(t)});if(t.type==='metric'&&!ins.some(r=>r.type==='tracks')&&!outs.some(r=>['progresses','unlocks','awards'].includes(r.type)))gaps.push({kind:'unused-metric',thing:clone(t)});if(['achievement','trophy'].includes(t.type)&&!ins.some(r=>['unlocks','awards','progresses','depends-on'].includes(r.type))&&!outs.some(r=>['awards','unlocks','requires','depends-on'].includes(r.type)))gaps.push({kind:'unconnected-milestone',thing:clone(t)});}return gaps;}
const api=Object.freeze({DOMAINS,RELATIONSHIPS,installDesignCatalog,createCatalogThing,connect,domainSummary,findGaps});if(typeof window!=='undefined')window.emojeoDesignCatalog=api;if(typeof globalThis!=='undefined')globalThis.emojeoDesignCatalog=api;
})();
