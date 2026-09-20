# Genreactrix v0.9.40.212 — PrimFusion taxonomy update

## v0.9.40.212 — Stacked safety filter panels

- Stacked AI Safety above Dir Safety in the right-hand area instead of placing them side by side.
- Status remains in the left column and spans the full safety-panel height.
- Selected safety size buttons now use a strong solid teal fill, bright text, and bright inset border so selection is unmistakable against the dark background.
- No filter logic, matching semantics, Worker, AI pipeline, Content Gate execution, Theme logic, Reaction logic, Queue, Bundle, or lifecycle behavior changed.


## v0.9.40.211 — Safety filter alignment correction

- Reworked each AI/Dir safety axis so Include sits on the left and Exclude on the right, matching the established Filter visual language.
- W, L, and C now each get their own horizontal row instead of forcing all three axes into one overflowing row.
- Reduced overall dialog width to keep the right edge inside the landscape viewport.
- Fixed safety-size selected-state styling using `input:checked + span`, so selected buttons visibly fill even where `:has()` support is unreliable.
- No filter logic or matching semantics changed.
- Worker and all AI/Theme/Reaction/Queue/Bundle/lifecycle behavior remain unchanged.


## v0.9.40.210 — Compact landscape Filter correction

- Reduced the Filter heading to a thin header and moved All / Feed into the same header area.
- Reworked AI Safety and Dir Safety so each uses one long Include row and one long Exclude row, matching the Filter's existing left/right Include/Exclude feel.
- Narrowed the overall modal so it stays within the landscape viewport.
- Tightened Status spacing so Tuned, Slop Warning, and Slop Detected remain visible.
- Increased the selected-state fill of safety size buttons so active selections are visibly colored.
- No filter semantics, Worker, AI pipeline, Content Gate execution, Theme logic, Reaction logic, Queue, Bundle, or lifecycle changes.


## v0.9.40.209 — Landscape Filter safety search

- Rebuilt the landscape Filter to use three dense columns instead of wasting horizontal space.
- Removed the redundant generic `SLOP?` filter row; Slop Warning and Slop Detected remain independently searchable.
- Added AI and Director safety filtering for W / L / C at XS / S / M / L / XL, with separate Include and Exclude controls.
- Preserves the Filter's existing Include/Exclude matching semantics; no new OR/AND behavior was introduced.
- Portrait Filter layout was not redesigned.
- Worker, AI pipeline, Content Gate execution, Theme logic, Reaction logic, lifecycle, Queue, and Bundle behavior are unchanged.


## v0.9.40.208

- PFM0106 Adorable + Weird: Kawaii → Whimsical.
- PFM0108 Adorable + Dreamy: Whimsical → Romance.
- PFM0209 Beautiful + Zazzly: Romance → Fleshy.
- PFM0911 Zazzly + Scary: Exploitation → Zazzploitation.
- Kawaii is retired from the active 66-theme matrix.
- Matrix identity/version remains 0.0.0.0.
- No Content Gate, provider, lifecycle, Queue, Bundle, Reaction formula, or layout behavior changes.
- Companion Worker: v0.9.6.158-theme-taxonomy-update.

## v0.9.40.207

- Corrects the visible page/build version to v0.9.40.207 after the .205/.206 display metadata was not advanced.
- No functional, layout, Worker, AI Safety, Theme, Reaction, or pipeline changes.


- Keeps the v0.9.40.203 2×3 AI/Dir W/L/C layout exactly in place; no reaction/header geometry is moved or expanded.
- Adds the first AI Content Gate pass using Cloudflare Workers AI `@cf/meta/llama-guard-3-8b` against the completed Genreactrix Description.
- AI ratings are intentionally binary in this first pass: XS when no matching axis hazard is flagged, XL when Llama Guard flags a matching axis hazard.
- W maps sex-related / child-sexual-exploitation / sexual-content flags; L maps violent-crime / self-harm flags; C maps non-violent-crime / defamation / hate / election flags.
- Tapping an AI W/L/C button opens the stored explanation for that axis.
- Director W/L/C remains independently editable with the full XS / S / M / L / XL scale and is never overwritten by AI.
- Content-gate failure is non-fatal: the normal Genreactrix analysis still completes and the AI rating remains unrated rather than defaulting to safe.
- Companion Worker is v0.9.6.158-theme-taxonomy-update.


