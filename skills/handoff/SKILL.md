---
name: handoff
description: Write a concise handoff note (HANDOFF.md) so another agent or person can continue the current task. Use when the user asks for a handoff, summary for later, or before ending a long session mid-task.
disable-model-invocation: true
---

# Handoff

Write `HANDOFF.md` in the repository root (overwrite if present) with these sections, terse and concrete:

- **Goal**: the task in one or two sentences, in the user's terms.
- **State**: what is done, with commit hashes or `file:line` references; what is uncommitted (`git status --short`).
- **Decisions**: choices made and why, including approaches tried and rejected.
- **Next steps**: an ordered list a fresh agent can start on immediately.
- **Verify**: exact commands to check the work (tests, typecheck, run).
- **Gotchas**: anything non-obvious discovered (env quirks, flaky tests, traps).

Do not include secrets. Tell the user the file path when done.
