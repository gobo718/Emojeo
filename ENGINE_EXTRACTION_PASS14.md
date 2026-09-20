# Reusable Engine Extraction — Pass 14

## Workspace / console capability extraction

Pass 14 adds an application-neutral workspace engine without replacing Genreactrix's specialized consoles.

### Added reusable capability
`engine/workspace-engine.js` provides:
- arbitrary subject/record loading
- draft editing, revert, and explicit commit
- arbitrary single/multi selection
- application-defined panels
- application-defined async actions
- workspace lifecycle/status events and subscriptions
- application metadata without imposing Genreactrix vocabulary

### Preserved specialized implementations
The existing Genreactrix Image Console, Director workspace/classification behavior, Investigation UI, AI workspaces, rerun workspaces, maintenance/research consoles, layout logic, and their accumulated application-specific behavior remain intact. They were not simplified into the generic workspace and were not deleted.

This is a reusable capability beside proven specialized implementations, not a replacement pass.

### Validation
- 20 automated tests pass (16 inherited + 4 workspace tests).
- JavaScript syntax validation passes.
- No Emojeo content or vocabulary added.
