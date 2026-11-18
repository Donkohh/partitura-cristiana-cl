import test from "node:test";
import assert from "node:assert/strict";
import {
  isAdminUser,
  normalizeEmail,
} from "../src/lib/auth/admin-policy.ts";
import {
  mapAuthError,
  safeAdminRedirect,
  safeInternalRedirect,
  validateLoginFields,
} from "../src/lib/auth/messages.ts";

test("solo permite al correo administrador confirmado", () => {
  const policy = { email: "Admin@Donko.cl" };

  assert.equal(
    isAdminUser(
      {
        email: "admin@donko.cl",
        emailConfirmedAt: "2026-01-01T00:00:00Z",
      },
      policy
    ),
    true
  );
  assert.equal(
    isAdminUser(
      { email: "admin@donko.cl", emailConfirmedAt: null },
      policy
    ),
    false
  );
  assert.equal(
    isAdminUser(
      { email: "otra@donko.cl", emailConfirmedAt: "2026-01-01T00:00:00Z" },
      policy
    ),
    false
  );
  assert.equal(isAdminUser(null, policy), false);
  assert.equal(normalizeEmail(" Admin@Donko.cl "), "admin@donko.cl");
});

test("valida campos de acceso", () => {
  assert.deepEqual(validateLoginFields({ email: "", password: "" }), {
    email: "Escribe tu correo.",
    password: "Escribe tu contraseña.",
  });
  assert.deepEqual(
    validateLoginFields({ email: "admin@donko.cl", password: "secreto" }),
    {}
  );
});

test("traduce errores de autenticación", () => {
  assert.match(mapAuthError("invalid_credentials"), /incorrectos/);
  assert.match(mapAuthError("sin_permiso"), /administradora/);
  assert.match(mapAuthError("desconocido"), /Inténtalo de nuevo/);
});

test("evita redirecciones externas", () => {
  assert.equal(safeInternalRedirect("/admin/partituras"), "/admin/partituras");
  assert.equal(safeInternalRedirect("https://evil.example"), undefined);
  assert.equal(safeInternalRedirect("//evil.example"), undefined);
  assert.equal(safeInternalRedirect("/\\evil.example"), undefined);

  assert.equal(safeAdminRedirect("/admin/carpetas"), "/admin/carpetas");
  assert.equal(safeAdminRedirect("/admin/login"), "/admin/partituras");
  assert.equal(safeAdminRedirect("/otra"), "/admin/partituras");
  assert.equal(safeAdminRedirect(null), "/admin/partituras");
});
