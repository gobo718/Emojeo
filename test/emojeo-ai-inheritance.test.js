import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function load(cloud){const window={GenreactrixCloudApi:cloud};const context=vm.createContext({window,globalThis:null});context.globalThis=context;context.GenreactrixCloudApi=cloud;vm.runInContext(fs.readFileSync(new URL('../emojeo-ai-inheritance.js',import.meta.url),'utf8'),context);return context.emojeoAiInheritance}
test('inheritance inspection reports presence without exposing secret value',()=>{const p=load({isConfigured:()=>true,getBaseUrl:()=> 'https://worker.example',getKey:()=> 'VERY-SECRET'});const r=p.inspect();assert.equal(r.workerConfigured,true);assert.equal(r.analysisKeyPresent,true);assert.equal(r.analysisKeyValueExposed,false);assert.equal(JSON.stringify(r).includes('VERY-SECRET'),false)});
test('verification delegates to existing Worker contract without rewriting configuration',async()=>{let calls=0;const p=load({isConfigured:()=>true,getBaseUrl:()=> 'https://worker.example',getKey:()=> 'secret',verifyConnection:async()=>{calls++;return{auth:'verified',version:'x',vision:'configured',providers:{mistral:true}}}});const r=await p.verify();assert.equal(calls,1);assert.equal(r.connected,true);assert.equal(r.auth,'verified');assert.equal(r.providers.mistral,true)});
