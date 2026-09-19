/* Reusable AI Pipeline Engine v1
   Product-neutral staged execution beside (not instead of) specialized pipelines.
   Applications supply stage functions/adapters, validation, retries, fallbacks and hooks. */
(()=>{'use strict';
 const clone=v=>v==null?v:structuredClone(v);
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const errInfo=e=>({name:e?.name||'Error',message:String(e?.message||e||'Unknown error')});
 function normalizeStage(stage,index){
  if(!stage||typeof stage.run!=='function')throw new TypeError(`Stage ${index+1} requires run(context)`);
  return {
   id:String(stage.id||`stage-${index+1}`),
   run:stage.run,
   validate:typeof stage.validate==='function'?stage.validate:null,
   fallback:typeof stage.fallback==='function'?stage.fallback:null,
   retries:Math.max(0,Number(stage.retries)||0),
   retryDelayMs:Math.max(0,Number(stage.retryDelayMs)||0),
   timeoutMs:Math.max(0,Number(stage.timeoutMs)||0),
   metadata:clone(stage.metadata||{})
  };
 }
 async function withTimeout(promise,ms,stageId){
  if(!ms)return promise;
  let timer;
  try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`Stage ${stageId} timed out after ${ms}ms`)),ms);})]);}
  finally{clearTimeout(timer);}
 }
 function createPipeline(definition={}){
  const stages=(definition.stages||[]).map(normalizeStage);
  const id=String(definition.id||'pipeline');
  const hooks=definition.hooks||{};
  async function run(input,options={}){
   const context={pipelineId:id,input:clone(input),value:clone(input),outputs:{},history:[],metadata:clone(options.metadata||{}),signal:options.signal||null};
   await hooks.beforePipeline?.(context);
   for(const stage of stages){
    if(context.signal?.aborted)throw new Error(`Pipeline ${id} aborted`);
    let output,lastError=null,usedFallback=false,attempt=0;
    await hooks.beforeStage?.(stage,context);
    for(attempt=1;attempt<=stage.retries+1;attempt++){
     try{
      output=await withTimeout(Promise.resolve(stage.run(context)),stage.timeoutMs,stage.id);
      if(stage.validate){const verdict=await stage.validate(output,context);if(verdict===false)throw new Error(`Stage ${stage.id} validation failed`);}
      lastError=null;break;
     }catch(error){
      lastError=error;
      await hooks.stageError?.(stage,error,context,{attempt});
      if(attempt<=stage.retries&&stage.retryDelayMs)await sleep(stage.retryDelayMs);
     }
    }
    if(lastError&&stage.fallback){output=await stage.fallback(lastError,context);usedFallback=true;lastError=null;}
    if(lastError)throw lastError;
    context.value=clone(output);context.outputs[stage.id]=clone(output);
    context.history.push({stageId:stage.id,attempts:attempt,usedFallback,metadata:clone(stage.metadata)});
    await hooks.afterStage?.(stage,context);
   }
   await hooks.afterPipeline?.(context);
   return {pipelineId:id,value:clone(context.value),outputs:clone(context.outputs),history:clone(context.history),metadata:clone(context.metadata)};
  }
  return Object.freeze({id,stages:()=>stages.map(s=>({id:s.id,retries:s.retries,retryDelayMs:s.retryDelayMs,timeoutMs:s.timeoutMs,metadata:clone(s.metadata)})),run});
 }
 window.reusableAiPipeline=Object.freeze({createPipeline});
})();
