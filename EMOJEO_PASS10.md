# Emojeo Pass 10 — Multi-Domain Design Graph

Pass 10 establishes Emojeo as the MASHPEDITION design-intelligence workbench rather than an emoji-only analyzer.

## Boundary
- StringBoard Engine remains the reusable capability layer.
- Emojeo owns MASHPEDITION design meaning and connections.
- Emoji is the first mature Thing type, not Emojeo's permanent boundary.
- Mosaic is the second domain because Pass 9 can create human-approved canonical Mosaics.
- Future domains are registered as they are actually needed rather than hard-coded prematurely.

## Graph capability
`emojeo-design-graph.js` provides:
- extensible Thing-type registry;
- extensible typed relationship registry with optional endpoint constraints;
- arbitrary design Things in one graph;
- incoming/outgoing neighbor inspection;
- multi-hop traversal across domains;
- disconnected/orphan Thing discovery;
- snapshots suitable for persistence/export;
- bridges for official Emoji records and human-approved Mosaic records.

## Human / machine boundary
Machine-derived relationships default to advisory. A non-advisory/canonical connection requires explicit human approval. This preserves the same decision boundary established by discovery, vocabulary, clustering, and Mosaic review.

## First useful cross-domain chain
The graph can now represent chains such as:

Emoji → Mosaic → Gem → Setting

without making Gem or Setting fixed schemas yet. Those domains can be registered when their real MASHPEDITION requirements are introduced.
