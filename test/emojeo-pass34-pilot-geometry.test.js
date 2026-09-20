import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
test('semantic runner loads after cloud API adapter',()=>{
  assert.ok(html.indexOf('genreactrix-cloud-api.js') < html.indexOf('emojeo-semantic-pilot-runner.js'));
  assert.ok(html.indexOf('emojeo-semantic-pilot-runner.js') < html.indexOf('emojeo-semantic-pilot-ui.js'));
});
test('mobile detail panel is inline instead of fixed viewport overlay',()=>{
  assert.match(html,/Pass 34 geometry repair/);
  assert.match(html,/aside\{position:relative;inset:auto;height:auto;min-height:0/);
});
