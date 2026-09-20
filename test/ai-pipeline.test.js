import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(){
  const context=vm.createContext({structuredClone,console,setTimeout,clearTimeout,Promise,window:{}});
  vm.runInContext(fs.readFileSync(new URL('../engine/ai-pipeline-engine.js',import.meta.url),'utf8'),context);
  return context.window.reusableAiPipeline;
}

test('generic AI pipeline runs configurable stages without product vocabulary',async()=>{
  const e=load();
  const p=e.createPipeline({id:'demo',stages:[
    {id:'describe',run:ctx=>({text:String(ctx.value).toUpperCase()})},
    {id:'structure',run:ctx=>({description:ctx.value.text,length:ctx.value.text.length})}
  ]});
  const result=await p.run('sample');
  assert.equal(result.value.description,'SAMPLE');
  assert.deepEqual([...result.history.map(x=>x.stageId)],['describe','structure']);
});

test('generic AI pipeline preserves retry and fallback behavior',async()=>{
  const e=load();let calls=0;
  const p=e.createPipeline({stages:[{id:'provider',retries:1,run:()=>{calls++;throw new Error('provider down')},fallback:()=>({source:'fallback'})}]});
  const result=await p.run({});
  assert.equal(calls,2);assert.equal(result.value.source,'fallback');assert.equal(result.history[0].usedFallback,true);
});

test('generic AI pipeline keeps specialized policy outside the mechanism',()=>{
  const e=load();
  const p=e.createPipeline({id:'arbitrary',stages:[{id:'anything',run:ctx=>ctx.value,metadata:{applicationRule:'supplied externally'}}]});
  assert.equal(p.stages()[0].metadata.applicationRule,'supplied externally');
});
