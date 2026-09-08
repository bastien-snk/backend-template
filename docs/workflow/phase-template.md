# Phase [NN]: [Name]

**Status:** Draft

**Epic:** [Feature](../../feature.md)

## Objective

[One observable outcome delivered by this phase.]

## Scope

### Included

- [Included behavior]

### Excluded

- [Deferred behavior]

## Product Rules and Edge Cases

- [Rule or scenario]

## Technical Design

List only files created or modified by this phase. Use `[new]` or `[modified]` for every file. The tree is the implementation design: it must make ports, public contracts, integration events, and adapters explicit before implementation starts.

```text
src/modules/[module]/
├── domain/
│   └── entity/
│       └── [entity].ts                                      [new]
├── application/
│   ├── command/
│   │   └── [use-case].ts                                    [new]
│   └── port/
│       └── [repository].ts                                  [new]
├── api/
│   ├── contract.ts                                          [new]
│   └── facade.ts                                            [new]
└── infrastructure/
    └── adapter/
        └── outbound/
            └── persistence/drizzle/
                └── [repository].ts                         [new]
```

### Dependencies and Operations

- Manifest dependencies: [none or required/optional changes]
- Persistence or migration: [none or details]
- Architecture references: [links]

## Implementation Tasks

- [ ] [Task]

## Verification

- [ ] [Test or observable acceptance criterion]
- [ ] `bun test`
- [ ] `bun run type-check`
- [ ] `bun run lint`
- [ ] Migration generated and tested when a Drizzle schema changes

## Open Questions

- [Question that must be resolved before status becomes Ready]

## Deviations

- None.
