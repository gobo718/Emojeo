# Reusable Engine Extraction — Pass 15

## Search / filter / report / analysis capability extraction

Pass 15 adds application-neutral query, analysis, and report composition beside the preserved Genreactrix reporting and research systems.

### Added reusable capabilities
- `engine/query-engine.js`: arbitrary field filtering, application-defined predicates, text search, multi-sort, facets, and composed queries.
- `engine/analysis-engine.js`: distributions, numeric summaries, grouping, and arbitrary multi-value intersections.
- `engine/report-engine.js`: application-supplied report definitions that compose query + analysis with pluggable renderers.

These modules contain no Reaction, Theme, PrimFusion, image, Director, SLOP, or emoji vocabulary.

### Preserved specialized implementations
The existing Genreactrix analytics, reports, report definitions, prediction, correlation, consensus, validation, research dashboards/sessions, citation/evidence, finding library, recommendation, publication, SLOP-adjacent review signals, and specialized Director/AI comparisons remain intact. Their concrete heuristics, definitions, UI, persistence, and accumulated behavior were not replaced or deleted.

### Validation
- 23 automated tests pass (20 inherited + 3 query/analysis/report tests).
- JavaScript syntax validation passes.
- No Emojeo content or vocabulary added.
