import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');

test('Pass 38 runner exposes truthful semantic stages',()=>{
 const s=read('emojeo-semantic-pilot-runner.js');
 for(const stage of ['preparing','awaiting-worker','validating','retaining-result','completed','failed'])assert.match(s,new RegExp(`'${stage}'`));
 assert.match(s,/onStage/);
});

test('Pass 38 forwards AbortSignal through semantic API',()=>{
 const runner=read('emojeo-semantic-pilot-runner.js');
 const api=read('genreactrix-cloud-api.js');
 assert.match(runner,/signal:runOptions\.signal/);
 assert.match(api,/emojeoSemanticDiscovery:\(payload,key=storedKey\(\),options=\{\}\)/);
 assert.match(api,/signal:options\.signal/);
});

test('Pass 38 UI reports subject stage elapsed counts provider and exact error',()=>{
 const s=read('emojeo-semantic-pilot-ui.js');
 for(const token of ['Awaiting Worker response','elapsed','provider/model','completed','failed','remaining','responsePayload'])assert.match(s,new RegExp(token.replace('/','\\/')));
 assert.match(s,/setInterval/);
 assert.match(s,/STOPPED BY USER/);
});

test('Pass 38 keeps full pilot locked until live test passes',()=>{
 const s=read('emojeo-semantic-pilot-ui.js');
 assert.match(s,/liveTestPassed:false/);
 assert.match(s,/execute\(1,true\)/);
 assert.match(s,/btnFull\.disabled=!state\.liveTestPassed/);
});

test('Pass 38 visible build identity is present',()=>{
 assert.match(read('emojeo-explorer.js'),/bundled catalog · Pass 38/);
});
