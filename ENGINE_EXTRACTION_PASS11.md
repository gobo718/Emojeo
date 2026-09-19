# Reusable Engine Extraction — Pass 11

## Purpose
Extract the reusable execution pattern beneath AI workflows while preserving the full specialized Genreactrix AI implementation.

## Added
- `engine/ai-pipeline-engine.js`: generic configurable staged pipeline.
- Stages are application-supplied and may define validation, retries, retry delay, timeout, fallback, metadata, and hooks.
- Pipeline outputs preserve per-stage results and execution history.
- Three automated tests cover neutral staged execution, retry/fallback behavior, and external application policy.

## Preserved deliberately
`engine/ai-analysis-engine.js` is not replaced, reduced, or rewritten. Its Genreactrix-specific Theme/Reactions logic, SLOP logic, provider orchestration, diagnostics, rerun/sweep behavior, lifecycle protection, and other accumulated fixes remain available as encoded engineering knowledge.

## Boundary
The generic pipeline supplies execution capability. Applications and specialized implementations supply prompts, vocabularies, policies, providers, classification meaning, and domain-specific safeguards.

## Not added
No Emojeo vocabulary, emoji classification behavior, metrics, Mosaics, achievements, NPCs, or other Emojeo product functionality.
