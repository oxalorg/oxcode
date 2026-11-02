---
description: Fix a GitHub issue end to end on a branch
argument-hint: "<issue number or URL>"
---
Fix GitHub issue $1.

1. Read it with `gh issue view $1 --comments`.
2. Reproduce or locate the cause in the code; explain it in one or two sentences.
3. Create a branch `fix/<issue-number>-<slug>`, implement the smallest correct fix, and add or update a test that fails without it.
4. Run the project's checks and report the results.
5. Commit with a one-line message referencing the issue. Do not push or open a PR unless I ask.
