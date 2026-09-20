import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
function load(file,ctx={}){ctx.globalThis=ctx;vm.runInNewContext(read(file),ctx);return ctx}
test('Pass 31 Worker exposes authenticated Emojeo semantic discovery endpoint',()=>{const s=read('index.js');assert.match(s,/\/api\/emojeo\/semantic-discovery/);assert.match(s,/runEmojeoSemanticDiscovery/);assert.match(s,/x-analysis-key/)});
test('Pass 31 cloud client exposes semantic discovery adapter',()=>{const s=read('genreactrix-cloud-api.js');assert.match(s,/emojeoSemanticDiscovery/);assert.match(s,/\/api\/emojeo\/semantic-discovery/)});
test('Pass 31 runner preserves raw and normalized outputs separately',async()=>{const ctx={structuredClone:v=>JSON.parse(JSON.stringify(v)),DOMException:globalThis.DOMException};load('emojeo-semantic-pilot.js',ctx);load('emojeo-open-discovery.js',ctx);load('emojeo-semantic-pilot-runner.js',ctx);const api={emojeoSemanticDiscovery:async()=>({result:{provider:{id:'test'},rawDiscovery:{summary:'face',observations:[{phrase:'round face',dimension:'visual',description:'round',evidence:['outline'],confidence:.9}],ambiguities:[],rawNotes:[]}}})};const run=ctx.emojeoSemanticPilotRunner.create({api,normalize:ctx.emojeoOpenDiscovery.normalizeResult});const out=await run({seed:'x',subjects:[{id:'1F600',glyph:'😀',codePoints:['1F600'],name:'grinning face',group:'Smileys & Emotion',subgroup:'face-smiling',sourceOrder:1}]});assert.equal(out.results.length,1);assert.equal(out.results[0].raw.rawDiscovery.summary,'face');assert.equal(out.results[0].normalized.observations[0].phrase,'round face');assert.notEqual(out.results[0].raw,out.results[0].normalized)});
