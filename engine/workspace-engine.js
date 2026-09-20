(function(){
  "use strict";
  const clone=value=>value==null?value:(typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value)));
  const now=()=>new Date().toISOString();
  function createWorkspace(options={}){
    const id=String(options.id||"workspace");
    const listeners=new Set();
    const actions=new Map();
    const panels=new Map();
    const state={
      id,
      subjectId:null,
      subject:null,
      selection:[],
      draft:null,
      dirty:false,
      activePanel:null,
      status:"idle",
      metadata:clone(options.metadata||{}),
      openedAt:null,
      updatedAt:now()
    };
    const emit=(type,payload={})=>{state.updatedAt=now();const event={type,workspaceId:id,at:state.updatedAt,...clone(payload)};for(const fn of listeners){try{fn(event,snapshot())}catch{}};return event};
    const snapshot=()=>clone({...state,panels:[...panels.entries()].map(([panelId,p])=>({id:panelId,...p})),actions:[...actions.keys()]});
    function setSubject(subject,subjectId){state.subject=clone(subject??null);state.subjectId=subjectId??subject?.id??null;state.draft=clone(subject??null);state.dirty=false;emit("subject-changed",{subjectId:state.subjectId});return snapshot()}
    function patchDraft(patch){const base=(state.draft&&typeof state.draft==="object")?state.draft:{};state.draft={...clone(base),...clone(patch||{})};state.dirty=JSON.stringify(state.draft)!==JSON.stringify(state.subject);emit("draft-changed",{dirty:state.dirty});return clone(state.draft)}
    function replaceDraft(value){state.draft=clone(value);state.dirty=JSON.stringify(state.draft)!==JSON.stringify(state.subject);emit("draft-changed",{dirty:state.dirty});return clone(state.draft)}
    function revertDraft(){state.draft=clone(state.subject);state.dirty=false;emit("draft-reverted");return clone(state.draft)}
    function commitDraft(meta={}){const before=clone(state.subject),after=clone(state.draft);state.subject=after;state.dirty=false;emit("draft-committed",{before,after,meta:clone(meta)});return clone(after)}
    function select(value,{append=false,toggle=false}={}){const values=Array.isArray(value)?value:[value];let next=append?[...state.selection]:[];for(const item of values){const key=JSON.stringify(item),index=next.findIndex(x=>JSON.stringify(x)===key);if(toggle&&index>=0)next.splice(index,1);else if(index<0)next.push(clone(item))}state.selection=next;emit("selection-changed",{selection:clone(next)});return clone(next)}
    function clearSelection(){state.selection=[];emit("selection-changed",{selection:[]});return[]}
    function registerPanel(panelId,definition={}){panels.set(String(panelId),clone(definition));if(!state.activePanel&&definition.default)state.activePanel=String(panelId);emit("panel-registered",{panelId:String(panelId)});return api}
    function openPanel(panelId){const key=String(panelId);if(!panels.has(key))throw new Error(`Unknown workspace panel: ${key}`);state.activePanel=key;emit("panel-opened",{panelId:key});return clone(panels.get(key))}
    function registerAction(actionId,handler,definition={}){if(typeof handler!=="function")throw new Error("Workspace action handler must be a function");actions.set(String(actionId),{handler,definition:clone(definition)});emit("action-registered",{actionId:String(actionId)});return api}
    async function runAction(actionId,payload){const key=String(actionId),entry=actions.get(key);if(!entry)throw new Error(`Unknown workspace action: ${key}`);state.status="working";emit("action-started",{actionId:key});try{const result=await entry.handler({workspace:api,state:snapshot(),payload:clone(payload)});state.status="idle";emit("action-completed",{actionId:key,result:clone(result)});return result}catch(error){state.status="error";emit("action-failed",{actionId:key,error:String(error?.message||error)});throw error}}
    function open(subject,subjectId){state.openedAt=now();state.status="idle";if(arguments.length)setSubject(subject,subjectId);emit("opened",{subjectId:state.subjectId});return snapshot()}
    function close({discardDraft=false}={}){if(discardDraft)revertDraft();state.status="closed";emit("closed",{dirty:state.dirty});return snapshot()}
    const api={id,open,close,snapshot,setSubject,patchDraft,replaceDraft,revertDraft,commitDraft,select,clearSelection,registerPanel,openPanel,registerAction,runAction,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}};
    return api;
  }
  window.reusableWorkspaceEngine={createWorkspace};
})();
