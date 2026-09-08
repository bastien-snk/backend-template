# Backend Template

## Stack

- Runtime: Bun + TypeScript
- Runtimes: API, WebSocket, worker
- API: Elysia + OpenAPI
- Database: PostgreSQL + Drizzle
- Jobs: pg-boss
- Messaging: NATS
- Entry: `src/main.ts`

## Sources of truth

- `docs/technical/architecture.md` - architecture and dependency rules
- `docs/technical/module-structure-guide.md` - canonical module layout
- `docs/workflow/development.md` - epic and phase workflow

## Workflow

1. Create a product epic.
2. Design one implementation-ready phase.
3. Implement only a Ready phase, including required tests.
4. Review through an independent agent.
5. Apply accepted findings, rerun verification, then request user validation.

Ask the user whenever a product or architecture decision is ambiguous.

## Verification

```bash
bun test
bun run type-check
bun run lint
bun run format
```

## Template upgrades

Consumer repositories retain this repository as the `backend-template` remote.
Adopt only tagged template releases and review the resulting merge before applying it.
