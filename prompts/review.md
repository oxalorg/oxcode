---
description: Review uncommitted changes (or a ref range) for bugs
argument-hint: "[git range or focus]"
---
Review the code changes in this repository. Scope: ${1:-the uncommitted working tree (`git diff HEAD` plus untracked files)}.

Focus on correctness: logic errors, unhandled edge cases, broken error handling, security issues, race conditions, and API misuse. Ignore pure style nits.

For each finding give `file:line`, a one-sentence description of the defect, and a concrete input or state that triggers it. Rank most severe first. If you find nothing worth reporting, say so plainly. Do not modify any files.
