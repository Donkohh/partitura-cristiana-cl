import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const uploadOnly = args.has("--upload");
const allowCustomDomain = args.has("--allow-custom-domain");

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

function fail(message) {
  console.error(`\n[deploy] ${message}\n`);
  process.exit(1);
}

const envFilesReadByOpenNext = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.development",
  ".env.development.local",
  ".env.test",
  ".env.test.local",
];

function findSecretKeys() {
  const found = [];
  for (const file of envFilesReadByOpenNext) {
    const values = loadEnvFile(resolve(root, file));
    for (const key of Object.keys(values)) {
      if (/(_SECRET|_PASSWORD|SERVICE_ROLE|^ADMIN_EMAIL$)/i.test(key)) {
        found.push(`${file}: ${key}`);
      }
    }
  }
  return found;
}

function assertBuildHasNoSecrets() {
  const nextEnvPath = resolve(root, ".open-next/cloudflare/next-env.mjs");
  if (!existsSync(nextEnvPath)) {
    fail("No se encontró .open-next/cloudflare/next-env.mjs tras el build.");
  }

  const content = readFileSync(nextEnvPath, "utf8");
  const hasOpaqueSecret = /sb_secret_[A-Za-z0-9_-]{12,}/.test(content);
  const jwtTokens = content.match(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g) ?? [];
  const hasServiceRoleJwt = jwtTokens.some((token) => {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString("utf8")
      );
      return payload?.role === "service_role";
    } catch {
      return false;
    }
  });

  if (hasOpaqueSecret || hasServiceRoleJwt) {
    rmSync(resolve(root, ".open-next"), { recursive: true, force: true });
    fail(
      "El build contiene un secreto en .open-next/cloudflare/next-env.mjs y fue eliminado. " +
        "Quita SUPABASE_SECRET_KEY de los archivos .env*; usa .dev.vars en local y secretos de Cloudflare en producción."
    );
  }
}

function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

const prodEnv = loadEnvFile(resolve(root, ".env.prod"));
for (const [key, value] of Object.entries(prodEnv)) {
  process.env[key] = value;
}

const prodSecretKeys = Object.keys(prodEnv).filter((key) =>
  /(_SECRET|_PASSWORD|SERVICE_ROLE)/i.test(key)
);
if (prodSecretKeys.length > 0) {
  fail(
    `No pongas secretos en .env.prod: ${prodSecretKeys.join(", ")}. ` +
      "Configúralos con `npx wrangler secret put NOMBRE`."
  );
}

const envSecretKeys = findSecretKeys();
if (envSecretKeys.length > 0) {
  fail(
    "Hay secretos o datos de administrador en archivos .env* que OpenNext incrustaría en el Worker:\n- " +
      envSecretKeys.join("\n- ") +
      "\nMuévelos a .dev.vars (local) y a secretos de Cloudflare (producción)."
  );
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const adminEmail = process.env.ADMIN_EMAIL?.trim();

const missing = [];
if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
if (!publishableKey) {
  missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY)");
}
if (!siteUrl) missing.push("NEXT_PUBLIC_SITE_URL");
if (!adminEmail) missing.push("ADMIN_EMAIL");

if (missing.length > 0) {
  fail(
    `Faltan variables en .env.prod:\n- ${missing.join("\n- ")}\n\nCopia .env.prod.example y complétalo.`
  );
}

let supabase;
let site;
try {
  supabase = new URL(supabaseUrl);
} catch {
  fail("NEXT_PUBLIC_SUPABASE_URL no es una URL válida.");
}
try {
  site = new URL(siteUrl);
} catch {
  fail("NEXT_PUBLIC_SITE_URL no es una URL válida.");
}

