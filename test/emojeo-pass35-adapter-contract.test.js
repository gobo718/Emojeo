import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
test('semantic runner consumes canonical GenreactrixCloudApi export',()=>{const s=read('emojeo-semantic-pilot-runner.js');assert.match(s,/globalThis\.GenreactrixCloudApi/);});
test('open discovery loads before semantic runner',()=>{const s=read('index.html');assert.ok(s.indexOf('emojeo-open-discovery.js') < s.indexOf('emojeo-semantic-pilot-runner.js'));});
