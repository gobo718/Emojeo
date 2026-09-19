# Reusable Engine Extraction — Pass 9

## Purpose
Formalize the detachment boundary: preserve Genreactrix's useful software and encoded know-how while separating reusable engine capability from application identity, vocabulary/configuration, namespaces, defaults, and personalized instance data.

## Added
- `application-definition-engine.js`: generic declarative application definitions.
- Definitions can provide identity, namespaces, capability choices, tag types/tags/relationships, defaults, compatibility metadata, and arbitrary metadata.
- Definitions are dormant until deliberately activated; activation can register an application's tag vocabulary into the generic tag engine.
- `genreactrix-application-definition.js`: preserves Genreactrix namespace/compatibility knowledge and its full specialized-capability profile as an optional definition.

## Preservation rule applied
- No specialized Genreactrix capability was deleted or simplified away.
- SLOP detection, Theme/Reaction handling, Director behavior, AI logic, research/publication, prediction, matrices, and other specialized implementations remain source assets.
- Existing `genreactrix-*` IndexedDB/localStorage/global/API contracts were NOT blindly renamed or migrated.
- Genreactrix-specific behavior may continue to exist as specialized reusable implementation even when it is not generic.

## Detachment rule applied
Application identity/configuration can now be supplied separately from the engine. The Genreactrix application definition explicitly contains no user records, images, credentials, histories, or analysis results.

## Validation
Added automated tests proving that arbitrary application definitions can supply their own namespace and tags, and that Genreactrix remains registered but inactive rather than becoming the engine's identity.

## Deliberately not done
- No Emojeo vocabulary or functionality.
- No destructive storage migration.
- No removal of Genreactrix-specific code merely because it is specialized.
- No personalized Genreactrix instance data added.
