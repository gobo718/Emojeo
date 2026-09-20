import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('release baseline retains a complete Pass 1 through Pass 27 documentation trail',()=>{
 for(let n=1;n<=27;n++)assert.equal(fs.existsSync(path.join(root,`EMOJEO_PASS${n}.md`)),true,`missing EMOJEO_PASS${n}.md`);
 assert.equal(fs.existsSync(path.join(root,'EMOJEO_RELEASE_BASELINE_V1.md')),true);
});

test('root application loads runtime before qualification gate and identifies the release baseline',()=>{
 const html=read('index.html');
 const runtime=html.indexOf('emojeo-design-runtime.js');
 const qualification=html.indexOf('emojeo-release-qualification.js');
 assert.ok(runtime>=0,'runtime script missing');
 assert.ok(qualification>runtime,'qualification gate must load after runtime');
 assert.match(html,/Design Intelligence · Release Baseline v1/);
});

test('README closes the documented sequence through the release baseline',()=>{
 const text=read('README.md');
 for(let n=24;n<=27;n++)assert.match(text,new RegExp(`## Emojeo Pass ${n}(?:\\s|—)`));
 assert.match(text,/EMOJEO_RELEASE_BASELINE_V1\.md/);
});
