import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function load(){const context=vm.createContext({structuredClone,console,Promise,window:{}});vm.runInContext(fs.readFileSync(new URL('../engine/workspace-engine.js',import.meta.url),'utf8'),context);return context.window.reusableWorkspaceEngine}
test('generic workspace owns subject draft and commit without application vocabulary',()=>{const w=load().createWorkspace({id:'demo'});w.open({id:'x',name:'Before'});w.patchDraft({name:'After'});assert.equal(w.snapshot().dirty,true);w.commitDraft({actor:'tester'});assert.equal(w.snapshot().subject.name,'After');assert.equal(w.snapshot().dirty,false)});
test('generic workspace supports arbitrary multi-selection',()=>{const w=load().createWorkspace();w.select(['a','b']);w.select('c',{append:true});w.select('b',{append:true,toggle:true});assert.deepEqual([...w.snapshot().selection],['a','c'])});
test('generic workspace panels are application supplied',()=>{const w=load().createWorkspace();w.registerPanel('inspect',{title:'Anything',default:true});w.registerPanel('history',{title:'History'});assert.equal(w.snapshot().activePanel,'inspect');w.openPanel('history');assert.equal(w.snapshot().activePanel,'history')});
test('generic workspace actions preserve application supplied behavior',async()=>{const w=load().createWorkspace();w.setSubject({id:'x',count:1});w.registerAction('increment',({workspace})=>{workspace.patchDraft({count:2});return 'ok'});const out=await w.runAction('increment');assert.equal(out,'ok');assert.equal(w.snapshot().draft.count,2);assert.equal(w.snapshot().status,'idle')});
