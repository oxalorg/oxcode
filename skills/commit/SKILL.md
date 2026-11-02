---
name: commit
description: Stage and commit the current work as one or more focused commits with short one-line messages. Use when the user asks to commit, save progress, or checkpoint work in git.
---

# Commit

1. Run `git status --short` and `git diff --stat` (plus `git diff --cached --stat`) to see what changed.
2. Never commit secrets: skip `.env*` (except `.env.example`), keys, credentials, large binaries, build output. If any are untracked and not ignored, tell the user instead of committing them.
3. Group changes into logical commits. Stage paths explicitly (`git add <paths>`); avoid `git add -A` unless every change belongs in the commit.
4. Message: one line, imperative mood, at most ~72 chars, no trailing period (e.g. `Fix token refresh race in auth client`). No body unless the user asks.
5. If on the default branch and the user asked for a PR or branch, create a branch first.
6. Commit, then show `git log --oneline -n <count>`. Never push unless asked.
