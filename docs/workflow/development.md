# Development Workflow

## Purpose

Virtosia develops major features through product epics and validated implementation phases. The workflow separates product intent from technical design so that code is written only when the current phase is ready to implement.

## Artifacts

| Artifact | Location | Purpose |
|---|---|---|
| Product epic | `docs/epics/<feature>.md` | Product outcome, rules, scope, and phase roadmap |
| Phase brief | `docs/epics/<feature>/phases/<nn>-<name>.md` | Implementation-ready design for one phase |
| Architecture | `docs/technical/architecture.md` | Shared technical rules and module boundaries |
| Product design | `docs/product/` | Game-wide product source of truth |

An epic must not duplicate the project architecture. It links to architecture and records only feature-specific product decisions. A phase brief contains the technical decisions required for that phase.

## Lifecycle

```text
Product epic
  -> Phase draft
  -> Phase ready
  -> Implementation
  -> Review
  -> Corrections and verification
  -> User validation
  -> Next phase or epic closure
```

### Product Epic

Create or update a product epic before starting a major feature. It defines the player outcome, goals, non-goals, rules, scenarios, and a high-level phase roadmap. Use [Epic Template](./epic-template.md).

### Phase Design

Design only the next phase in detail. A phase is `Ready` when its scope, business rules, technical decisions, dependencies, tests, and acceptance criteria are unambiguous. Use [Phase Template](./phase-template.md).

If a product or architecture decision is ambiguous, stop and ask the user. Do not resolve it implicitly in code.

### Implementation

Implement one ready phase at a time. Read the product epic and current phase brief before changing code. Stay within the brief's scope. Record intentional deviations in the phase brief.

Update task checkboxes only after the associated work and verification are complete.

### Review and Validation

Review is separate from implementation. The reviewer reports findings and does not modify the code. Apply accepted corrections, rerun verification, then ask the user to validate the phase. Do not start the next phase before validation unless the user explicitly delegates that decision.

Use [Review Checklist](./review-checklist.md).

## Required Verification

For a completed phase, run the checks applicable to its changes:

```bash
bun test
bun run type-check
bun run lint
```

Run `bun run format` when closing an epic or when the phase explicitly requires full verification. Run database migration checks when a schema changes.

## Phase States

| State | Meaning |
|---|---|
| `Draft` | Product or technical questions remain |
| `Ready` | Approved and unambiguous enough to implement |
| `In progress` | Implementation is underway |
| `Implemented` | Scope is implemented and self-verified |
| `In review` | Findings are being assessed |
| `Reviewed` | Findings are addressed and checks pass |
| `Validated` | User approved completion |