if (supabase.protocol !== "https:") {
  fail("NEXT_PUBLIC_SUPABASE_URL debe usar https.");
}
if (site.protocol !== "https:") {
  fail("NEXT_PUBLIC_SITE_URL debe usar https.");
}
if (site.pathname !== "/" || site.search || site.hash) {
  fail("NEXT_PUBLIC_SITE_URL debe ser solo el origen, sin ruta, query ni hash.");
}
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) {
  fail("ADMIN_EMAIL no parece un correo válido.");
}
if (!allowCustomDomain && !/^https:\/\/[^/]+\.workers\.dev$/i.test(site.origin)) {
  fail(
    "NEXT_PUBLIC_SITE_URL no es un dominio workers.dev. Usa --allow-custom-domain si es intencional."
  );
}
const devEnv = loadEnvFile(resolve(root, ".env.local"));
if (
  devEnv.NEXT_PUBLIC_SUPABASE_URL &&
  devEnv.NEXT_PUBLIC_SUPABASE_URL.trim() === supabaseUrl
) {
  fail(
    "La URL de Supabase de producción es igual a la de .env.local. Separa los entornos antes de desplegar."
  );
}

process.env.NEXT_PUBLIC_SUPABASE_URL = supabase.origin;
process.env.NEXT_PUBLIC_SITE_URL = site.origin;
process.env.ADMIN_EMAIL = adminEmail;

console.log(`[deploy] Supabase: ${supabase.origin}`);
console.log(`[deploy] Sitio: ${site.origin}`);
console.log(`[deploy] Admin: ${maskEmail(adminEmail)}`);
console.log("[deploy] Los secretos no se imprimen ni se leen desde el repositorio.");

if (dryRun) {
  console.log("[deploy] Validación correcta. No se compiló ni desplegó nada.");
  process.exit(0);
}

function spawn(command, commandArgs, capture) {
  return spawnSync(command, commandArgs, {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
    shell: process.platform === "win32",
  });
}

function run(command, commandArgs) {
  const result = spawn(command, commandArgs, false);
  if (result.error) fail(result.error.message);
  if (result.status !== 0) fail(`Falló: ${command} ${commandArgs.join(" ")}`);
}

const whoami = spawn("npx", ["wrangler", "whoami"], true);
if (whoami.error || whoami.status !== 0) {
  fail("Wrangler no está autenticado. Ejecuta `npx wrangler login` y vuelve a intentarlo.");
}

let secretNames = [];
const secrets = spawn("npx", ["wrangler", "secret", "list"], true);
if (!secrets.error && secrets.status === 0) {
  const output = `${secrets.stdout ?? ""}${secrets.stderr ?? ""}`;
  try {
    const start = output.indexOf("[");
    const parsed = start >= 0 ? JSON.parse(output.slice(start)) : [];
    secretNames = Array.isArray(parsed)
      ? parsed.map((item) => item?.name).filter(Boolean)
      : [];
  } catch {
    secretNames = [];
  }
}

const requiredSecrets = ["ADMIN_EMAIL", "SUPABASE_SECRET_KEY"];
const missingSecrets = requiredSecrets.filter((name) => !secretNames.includes(name));
if (missingSecrets.length > 0) {
  fail(
    `Faltan secretos en Cloudflare: ${missingSecrets.join(", ")}. Configúralos con \`npx wrangler secret put NOMBRE\`.`
  );
}

try {
  const response = await fetch(`${supabase.origin}/auth/v1/health`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    fail(
      `Supabase respondió ${response.status} en ${supabase.origin}. Revisa que el proyecto exista y esté activo.`
    );
  }
} catch {
  fail(
    `No pude contactar ${supabase.origin}. Revisa que el proyecto Supabase exista, no esté pausado y que la URL sea correcta.`
  );
}

if (!/^[A-Za-z0-9._-]+$/.test(publishableKey)) {
  fail("La clave publishable contiene caracteres no permitidos.");
}

const productionEnvPath = resolve(root, ".env.production.local");
process.on("exit", () => rmSync(productionEnvPath, { force: true }));

writeFileSync(
  productionEnvPath,
  [
    `NEXT_PUBLIC_SUPABASE_URL=${supabase.origin}`,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishableKey}`,
    `NEXT_PUBLIC_SITE_URL=${site.origin}`,
    "",
  ].join("\n"),
  "utf8"
);

delete process.env.SUPABASE_SECRET_KEY;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

run("npx", ["opennextjs-cloudflare", "build"]);
assertBuildHasNoSecrets();
run("npx", ["opennextjs-cloudflare", uploadOnly ? "upload" : "deploy"]);
