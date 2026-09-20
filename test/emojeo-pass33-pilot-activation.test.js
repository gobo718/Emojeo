import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../emojeo-semantic-pilot-ui.js',import.meta.url),'utf8');
test('Pass 33 loads semantic pilot dependencies before runner and UI',()=>{const names=['engine/settings-engine.js','genreactrix-cloud-api.js','emojeo-ai-inheritance.js','emojeo-open-discovery.js','emojeo-semantic-pilot-runner.js','emojeo-semantic-pilot-ui.js'];const pos=names.map(n=>html.indexOf(n));assert.ok(pos.every(n=>n>=0));for(let i=1;i<pos.length;i++)assert.ok(pos[i]>pos[i-1],`${names[i]} must load after ${names[i-1]}`)});
test('Pass 33 pilot UI initializes even if DOM is already ready',()=>{assert.match(ui,/document\.readyState==='loading'/);assert.match(ui,/else init\(\)/);assert.match(ui,/Object\.freeze\(\{summarize,init\}\)/)});
