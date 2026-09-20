import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../emojeo-semantic-pilot-ui.js',import.meta.url),'utf8');
test('Pass 32 exposes semantic pilot controls in root UI',()=>{for(const id of ['semanticPilot','pilotTestRun','pilotFullRun','pilotStop','pilotDownload'])assert.match(html,new RegExp(`id="${id}"`));assert.match(html,/emojeo-semantic-pilot-ui\.js/)});
test('Pass 32 requires one-subject success before full pilot',()=>{assert.match(ui,/liveTestPassed:false/);assert.match(ui,/execute\(1,true\)/);assert.match(ui,/btnFull\.disabled=!state\.liveTestPassed/)});
test('Pass 32 retains and downloads raw pilot results',()=>{assert.match(ui,/JSON\.stringify\(state\.lastRun/);assert.match(ui,/rawDiscovery/);assert.match(html,/DOWNLOAD RESULTS/)});
