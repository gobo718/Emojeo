from pathlib import Path

html_path = Path("emojeo-step3-delta-backfill.html")
js_path = Path("emojeo-step3-delta-backfill.js")

html = html_path.read_text(encoding="utf-8")
js = js_path.read_text(encoding="utf-8")

if "Step 3 Delta Backfill · Pass 56" in html and "STRICT_EVIDENCE_VALIDATOR_VERSION=1" in js:
    print("Pass 56 is already installed.")
    raise SystemExit(0)

if "Step 3 Delta Backfill · Pass 55" not in html:
    raise SystemExit("ERROR: Expected Pass 55 delta-backfill HTML was not found.")
if "Emojeo Step 3 Delta Backfill — Pass 55" not in js:
    raise SystemExit("ERROR: Expected Pass 55 delta-backfill JS was not found.")
if "const mapped=await callRecoveryMapper(subject,units,aborter.signal);" not in js:
    raise SystemExit("ERROR: Expected Pass 55 mapper call marker was not found.")

# HTML: identity + narrow description only.
html = html.replace(
    "<title>Emojeo · Step 3 Delta Backfill · Pass 55</title>",
    "<title>Emojeo · Step 3 Delta Backfill · Pass 56</title>", 1)
html = html.replace(
    "<h1>Emojeo · Step 3 Delta Backfill · Pass 55</h1>",
    "<h1>Emojeo · Step 3 Delta Backfill · Pass 56</h1>", 1)

old_desc = (
    '<p class="small">Pass 55 keeps the Pass 54 fresh-discovery shards, then sends those new raw notes '
    'through the proven Step 3 recovery mapper/reconciler before an emoji counts as complete. This fixes '
    'Pass 54 recording useful raw notes while producing zero structured assertions. Existing Pass 54 '
    'IndexedDB shard checkpoints are reused; completed discovery calls are not rerun.</p>'
)
new_desc = (
    '<p class="small">Pass 56 keeps the Pass 55 two-stage discovery + mapper/reconciliation pipeline, '
    'then applies a strict deterministic evidence gate to accepted assertions. Low-confidence, explicitly '
    'speculative/context-only, or self-referential sentence-style targets are rejected and preserved for '
    'audit. Existing discovery and mapped checkpoints are re-audited locally; completed AI calls are not rerun.</p>'
)
if old_desc not in html:
    raise SystemExit("ERROR: Expected Pass 55 description marker was not found.")
html = html.replace(old_desc, new_desc, 1)

html = html.replace(
    "<strong>Completed 79/79 recovered Step 3 JSON</strong>",
    "<strong>Completed recovered JSON or Pass 55 checkpoint JSON</strong>", 1)
html = html.replace(
    'Load <code>emojeo-step3-recovered-2026-09-23T04-12-14-359Z.json</code>.',
    'Load the original 79/79 recovered JSON or a downloaded Pass 55 delta-backfill checkpoint.', 1)

old_safety = (
    '<strong>Safety gate:</strong> 1 subject → 3 total → 10 total → all 79. Each emoji has two stages: '
    '<strong>fresh delta discovery</strong> across 12 shards, then <strong>mapper/reconciliation</strong> '
    'against those same 354 new relationship types. The original <code>results</code> and '
    '<code>recoveryResults</code> remain unchanged. Pass 55 appends the fresh discovery evidence plus the '
    'structured delta assertions.'
)
new_safety = (
    '<strong>Safety gate:</strong> 1 subject → 3 total → 10 total → all 79. Each emoji keeps the Pass 55 '
    '<strong>fresh delta discovery</strong> + <strong>mapper/reconciliation</strong> stages, followed by the '
    'Pass 56 <strong>strict evidence gate</strong>. Rejected assertions are retained for audit rather than '
    'deleted. The original <code>results</code> and <code>recoveryResults</code> remain unchanged.'
)
if old_safety not in html:
    raise SystemExit("ERROR: Expected Pass 55 safety text marker was not found.")
html = html.replace(old_safety, new_safety, 1)
html = html.replace("genreactrix-cloud-api.js?v=55", "genreactrix-cloud-api.js?v=56", 1)
html = html.replace("emojeo-step3-delta-backfill.js?v=55", "emojeo-step3-delta-backfill.js?v=56", 1)

