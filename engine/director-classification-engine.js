(function(){
  "use strict";
  const DB_KEY="genreactrix-director-engine-v1";
  const DRAFT_KEY="genreactrix-director-drafts-v1";
  const MAX_TX=100;
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const now=()=>new Date().toISOString();
  const empty=()=>({
    reactions:[],themes:[null,null,null],primFusion:null,notes:"",saved:false,flagged:false,
    retention:"keep",completion:"unclassified",aiVisible:false,blocked:false,locked:false,updatedAt:null,schemaVersion:2
  });
  function load(key,fallback){try{return JSON.parse(localStorage.getItem(key)||"")||fallback;}catch{return fallback;}}
  function persist(key,value){localStorage.setItem(key,JSON.stringify(value));}
  function normalized(input={}){
    const reactions=[...new Set(input.reactions||input.selectedReactions||[])];
    const themes=(input.themes||[null,null,null]).slice(0,3); while(themes.length<3) themes.push(null);
    const state={...empty(),...clone(input),reactions,themes,notes:input.notes??input.writeIn??"",flagged:!!input.flagged,saved:!!input.saved};
    state.primFusion=input.primFusion??(reactions.length>=2?reactions.slice(0,2):null);
    state.completion=completion(state);
    return state;
  }
  function completion(s){
    if(s?.blocked) return "blocked";
    const hasReaction=(s.reactions||[]).length>0;
    const hasTheme=(s.themes||[]).some(Boolean);
    const needsPrim=(s.reactions||[]).length>=2;
    if(!hasReaction&&!hasTheme) return "unclassified";
    if(hasReaction&&hasTheme&&(!needsPrim||s.primFusion)) return "complete";
    return "partial";
  }
  function validate(s){
    const issues=[];
    if(!Array.isArray(s.reactions)) issues.push("reactions-not-array");
    if(!Array.isArray(s.themes)||s.themes.length!==3) issues.push("themes-invalid");
    if(new Set(s.reactions||[]).size!==(s.reactions||[]).length) issues.push("duplicate-reactions");
    const themeIds=(s.themes||[]).filter(Boolean).map(theme=>typeof theme==="object"?(theme.id||theme.label):theme);
    if(new Set(themeIds).size!==themeIds.length) issues.push("duplicate-themes");
    if((s.reactions||[]).length>=2&&!s.primFusion) issues.push("primfusion-missing");
    return {valid:issues.length===0,issues,completion:completion(s)};
  }
  function createEngine(){
    const store=load(DB_KEY,{records:{},undo:{},redo:{},schemaVersion:1});
    const drafts=load(DRAFT_KEY,{});
    const listeners=new Set();
    const emit=(type,payload)=>listeners.forEach(fn=>{try{fn({type,...clone(payload)})}catch{}});
    function save(){persist(DB_KEY,store);persist(DRAFT_KEY,drafts);}
    function get(imageId){return normalized(store.records[imageId]||empty());}
    function begin(imageId,seed){
      if(!imageId) throw new Error("Image ID is required");
      if(!store.records[imageId]&&seed) store.records[imageId]=normalized(seed);
      drafts[imageId]=normalized(drafts[imageId]||store.records[imageId]||seed||empty());
      save(); emit("draft-began",{imageId,draft:drafts[imageId]}); return clone(drafts[imageId]);
    }
    function draft(imageId){return clone(drafts[imageId]||begin(imageId));}
    function patchDraft(imageId,patch){
      const current=draft(imageId);
      const nextPatch=clone(patch);
      if(Object.prototype.hasOwnProperty.call(nextPatch,"reactions")){
        const before=JSON.stringify(current.reactions||[]);
        const after=JSON.stringify(nextPatch.reactions||[]);
        if(before!==after && !Object.prototype.hasOwnProperty.call(nextPatch,"primFusion")) nextPatch.primFusion=null;
      }
      drafts[imageId]=normalized({...current,...nextPatch});
      save();emit("draft-changed",{imageId,draft:drafts[imageId],dirty:isDirty(imageId)});return clone(drafts[imageId]);
    }
    function commit(imageId,options={}){
      const next=normalized(options.state||draft(imageId));
      const checked=validate(next); if(!checked.valid) return {ok:false,...checked};
      const before=get(imageId); next.updatedAt=now(); next.aiVisible=!!options.aiVisible;
      store.undo[imageId]=store.undo[imageId]||[]; store.redo[imageId]=[];
      if(JSON.stringify(before)!==JSON.stringify(next)){
        store.undo[imageId].push({before,after:clone(next),action:options.action||"commit",at:next.updatedAt});
        if(store.undo[imageId].length>MAX_TX) store.undo[imageId].shift();
      }
      store.records[imageId]=clone(next); drafts[imageId]=clone(next); save();
      try{
        const rec=window.genreactrixImageRecordEngine?.get?.(imageId,{touch:false});
        if(rec){const lifecycle=window.genreactrixLifecycleEngine,inboxOwned=Boolean(lifecycle?.inInbox?.(rec)||rec.workflow?.stage==="inbox-working"||rec.workflow?.stage==="director-complete"||rec.workflow?.stage==="rejected-hold"),stage=inboxOwned?"inbox-working":rec.workflow?.stage;window.genreactrixImageRecordEngine.update(imageId,{analysis:{director:{...clone(next),recordedAt:next.updatedAt}},components:{directorReactions:next.reactions.length?"current":"missing",directorThemes:next.themes.some(Boolean)?"current":"missing",primFusion:next.reactions.length>=2?(next.primFusion?"current":"missing"):"current"},attributes:{saved:next.saved,flagged:next.flagged,needsReview:next.flagged},workflow:{stage},timestamps:{processedAt:next.completion==="complete"?next.updatedAt:null},metadata:{extended:{directorCompletion:next.completion,directorCompletionAt:next.updatedAt}}},"director-classification-committed");}
        window.genreactrixHistoryEngine?.append?.({imageId,eventType:"director-classification-committed",actor:"director",sourceEngine:"director-classification",summary:`Director ${options.action||"classification"}`,payload:{before,after:clone(next),aiVisible:next.aiVisible}});
      }catch(error){console.warn("Director engine canonical sync failed",error);}
      emit("committed",{imageId,before,after:next}); return {ok:true,state:clone(next),completion:next.completion};
    }
    function isDirty(imageId){return JSON.stringify(normalized(drafts[imageId]||get(imageId)))!==JSON.stringify(get(imageId));}
    function cancel(imageId){drafts[imageId]=get(imageId);save();emit("draft-cancelled",{imageId});return draft(imageId);}
    function undo(imageId){
      const stack=store.undo[imageId]||[]; let tx=null;
      while(stack.length){const candidate=stack.pop();if(JSON.stringify(candidate.before)!==JSON.stringify(candidate.after)){tx=candidate;break;}}
      if(!tx) return null;
      store.redo[imageId]=store.redo[imageId]||[]; store.redo[imageId].push(tx);
      store.records[imageId]=clone(tx.before); drafts[imageId]=clone(tx.before); save();
      window.genreactrixHistoryEngine?.append?.({imageId,eventType:"director-undo",actor:"director",sourceEngine:"director-classification",summary:`Undo ${tx.action||"classification"}`,payload:{restored:clone(tx.before),transaction:tx}});
      emit("undo",{imageId,state:tx.before,action:tx.action}); return clone(tx.before);
    }
    function redo(imageId){
      const stack=store.redo[imageId]||[]; let tx=null;
      while(stack.length){const candidate=stack.pop();if(JSON.stringify(candidate.before)!==JSON.stringify(candidate.after)){tx=candidate;break;}}
      if(!tx) return null;
      store.undo[imageId]=store.undo[imageId]||[]; store.undo[imageId].push(tx);
      store.records[imageId]=clone(tx.after); drafts[imageId]=clone(tx.after); save();
      window.genreactrixHistoryEngine?.append?.({imageId,eventType:"director-redo",actor:"director",sourceEngine:"director-classification",summary:`Redo ${tx.action||"classification"}`,payload:{restored:clone(tx.after),transaction:tx}});
      emit("redo",{imageId,state:tx.after,action:tx.action}); return clone(tx.after);
    }
    function canUndo(id){return !!store.undo[id]?.some(tx=>JSON.stringify(tx.before)!==JSON.stringify(tx.after))}
    function canRedo(id){return !!store.redo[id]?.some(tx=>JSON.stringify(tx.before)!==JSON.stringify(tx.after))}
    function peekUndo(id){const list=store.undo[id]||[];for(let i=list.length-1;i>=0;i--){if(JSON.stringify(list[i].before)!==JSON.stringify(list[i].after))return clone(list[i]);}return null;}
    function peekRedo(id){const list=store.redo[id]||[];for(let i=list.length-1;i>=0;i--){if(JSON.stringify(list[i].before)!==JSON.stringify(list[i].after))return clone(list[i]);}return null;}
    function migrate(imageId,legacy){if(!store.records[imageId]){store.records[imageId]=normalized(legacy);drafts[imageId]=clone(store.records[imageId]);save();emit("migrated",{imageId});}return get(imageId);}
    function verify(){const issues=[];for(const [id,value] of Object.entries(store.records)){const v=validate(normalized(value));if(!v.valid)issues.push({imageId:id,type:"invalid-director-state",details:v.issues});}return{ok:issues.length===0,issueCount:issues.length,issues};}
    return {empty,normalize:normalized,begin,draft,patchDraft,commit,cancel,revertDraft:cancel,isDirty,get,undo,redo,canUndo,canRedo,peekUndo,peekRedo,migrate,validate,completion,verify,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}};
  }
  window.genreactrixDirectorClassificationEngine=createEngine();
})();
