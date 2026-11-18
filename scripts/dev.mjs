import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const devVarsPath = resolve(root, ".dev.vars");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};

  const values = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

if (!existsSync(devVarsPath)) {
  console.warn(
    "[dev] No existe .dev.vars. La biblioteca y el panel no podrán autenticarse contra Supabase."
  );
}

for (const [key, value] of Object.entries(loadEnvFile(devVarsPath))) {
  process.env[key] ??= value;
}

const nextBin = resolve(root, "node_modules/next/dist/bin/next");
if (!existsSync(nextBin)) {
  console.error("[dev] No se encontró Next.js. Ejecuta `npm install` primero.");
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, "dev"], {
  cwd: root,
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
