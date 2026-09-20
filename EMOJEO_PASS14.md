# Emojeo Pass 14 — Progression & Dependency Analysis

Pass 14 makes the shared design graph analyzable as a progression network.

It adds read-only analysis for roots, endpoints, reachability, unreachable content, prerequisite chains, dependency cycles, and bottlenecks. Direction is semantic: `unlocks`, `awards`, `progresses`, and `contains` flow from source to result, while `requires` and `depends-on` are interpreted from prerequisite toward dependent content.

Advisory/machine-proposed relationships are excluded by default so speculative links cannot make broken progression look complete. They can be included explicitly for exploratory analysis.

This pass does not create MASHPEDITION canon, invent progression rules, or mutate the design graph.
