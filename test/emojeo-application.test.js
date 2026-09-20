import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function run(file, context){
  vm.runInContext(fs.readFileSync(new URL(file, import.meta.url),'utf8'),context,{filename:file});
}

test('Emojeo activates as a StringBoard child application without seeding emoji content',()=>{
  class CustomEvent { constructor(type,init={}){this.type=type;this.detail=init.detail;} }
  const window={dispatchEvent(){}};
  const context=vm.createContext({window,structuredClone,CustomEvent,console});
  run('../engine/application-definition-engine.js',context);
  run('../emojeo-application-definition.js',context);
  const active=window.reusableApplicationDefinitions.active();
  assert.equal(active.id,'emojeo');
  assert.equal(active.name,'Emojeo');
  assert.equal(active.namespaces.storage,'emojeo');
  assert.equal(active.compatibility.parentEngine,'stringboard-engine-v1');
  assert.deepEqual(active.tagTypes,[]);
  assert.deepEqual(active.tags,[]);
  assert.deepEqual(active.relationships,[]);
  assert.equal(active.metadata.contentSeeded,false);
});
