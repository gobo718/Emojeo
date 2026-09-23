from pathlib import Path

html_path = Path("emojeo-step3-delta-backfill.html")
js_path = Path("emojeo-step3-delta-backfill.js")

html = html_path.read_text(encoding="utf-8")
js = js_path.read_text(encoding="utf-8")

if "Step 3 Delta Backfill · Pass 57" in html and "STRICT_EVIDENCE_VALIDATOR_VERSION=2" in js:
    print("Pass 57 is already installed.")
    raise SystemExit(0)

if "Step 3 Delta Backfill · Pass 56" not in html:
    raise SystemExit("ERROR: Expected Pass 56 delta-backfill HTML was not found.")
if "Emojeo Step 3 Delta Backfill — Pass 56" not in js:
    raise SystemExit("ERROR: Expected Pass 56 delta-backfill JS was not found.")
if "const STRICT_EVIDENCE_VALIDATOR_VERSION=1;" not in js:
    raise SystemExit("ERROR: Expected Pass 56 strict validator v1 marker was not found.")

html = html.replace(
    "<title>Emojeo · Step 3 Delta Backfill · Pass 56</title>",
    "<title>Emojeo · Step 3 Delta Backfill · Pass 57</title>", 1)
html = html.replace(
    "<h1>Emojeo · Step 3 Delta Backfill · Pass 56</h1>",
    "<h1>Emojeo · Step 3 Delta Backfill · Pass 57</h1>", 1)

old_desc = (
    '<p class="small">Pass 56 keeps the Pass 55 two-stage discovery + mapper/reconciliation pipeline, '
    'then applies a strict deterministic evidence gate to accepted assertions. Low-confidence, explicitly '
    'speculative/context-only, or self-referential sentence-style targets are rejected and preserved for audit. '
    'Existing discovery and mapped checkpoints are re-audited locally; completed AI calls are not rerun.</p>'
)
new_desc = (
    '<p class="small">Pass 57 keeps the Pass 56 pipeline and strengthens only the deterministic evidence gate. '
    'It now also rejects accepted assertions whose evidence directly contradicts the subject itself, plus unsupported '
    'numerical/time-series claims that provide no source provenance. Existing Pass 56 checkpoints are re-audited '
    'locally; completed discovery and mapper AI calls are not rerun.</p>'
)
if old_desc not in html:
    raise SystemExit("ERROR: Expected Pass 56 description marker was not found.")
html = html.replace(old_desc, new_desc, 1)

html = html.replace(
    "<strong>Completed recovered JSON or Pass 55 checkpoint JSON</strong>",
    "<strong>Completed recovered JSON or Pass 56 checkpoint JSON</strong>", 1)
html = html.replace(
    "Load the original 79/79 recovered JSON or a downloaded Pass 55 delta-backfill checkpoint.",
    "Load the original 79/79 recovered JSON or a downloaded Pass 56 delta-backfill checkpoint.", 1)

old_safety = (
    '<strong>Safety gate:</strong> 1 subject → 3 total → 10 total → all 79. Each emoji keeps the Pass 55 '
    '<strong>fresh delta discovery</strong> + <strong>mapper/reconciliation</strong> stages, followed by the Pass 56 '
    '<strong>strict evidence gate</strong>. Rejected assertions are retained for audit rather than deleted. '
    'The original <code>results</code> and <code>recoveryResults</code> remain unchanged.'
)
new_safety = (
    '<strong>Safety gate:</strong> 1 subject → 3 total → 10 total → all 79. Pass 57 reuses the completed '
    '<strong>fresh delta discovery</strong> + <strong>mapper/reconciliation</strong> work and upgrades only the '
    '<strong>strict evidence gate</strong>. Rejected assertions remain preserved for audit. The original '
    '<code>results</code> and <code>recoveryResults</code> remain unchanged.'
)
if old_safety not in html:
    raise SystemExit("ERROR: Expected Pass 56 safety marker was not found.")
html = html.replace(old_safety, new_safety, 1)

html = html.replace("genreactrix-cloud-api.js?v=56", "genreactrix-cloud-api.js?v=57", 1)
html = html.replace("emojeo-step3-delta-backfill.js?v=56", "emojeo-step3-delta-backfill.js?v=57", 1)

js = js.replace(
    "/* Emojeo Step 3 Delta Backfill — Pass 56",
    "/* Emojeo Step 3 Delta Backfill — Pass 57", 1)

old_validator = r'''const STRICT_EVIDENCE_VALIDATOR_VERSION=1;
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
}'''