# JS: keep Pass 55 discovery + mapper/reconciliation; add strict deterministic validation.
js = js.replace(
    "/* Emojeo Step 3 Delta Backfill — Pass 55",
    "/* Emojeo Step 3 Delta Backfill — Pass 56", 1)

validator_code = r'''
const STRICT_EVIDENCE_VALIDATOR_VERSION=1;
const STRICT_WEAK_EVIDENCE_RE=/\b(?:speculative|hypothetical|theoretically|plausible stretch|stretch|niche|not widely exploited|lacks institutional backing|subjective|possible symbolic gesture|could|might|maybe|context-dependent)\b/i;
function strictValidationKey(a){return [clean(a?.relationshipType),clean(a?.domain),clean(a?.tag),clean(a?.evidence)].join('\u0000')}
function strictEvidenceReason(a,subject){
  const confidence=clean(a?.confidence).toLowerCase(),tag=clean(a?.tag),evidence=clean(a?.evidence);
  if(confidence==='low')return 'low-confidence accepted assertion is not eligible for Pass 56 KEEP';
  if(clean(subject?.glyph)&&tag.includes(clean(subject.glyph)))return 'target is self-referential prose containing the subject glyph instead of a semantic target';
  const subjectName=normalizeName(subject?.name),tagName=normalizeName(tag);
  if(subjectName&&tagName.includes(subjectName))return 'target is self-referential prose containing the subject name instead of a semantic target';
  if(STRICT_WEAK_EVIDENCE_RE.test(`${tag} ${evidence}`))return 'accepted evidence still contains explicit speculative/context-only language';
  return '';
}
function validateStrictEvidence(result){
  if(!result||result?.strictEvidenceValidation?.version===STRICT_EVIDENCE_VALIDATOR_VERSION)return result;
  const current=Array.isArray(result.assertions)?result.assertions:[];
  const priorStrict=Array.isArray(result.strictEvidenceRejectedAssertions)?result.strictEvidenceRejectedAssertions:[];
  const source=[],seenSource=new Set();
  for(const a of [...current,...priorStrict]){
    const k=strictValidationKey(a);
    if(!seenSource.has(k)){source.push(a);seenSource.add(k)}
  }
  const kept=[],invalid=[];
  for(const a of source){
    const reason=strictEvidenceReason(a,result.subject||{});
    if(reason)invalid.push({...a,reconciliationReason:`Pass 56 strict evidence validator: ${reason}`,strictEvidenceValidator:`client-v${STRICT_EVIDENCE_VALIDATOR_VERSION}`});
    else{
      const cleanA={...a};
      delete cleanA.strictEvidenceValidator;
      if(clean(cleanA.reconciliationReason).startsWith('Pass 56 strict evidence validator:'))delete cleanA.reconciliationReason;
      kept.push(cleanA);
    }
  }
  const rejected=(Array.isArray(result.rejectedCandidates)?result.rejectedCandidates:[]).filter(a=>!clean(a?.strictEvidenceValidator).startsWith('client-v'));
  const seenRejected=new Set(rejected.map(strictValidationKey));
  for(const a of invalid){
    const k=strictValidationKey(a);
    if(!seenRejected.has(k)){rejected.push(a);seenRejected.add(k)}
  }
  const invalidTags=new Set(invalid.map(a=>clean(a.tag))),keptTags=new Set(kept.map(a=>clean(a.tag)));
  const newTags=(Array.isArray(result.newTags)?result.newTags:[]).filter(t=>!invalidTags.has(clean(t))||keptTags.has(clean(t)));
  const audit={
    version:STRICT_EVIDENCE_VALIDATOR_VERSION,
    mode:'client-post-reconciliation',
    checkedAt:new Date().toISOString(),
    checkedAssertionCount:source.length,
    rejectedCount:invalid.length,
    rejectedRelationships:[...new Set(invalid.map(a=>a.relationshipType))]
  };
  return {
    ...result,
    assertions:kept,
    newTags,
    rejectedCandidates:rejected,
    strictEvidenceRejectedAssertions:invalid,
    strictEvidenceValidation:audit,
    reconciliation:{...(result.reconciliation||{}),strictEvidenceValidation:audit}
  };
}
function compatibleMappedPrefix(list,subjects){
  const rows=Array.isArray(list)?list:[];
  if(rows.length>subjects.length)return false;
  for(let i=0;i<rows.length;i++){
    const a=rows[i]?.subject||{},b=subjects[i]||{};
    if(subjectKey(a)!==subjectKey(b))return false;
  }
  return true;
}
function compatibleDiscoveryPrefix(list,subjects,shards){
  const rows=Array.isArray(list)?list:[];
  if(rows.length>subjects.length*shards.length)return false;
  for(let i=0;i<rows.length;i++){
    const si=Math.floor(i/shards.length),di=i%shards.length;
    const row=rows[i]||{},subject=subjects[si]||{},shard=shards[di]||{};
    if(subjectKey(row.subject||{})!==subjectKey(subject))return false;
    if(clean(row.shardId)!==clean(shard.id))return false;
  }
  return true;
}
'''
prompt_marker = "function prompt(subject,shard){"
if prompt_marker not in js:
    raise SystemExit("ERROR: Prompt insertion marker not found.")
