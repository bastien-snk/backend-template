---
name: phase-implement
description: Implement one Ready backend phase. Use only when the user explicitly requests phase implementation.
---

Read the workflow, `docs/technical/architecture.md`, `docs/technical/module-structure-guide.md`, `docs/technical/conventions.md` product epic, and phase brief. Confirm the phase is Ready. Implement only its scope, add required tests, run verification, update completed tasks, and record deviations.

If implementation reveals a conflict between the brief and the architecture, module structure rules, or applicable conventions, stop work on the conflicting point. Record the conflict and options in `Open Questions`, then ask the user for a decision. Do not resolve it implicitly in code. Stop at Implemented and request an independent review.
