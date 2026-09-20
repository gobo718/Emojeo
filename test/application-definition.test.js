import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function load(){
 const events=[];
 class CE{constructor(type,init={}){this.type=type;this.detail=init.detail}}
 const window={dispatchEvent:e=>events.push(e)};
 const context=vm.createContext({structuredClone,console,window,CustomEvent:CE});
 for(const file of ['../engine/tag-engine.js','../engine/application-definition-engine.js','../genreactrix-application-definition.js']) vm.runInContext(fs.readFileSync(new URL(file,import.meta.url),'utf8'),context,{filename:file});
 return {w:context.window,events};
}
test('application definitions keep identity/configuration outside reusable mechanisms',()=>{
 const {w}=load(),r=w.reusableApplicationDefinitions;
 r.register({id:'sample',name:'Sample',namespaces:{storage:'sample'},tagTypes:[{id:'trait'}],tags:[{type:'trait',id:'bright'}]});
 r.activate('sample');
 assert.equal(r.active().name,'Sample');
 assert.equal(r.namespace('storage'),'sample');
 assert.equal(w.reusableTagEngine.get('trait','bright').id,'bright');
});
test('Genreactrix remains a preserved optional application definition, not engine identity',()=>{
 const {w}=load(),r=w.reusableApplicationDefinitions,g=r.get('genreactrix');
 assert.equal(g.metadata.instanceDataIncluded,false);
 assert.equal(g.compatibility.preserveSpecializedImplementations,true);
 assert.equal(r.active(),null);
});
