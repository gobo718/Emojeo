# Reusable Engine Extraction — Pass 7

## Purpose
Continue the preservation-first detachment by separating **tag vocabulary/relationships** from **tag assignments/classification records**.

Genreactrix taught the engine more than “a Theme and a Reaction are tags.” It also taught it that tags can be applied with weights, confidence, evidence, provenance, status, and different decision sources. Those mechanics are reusable and should not be flattened away.

## Added
- `tag-assignment-engine.js`: product-neutral, unlimited tag assignments to arbitrary subjects.
- Multiple tag types can coexist on the same subject.
- Assignments preserve optional weight, confidence, source/provenance, evidence, status, and arbitrary metadata.
- The same subject/tag pair can coexist from independent sources instead of forcing one answer to overwrite another.
- Query helpers support subject-, tag-, source-, and status-oriented retrieval.
- Tag-assignment machinery is registered as part of the existing Tags capability rather than creating a Genreactrix-only replacement.

## Preserved
- Genreactrix Reactions and Themes remain specialized systems and remain represented as typed tags through the compatibility adapter.
- PrimFusion semantics, Theme composition, customization, AI logic, Director logic, SLOP logic, prompts, storage behavior, and existing workflows were not deleted or simplified.
- No Genreactrix vocabulary was removed.

## Instance-data boundary
No user classifications, image records, credentials, histories, or personalized data were copied into the assignment engine. It supplies the reusable mechanism; applications supply their records.

## Deliberately not done
- No Emojeo vocabulary or functionality.
- No forced migration of existing Genreactrix records into the generic assignment store.
- No replacement of specialized Genreactrix classification structures.
- No deletion of specialized code merely because a generic representation now exists beside it.
