import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(){
 const context=vm.createContext({structuredClone,console,setTimeout,clearTimeout,Promise,AbortController,window:{}});
 vm.runInContext(fs.readFileSync(new URL('../engine/work-processing-engine.js',import.meta.url),'utf8'),context);
 return context.window.reusableWorkProcessing;
}

test('generic work processor completes arbitrary application items',async()=>{
 const e=load(),p=e.createProcessor({id:'demo',concurrency:2,runItem:item=>item.n*2});
 await p.initialize({items:[{id:'a',n:2},{id:'b',n:4}]});
 const out=await p.run();
 assert.equal(out.state,'completed');
 assert.deepEqual([...out.items.map(x=>x.result)],[4,8]);
});

test('generic work processor retries without application vocabulary',async()=>{
 const e=load();let calls=0;
 const p=e.createProcessor({retries:1,runItem:()=>{calls++;if(calls===1)throw new Error('temporary');return 'ok'}});
 await p.initialize({items:[{id:'x'}]});const out=await p.run();
 assert.equal(out.state,'completed');assert.equal(out.items[0].attempts,2);assert.equal(out.items[0].result,'ok');
});

test('generic work processor can restore interrupted persisted work',async()=>{
 const e=load(),store=e.memoryStore({processorId:'old',state:'running',createdAt:'x',updatedAt:'x',metadata:{},items:[{id:'x',order:0,state:'processing',attempts:1,error:null,value:{n:3},result:null}]});
 const p=e.createProcessor({id:'new',store,runItem:item=>item.n});const restored=await p.initialize();
 assert.equal(restored.state,'paused');assert.equal(restored.items[0].state,'queued');
 const out=await p.resume();assert.equal(out.state,'completed');assert.equal(out.items[0].result,3);
});

test('generic work processor preserves immediate kill as a distinct capability',async()=>{
 const e=load();let release;
 const gate=new Promise(r=>{release=r});
 const p=e.createProcessor({runItem:async()=>{await gate;return 'late'}});await p.initialize({items:[{id:'x'},{id:'y'}]});
 const running=p.run();await new Promise(r=>setTimeout(r,5));const killed=await p.kill();release();await running;
 assert.equal(killed.state,'killed');assert.equal(p.snapshot().state,'killed');assert.ok(p.snapshot().items.every(x=>x.state==='cancelled'));
});
