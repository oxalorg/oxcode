/**
 * oxcode branding: startup header, footer status, terminal title, /oxcode.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { VERSION as PI_VERSION } from "@earendil-works/pi-coding-agent";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION: string = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;

const LOGO = [
	"  ▄▀▀▄ ▀▄▀ ▄▀▀ ▄▀▀▄ █▀▄ █▀▀",
	"  ▀▄▄▀ ▄▀▄ ▀▄▄ ▀▄▄▀ █▄▀ ██▄",
];

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		if (ctx.mode !== "tui") return;
		const launcher = process.env.OXCODE === "1";

		ctx.ui.setTitle(`oxcode · ${ctx.cwd.split("/").pop()}`);
		ctx.ui.setStatus("oxcode", ctx.ui.theme.fg("accent", `ox ${VERSION}`));

		if (launcher) {
			ctx.ui.setHeader((_tui, theme) => ({
				render: () => [
					"",
					...LOGO.map((l) => theme.fg("accent", l)),
					theme.fg("dim", `  v${VERSION} · pi ${PI_VERSION} · /oxcode for help`),
					"",
				],
				invalidate() {},
			}));
		}
	});

	pi.registerCommand("oxcode", {
		description: "Show oxcode harness info",
		handler: async (_args, ctx) => {
			const lines = [
				`oxcode ${VERSION} on pi ${PI_VERSION}`,
				`agent dir: ${process.env.PI_CODING_AGENT_DIR ?? "~/.pi/agent"}`,
				`model:     ${ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "none"}`,
				"",
				"prompts:  /review  /plan  /fix-issue",
				"skills:   /skill:commit  /skill:handoff",
				"safety:   rm→trash, secret files blocked, destructive git confirmed (--no-safety to disable)",
			];
			ctx.ui.notify(lines.join("\n"), "info");
		},
	});
}
