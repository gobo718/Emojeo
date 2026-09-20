import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const cloud=fs.readFileSync(new URL('../genreactrix-cloud-api.js',import.meta.url),'utf8');

test('Pass 30 loads canonical Genreactrix settings before inherited Cloud API',()=>{
  const settings=html.indexOf('engine/settings-engine.js');
  const cloudApi=html.indexOf('genreactrix-cloud-api.js');
  const inheritance=html.indexOf('emojeo-ai-inheritance.js');
  assert.ok(settings>=0,'settings engine is loaded');
  assert.ok(cloudApi>settings,'Cloud API loads after settings engine');
  assert.ok(inheritance>cloudApi,'inheritance diagnostic loads after Cloud API');
});

test('Cloud API prefers canonical settings and reloads when settings are ready',()=>{
  assert.match(cloud,/genreactrixSettingsEngine\?\.get\?\.\('ai\.worker\.accessKey'/);
  assert.match(cloud,/genreactrixSettingsEngine\?\.get\?\.\('ai\.worker\.base'/);
  assert.match(cloud,/genreactrix:settings-ready/);
  assert.match(cloud,/GenreactrixCloudApi\.reload\(\)/);
});
