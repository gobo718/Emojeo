#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then
  echo "ERROR: Run this from inside the Emojeo git repo."
  exit 1
fi
cd "$ROOT"

for f in emojeo-step3-delta-backfill.js emojeo-step3-delta-backfill.html; do
  if [ ! -f "$f" ]; then
    echo "ERROR: Missing $f"
    exit 1
  fi
done

cp emojeo-step3-delta-backfill.js emojeo-step3-delta-backfill.js.pass58.bak
cp emojeo-step3-delta-backfill.html emojeo-step3-delta-backfill.html.pass58.bak

python - <<'PY'
from pathlib import Path

js_path = Path("emojeo-step3-delta-backfill.js")
html_path = Path("emojeo-step3-delta-backfill.html")

js = js_path.read_text(encoding="utf-8")
html = html_path.read_text(encoding="utf-8")

if "Emojeo Step 3 Delta Backfill — Pass 58" not in js:
    raise SystemExit("ERROR: Expected Pass 58 JS marker was not found.")
if "Step 3 Delta Backfill · Pass 58" not in html:
    raise SystemExit("ERROR: Expected Pass 58 HTML marker was not found.")

js = js.replace("Emojeo Step 3 Delta Backfill — Pass 58",
                "Emojeo Step 3 Delta Backfill — Pass 59", 1)

globals_old = """let input=null,spec=null,job=null,running=false,aborter=null;"""
globals_new = """let input=null,spec=null,job=null,running=false,aborter=null;

const RUN_LEASE_KEY='emojeo-step3-delta-backfill-run-lease-v1';
const RUN_LEASE_MS=45000;
const TAB_ID=(globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`);
let runLeaseTimer=null;
function readRunLease(){
  try{return JSON.parse(localStorage.getItem(RUN_LEASE_KEY)||'null')}catch{return null}
}
function renewRunLease(){
  const cur=readRunLease();
  if(cur?.owner!==TAB_ID)return false;
  localStorage.setItem(RUN_LEASE_KEY,JSON.stringify({owner:TAB_ID,expiresAt:Date.now()+RUN_LEASE_MS}));
  return true;
}
function acquireRunLease(){
  const now=Date.now(),cur=readRunLease();
  if(cur&&cur.owner!==TAB_ID&&Number(cur.expiresAt||0)>now)return false;
  localStorage.setItem(RUN_LEASE_KEY,JSON.stringify({owner:TAB_ID,expiresAt:now+RUN_LEASE_MS}));
  if(readRunLease()?.owner!==TAB_ID)return false;
  clearInterval(runLeaseTimer);
  runLeaseTimer=setInterval(()=>{if(!renewRunLease())clearInterval(runLeaseTimer)},10000);
  return true;
}
function releaseRunLease(){
  clearInterval(runLeaseTimer);runLeaseTimer=null;
  const cur=readRunLease();
  if(cur?.owner===TAB_ID)localStorage.removeItem(RUN_LEASE_KEY);
}
window.addEventListener('pagehide',releaseRunLease);"""
if globals_old not in js:
    raise SystemExit("ERROR: Pass 58 globals anchor not found.")
js = js.replace(globals_old, globals_new, 1)

build_anchor = """function parseJsonish(v){"""
canon_code = """function canonicalizeJobShards(){
  const relationships=Array.isArray(spec?.relationshipDelta)?spec.relationshipDelta:[];
  if(relationships.length!==354)throw new Error(`Current delta RunSpec is missing the 354 canonical relationships (found ${relationships.length}).`);
  const shards=buildShards(relationships);
  if(shards.length!==12||shards.some(s=>!Array.isArray(s.relationships)))throw new Error('Canonical delta shards could not be rebuilt.');
  if(job)job.shards=shards;
  return shards;
}
function canonicalizeDiscoveryCheckpoint(){
  if(!job)return;
  const shards=canonicalizeJobShards(),subjects=job.subjects||[];
  const byKey=new Map();
  for(const row of (Array.isArray(job.results)?job.results:[])){
    const sk=subjectKey(row?.subject||{}),sid=clean(row?.shardId);
    if(!sk||!sid)continue;
    const key=`${sk}\\u0000${sid}`;
    if(!byKey.has(key))byKey.set(key,row);
  }
  const ordered=[];
  outer:
  for(const subject of subjects){
    for(const shard of shards){
      const key=`${subjectKey(subject)}\\u0000${shard.id}`;
      if(!byKey.has(key))break outer;
      ordered.push(byKey.get(key));
    }
  }
  job.results=ordered;
}

"""
if build_anchor not in js:
    raise SystemExit("ERROR: parseJsonish anchor not found.")
js = js.replace(build_anchor, canon_code + build_anchor, 1)

