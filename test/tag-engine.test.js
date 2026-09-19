import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(){
  const context=vm.createContext({structuredClone,console,window:{}});
  for(const file of ['tag-engine.js','tag-assignment-engine.js','tag-rule-engine.js']){
    vm.runInContext(fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8'),context,{filename:file});
  }
  return context.window;
}

test('typed tags preserve arbitrary relationship semantics',()=>{
  const w=load(),e=w.reusableTagEngine;
  e.registerType({id:'reaction'});e.registerType({id:'theme'});
  e.registerTags([{type:'reaction',id:'joy'},{type:'reaction',id:'surprise'},{type:'theme',id:'delight'}]);
  e.composedFrom({type:'theme',id:'delight'},[{type:'reaction',id:'joy'},{type:'reaction',id:'surprise'}]);
  assert.equal(e.relations({kind:'composed-from',fromType:'theme',fromId:'delight'}).length,2);
});

test('rule evaluation expands a composite without overwriting explicit provenance',()=>{
  const w=load(),e=w.reusableTagEngine,a=w.reusableTagAssignments,r=w.reusableTagRules;
  e.registerTags([{type:'reaction',id:'joy'},{type:'reaction',id:'surprise'},{type:'theme',id:'delight'}]);
  e.composedFrom({type:'theme',id:'delight'},[{type:'reaction',id:'joy'},{type:'reaction',id:'surprise'}]);
  a.assign({subject:{type:'image',id:'1'},tag:{type:'theme',id:'delight'},source:{id:'director'}});
  const result=r.expand({type:'image',id:'1'});
  assert.equal(result.explicit.length,1);assert.equal(result.derived.length,2);
  assert.equal(a.forSubject({type:'image',id:'1'}).length,1);
});

test('composite suggestions are advisory until explicitly materialized',()=>{
  const w=load(),e=w.reusableTagEngine,a=w.reusableTagAssignments,r=w.reusableTagRules;
  e.registerTags([{type:'reaction',id:'joy'},{type:'reaction',id:'surprise'},{type:'theme',id:'delight'}]);
  e.composedFrom({type:'theme',id:'delight'},[{type:'reaction',id:'joy'},{type:'reaction',id:'surprise'}]);
  const subject={type:'image',id:'2'};
  a.assign({subject,tag:{type:'reaction',id:'joy'},source:{id:'ai'}});
  a.assign({subject,tag:{type:'reaction',id:'surprise'},source:{id:'ai'}});
  const suggestions=r.compositeSuggestions(subject);
  assert.equal(suggestions.length,1);assert.equal(suggestions[0].tag.id,'delight');
  assert.equal(a.forSubject(subject).length,2);
  r.materialize(subject,suggestions);
  assert.equal(a.forSubject(subject).length,3);
});
