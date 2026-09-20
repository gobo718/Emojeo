/* Emojeo Design Workbench — Pass 20
   Practical read-only multi-domain workbench over the design graph.
   Navigation and inspection never mutate graph or canon. */
(()=>{'use strict';
const clone=v=>v==null?v:structuredClone(v), clean=v=>String(v??'').trim(), esc=v=>clean(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function createDesignWorkbench({graph,catalog,ledger=null,health=null}={}){
 if(!graph)throw new Error('Design graph is required.');
 const state={domain:'all',query:'',status:'all',selected:null};
 const domains=()=>{const snap=graph.snapshot(),defs=new Map((snap.types||[]).map(x=>[x.id,x]));return [...defs.values()].map(d=>({id:d.id,label:d.label||d.id,count:graph.listThings({type:d.id}).length})).sort((a,b)=>a.label.localeCompare(b.label));};
 const setFilters=(input={})=>{if(input.domain!==undefined)state.domain=clean(input.domain)||'all';if(input.query!==undefined)state.query=clean(input.query);if(input.status!==undefined)state.status=clean(input.status)||'all';return getState()};
 const getState=()=>clone(state);
 const rows=()=>{const q=state.query.toLowerCase();return graph.listThings().filter(t=>(state.domain==='all'||t.type===state.domain)&&(state.status==='all'||t.status===state.status)&&(!q||[t.id,t.name,t.type,t.status].some(v=>clean(v).toLowerCase().includes(q)))).map(t=>({...t,connectionCount:graph.listRelationships({thing:{type:t.type,id:t.id}}).length})).sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name)||a.id.localeCompare(b.id));};
 const select=(type,id)=>{const thing=graph.getThing(type,id);if(!thing)throw new Error('Unknown design Thing.');state.selected={type:thing.type,id:thing.id};return inspect()};
 const clearSelection=()=>{state.selected=null;return getState()};
 const inspect=()=>{if(!state.selected)return null;const thing=graph.getThing(state.selected.type,state.selected.id);if(!thing){state.selected=null;return null}const connections=graph.listRelationships({thing:state.selected});const canon=ledger?.currentView?ledger.currentView(state.selected):null;return {thing,canon:clone(canon),connections:connections.map(r=>({...r,other:r.from.type===thing.type&&r.from.id===thing.id?graph.getThing(r.to.type,r.to.id):graph.getThing(r.from.type,r.from.id)}))};};
 const summary=()=>({domains:domains(),visible:rows().length,total:graph.listThings().length,relationships:graph.listRelationships().length,filters:getState()});
 const attention=()=>{if(!health)return[];const report=typeof health.report==='function'?health.report():typeof health.snapshot==='function'?health.snapshot():null;return clone(report?.findings||report?.attention||report?.queue||[])};
 const exportView=()=>({schemaVersion:1,kind:'emojeo-design-workbench-view',generatedAt:new Date().toISOString(),summary:summary(),rows:rows(),selection:inspect(),policy:{readOnly:true,humanControlledNavigation:true,doesNotMutateCanon:true}});
 const render=()=>{const s=summary(),list=rows(),detail=inspect();return `<section class="emojeo-workbench" data-pass="20"><header><h2>MASHPEDITION Design Workbench</h2><p>${s.visible} of ${s.total} Things · ${s.relationships} connections</p></header><div class="workbench-domains">${s.domains.map(d=>`<span data-domain="${esc(d.id)}">${esc(d.label)} <b>${d.count}</b></span>`).join('')}</div><div class="workbench-list">${list.map(t=>`<button type="button" data-thing-type="${esc(t.type)}" data-thing-id="${esc(t.id)}"><strong>${esc(t.name)}</strong><small>${esc(t.type)} · ${esc(t.status)} · ${t.connectionCount} links</small></button>`).join('')||'<p>No matching design Things.</p>'}</div>${detail?`<aside><h3>${esc(detail.thing.name)}</h3><p>${esc(detail.thing.type)} · ${esc(detail.thing.id)} · ${esc(detail.thing.status)}</p><h4>Connections</h4><ul>${detail.connections.map(c=>`<li>${esc(c.type)} · ${esc(c.other?.name||c.other?.id||'Unknown')}</li>`).join('')||'<li>None</li>'}</ul></aside>`:''}</section>`};
 const mount=(root)=>{if(!root||typeof root.innerHTML!=='string')throw new Error('Workbench mount root is required.');root.innerHTML=render();root.querySelectorAll?.('[data-thing-type][data-thing-id]').forEach(el=>el.addEventListener('click',()=>{select(el.dataset.thingType,el.dataset.thingId);mount(root)}));return root};
 return Object.freeze({domains,setFilters,getState,rows,select,clearSelection,inspect,summary,attention,exportView,render,mount});
}
const api=Object.freeze({createDesignWorkbench});if(typeof window!=='undefined')window.emojeoDesignWorkbench=api;if(typeof globalThis!=='undefined')globalThis.emojeoDesignWorkbench=api;
})();
