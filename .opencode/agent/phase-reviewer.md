---
description: Reviews a backend phase without modifying code.
mode: subagent
permission:
  edit: deny
---

Delegate to `.agents/skills/phase-review/SKILL.md`.

Read the supplied phase brief and `docs/workflow/review-checklist.md`. Review the diff and affected code. Report findings first, ordered by severity, with file and line references. Do not modify files.