This build preserves v0.9.40.203 behavior except for the bounded Content Gate additions above. The bundled Worker source is synchronized to standalone Worker v0.9.6.158-theme-taxonomy-update.

No Theme-selection, Description-generation, provider-order, Queue/lifecycle, Reaction, SLOP, taxonomy, or surrounding layout behavior is changed.

Companion Worker: v0.9.6.158-theme-taxonomy-update.

---

# Genreactrix v0.9.40.192 — ZazzlyParty

PFM0912 (Zazzly + Celebration) is now **ZazzlyParty**. **Hedonism is retired.**

ZazzlyParty means: sexy, provocative, sensual, revealing, flirtatious, or exhibitionistic presentation combined with celebration, partying, revelry, dancing, festive social energy, or a celebratory event. Both components must be visibly present: sexy or Zazzly presentation alone is not ZazzlyParty, and celebration alone is not ZazzlyParty.

PFM0912 keeps its stable code and P09 + P12 Prim identity. The 66-Theme taxonomy count, PrimFusion Matrix geometry/colors, Theme ordering, server orchestration, Description behavior, and Theme-derived Reactions are unchanged. Companion Worker: v0.9.6.142-zazzlyparty.

---

# Genreactrix v0.9.40.191 — Schadenfreude / Freakshow Theme remap

This taxonomy release keeps all 66 stable PFM codes and changes two current Theme identities. PFM0304 (Tragic + Funny) is now **Schadenfreude**, using the Director-supplied victim/observer, expression, context, and negative-sample definition. PFM0612 (Weird + Celebration) is now **Freakshow**, carrying forward the complete calibrated Freakshow definition and its existing public-nudity/transgression gate. **Delirious is retired.**

The PrimFusion Matrix geometry and colors are unchanged. Theme selection, audit, Description v5/rerun behavior, provider order, server-job orchestration, Theme-derived Reactions, and the manual Bundle boundary are unchanged. Companion Worker: v0.9.6.141-schadenfreude-freakshow-swap.

---

# Genreactrix v0.9.40.190 — server-backed AI reruns + full 66-Theme rerun vocabulary

This release moves Director Theme reruns and Description reruns onto the durable D1/R2/Queue server-job path when server jobs are available. The rerun request payload now carries the existing Theme Rerun / Description Rerun specification unchanged to the Worker; browser harvest preserves the same AI Attempt/Artifact history, Theme edit diagnostics, Description add/replace splice behavior, AI Tuned metadata, and Theme-rerun lifecycle isolation used by the prior local runner. The old browser runner remains fallback only when a job shape cannot be represented by one server request.

It also repairs the two stale fixed shuffled Theme-order catalogs that still contained only 63 Themes. Both now contain all 66 current PrimFusion Themes, including PFM0109 Cheeky, PFM0708 Cursed, and PFM1112 Halloween, while preserving the relative order of every pre-existing Theme. Worker startup now asserts that each fixed catalog contains every current Theme exactly once, preventing a future silent vocabulary omission.

No Theme definitions, provider order, Theme-derived Reaction architecture, Prim taxonomy, Theme Sweep semantics, or manual Bundle boundary changed. Companion Worker: v0.9.6.139-server-reruns-full66.

---

# Genreactrix v0.9.40.189 — automatic AI to manual Bundle boundary

This release removes routine manual intervention from the server-backed AI / Theme Sweep path while preserving Bundles as an intentional, trackable workflow boundary. A healthy run now automatically retries retryable AI failures until they resolve or reach the existing three-isolated-failure Quarantine boundary. Managed Theme Sweep runs then continue with the valid population, advance later passes automatically, and resume that recovery automatically when the site is reopened. Provider/configuration failures still pause because processing cannot safely continue, and user Pause/Stop remain authoritative.

Automatic AI flow now stops when the configured Bundle-size population is Staged. It never creates a Bundle or moves those images into Inbox automatically. `Bundle Staged` remains the deliberate action that creates a numbered Bundle and preserves membership/history. After that manual Bundle is created, automatic AI flow may resume filling the next Bundle. Legacy auto-bundle hooks are intentionally no-ops so there is no hidden path around the Bundle boundary.

