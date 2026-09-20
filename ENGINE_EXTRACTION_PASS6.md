# Reusable Engine Extraction — Pass 6

## Purpose
Detach classification meaning from fixed Genreactrix vocabularies without deleting Genreactrix knowledge.

## Added
- `tag-engine.js`: unlimited, typed tag vocabularies with arbitrary metadata.
- Generic relationships between tags, including `implies` and `composed-from`.
- Recursive implication lookup.
- `genreactrix-tag-compatibility.js`: additive adapter for exposing Genreactrix Reactions and Themes as typed tags while preserving their specialized implementations.
- `tags` capability in the engine capability registry/profile.

## Preservation rule applied
Reaction and Theme systems were **not** replaced, simplified, or deleted. Their existing code, storage behavior, customization, PrimFusion logic, prompts, SLOP handling, and workflows remain intact. The new tag layer sits beside them so future applications can use the same underlying idea with unlimited vocabularies and different rules.

## Instance-data boundary
This pass adds no user records, analysis results, imported images, credentials, or other personalized instance data to the generic tag engine. Applications supply vocabularies/data at runtime.

## Deliberately not done
- No Emojeo vocabulary or functionality.
- No migration of existing Genreactrix storage.
- No deletion of Genreactrix-specific taxonomy or compatibility behavior.
- No forced conversion of specialized code to generic code.