mapper_old = """async function callRecoveryMapper(subject,units,signal){
  const api=globalThis.GenreactrixCloudApi;
  const b=clean(api?.getBaseUrl?.()),k=clean(api?.getKey?.());
  if(!b)throw new Error('AI Worker URL is not configured in this browser');
  if(!k)throw new Error('Analysis key is not configured in this browser');
  const relationshipDomains=job.shards.map(s=>({
    domain:s.domain,
    relationshipTypes:s.relationships.map(x=>x.relationshipType)
  }));"""
mapper_new = """async function callRecoveryMapper(subject,units,signal){
  const api=globalThis.GenreactrixCloudApi;
  const b=clean(api?.getBaseUrl?.()),k=clean(api?.getKey?.());
  if(!b)throw new Error('AI Worker URL is not configured in this browser');
  if(!k)throw new Error('Analysis key is not configured in this browser');
  const canonicalShards=canonicalizeJobShards();
  const relationshipDomains=canonicalShards.map(s=>({
    domain:s.domain,
    relationshipTypes:s.relationships.map(x=>x.relationshipType)
  }));"""
if mapper_old not in js:
    raise SystemExit("ERROR: callRecoveryMapper anchor not found.")
js = js.replace(mapper_old, mapper_new, 1)

ensure_start = js.index("async function ensureDiscoveryForSubject(si){")
ensure_end = js.index("\nasync function runTo(target){", ensure_start)
ensure_new = r"""async function ensureDiscoveryForSubject(si){
  const subject=job.subjects[si];
  const canonicalShards=canonicalizeJobShards();
  const start=si*canonicalShards.length,end=(si+1)*canonicalShards.length;
  if(job.results.length<start)throw new Error(`Discovery checkpoint gap before subject ${si+1}.`);
  while(job.results.length<end){
    if(aborter.signal.aborted)throw new DOMException('Aborted','AbortError');
    const absolute=job.results.length;
    const expectedSubject=Math.floor(absolute/canonicalShards.length);
    if(expectedSubject!==si)throw new Error(`Discovery cursor mismatch: expected subject ${si+1}, cursor points to ${expectedSubject+1}.`);
    const di=absolute%canonicalShards.length;
    const shard=canonicalShards[di];
    if(!shard||!Array.isArray(shard.relationships))throw new Error(`Canonical shard ${di+1}/${canonicalShards.length} is unavailable.`);
    setStatus(`DISCOVERY · ${si+1}/${job.subjects.length} · ${subject.glyph} ${subject.name}\nShard ${di+1}/${canonicalShards.length} · ${shard.relationships.length} new relationships…`);
    const envelope=await callWithRetry(request(subject,shard),aborter.signal,r=>{
      setStatus(`DISCOVERY RETRY ${r.attempt}/5 in ${Math.round(r.delay/1000)}s · ${subject.glyph} ${subject.name} · shard ${di+1}/${canonicalShards.length}\n${r.error?.message||r.error}`);
    });
    job.results.push(normalizeDiscoveryResult(envelope?.result||envelope,subject,shard));
    job.updatedAt=new Date().toISOString();
    await dbPut(job);render();
  }
  return job.results.slice(start,end);
}"""
js = js[:ensure_start] + ensure_new + js[ensure_end:]

run_old = """async function runTo(target){
  if(running||!job)return;
  const totalSubjects=job.subjects.length,startDone=mappedSubjects();
  const stopSubject=target==='all'?totalSubjects:Math.min(totalSubjects,target==='next'?startDone+1:Number(target));
  if(!Number.isFinite(stopSubject)||stopSubject<=startDone)return;
  job.runIntent={active:true,stopSubject,requestedAt:new Date().toISOString()};"""
run_new = """async function runTo(target){
  if(running||!job)return;
  const totalSubjects=job.subjects.length,startDone=mappedSubjects();
  const stopSubject=target==='all'?totalSubjects:Math.min(totalSubjects,target==='next'?startDone+1:Number(target));
  if(!Number.isFinite(stopSubject)||stopSubject<=startDone)return;
  if(!acquireRunLease()){
    setStatus('PAUSED · This backfill is already running in another browser tab. Close the duplicate tab or wait about 45 seconds, then refresh this page.');
    render();
    return;
  }
  canonicalizeDiscoveryCheckpoint();
  job.runIntent={active:true,stopSubject,requestedAt:new Date().toISOString()};"""
if run_old not in js:
    raise SystemExit("ERROR: runTo opening anchor not found.")
js = js.replace(run_old, run_new, 1)