No AI prompts, Theme definitions, provider order, Theme-derived Reaction architecture, taxonomy, or Theme Sweep selection logic changed in this site release. Worker v0.9.6.138 accompanies this site release so automatic retry can target only retryable failed server items and never requeue images already isolated to Quarantine/Defective. It preserves all v0.9.6.137 Glory/Freakshow/Description calibration behavior and changes no prompts, provider order, taxonomy, or Reaction architecture.

---

# Genreactrix v0.9.40.188 — pressure-first failsafe cleanup

This release changes Reset All → Failsafe Cleanup ordering so the browser sheds the heaviest live image workload first instead of following IndexedDB object-store/schema order. Immediately after authorization/resume, the failsafe removes the canonical Image Record / Inbox local product population, drops its in-memory Image Record and Danger Zone lists, revokes image object URLs, and rehydrates the live feed against zero records.

The `genreactrix-image-engine` database is forced to the front of the IndexedDB pass. Within it, stores are explicitly ordered: `image-thumbnails` → `image-blobs` → `kept-images` → `kept-image-ids` → flag metadata → `history-events`. Remaining product databases then continue through the existing one-store-per-committed-transaction checkpointed cleanup. Existing authorized v0.9.40.183–.187 checkpoints remain compatible; already committed stores are skipped.

Deletion scope, preservation boundaries, checkpoint authorization, pause/stop semantics, and committed-store-ledger finalization are unchanged. Worker remains v0.9.6.136 and does not require re-upload.

---

# Genreactrix v0.9.40.187 — committed-store ledger finalization

This release removes the redundant post-clear IndexedDB readback verification from Reset All → Failsafe Cleanup only. A store is considered complete only after its native `objectStore.clear()` transaction fires `oncomplete`; that committed transaction plus the saved completed-store checkpoint is the proof of deletion. After the last committed store clear, the failsafe checks only its checkpoint ledger and product-localStorage boundary, then advances directly to Complete without reopening every IndexedDB store or probing cursors.

Existing v0.9.40.186 authorized checkpoints remain valid and resume without password/phrase/acknowledgement. Fast cleanup and all non-failsafe cleanup paths keep their existing verification behavior. Worker remains v0.9.6.136 and does not require re-upload.

---

# Genreactrix v0.9.40.186 — store-at-a-time authorized failsafe recovery

This release replaces the 10-record cursor-delete loop with one native IndexedDB `objectStore.clear()` transaction per store. The failsafe checkpoints after every committed store, yields to the browser, and resumes from the first store not already checkpointed. It does not pre-count records, load values, or delete records one-by-one. Final verification remains a one-key probe per store.

Interrupted Reset All authorization is now carried by the saved failsafe checkpoint. When a valid Reset All failsafe checkpoint exists, reopening Danger Zone goes directly to the recovery confirmation screen and offers Resume cleanup without re-entering the Danger Zone password, confirmation phrase, or acknowledgement. A brand-new Reset All still requires the normal confirmation once. The authorization checkpoint is removed only after the final integrity check passes.

The Execute button is now hard-disabled while cleanup is running; confirmation-field changes can no longer visually re-enable it during an active transaction. Pause and Stop now act between committed store clears. Worker remains v0.9.6.136 and does not require re-upload.

---

# Genreactrix v0.9.40.185 — count-free progressive failsafe cleanup

This release removes the per-store `count()` bottleneck from Reset All → Failsafe Cleanup. It also stops pre-opening every product database before deletion begins. The failsafe now opens one existing database at a time, discovers that database's targeted stores, and immediately deletes up to 10 records per committed cursor transaction until a zero-record bite proves that store is empty.

Final Reset All verification is also count-free: it probes only the first key of each emptied store. Existing v0.9.40.183/.184 failsafe checkpoints remain readable; completed stores are skipped on resume. Fast cleanup and all non-Danger-Zone behavior are unchanged. Worker remains v0.9.6.136 and does not require re-upload.

