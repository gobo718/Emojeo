# Reusable Engine Extraction — Pass 10

## Purpose
Introduce the first intentional directory boundary without turning the project into a folder hierarchy: reusable capability implementations move into `/engine/`; application identity, application meaning, entry points, deployment files, and preserved Genreactrix application definitions remain at the project root.

## Architectural rule
**Capability -> `/engine/`**

**Application meaning/configuration/integration -> root**

This is a detachment boundary, not a deletion boundary. Specialized Genreactrix-derived implementations remain valuable engine assets when they encode reusable behavior. A capability is not removed merely because Emojeo does not currently need it.

## Changes
- Created the single shallow `/engine/` directory.
- Moved reusable `*-engine.js` implementations into `/engine/`.
- Moved the previously selected reusable matrix/research UI companions into `/engine/`.
- Kept application-facing and compatibility files at root, including `genreactrix-application-definition.js`, `genreactrix-tag-compatibility.js`, `genreactrix-cloud-api.js`, `engine-profile.js`, `app.js`, HTML/CSS, deployment configuration, definitions, and documentation.
- Updated `index.html` script paths to the new engine locations while preserving query/version strings.
- Updated automated tests to resolve engine files from `/engine/` while continuing to resolve the Genreactrix application definition from root.
- No capability was deleted as part of this split.
- No Emojeo vocabulary or personalized Genreactrix instance data was introduced.

## Validation
- JavaScript syntax check: PASS for all JavaScript files.
- Automated tests: 5/5 PASS.
- Root HTML references to moved engine files: none remaining.
- Root file count after split: 35 files.
- `/engine/`: 64 files.

## Preservation rule
The engine is a growing capability library. Generalization may sit beside specialized implementations; it does not replace them. When future reuse is uncertain, preserve the implementation.