js = js.replace(prompt_marker, validator_code + "\n" + prompt_marker, 1)

old_render = '''  const present=(job.mapped||[]).reduce((n,r)=>n+(r?.assertions||[]).filter(x=>x?.state==='present').length,0);
  $('summary').innerHTML=`<span class="good">${done}/${subjectTotal} old emoji backfilled</span> · ${shardDone}/${shardTotal} discovery shards saved · ${present} accepted PRESENT assertions · ${job.relationshipCount} new relationships`;'''
new_render = '''  const present=(job.mapped||[]).reduce((n,r)=>n+(r?.assertions||[]).filter(x=>x?.state==='present').length,0);
  const strictRejected=(job.mapped||[]).reduce((n,r)=>n+Number(r?.strictEvidenceValidation?.rejectedCount||0),0);
  $('summary').innerHTML=`<span class="good">${done}/${subjectTotal} old emoji backfilled</span> · ${shardDone}/${shardTotal} discovery shards saved · ${present} accepted PRESENT assertions · ${strictRejected} strict-evidence rejection(s) · ${job.relationshipCount} new relationships`;'''
if old_render not in js:
    raise SystemExit("ERROR: Pass 55 render marker not found.")
js = js.replace(old_render, new_render, 1)

js = js.replace(
    "const mapped=await callRecoveryMapper(subject,units,aborter.signal);",
    "const mapped=validateStrictEvidence(await callRecoveryMapper(subject,units,aborter.signal));", 1)

old_download_head = '''function download(){
  if(!job||!input)return;
  const present=(job.mapped||[]).reduce((n,r)=>n+(r?.assertions||[]).filter(x=>x?.state==='present').length,0);
  const out={'''
new_download_head = '''function download(){
  if(!job||!input)return;
  const present=(job.mapped||[]).reduce((n,r)=>n+(r?.assertions||[]).filter(x=>x?.state==='present').length,0);
  const strictRejected=(job.mapped||[]).reduce((n,r)=>n+Number(r?.strictEvidenceValidation?.rejectedCount||0),0);
  const out={'''
if old_download_head not in js:
    raise SystemExit("ERROR: Pass 55 download marker not found.")
js = js.replace(old_download_head, new_download_head, 1)
js = js.replace("deltaBackfillSchemaVersion:2,", "deltaBackfillSchemaVersion:3,", 1)
js = js.replace(
    "deltaBackfillPresentAssertionCount:present,",
    "deltaBackfillPresentAssertionCount:present,\n    deltaBackfillStrictEvidenceRejectedAssertionCount:strictRejected,\n    deltaBackfillStrictEvidenceValidatorVersion:STRICT_EVIDENCE_VALIDATOR_VERSION,", 1)

old_strategy = "deltaBackfillStrategy:`Pass 55 two-stage delta backfill: fresh Semantic Discovery over only ${job.relationshipCount} v013 additions in ${job.shards.length} deterministic shards, then proven Step 3 recovery mapper/reconciliation over those fresh raw notes; original results and recoveryResults preserved; IndexedDB checkpointing; gated 1 -> 3 -> 10 -> 79`,"
new_strategy = "deltaBackfillStrategy:`Pass 56 strict delta backfill: Pass 55 fresh Semantic Discovery + Step 3 mapper/reconciliation over only ${job.relationshipCount} v013 additions, followed by deterministic strict evidence validation that rejects low-confidence, explicitly speculative/context-only, and self-referential sentence-style targets while preserving rejects for audit; original results and recoveryResults preserved; IndexedDB checkpointing; gated 1 -> 3 -> 10 -> 79`,"
if old_strategy not in js:
    raise SystemExit("ERROR: Pass 55 strategy marker not found.")