- Reset All no longer performs the full IndexedDB impact inventory before Step 4. The Impact screen opens immediately from the already-loaded Image Record count and fixed full-reset scope.
- Detailed IndexedDB/store counts are intentionally deferred to Failsafe Cleanup instead of blocking before confirmation.
- Failsafe Cleanup no longer performs one complete all-store inventory before deletion. It counts one store when it reaches that store, deletes in the existing 10-record committed bites, checkpoints, yields, verifies that store empty, then advances.
- Progress reports store number/name, records remaining in the active store, and cumulative records removed. A legacy v0.9.40.183 checkpoint with a known global remaining count is still understood.
- Reset All review continues to skip thumbnail rendering. Fast cleanup remains available and unchanged.
- Preservation boundaries, selective cleanup paths, Worker/AI behavior, and the 10-record failsafe bite size are unchanged.
- Bundled Worker remains 0.9.6.136-cloudflare-typecheck-fix; no Worker upload is required.

# Genreactrix v0.9.40.183 — checkpointed Failsafe Cleanup

- Adds a separate Failsafe Cleanup method for Reset All Product Data.
- Failsafe deletes at most 10 IndexedDB records per committed transaction bite, then yields to the browser before continuing.
- A checkpoint is written after every bite. Pause, Resume, and Stop after current bite are supported; a browser close/reload can resume from the remaining persistent data after normal Danger Zone confirmation.
- Progress reports the active database/store, store number, records removed, and records remaining.
- Each store is count-verified when emptied; the existing final reset verification remains count-only.
- Existing v0.9.40.182 fast memory-safe Reset All remains available as the Fast cleanup option.
- Reset All no longer renders every image thumbnail on the review screen. Large resets show a lightweight selected-image summary instead, avoiding the multi-hour thumbnail preload observed with very large packs.
- Partial cleanup left by v0.9.40.181/.182 is safe input: already-empty stores are skipped and only remaining product data is removed.
- Preservation boundaries are unchanged.
- No Worker/AI behavior changes; bundled Worker remains 0.9.6.136-cloudflare-typecheck-fix.

# Genreactrix v0.9.40.182 — memory-safe Danger Zone reset

- Repairs Reset All Product Data after large browser-local runs.
- Full-reset impact counting now uses IndexedDB `count()` rather than loading complete stores into JavaScript memory.
- Full reset clears target stores directly, grouped by database, without reading rows first.
- Integrity verification is count-only; it never uses `getAll()` / `getAllKeys()` for full-reset verification.
- Cleanup yields between databases and reports visible clear/verify progress so mobile browsers can repaint.
- Full reset is idempotent: an interrupted partial reset can be run again safely to finish remaining product data.
- Preservation boundaries are unchanged: Customs, Prim/PrimFusion definitions, settings/credentials, code, report definitions/presets, storage configuration, and system history remain preserved.
- AI/server-job behavior is unchanged from v0.9.40.181.
- Bundled Worker synchronized to already-deployed 0.9.6.136-cloudflare-typecheck-fix; no new Worker behavior.

# Genreactrix v0.9.40.181 — durable server AI pass runner

- Adds an optional durable server-side AI job runner for normal full AI passes.
- Browser still owns canonical Image Records, artifact/history persistence, Director state, Theme Sweep evaluation, Bundling, and all interactive UI.
- When the Worker reports D1 + Queue + R2 bindings available, eligible full AI passes are handed off once and continue without the browser remaining foregrounded.
- The Worker Queue consumer reuses the existing `analyze()` pipeline unchanged; no prompt, provider-order, Theme, Description, audit, slop, or Theme-derived Reaction logic was replaced.
- Browser-local images are normalized to the existing 1280px JPEG transport copy, uploaded temporarily to R2, and removed after a successful harvest/cancel. Linked HTTPS images stay URL-backed.
- Server job state/results are durable in D1. Queue consumer concurrency is fixed at 1 for this first experiment, preserving the existing sequential image-job behavior.
- If the new server bindings are absent, Genreactrix automatically keeps using the existing browser-orchestrated path.
- Also fixes two pending matrix UI defects from v0.9.40.180: Cheeky uses the lavender region color, and the final right-axis box contains the Angry 🤬 Prim.
- Bundled Worker at the time of v0.9.40.181: 0.9.6.135-server-job-runner.

