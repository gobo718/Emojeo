import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { QueryEngine } from '../engine/query-engine.js';

function loadNeutralEngine(){
  const events=[];
  class CE{constructor(type,init={}){this.type=type;this.detail=init.detail}}
  const window={dispatchEvent:e=>events.push(e)};
  const context=vm.createContext({structuredClone,console,window,CustomEvent:CE,AbortController,setTimeout,clearTimeout,Date,Math});
  for(const file of [
    '../engine/tag-engine.js',
    '../engine/application-definition-engine.js',
    '../engine/namespace-engine.js',
    '../engine/classification-matrix-engine.js',
    '../engine/record-store-engine.js',
    '../engine/workspace-engine.js',
    '../engine/work-processing-engine.js'
  ]) vm.runInContext(fs.readFileSync(new URL(file,import.meta.url),'utf8'),context,{filename:file});
  return {w:context.window,events};
}

const neutralDefinition={
  id:'field-notes',
  name:'Field Notes',
  namespaces:{storage:'field-notes',database:'field-notes-db',events:'field-notes',globals:'FieldNotes',api:'field-notes'},
  capabilities:{classification:true,records:true,workspaces:true,workProcessing:true},
  tagTypes:[{id:'trait',label:'Trait'}],
  tags:[{type:'trait',id:'bright',label:'Bright'},{type:'trait',id:'quiet',label:'Quiet'}],
  relationships:[{kind:'implies',from:{type:'trait',id:'bright'},to:{type:'trait',id:'visible'}}],
  metadata:{qualificationFixture:true}
};

test('neutral application activates without Genreactrix or emoji vocabulary',()=>{
  const {w}=loadNeutralEngine();
  w.reusableApplicationDefinitions.register(neutralDefinition);
  const active=w.reusableApplicationDefinitions.activate('field-notes');
  assert.equal(active.name,'Field Notes');
  assert.equal(w.reusableNamespaceEngine.storageKey('records'),'field-notes-records');
  assert.equal(w.reusableNamespaceEngine.databaseName('records'),'field-notes-db-records');
  assert.equal(w.reusableTagEngine.get('trait','bright').label,'Bright');
  assert.equal(w.reusableTagEngine.get('theme','scary'),null);
});

test('neutral application can classify, persist, query, and edit its own records',async()=>{
  const {w}=loadNeutralEngine();
  w.reusableApplicationDefinitions.register(neutralDefinition);
  w.reusableApplicationDefinitions.activate('field-notes');
  w.classificationMatrixEngine.configure({id:'habitat',items:[{id:'forest',label:'Forest'},{id:'river',label:'River'}]});
  assert.equal(w.classificationMatrixEngine.intersection('forest','river').label,'Forest + River');

  const store=w.reusableRecordStore.createStore({id:'observations'});
  await store.initialize();
  await store.put({id:'n1',data:{title:'Morning bird',place:'forest',score:7},flags:['reviewed']});
  await store.put({id:'n2',data:{title:'River stone',place:'river',score:3}});
  const query=new QueryEngine();
  const result=query.run(store.all(),{filters:{conditions:[{field:'data.score',op:'gte',value:5}]},search:{text:'bird',fields:['data.title']}});
  assert.equal(Array.from(result.records,r=>r.id).join(','),'n1');

  const workspace=w.reusableWorkspaceEngine.createWorkspace({id:'note-editor'});
  workspace.open(store.get('n1'));
  workspace.patchDraft({status:'archived'});
  const committed=workspace.commitDraft({actor:'neutral-test'});
  assert.equal(committed.status,'archived');
  assert.equal(workspace.snapshot().dirty,false);
});

test('neutral application can process resumable work with no product vocabulary',async()=>{
  const {w}=loadNeutralEngine();
  const processor=w.reusableWorkProcessing.createProcessor({id:'normalize-notes',concurrency:2,runItem:async item=>({id:item.id,label:String(item.label).toUpperCase()})});
  await processor.initialize({items:[{id:'a',label:'alpha'},{id:'b',label:'beta'}],metadata:{application:'field-notes'}});
  const done=await processor.run();
  assert.equal(done.state,'completed');
  assert.equal(Array.from(done.items,x=>x.result.label).sort().join(','),'ALPHA,BETA');
});
