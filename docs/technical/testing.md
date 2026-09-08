# Testing Standards

## Required Coverage

- Domain entities, value objects, services, and policies require unit tests.
- Application commands and queries require tests when they perform meaningful orchestration.
- Infrastructure tests are targeted at critical mappings, persistence behavior, and adapters with non-trivial logic.
- End-to-end tests cover externally observable API contracts and cross-module flows.

## Structure

Tests live outside `src/` and mirror the module and layer they cover:

```text
tests/
  modules/<module>/domain/
  modules/<module>/application/
  modules/<module>/infrastructure/
  systems/
  e2e/
```

Use Bun's test runner. Prefer fakes for application ports; use mocks only when verifying an interaction is the behavior under test.

## AI Rule

When creating or changing domain code, create or update its corresponding tests and run the relevant verification before considering the phase implemented.