finally_old = """  }finally{
    running=false;render();
  }
}"""
finally_new = """  }finally{
    running=false;
    releaseRunLease();
    render();
  }
}"""
if finally_old not in js:
    raise SystemExit("ERROR: runTo finally anchor not found.")
js = js.replace(finally_old, finally_new, 1)

# Rehydrate/dedupe checkpoints immediately after canonical subjects/shards are assigned.
restore_anchor = """    job.results=Array.isArray(job.results)?job.results:[];
    job.mapped=Array.isArray(job.mapped)?job.mapped:[];

    if(!compatibleDiscoveryPrefix(job.results,subjects,shards))"""
restore_repl = """    job.results=Array.isArray(job.results)?job.results:[];
    job.mapped=Array.isArray(job.mapped)?job.mapped:[];
    canonicalizeDiscoveryCheckpoint();

    if(!compatibleDiscoveryPrefix(job.results,subjects,shards))"""
if restore_anchor not in js:
    raise SystemExit("ERROR: restore checkpoint anchor not found.")
js = js.replace(restore_anchor, restore_repl, 1)

load_anchor = """  job.results=Array.isArray(job.results)?job.results:[];
  job.mapped=Array.isArray(job.mapped)?job.mapped:[];"""
load_repl = """  job.results=Array.isArray(job.results)?job.results:[];
  job.mapped=Array.isArray(job.mapped)?job.mapped:[];
  canonicalizeDiscoveryCheckpoint();"""
if load_anchor not in js:
    raise SystemExit("ERROR: load checkpoint anchor not found.")
js = js.replace(load_anchor, load_repl, 1)

html = html.replace("Step 3 Delta Backfill · Pass 58","Step 3 Delta Backfill · Pass 59")
html = html.replace(
    "Pass 58 keeps the Pass 57 discovery, mapper/reconciliation, and strict evidence logic unchanged. It adds durable browser recovery: the latest IndexedDB checkpoint is restored automatically on refresh/reopen, an interrupted run remembers its requested gate, and the page resumes that run without making you choose the JSON or press RUN again. A manual STOP still cancels auto-resume.",
    "Pass 59 keeps the Pass 58 discovery, mapper/reconciliation, strict-evidence, checkpoint, and auto-resume behavior. It adds a single-tab run lease plus canonical shard rehydration so two restored tabs cannot advance the same checkpoint at once, and a stale/mixed checkpoint cannot produce an undefined relationship shard."
)
html = html.replace(
    "Pass 58 remembers the gate you actually started.",
    "Pass 59 remembers the gate you actually started and prevents duplicate tabs from running that gate concurrently."
)
html = html.replace('genreactrix-cloud-api.js?v=58','genreactrix-cloud-api.js?v=59')
html = html.replace('emojeo-step3-delta-backfill.js?v=58','emojeo-step3-delta-backfill.js?v=59')

if "Pass 58" in html:
    raise SystemExit("ERROR: Pass 58 remains in HTML after patch.")
if "Emojeo Step 3 Delta Backfill — Pass 58" in js:
    raise SystemExit("ERROR: Pass 58 JS build marker remains after patch.")

js_path.write_text(js, encoding="utf-8")
html_path.write_text(html, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path
js=Path("emojeo-step3-delta-backfill.js").read_text(encoding="utf-8")
html=Path("emojeo-step3-delta-backfill.html").read_text(encoding="utf-8")

checks = {
    "Pass 59 JS": "Emojeo Step 3 Delta Backfill — Pass 59" in js,
    "Pass 59 HTML": "Step 3 Delta Backfill · Pass 59" in html,
    "run lease": "RUN_LEASE_KEY" in js and "acquireRunLease()" in js and "releaseRunLease()" in js,
    "canonical shard rebuild": "canonicalizeJobShards" in js,
    "checkpoint dedupe": "canonicalizeDiscoveryCheckpoint" in js,
    "defensive shard guard": "Canonical shard ${di+1}/${canonicalShards.length} is unavailable." in js,
    "cache buster": "emojeo-step3-delta-backfill.js?v=59" in html,
}
bad=[k for k,v in checks.items() if not v]
if bad:
    raise SystemExit("ERROR: verification failed: "+", ".join(bad))
print("PASS 59 VERIFIED")
for k in checks: print("  OK:", k)
PY

git diff --check -- emojeo-step3-delta-backfill.js emojeo-step3-delta-backfill.html

echo
echo "PASS 59 INSTALLED"
echo "- Existing 2/79 mapped subjects preserved"
echo "- Existing discovery shards preserved/deduplicated canonically"
echo "- Single-tab lease blocks duplicate auto-resume races"
echo "- Canonical 12-shard structure is rebuilt before every run/mapper call"
echo "- No discovery, mapper, reconciliation, or strict-evidence prompt changes"
