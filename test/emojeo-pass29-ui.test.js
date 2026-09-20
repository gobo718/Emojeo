import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('Pass 29 exposes the read-only AI readiness control in the deployed root UI',()=>{assert.match(html,/RUN AI READINESS CHECK/);assert.match(html,/emojeoAiInheritance\.verify/);assert.match(html,/Read-only · no analysis run/)});
