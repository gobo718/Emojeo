# Reusable Engine Extraction — Pass 5

## Preservation-first capability pass

This pass deliberately does **not** delete or flatten specialized Genreactrix knowledge.

### Added
- `capability-registry.js`: a flat capability inventory separating **availability in the engine** from **visibility in an application profile**.
- Explicit preservation entries for the specialized Theme, Reaction, Director, Theme Sweep/adversarial review, and SLOP implementations, alongside generic/reusable systems.
- Application-profile capability switches. A false switch means *dormant for that profile*, not removed.

### Preserved intact
- SLOP-specific assessment logic, Director review/disposition behavior, labels, UI and metadata handling.
- Theme and Reaction classification/customization machinery.
- Theme sweep/adversarial review machinery.
- AI analysis and artifact machinery.
- Research, publication, prediction, consensus and other specialized modules even when dormant in the extraction profile.

### Rule established
A specialized implementation is itself reusable engineering knowledge. Generalization may be added beside it; it is not a replacement or justification for deletion.

No Emojeo product functionality was added in this pass.