# Genreactrix v0.9.40.180 — final three PrimFusion Themes + matrix colors

- Fills all three remaining PrimFusion cells: PFM0109 Cheeky, PFM0708 Cursed, PFM1112 Halloween.
- Matrix now has 12 Prims / 66 assigned PrimFusion Themes / 0 OPEN cells.
- Restores and preserves the canonical lavender / peach / green-separator matrix palette.
- Prompt Diagnostics updated to 78 concepts / 6 batches (15, 15, 15, 15, 15, 3).
- Bundled Worker: 0.9.6.134-open-three-filled.

---

# Genreactrix v0.9.40.179 — Smart matrix/cache repair

## Matrix palette restoration
- Reasserts the established interlocked Matrix palette at final CSS precedence: very pale pastel lavender (`#d8c9e5`), very pale pastel peach (`#f2cba8`), green separator (`#a9dda5`), and Hot Magenta OPEN (`#ff00a8`).
- No matrix geometry, Theme placement, Prim numbering, or Worker behavior changed from v0.9.40.178.
- Bundled Worker remains v0.9.6.133.


- Replaces unsafe v0.9.40.177.
- Visible build number and all local asset cache-busters now use v0.9.40.179.
- Removes the 13 retired-Smart cells that incorrectly appeared as an OPEN far-right column in the interlocked matrix.
- Active interlocked matrix is 13 rows × 6 columns with only 3 legitimate OPEN pair slots.
- 12 active Prims; Celebration is P12; 63 assigned PrimFusion Themes.
- Prompt Diagnostics remains 75 concepts / 5 batches and its batch-track geometry now matches.
- Restores approved Goofy/Camp mapping in Worker and definitions: PFM0104 Goofy, PFM0204 Camp.
- No direct AI Reaction scan is reintroduced.

# Genreactrix v0.9.40.177 — P13 audit repair

- Follow-up verification release built from v0.9.40.176.
- No taxonomy semantics changed from v0.9.40.176: 12 Prims, 63 assigned PrimFusion Themes, 3 open pair slots.
- Repairs Prompt Diagnostics after Smart retirement: five complete 15-concept batches / 75 concepts total.
- Synchronizes live Prompt Diagnostics counts, progress, batch labels, report heading, and call-count descriptions.
- Retains intentional legacy P13→P12 migration handling for pre-retirement records.

---

# Genreactrix v0.9.40.176 — Smart retired / Celebration renumbered

- Retires P12 Smart completely.
- Moves Celebration from P13 to P12, following the same contiguous-active-ID policy used when Ticket was retired and Angry moved into P07.
- Retires Innocence, Elegant, and Gloomy.
- Moves Mundane to PFM0203 (Beautiful + Tragic), preserving the exact Mundane definition.
- Moves Glory to PFM0512 (Intense + Celebration), preserving the exact Glory definition.
- Recodes every surviving Celebration fusion from former PFMxx13 to current PFMxx12.
- Active taxonomy: 12 Prims, 63 assigned PrimFusion Themes, 3 open pair slots.
- No active Smart vocabulary remains. Historical release notes below are retained as history.

---

# Genreactrix v0.9.40.175 — Smart cleanup

Built from v0.9.40.174 with Worker 0.9.6.130-smart-cleanup.

Current taxonomy: **13 Prims / 66 assigned PrimFusion Themes / 12 OPEN pair slots**. Matrix identity remains **0.0.0.0**.

## v0.9.40.175

