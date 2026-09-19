import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function load(){
 const window={}; window.window=window; window.dispatchEvent=()=>{};
 const context=vm.createContext({structuredClone,console,window,CustomEvent:function(){}});
 for(const file of ['../engine/application-definition-engine.js','../genreactrix-application-definition.js','../engine/namespace-engine.js']) vm.runInContext(fs.readFileSync(new URL(file,import.meta.url),'utf8'),context,{filename:file});
 return window;
}
test('application namespaces generate product-neutral owned names',()=>{
 const w=load(),r=w.reusableApplicationDefinitions;
 r.register({id:'sample',namespaces:{storage:'sample',database:'sampledb',events:'sample',globals:'sample',api:'sample'}}); r.activate('sample',{registerTags:false});
 const n=w.reusableNamespaceEngine;
 assert.equal(n.storageKey('records',{version:2}),'sample-records-v2');
 assert.equal(n.databaseName('assets'),'sampledb-assets');
 assert.equal(n.eventName('ready'),'sample:ready');
 assert.equal(n.globalName('Runtime'),'sampleRuntime');
 assert.equal(n.apiPath('analyze'),'/api/sample/analyze');
});
test('Genreactrix legacy contracts remain explicit compatibility candidates',()=>{
 const w=load(); w.reusableApplicationDefinitions.activate('genreactrix',{registerTags:false}); const n=w.reusableNamespaceEngine;
 assert.equal(n.storageKey('custom-themes-v2'),'genreactrix-custom-themes-v2');
 assert.deepEqual([...n.candidates('storage','custom-themes-v2')],['genreactrix-custom-themes-v2']);
 assert.equal(n.apiPath('analyze'),'/api/genreactrix/analyze');
 assert.deepEqual([...n.candidates('api','analyze')],['/api/genreactrix/analyze']);
 assert.equal(n.compatibility().preserveSpecializedImplementations,true);
});
