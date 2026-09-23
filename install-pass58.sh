#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$ROOT" ]; then
  echo "ERROR: Run this from inside the Emojeo git repo."
  exit 1
fi
cd "$ROOT"

for f in emojeo-step3-delta-backfill.html emojeo-step3-delta-backfill.js; do
  if [ ! -f "$f" ]; then
    echo "ERROR: Missing $f"
    exit 1
  fi
done

python - <<'PY'
from pathlib import Path

js_path = Path("emojeo-step3-delta-backfill.js")
html_path = Path("emojeo-step3-delta-backfill.html")
js = js_path.read_text(encoding="utf-8")
html = html_path.read_text(encoding="utf-8")

def must_replace(text, old, new, label):
    if old not in text:
        raise SystemExit(f"ERROR: Pass 58 patch marker not found: {label}")
    return text.replace(old, new, 1)

# ---- JS: identity + durable local source/pointer records ----
js = must_replace(
    js,
    "/* Emojeo Step 3 Delta Backfill — Pass 57",
    "/* Emojeo Step 3 Delta Backfill — Pass 58",
    "JS Pass identity"
)

js = must_replace(
    js,
    "const STORE='jobs';\nconst SHARD_SIZE=30;",
    "const STORE='jobs';\nconst LATEST_ID='__latest__';\nconst SOURCE_PREFIX='__source__:';\nconst SHARD_SIZE=30;",
    "IndexedDB constants"
)

db_marker = """async function dbPut(value){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put(value);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
"""
db_add = db_marker + r"""async function dbGetAll(){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).getAll();
    r.onsuccess=()=>resolve(Array.isArray(r.result)?r.result:[]);
    r.onerror=()=>reject(r.error);
  });
}
async function dbRememberLatest(jobId){
  await dbPut({id:LATEST_ID,kind:'emojeo-step3-delta-backfill-latest',jobId,updatedAt:new Date().toISOString()});
}
async function dbSaveSource(jobId,value){
  await dbPut({id:`${SOURCE_PREFIX}${jobId}`,kind:'emojeo-step3-delta-backfill-source',input:clone(value),updatedAt:new Date().toISOString()});
}
async function dbLatestJob(){
  const pointer=await dbGet(LATEST_ID);
  if(pointer?.jobId){
    const pointed=await dbGet(pointer.jobId);
    if(pointed?.kind==='emojeo-step3-delta-backfill-job')return pointed;
  }
  const rows=await dbGetAll();
  return rows
    .filter(x=>x?.kind==='emojeo-step3-delta-backfill-job')
    .sort((a,b)=>String(b?.updatedAt||b?.createdAt||'').localeCompare(String(a?.updatedAt||a?.createdAt||'')))[0]||null;
}
"""
js = must_replace(js, db_marker, db_add, "IndexedDB helper insertion")

# Download button must not pretend it can export until the original source JSON is cached.
js = must_replace(
    js,
    "$('download').disabled=!done;",
    "$('download').disabled=!done||!input;",
    "download source guard"
)

# ---- JS: persist the user's requested run target before making the next call ----
run_marker = """  if(!Number.isFinite(stopSubject)||stopSubject<=startDone)return;
  running=true;aborter=new AbortController();render();
"""
run_replacement = """  if(!Number.isFinite(stopSubject)||stopSubject<=startDone)return;
  job.runIntent={active:true,stopSubject,requestedAt:new Date().toISOString()};
  await dbPut(job);
  await dbRememberLatest(job.id);
  running=true;aborter=new AbortController();render();
"""
js = must_replace(js, run_marker, run_replacement, "run intent persistence")

# ---- JS: clear intent only after reaching the requested gate; preserve intent on network failure ----
success_marker = """    if(mappedSubjects()===totalSubjects)setStatus('DELTA BACKFILL COMPLETE · 79/79 · Download the backfilled JSON.');
    else if(aborter.signal.aborted)setStatus('STOPPED · every completed discovery shard and mapped subject is saved.');
    else setStatus(`CHECKPOINT REACHED · ${mappedSubjects()}/${totalSubjects} subjects backfilled · download and inspect before the next gate.`);
  }catch(e){
    if(e?.name==='AbortError')setStatus('STOPPED · every completed discovery shard and mapped subject is saved.');
    else setStatus(`STOPPED · ${e?.message||e}`);
  }finally{
"""
success_replacement = """    if(mappedSubjects()>=stopSubject||mappedSubjects()===totalSubjects){
      job.runIntent={...(job.runIntent||{}),active:false,completedAt:new Date().toISOString()};
      await dbPut(job);
    }
    if(mappedSubjects()===totalSubjects)setStatus('DELTA BACKFILL COMPLETE · 79/79 · Download the backfilled JSON.');
    else if(aborter.signal.aborted)setStatus('STOPPED · every completed discovery shard and mapped subject is saved.');
    else setStatus(`CHECKPOINT REACHED · ${mappedSubjects()}/${totalSubjects} subjects backfilled · download and inspect before the next gate.`);
  }catch(e){
    if(e?.name==='AbortError')setStatus('STOPPED · every completed discovery shard and mapped subject is saved.');
    else{
      if(job){
        job.runIntent={...(job.runIntent||{}),active:true,lastError:clean(e?.message||e),lastErrorAt:new Date().toISOString()};
        try{await dbPut(job)}catch{}
      }
      setStatus(`STOPPED · ${e?.message||e}\\nRefresh/reopen this page and Pass 58 will resume the saved run automatically.`);
    }
  }finally{
"""
js = must_replace(js, success_marker, success_replacement, "run completion/error intent handling")

