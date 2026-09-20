# Reusable Engine Extraction — Pass 4

This pass extracts the specialized interlocked/landscape matrix presentation as a reusable engine component.

## Extracted
- `interlocked-matrix-ui.js`: generic four-axis interlocked matrix renderer.
- Configurable top/bottom/left/right axes.
- Arbitrary row/cell data.
- Generic tone classes, open-cell state, labels, IDs, and callbacks.
- Existing diagonal-cell presentation preserved as compatibility behavior.

## Compatibility boundary
Genreactrix still supplies its current symbols, Theme labels, Prim/PrimFusion lookup, and selection semantics from `app.js`. Those meanings are no longer responsibilities of the renderer.

## Deliberately unchanged
- No Emojeo data or behavior.
- No redesign of the proven landscape geometry.
- No broad file restructuring; architecture remains flat.
- No deletion of other potentially reusable Genreactrix systems.

## Verification
Changed JavaScript files pass `node --check`.
