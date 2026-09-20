/* Reusable Work Processing Engine v1
   Product-neutral orchestration for queued/resumable work.
   Applications supply item work, persistence adapters, retry policy and hooks.
   Specialized Genreactrix Queue/Batch/Lifecycle engines remain preserved beside this layer. */
(()=>{'use strict';
 const clone=v=>v==null?v:structuredClone(v);
 const now=()=>new Date().toISOString();
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const terminal=new Set(['completed','completed-with-failures','failed','cancelled','killed']);
 function memoryStore(seed=null){let value=clone(seed);return Object.freeze({async load(){return clone(value)},async save(next){value=clone(next);return clone(value)}})}
 function createProcessor(definition={}){
  if(typeof definition.runItem!=='function')throw new TypeError('createProcessor requires runItem(item, context)');
  const id=String(definition.id||'work-processor'),hooks=definition.hooks||{},store=definition.store||memoryStore();
  const concurrency=Math.max(1,Number(definition.concurrency)||1),maxRetries=Math.max(0,Number(definition.retries)||0),retryDelayMs=Math.max(0,Number(definition.retryDelayMs)||0);
  let state=null,runningPromise=null,aborter=null,killRequested=false;
  const snapshot=()=>clone(state);
  async function persist(){if(state){state.updatedAt=now();await store.save(state)}return snapshot()}
  async function initialize(input={}){
   const restored=await store.load();
   if(restored){state=restored;state.processorId=id;state.items=(state.items||[]).map(x=>x.state==='processing'?{...x,state:'queued'}:x);if(state.state==='running'||state.state==='stopping')state.state='paused';await persist();return snapshot()}
   const rows=Array.isArray(input.items)?input.items:[];
   state={processorId:id,state:input.state||'queued',createdAt:input.createdAt||now(),updatedAt:now(),startedAt:null,completedAt:null,message:input.message||'Queued',stopRequested:false,killRequested:false,metadata:clone(input.metadata||{}),items:rows.map((row,index)=>({id:String(row?.id??`item-${index+1}`),order:index,state:'queued',attempts:0,error:null,value:clone(row),result:null}))};
   await persist();return snapshot();
  }
  function counts(){const items=state?.items||[],n=s=>items.filter(x=>x.state===s).length;return{total:items.length,queued:n('queued'),processing:n('processing'),completed:n('completed'),failed:n('failed'),cancelled:n('cancelled')}}
  async function runOne(item){
   item.state='processing';item.attempts=(item.attempts||0)+1;item.error=null;await persist();
   try{
    const context={processorId:id,itemId:item.id,attempt:item.attempts,signal:aborter?.signal||null,metadata:clone(state.metadata),snapshot};
    await hooks.beforeItem?.(clone(item),context);
    const result=await definition.runItem(clone(item.value),context);
    if(killRequested)return;
    item.result=clone(result);item.state='completed';item.completedAt=now();await hooks.afterItem?.(clone(item),context);
   }catch(error){
    if(killRequested)return;
    const aborted=aborter?.signal?.aborted;
    if(aborted&&state.state==='paused'){item.state='queued';item.error=null;}
    else if(aborted&&state.stopRequested){item.state='cancelled';item.error='Stopped';}
    else if(item.attempts<=maxRetries){item.state='queued';item.error=String(error?.message||error);if(retryDelayMs)await sleep(retryDelayMs);}
    else{item.state='failed';item.error=String(error?.message||error);item.completedAt=now();await hooks.itemError?.(clone(item),error,context);}
   }
   await persist();
  }
  async function run(){
   if(!state)await initialize();
   if(runningPromise)return runningPromise;
   if(terminal.has(state.state))return snapshot();
   killRequested=false;state.killRequested=false;state.stopRequested=false;state.state='running';state.startedAt=state.startedAt||now();state.message='Running';aborter=new AbortController();await persist();await hooks.beforeRun?.(snapshot());
   runningPromise=(async()=>{
    const workers=Array.from({length:concurrency},async()=>{
     while(state.state==='running'&&!killRequested){const item=state.items.find(x=>x.state==='queued');if(!item)break;await runOne(item)}
    });
    await Promise.all(workers);
    if(killRequested){state.state='killed';state.message='Killed immediately';}
    else if(state.state==='paused'){state.message='Paused safely';}
    else if(state.stopRequested){for(const item of state.items.filter(x=>x.state==='queued')){item.state='cancelled';item.error='Stopped'}state.state='cancelled';state.message='Stopped safely';}
    else{const c=counts();state.state=c.failed?(c.completed?'completed-with-failures':'failed'):'completed';state.message=state.state==='completed'?'Completed':'Completed with failures';}
    if(terminal.has(state.state))state.completedAt=now();await persist();await hooks.afterRun?.(snapshot());return snapshot();
   })().finally(()=>{runningPromise=null;aborter=null});
   return runningPromise;
  }
  async function pause(){if(!state||state.state!=='running')return snapshot();state.state='paused';state.message='Pausing safely';aborter?.abort();await persist();return snapshot()}
  async function resume(){if(!state||state.state!=='paused')return snapshot();state.state='queued';state.message='Ready to resume';await persist();return run()}
  async function stop(){if(!state||terminal.has(state.state))return snapshot();state.stopRequested=true;state.state=state.state==='running'?'stopping':state.state;state.message='Stopping safely';aborter?.abort();await persist();if(!runningPromise){for(const item of state.items.filter(x=>x.state==='queued'))item.state='cancelled';state.state='cancelled';state.completedAt=now();await persist()}return runningPromise||snapshot()}
  async function kill(){if(!state||terminal.has(state.state))return snapshot();killRequested=true;state.killRequested=true;state.stopRequested=true;state.state='killed';state.message='Killed immediately';for(const item of state.items.filter(x=>['queued','processing'].includes(x.state))){item.state='cancelled';item.error='Killed'}aborter?.abort();state.completedAt=now();await persist();return snapshot()}
  async function retryFailed(){if(!state)return null;for(const item of state.items.filter(x=>x.state==='failed')){item.state='queued';item.error=null}state.state='queued';state.completedAt=null;state.message='Retry queued';await persist();return snapshot()}
  return Object.freeze({id,initialize,run,pause,resume,stop,kill,retryFailed,snapshot,counts,store});
 }
 window.reusableWorkProcessing=Object.freeze({createProcessor,memoryStore});
})();