js = js.replace(old_strategy, new_strategy, 1)
js = js.replace("emojeo-step3-delta-backfilled-pass55-", "emojeo-step3-delta-backfilled-pass56-", 1)

seed_marker = '''  job.results=Array.isArray(job.results)?job.results:[];
  job.mapped=Array.isArray(job.mapped)?job.mapped:[];'''
seed_insert = '''  job.results=Array.isArray(job.results)?job.results:[];
  job.mapped=Array.isArray(job.mapped)?job.mapped:[];
  const embeddedDiscovery=Array.isArray(input?.deltaBackfillDiscoveryResults)?input.deltaBackfillDiscoveryResults:[];
  const embeddedMapped=Array.isArray(input?.deltaBackfillResults)?input.deltaBackfillResults:[];
  if(embeddedDiscovery.length||embeddedMapped.length){
    if(!compatibleDiscoveryPrefix(embeddedDiscovery,subjects,shards))throw new Error('Embedded deltaBackfillDiscoveryResults do not match the v013 subject/shard order');
    if(!compatibleMappedPrefix(embeddedMapped,subjects))throw new Error('Embedded deltaBackfillResults do not match the v013 subject order');
    const embeddedProgress=embeddedMapped.length*10000+embeddedDiscovery.length;
    const savedProgress=job.mapped.length*10000+job.results.length;
    if(embeddedProgress>savedProgress){
      job.results=clone(embeddedDiscovery);
      job.mapped=clone(embeddedMapped);
    }
  }
  job.mapped=job.mapped.map(validateStrictEvidence);'''
if seed_marker not in js:
    raise SystemExit("ERROR: Pass 55 checkpoint seed marker not found.")
js = js.replace(seed_marker, seed_insert, 1)

old_resume = '''  if(job.mapped.length){
    setStatus(`RESUMED · ${job.mapped.length}/79 subjects fully backfilled · ${job.results.length}/${79*shards.length} fresh discovery shards saved.`);
  }else if(job.results.length){'''
new_resume = '''  if(job.mapped.length){
    const strictRejected=job.mapped.reduce((n,r)=>n+Number(r?.strictEvidenceValidation?.rejectedCount||0),0);
    setStatus(`RESUMED + RE-AUDITED · ${job.mapped.length}/79 subjects fully backfilled · ${job.results.length}/${79*shards.length} fresh discovery shards saved.\\nPass 56 strict evidence gate rejected ${strictRejected} previously accepted assertion(s) and preserved them for audit.`);
  }else if(job.results.length){'''
if old_resume not in js:
    raise SystemExit("ERROR: Pass 55 resume marker not found.")
js = js.replace(old_resume, new_resume, 1)

js = js.replace(
    "$('summary').textContent='Load emojeo-step3-recovered-2026-09-23T04-12-14-359Z.json.';",
    "$('summary').textContent='Load the original 79/79 recovered JSON or a downloaded Pass 55 delta-backfill checkpoint.';", 1)

required_js = [
    "STRICT_EVIDENCE_VALIDATOR_VERSION=1",
    "validateStrictEvidence(await callRecoveryMapper",
    "strictEvidenceRejectedAssertions",
    "deltaBackfillSchemaVersion:3",
    "deltaBackfillStrictEvidenceRejectedAssertionCount",
    "embeddedDiscovery",
    "embeddedMapped",
    "emojeo-step3-delta-backfilled-pass56-",
    "emojeo-step3-delta-backfill-v1",
]
for marker in required_js:
    if marker not in js:
        raise SystemExit(f"ERROR: Missing installed JS marker: {marker}")

required_html = [
    "Step 3 Delta Backfill · Pass 56",
    "strict deterministic evidence gate",
    "Pass 55 checkpoint JSON",
    "emojeo-step3-delta-backfill.js?v=56",
]
for marker in required_html:
    if marker not in html:
        raise SystemExit(f"ERROR: Missing installed HTML marker: {marker}")

html_path.write_text(html, encoding="utf-8")
js_path.write_text(js, encoding="utf-8")

print("PASS 56 PATCH APPLIED")
