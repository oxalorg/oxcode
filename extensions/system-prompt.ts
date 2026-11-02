/**
 * oxcode system prompt: appends harness/APPEND_SYSTEM.md to pi's system prompt
 * on every run. Lives in an extension (not <agent-dir>/APPEND_SYSTEM.md) so it
 * applies both under the `oxcode` launcher and when installed into stock pi
 * with `pi install`, and so users keep their own APPEND_SYSTEM.md free.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const PROMPT_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "harness", "APPEND_SYSTEM.md");

export default function (pi: ExtensionAPI) {
	let prompt: string | undefined;

	pi.on("before_agent_start", async (event) => {
		prompt ??= readFileSync(PROMPT_FILE, "utf8").trim();
		if (!prompt || event.systemPrompt.includes("<oxcode>")) return undefined;
		return { systemPrompt: `${event.systemPrompt}\n\n<oxcode>\n${prompt}\n</oxcode>` };
	});
}
