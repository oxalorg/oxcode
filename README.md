# oxcode

An opinionated coding-agent harness built on [pi](https://pi.dev). It ships as one npm package that works two ways:

1. **Standalone harness**: the `oxcode` command runs pi with its own config dir (`~/.oxcode/agent`), branding, defaults, and everything below preloaded.
2. **pi package**: `pi install` it into a normal pi setup to get the same extensions, skills, prompts and theme.

## Install

```bash
# Standalone harness (pi is pulled in as a peer dependency)
npm i -g oxcode            # or: npm i -g git+https://github.com/<you>/oxcode
oxcode

# Or add to an existing pi
pi install npm:oxcode      # or: pi install git:github.com/<you>/oxcode
```

Log in once inside oxcode with `/login`, or set a provider key in the environment (`ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, ...). oxcode keeps its own `auth.json`, sessions and settings in `~/.oxcode/agent`, separate from `~/.pi/agent`. Set `OXCODE_HOME` to move it.

## What's inside

| Path | What it does |
|---|---|
| `bin/oxcode.js` | Launcher. Points pi at `~/.oxcode/agent`, seeds default settings on first run, loads this package with `-e`, then runs the stock pi CLI in-process. |
| `harness/APPEND_SYSTEM.md` | House rules appended to the system prompt (via `extensions/system-prompt.ts`). |
| `harness/agent/settings.json` | Defaults copied into a new agent dir: oxcode theme, high thinking, grep/find/ls tools on, telemetry off. Never overwrites an existing file. |
| `extensions/safety.ts` | Blocks `rm` (use `trash`), blocks reading or printing `.env` and other secret files, asks before force-push, `reset --hard`, `clean -f`, etc. `--no-safety` turns it off for a run. |
| `extensions/branding.ts` | Startup logo, footer badge, terminal title, `/oxcode` info command. |
| `prompts/` | `/review`, `/plan <task>`, `/fix-issue <n>`. |
| `skills/` | `commit` (model-invoked), `handoff` (`/skill:handoff` only). |
| `themes/oxcode.json` | Amber/teal theme based on pi's dark theme. |

## Launcher commands

```bash
oxcode                     # interactive
oxcode -p "explain src/"   # print mode; every pi flag works
oxcode --version           # oxcode + pi versions
oxcode --oxcode-doctor     # paths: package, pi, agent dir
oxcode install npm:foo     # pi subcommands work too, scoped to ~/.oxcode/agent
```

`oxcode update self` prints the upgrade command (`npm i -g oxcode@latest`), since pi is pinned by the harness.

## Customize

- Rules for the model: edit `harness/APPEND_SYSTEM.md`.
- Defaults for new users: edit `harness/agent/settings.json` (existing users keep theirs).
- New extension, prompt, skill or theme: drop it in the matching folder. The `pi` field in `package.json` picks it up.
- Pin a different pi: change the `@earendil-works/pi-coding-agent` peer range.

## Develop

```bash
pnpm install
pnpm check                                       # typecheck extensions
OXCODE_HOME=$PWD/.oxcode-test pnpm start         # run against a throwaway agent dir
npm pack                                         # inspect what ships
```

Extensions are TypeScript loaded by pi through jiti, so there is no build step. Reference: pi docs in `node_modules/@earendil-works/pi-coding-agent/docs/` (start with `packages.md`, `extensions.md`, `sdk.md`).

Note: pi print mode (`-p`) reads stdin when it is a pipe. In scripts with an open stdin, add `</dev/null` or the run waits forever.
