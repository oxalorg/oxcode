/**
 * oxcode safety rails for model-issued shell commands and file tools.
 *
 * - `rm` is blocked when `trash` is available: the model is told to use `trash`.
 * - Reading or printing secret files (.env, api keys, ssh keys) is blocked.
 * - History-destroying git commands ask for confirmation (blocked without a UI).
 *
 * Disable for one run with `--no-safety`.
 */
import { spawnSync } from "node:child_process";
import { basename } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

// `rm` as a command word: start of line or after ; & | ( ` $( and optional sudo/xargs.
const RM = /(^|[;&|(`]|\$\(|\bsudo\s+|\bxargs\s+(-\S+\s+)*)\s*rm(\s|$)/m;

// Commands that dump file contents.
const DUMPERS = /\b(cat|bat|less|more|head|tail|strings|xxd|od|base64|nl|tac)\b/;
const SECRET_FILE =
	/(^|[\s/'"=])(\.env(\.(?!example\b|sample\b|template\b)[\w.-]+)?|\.envrc|[\w.-]*api\.env|id_(rsa|ed25519|ecdsa)(?!\.pub)|\.netrc|\.pgpass|credentials(\.json)?|auth\.json)(?=$|[\s'";|&)])/;

const DESTRUCTIVE_GIT = [
	/\bgit\s+push\b.*\s(--force(?!-with-lease)|-f)\b/,
	/\bgit\s+reset\s+--hard\b/,
	/\bgit\s+clean\s+-\w*f/,
	/\bgit\s+checkout\s+(--\s+)?\.(\s|$)/,
	/\bgit\s+restore\s+(--\S+\s+)*\.(\s|$)/,
	/\bgit\s+branch\s+-D\b/,
	/\bgit\s+stash\s+(drop|clear)\b/,
];

function isSecretPath(path: string): boolean {
	return SECRET_FILE.test(` ${basename(path)} `) || SECRET_FILE.test(` ${path} `);
}

async function confirm(ctx: ExtensionContext, title: string, command: string) {
	if (!ctx.hasUI) return { block: true, reason: `${title}: blocked (no UI to confirm). Ask the user to run it.` };
	const ok = await ctx.ui.confirm(title, command);
	return ok ? undefined : { block: true, reason: `${title}: the user declined. Do not retry it; ask how to proceed.` };
}

export default function (pi: ExtensionAPI) {
	pi.registerFlag("no-safety", { description: "Disable oxcode safety rails for this run", type: "boolean" });

	let hasTrash: boolean | undefined;
	const trashAvailable = () =>
		(hasTrash ??= spawnSync("sh", ["-c", "command -v trash"], { stdio: "ignore" }).status === 0);

	pi.on("tool_call", async (event, ctx) => {
		if (pi.getFlag("no-safety")) return undefined;

		if (isToolCallEventType("bash", event)) {
			const cmd = event.input.command;

			if (RM.test(cmd) && trashAvailable()) {
				return {
					block: true,
					reason: "oxcode: `rm` is disabled. Use `trash <paths>` instead (recoverable). Run `trash --help` if unsure.",
				};
			}
			if (DUMPERS.test(cmd) && SECRET_FILE.test(` ${cmd} `)) {
				return {
					block: true,
					reason:
						"oxcode: printing secret files is blocked. List key NAMES only, e.g. grep -oE '^[A-Za-z_][A-Za-z0-9_]*=' .env",
				};
			}
			const git = DESTRUCTIVE_GIT.find((re) => re.test(cmd));
			if (git) return confirm(ctx, "Destructive git command", cmd);
			return undefined;
		}

		if (isToolCallEventType("read", event) && isSecretPath(event.input.path)) {
			return {
				block: true,
				reason: `oxcode: reading ${event.input.path} is blocked (secrets). Read the .example file or list key names only.`,
			};
		}
		return undefined;
	});
}
