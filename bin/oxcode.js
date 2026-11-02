#!/usr/bin/env node
// oxcode launcher: runs the stock pi CLI in-process with oxcode's own agent
// directory and the resources bundled in this package.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

// 1. Agent dir: ~/.oxcode/agent (override with OXCODE_HOME). Kept separate
//    from ~/.pi/agent so oxcode settings, sessions and auth never collide
//    with a plain pi install. pi reads PI_CODING_AGENT_DIR lazily.
const agentDir = process.env.OXCODE_HOME
	? resolve(process.env.OXCODE_HOME)
	: join(homedir(), ".oxcode", "agent");
process.env.PI_CODING_AGENT_DIR = agentDir;
process.env.OXCODE = "1";
process.env.OXCODE_VERSION = pkg.version;

// 2. First run: seed user-owned defaults (never overwrite existing files).
const seedDir = join(ROOT, "harness", "agent");
mkdirSync(agentDir, { recursive: true });
for (const name of readdirSync(seedDir)) {
	const dest = join(agentDir, name);
	if (!existsSync(dest)) cpSync(join(seedDir, name), dest, { recursive: true });
}

// 3. Locate the pi CLI entry (peer dependency).
let piIndex;
try {
	piIndex = fileURLToPath(import.meta.resolve("@earendil-works/pi-coding-agent"));
} catch {
	console.error("oxcode: @earendil-works/pi-coding-agent is not installed.\n  npm i -g oxcode @earendil-works/pi-coding-agent");
	process.exit(1);
}
const piRoot = resolve(dirname(piIndex), "..");
const piPkg = JSON.parse(readFileSync(join(piRoot, "package.json"), "utf8"));
const piCli = join(piRoot, piPkg.bin.pi);

// 4. Build argv. pi subcommands (install, config, ...) take no resource flags.
const SUBCOMMANDS = new Set(["install", "remove", "uninstall", "update", "list", "config", "auth", "mcp"]);
const userArgs = process.argv.slice(2);
const first = userArgs[0];

if (first === "--version" || first === "-v") {
	console.log(`oxcode ${pkg.version} (pi ${piPkg.version})`);
	process.exit(0);
}
if (first === "--oxcode-doctor") {
	console.log(`oxcode ${pkg.version}\n  package:   ${ROOT}\n  pi:        ${piPkg.version} (${piRoot})\n  agent dir: ${agentDir}`);
	process.exit(0);
}
if (first === "update" && (userArgs[1] === "self" || userArgs[1] === "pi")) {
	console.log("oxcode: update the harness (and its pi) with:\n  npm i -g oxcode@latest");
	process.exit(0);
}

const harnessArgs = SUBCOMMANDS.has(first)
	? []
	: ["--extension", ROOT]; // loads the whole package via its `pi` manifest

process.argv = [process.argv[0], piCli, ...harnessArgs, ...userArgs];
await import(pathToFileURL(piCli).href);
