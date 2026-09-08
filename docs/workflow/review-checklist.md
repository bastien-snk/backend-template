# Phase Review Checklist

## Scope

- [ ] The implementation matches the phase brief.
- [ ] No unrelated feature or refactor was introduced.
- [ ] Deviations are documented and approved where required.

## Product and Domain

- [ ] Product rules and edge cases are implemented.
- [ ] Domain invariants are protected.
- [ ] Domain code has corresponding tests.

## Architecture

- [ ] The implementation respects `docs/technical/architecture.md` 1:1.

## Verification

- [ ] Relevant tests pass.
- [ ] Type checking, linting, and formatting checks pass.
- [ ] Findings are reported by severity with file and line references.

The reviewer reports findings only. The implementer addresses accepted findings in a separate step.