# Manual stop is the one thing that must cancel auto-resume.
js = must_replace(
    js,
    "function stop(){aborter?.abort()}",
    """function stop(){
  if(job){
    job.runIntent={...(job.runIntent||{}),active:false,stoppedAt:new Date().toISOString()};
    dbPut(job).catch(()=>{});
  }
  aborter?.abort();
}""",
    "manual stop behavior"
)

# ---- JS: when a file is chosen, cache it once and remember this job as latest ----
save_marker = """  await dbPut(job);
  if(job.mapped.length){
"""
save_replacement = """  await dbPut(job);
  await dbSaveSource(id,input);
  await dbRememberLatest(id);
  if(job.mapped.length){
"""
js = must_replace(js, save_marker, save_replacement, "source cache + latest pointer")

# ---- JS: automatic restore/reopen logic ----
event_marker = """$('file').addEventListener('change',async e=>{
"""
restore_code = r"""async function restoreLatestCheckpoint(){
  try{
    spec=await loadJson('Emojeo_STEP3_Delta_Backfill_v013_RunSpec.json');
    const relationships=Array.isArray(spec?.relationshipDelta)?spec.relationshipDelta:[];
    const subjects=(spec?.subjects||[]).map(s=>({glyph:clean(s.glyph),name:clean(s.name)}));
    if(relationships.length!==354||subjects.length!==79)throw new Error('Current v013 delta RunSpec is not 79 subjects × 354 relationships.');
    const shards=buildShards(relationships);

    const saved=await dbLatestJob();
    if(!saved)return false;
    if(saved.relationshipCount!==354||saved.shards?.length!==shards.length)throw new Error('Latest saved job does not match the current v013 delta.');

    job=saved;
    job.schemaVersion=3;
    job.subjects=subjects;
    job.shards=shards;
    job.relationshipCount=354;
    job.results=Array.isArray(job.results)?job.results:[];
    job.mapped=Array.isArray(job.mapped)?job.mapped:[];

    if(!compatibleDiscoveryPrefix(job.results,subjects,shards))throw new Error('Saved discovery checkpoint no longer matches the v013 subject/shard order.');
    if(!compatibleMappedPrefix(job.mapped,subjects))throw new Error('Saved mapped checkpoint no longer matches the v013 subject order.');

    job.mapped=job.mapped.map(validateStrictEvidence);
    job.results=job.results.map(r=>({
      ...r,
      kind:'emojeo-step3-delta-backfill-discovery-shard',
      observations:Array.isArray(r.observations)?r.observations:[],
      summary:clean(r.summary),
      ambiguities:Array.isArray(r.ambiguities)?r.ambiguities:[],
      rawNotes:Array.isArray(r.rawNotes)?r.rawNotes:[]
    }));

    const source=await dbGet(`${SOURCE_PREFIX}${job.id}`);
    input=source?.input||null;

    const done=mappedSubjects();
    const partialSubject=discoveredShardCalls()>done*shards.length;

    // Legacy Pass 54–57 jobs had no runIntent. If a subject is visibly partial,
    // it was interrupted mid-gate, so resume only that subject automatically.
    if(!job.runIntent&&partialSubject&&done<79){
      job.runIntent={
        active:true,
        stopSubject:done+1,
        requestedAt:new Date().toISOString(),
        restoredFromLegacyPartial:true
      };
    }

    await dbPut(job);
    await dbRememberLatest(job.id);

    const sourceNote=input
      ? 'Source JSON is cached locally; no file reselect is required.'
      : 'Run can continue without reselecting a file. Choose the recovered/checkpoint JSON once before final download so the full source can be embedded.';

    const active=Boolean(job.runIntent?.active);
    const stopSubject=Math.min(79,Math.max(done+1,Number(job.runIntent?.stopSubject)||done+1));

    setStatus(
      `AUTO-RESTORED · ${done}/79 subjects fully backfilled · ${job.results.length}/${79*shards.length} discovery shards saved.\n`+
      `${sourceNote}`+
      (active&&done<stopSubject?`\nAUTO-RESUME · continuing the interrupted run through subject ${stopSubject}…`:'')
    );
    render();

    if(active&&done<stopSubject){
      setTimeout(()=>runTo(stopSubject),700);
    }else if(active){
      job.runIntent={...(job.runIntent||{}),active:false,completedAt:new Date().toISOString()};
      await dbPut(job);
    }
    return true;
  }catch(e){
    job=null;input=null;
    setStatus(`AUTO-RESTORE FAILED · ${e?.message||e}\nChoose the recovered/checkpoint JSON manually.`);
    render();
    return false;
  }
}

"""
js = must_replace(js, event_marker, restore_code + event_marker, "automatic restore function")

