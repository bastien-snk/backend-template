---
name: phase-design
description: Design one backend phase until it is Ready. Use only when the user explicitly requests phase design.
---

Read `docs/workflow/development.md`, `docs/technical/architecture.md`, `docs/technical/module-structure-guide.md`, `docs/technical/conventions.md`, the epic, and `docs/workflow/phase-template.md`. Create or update the phase brief with the `[new]` and `[modified]` file tree, ports, public contracts, adapters, tests, and acceptance criteria.

Before marking a phase `Ready`, compare its technical design against `docs/technical/architecture.md`, `docs/technical/module-structure-guide.md`, and the applicable conventions they define. Verify dependency boundaries, the canonical file tree, public in-process API, HTTP boundary, persistence, dependencies, migrations, contracts, and required tests. If the brief conflicts with any of these rules or conventions, keep it `Draft`, record the conflict and options in `Open Questions`, and ask the user for a decision. Do not turn an architectural conflict into an implicit implementation decision. Ask the user about every blocking ambiguity. Do not implement production code.
