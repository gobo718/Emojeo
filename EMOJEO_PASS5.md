# Emojeo Pass 5 — Open-Ended Discovery

Pass 5 establishes the first interpretive analysis layer without creating a vocabulary in advance.

## Added
- `emojeo-open-discovery.js`: provider-neutral open-discovery prompt contract, result schema, validation, runner adapter, and history-preserving attachment to Emoji Records.
- `emojeo-discovery-corpus.js`: lossless corpus for pooling raw observations across emoji.
- Five tests covering open-vocabulary prompting, provenance, non-tag semantics, run history, and lossless corpus pooling.

## Boundary
Raw observations are **analysis evidence, not canon and not StringBoard tag assignments**. Unicode taxonomy is supplied only as official context and the prompt explicitly prevents it from being echoed as a discovered trait. No synonyms are merged, no shared vocabulary is created, and no Mosaic candidates are inferred in this pass.

The next pass can run/accumulate discovery at scale and normalize the resulting corpus into a reviewable candidate vocabulary while preserving every raw observation underneath it.