- PFM0608 🌀🌌: OPEN → Spirituality; prior PFM1113 👻🎉 Spirituality → OPEN.
- PFM0307 😭🤬: Shame → Overstimulated; prior PFM0512 💥🧠 Overstimulated → OPEN.
- PFM0310 😭🤢: Despair → Shame.
- PFM0305 😭💥: Devastating → Despair; Despair absorbs useful Devastating ruin/aftermath/loss coverage.
- PFM0412 🤣🧠: Witty → OPEN.
- PFM0405 🤣💥: Cringe → Hilarious, using the prior Witty definition unchanged.
- PFM0406 🤣🌀: Zany → Absurd.
- PFM0408 🤣🌌: Absurd → Medicated; prior PFM0812 🌌🧠 Medicated → OPEN.
- PFM1013 🤢🎉: OPEN → Excess; prior PFM1012 🤢🧠 Excess → OPEN.
- PFM1011 🤢👻: Macabre → Foreboding.
- PFM0311 😭👻: Foreboding → Paranoia; prior PFM1112 👻🧠 Paranoia → OPEN.
- Goofy absorbs useful Zany comic-eccentric coverage while retaining a gate against ordinary clutter, incidental awkwardness, and merely unusual appearance.
- Cringe, Witty, Devastating, Zany, and Macabre retire as standalone Theme names.
- Prompt Diagnostics updates to 79 concepts: 13 Prims + 66 assigned PrimFusion Themes.
- Existing Hot Magenta OPEN styling from v0.9.40.174 is preserved.
- Theme/Description provider routing, independent per-Theme audit, deterministic Theme-derived Reactions, Matrix geometry, and Matrix version remain unchanged.

## Final approved Matrix revision

- PFM0203 ✨😭: Melancholic → Gloomy (same definition)
- PFM0409 🤣🌶️: Ribaldry → Raunchy (same definition)
- PFM0205 ✨💥: Majestic → Epic; Epic definition absorbs Majestic + prior Epic coverage
- PFM0508 💥🌌: Epic → Ethereal
- PFM0812 🌌🧠: Ethereal → Medicated
- PFM0512 💥🧠: Medicated → Overstimulated
- PFM1012 🤢🧠: Greed → Excess; definition absorbs visible Greed + Indulgent coverage
- PFM1013 🤢🎉: Indulgent → OPEN
- PFM0610 🌀🤢: Mutant → Strange; definition absorbs Mutant + Alien + Bizarre + Surreal coverage
- PFM0608 🌀🌌: Surreal → OPEN
- PFM0612 🌀🧠: Alien → OPEN
- PFM0106 🧸🌀: Bizarre → Kawaii
- PFM0109 🧸🌶️: Kawaii → OPEN
- PFM0103 🧸😭: Pitiful → Poignant; definition absorbs Pitiful + prior Poignant coverage
- PFM0312 😭🧠: Poignant → Mundane
- PFM0712 🤬🧠: Mundane → OPEN
- PFM0513 💥🎉: Pride → OPEN
- PFM0912 🌶️🧠: Kinky → OPEN
- PFM0708 🤬🌌: remains OPEN

Together with the pre-existing PFM0708 vacancy, the active taxonomy is now 13 Prims, 70 assigned PrimFusion Themes, and 8 open pair slots. Matrix identity remains 0.0.0.0.

## Definition changes

- Gloomy keeps the former Melancholic definition unchanged.
- Raunchy keeps the former Ribaldry definition unchanged.
- Epic preserves the useful coverage of both prior Majestic and Epic.
- Overstimulated is a new still-image-grounded definition centered on visible sensory/informational/social overload.
- Excess is grounded in visible overabundance, accumulation, consumption, luxury, indulgence, or waste rather than invisible desire.
- Strange consolidates the visible territory of Mutant, Alien, Bizarre, and Surreal while using concrete anomalous/impossible/transformed cues.
- Poignant preserves both prior Poignant and Pitiful coverage.
- Kawaii, Ethereal, Medicated, and Mundane retain their current runtime definitions when moved.

## Dependent consistency updates

- Removed/open PFM codes are excluded from both fixed Theme-order arrays and AI Theme vocabulary.
- Prompt Diagnostics now reflects 83 total concepts: 13 Prims + 70 assigned PrimFusion Themes.
- Theme recovery examples no longer reference an open PFM code.
- The affected Matrix cells, Worker registry entries, bundled Worker source, and definition reference file are synchronized.
- No AI Theme/Description routing, provider-lane behavior, deterministic Theme-derived Reaction logic, or Matrix versioning semantics were changed.


## v0.9.40.174
- PrimFusion Matrix cells labeled `OPEN` now use the existing Hot Magenta reject shade `#ff00a8`.
- No taxonomy, definitions, matrix assignments, geometry, AI behavior, or Worker behavior changed.