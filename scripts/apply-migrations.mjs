import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const disableSignup = args.has("--disable-signup");

function fail(message) {
  console.error(`\n[db] ${message}\n`);
  process.exit(1);
}

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

const tokenFile = resolve(root, ".supabase-token");
const token =
  process.env.SUPABASE_ACCESS_TOKEN?.trim() ||
  (existsSync(tokenFile) ? readFileSync(tokenFile, "utf8").trim() : "");

if (!token) {
  fail(
    "Falta un Personal Access Token de Supabase. " +
      "Guárdalo en .supabase-token (ignorado por Git) o define SUPABASE_ACCESS_TOKEN."
  );
}

const prodEnv = loadEnvFile(resolve(root, ".env.prod"));
const localEnv = loadEnvFile(resolve(root, ".env.local"));
const supabaseUrl =
  prodEnv.NEXT_PUBLIC_SUPABASE_URL?.trim() || localEnv.NEXT_PUBLIC_SUPABASE_URL?.trim();

if (!supabaseUrl) {
  fail("No encontré NEXT_PUBLIC_SUPABASE_URL en .env.prod ni en .env.local.");
}

let ref;
try {
  ref = new URL(supabaseUrl).hostname.split(".")[0];
} catch {
  fail("NEXT_PUBLIC_SUPABASE_URL no es una URL válida.");
}

if (!/^[a-z0-9]{20}$/.test(ref)) {
  fail(`No pude derivar el project ref desde ${supabaseUrl}.`);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function request(path, options) {
  const response = await fetch(`https://api.supabase.com${path}`, {
    ...options,
    headers,
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const body = await response.text();
    fail(`${options.method ?? "GET"} ${path} respondió ${response.status}: ${body.slice(0, 500)}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

const migrationsDir = resolve(root, "supabase/migrations");
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (migrationFiles.length === 0) {
  fail("No hay migraciones en supabase/migrations.");
}

for (const file of migrationFiles) {
  const sql = readFileSync(resolve(migrationsDir, file), "utf8");
  await request(`/v1/projects/${ref}/database/query`, {
    method: "POST",
    body: JSON.stringify({ query: sql }),
  });
  console.log(`[db] ${file} aplicada.`);
}

if (disableSignup) {
  await request(`/v1/projects/${ref}/config/auth`, {
    method: "PATCH",
    body: JSON.stringify({ disable_signup: true }),
  });
  console.log("[db] Registro público desactivado.");
}

console.log(
  `[db] Listo. Proyecto ${ref}. ` +
    "Los secretos no se imprimen ni se guardan en el repositorio."
);