new_validator = r'''const STRICT_EVIDENCE_VALIDATOR_VERSION=2;
const STRICT_WEAK_EVIDENCE_RE=/\b(?:speculative|hypothetical|theoretically|plausible stretch|stretch|niche|not widely exploited|lacks institutional backing|subjective|possible symbolic gesture|could|might|maybe|context-dependent)\b/i;
const STRICT_FACE_NEGATION_RE=/\b(?:lack(?:s|ing)?\s+(?:of\s+)?(?:a\s+)?face|no\s+face|without\s+(?:a\s+)?face)\b/i;
const STRICT_GRINNING_FACE_FALSE_EYE_RE=/\b(?:closed\s+eyes|eyes\s+(?:are\s+)?closed)\b/i;
const STRICT_UNSOURCED_EMPIRICAL_RE=/(?:\bfrom\s+(?:19|20)\d{2}\s+(?:to|through|-)\s+(?:19|20)\d{2}\b|\b\d+(?:\.\d+)?\s*(?:x|%|percent)\b|(?:increased|decreased|rose|fell|grew|declined)[^.]{0,120}\b(?:19|20)\d{2}\b)/i;
function strictValidationKey(a){return [clean(a?.relationshipType),clean(a?.domain),clean(a?.tag),clean(a?.evidence)].join('\u0000')}
function hasAssertionProvenance(a){
  return Boolean(
    clean(a?.sourceUrl)||clean(a?.sourceURL)||clean(a?.citation)||clean(a?.sourceCitation)||
    clean(a?.source)||clean(a?.reference)||clean(a?.sourceId)||clean(a?.sourceRef)||
    /https?:\/\/|doi:\s*10\./i.test(clean(a?.evidence))
  );
}
function strictEvidenceReason(a,subject){
  const confidence=clean(a?.confidence).toLowerCase(),tag=clean(a?.tag),evidence=clean(a?.evidence);
  if(confidence==='low')return 'low-confidence accepted assertion is not eligible for Pass 57 KEEP';
  if(clean(subject?.glyph)&&tag.includes(clean(subject.glyph)))return 'target is self-referential prose containing the subject glyph instead of a semantic target';
  const subjectName=normalizeName(subject?.name),tagName=normalizeName(tag);
  if(subjectName&&tagName.includes(subjectName))return 'target is self-referential prose containing the subject name instead of a semantic target';
  if(STRICT_WEAK_EVIDENCE_RE.test(`${tag} ${evidence}`))return 'accepted evidence still contains explicit speculative/context-only language';

  if(subjectName.includes('face')&&STRICT_FACE_NEGATION_RE.test(evidence))
    return 'evidence directly contradicts the canonical subject identity by claiming a named face subject lacks a face';
  if(clean(subject?.glyph)==='😀'&&STRICT_GRINNING_FACE_FALSE_EYE_RE.test(evidence))
    return 'evidence directly contradicts the grinning-face visual subject by claiming closed eyes';

  if(STRICT_UNSOURCED_EMPIRICAL_RE.test(evidence)&&!hasAssertionProvenance(a))
    return 'evidence contains an unsupported numerical/time-series claim with no source provenance';

  return '';
}'''

if old_validator not in js:
    raise SystemExit("ERROR: Exact Pass 56 validator block was not found.")
js = js.replace(old_validator, new_validator, 1)

js = js.replace(
    "reconciliationReason:`Pass 56 strict evidence validator: ${reason}`",
    "reconciliationReason:`Pass 57 strict evidence validator: ${reason}`", 1)
js = js.replace(
    "if(clean(cleanA.reconciliationReason).startsWith('Pass 56 strict evidence validator:'))delete cleanA.reconciliationReason;",
    "if(/^Pass (?:56|57) strict evidence validator:/.test(clean(cleanA.reconciliationReason)))delete cleanA.reconciliationReason;", 1)

js = js.replace("deltaBackfillSchemaVersion:3,", "deltaBackfillSchemaVersion:4,", 1)

old_strategy = (
    "deltaBackfillStrategy:`Pass 56 strict delta backfill: Pass 55 fresh Semantic Discovery + Step 3 mapper/reconciliation "
    "over only ${job.relationshipCount} v013 additions, followed by deterministic strict evidence validation that rejects "
    "low-confidence, explicitly speculative/context-only, and self-referential sentence-style targets while preserving "
    "rejects for audit; original results and recoveryResults preserved; IndexedDB checkpointing; gated 1 -> 3 -> 10 -> 79`,"
)
new_strategy = (
    "deltaBackfillStrategy:`Pass 57 strict delta backfill: Pass 55 fresh Semantic Discovery + Step 3 mapper/reconciliation "
    "over only ${job.relationshipCount} v013 additions, followed by deterministic strict evidence validation v2 that also "
    "rejects direct subject-fact contradictions and unsourced numerical/time-series claims while preserving rejects for "
    "audit; original results and recoveryResults preserved; IndexedDB checkpointing; gated 1 -> 3 -> 10 -> 79`,"
)
if old_strategy not in js:
    raise SystemExit("ERROR: Pass 56 strategy marker not found.")
js = js.replace(old_strategy, new_strategy, 1)

js = js.replace(
    "emojeo-step3-delta-backfilled-pass56-",
    "emojeo-step3-delta-backfilled-pass57-", 1)

js = js.replace(
    "$('summary').textContent='Load the original 79/79 recovered JSON or a downloaded Pass 55 delta-backfill checkpoint.';",
    "$('summary').textContent='Load the original 79/79 recovered JSON or a downloaded Pass 56 delta-backfill checkpoint.';", 1)

js = js.replace(
    "Pass 56 strict evidence gate rejected ${strictRejected} previously accepted assertion(s) and preserved them for audit.",
    "Pass 57 strict evidence gate rejected ${strictRejected} assertion(s) and preserved them for audit. No completed AI calls were rerun.", 1)

required_js = [
    "STRICT_EVIDENCE_VALIDATOR_VERSION=2",
    "STRICT_FACE_NEGATION_RE",
    "STRICT_GRINNING_FACE_FALSE_EYE_RE",
    "STRICT_UNSOURCED_EMPIRICAL_RE",
    "hasAssertionProvenance",
    "Pass 57 strict evidence validator:",
    "deltaBackfillSchemaVersion:4",
    "emojeo-step3-delta-backfilled-pass57-",
    "emojeo-step3-delta-backfill-v1",
]
for marker in required_js:
    if marker not in js:
        raise SystemExit(f"ERROR: Missing installed JS marker: {marker}")

required_html = [
    "Step 3 Delta Backfill · Pass 57",
    "directly contradicts the subject itself",
    "Pass 56 checkpoint JSON",
    "emojeo-step3-delta-backfill.js?v=57",
]
for marker in required_html:
    if marker not in html:
        raise SystemExit(f"ERROR: Missing installed HTML marker: {marker}")

html_path.write_text(html, encoding="utf-8")
js_path.write_text(js, encoding="utf-8")

print("PASS 57 PATCH APPLIED")