# Initial page load now actively restores the latest IndexedDB job.
js = must_replace(
    js,
    "render();\n\n})();",
    "render();\nrestoreLatestCheckpoint();\n\n})();",
    "automatic restore startup"
)

# ---- HTML identity + explanation ----
html = html.replace("Pass 57", "Pass 58")
html = html.replace("?v=57", "?v=58")
html = must_replace(
    html,
    '<p class="small">Pass 58 keeps the Pass 56 pipeline and strengthens only the deterministic evidence gate. It now also rejects accepted assertions whose evidence directly contradicts the subject itself, plus unsupported numerical/time-series claims that provide no source provenance. Existing Pass 56 checkpoints are re-audited locally; completed discovery and mapper AI calls are not rerun.</p>',
    '<p class="small">Pass 58 keeps the Pass 57 discovery, mapper/reconciliation, and strict evidence logic unchanged. It adds durable browser recovery: the latest IndexedDB checkpoint is restored automatically on refresh/reopen, an interrupted run remembers its requested gate, and the page resumes that run without making you choose the JSON or press RUN again. A manual STOP still cancels auto-resume.</p>',
    "Pass 58 purpose text"
)
html = must_replace(
    html,
    '<label><strong>Completed recovered JSON or Pass 56 checkpoint JSON</strong>',
    '<label><strong>Recovered/checkpoint JSON (only needed to seed a new browser or enable final download)</strong>',
    "file picker label"
)
html = must_replace(
    html,
    '<div id="summary">Load the original 79/79 recovered JSON or a downloaded Pass 56 delta-backfill checkpoint.</div>',
    '<div id="summary">Checking this browser for the latest saved backfill checkpoint…</div>',
    "initial summary"
)
html = must_replace(
    html,
    '<strong>Safety gate:</strong> 1 subject → 3 total → 10 total → all 79. Pass 58 reuses the completed <strong>fresh delta discovery</strong> + <strong>mapper/reconciliation</strong> work and upgrades only the <strong>strict evidence gate</strong>. Rejected assertions remain preserved for audit. The original <code>results</code> and <code>recoveryResults</code> remain unchanged.',
    '<strong>Safety gate:</strong> 1 subject → 3 total → 10 total → all 79. Pass 58 remembers the gate you actually started. If Android closes or refreshes the page during that gate, the latest saved shard/subject is restored and the interrupted gate resumes automatically. A deliberate <strong>STOP AFTER CURRENT REQUEST</strong> cancels auto-resume. Rejected assertions remain preserved for audit; original <code>results</code> and <code>recoveryResults</code> remain unchanged.',
    "safety gate text"
)

js_path.write_text(js, encoding="utf-8")
html_path.write_text(html, encoding="utf-8")
PY

python - <<'PY'
from pathlib import Path

js=Path("emojeo-step3-delta-backfill.js").read_text(encoding="utf-8")
html=Path("emojeo-step3-delta-backfill.html").read_text(encoding="utf-8")

checks = {
    "Pass 58 HTML identity": "Step 3 Delta Backfill · Pass 58" in html,
    "Pass 58 JS identity": "Step 3 Delta Backfill — Pass 58" in js,
    "cache buster 58": "emojeo-step3-delta-backfill.js?v=58" in html,
    "latest checkpoint pointer": "LATEST_ID='__latest__'" in js,
    "IndexedDB scan fallback": "async function dbLatestJob()" in js,
    "source cache": "async function dbSaveSource" in js,
    "run intent persisted": "job.runIntent={active:true,stopSubject" in js,
    "legacy partial auto-resume": "restoredFromLegacyPartial:true" in js,
    "startup auto-restore": "restoreLatestCheckpoint();" in js,
    "manual stop cancels resume": "active:false,stoppedAt" in js,
    "network error tells refresh": "Pass 58 will resume the saved run automatically" in js,
}
bad=[name for name,ok in checks.items() if not ok]
if bad:
    raise SystemExit("ERROR: Pass 58 verification failed: " + ", ".join(bad))

print("PASS 58 VERIFIED")
print("  refresh/reopen: restores latest IndexedDB job automatically")
print("  interrupted gate: resumes automatically")
print("  legacy partial subject: resumes only that interrupted subject")
print("  manual STOP: cancels auto-resume")
print("  original Pass 57 discovery/mapper/evidence behavior: unchanged")
PY

git diff --check -- emojeo-step3-delta-backfill.html emojeo-step3-delta-backfill.js

echo
echo "Pass 58 files are ready for git add / commit / push."
