import "./setup.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

test("recovery event wins over initial session and destroyed listeners cannot reopen it", async () => {
  globalThis.location = {
    search: "",
    pathname: "/",
    origin: "https://fixture.invalid",
  };
  let listener,
    finish,
    unsubscribed = false,
    destroy;
  globalThis.__fixtureAuth = {
    onAuthStateChange(cb) {
      listener = cb;
      return {
        data: {
          subscription: {
            unsubscribe() {
              unsubscribed = true;
            },
          },
        },
      };
    },
    getSession() {
      return new Promise((resolve) => (finish = resolve));
    },
  };
  globalThis.__fixtureDestroy = (callback) => {
    destroy = callback;
  };
  const result = await build({
    entryPoints: ["src/app/features/account/session/session.component.ts"],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    tsconfigRaw: { compilerOptions: { experimentalDecorators: true } },
    plugins: [
      {
        name: "auth-fixtures",
        setup(b) {
          b.onResolve(
            {
              filter:
                /^(@angular\/core|@angular\/forms|.*app\.component|.*app-icon\.component|.*core\/account|.*account-service|.*i18n\.service|.*language-switcher\.component|.*i18n\.pipe|.*core\/models|.*app-config\.generated)$/,
            },
            (args) => ({ path: args.path, namespace: "fixture" }),
          );
          b.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => {
            if (path === "@angular/core") {
              return {
                contents: `export const Component=()=>c=>c;export const DestroyRef='destroy';export const inject=key=>key==='destroy'?{onDestroy:globalThis.__fixtureDestroy}:key==='account'?{auth:globalThis.__fixtureAuth}:{t:key=>key};export const signal=x=>{const s=()=>x;s.set=v=>x=v;return s}`,
              };
            }
            if (path.includes("core/account")) {
              return {
                contents: `let scope='guest',session=null;export const accountScope=()=>scope;export const setScope=id=>scope=id;export const accountSession=()=>session;accountSession.set=v=>session=v;`,
              };
            }
            if (path.includes("account-service")) {
              return { contents: `export const AccountService='account';` };
            }
            if (path.includes("i18n.service")) {
              return { contents: `export const I18nService='i18n';` };
            }
            if (path.includes("app-config.generated")) {
              return {
                contents: `export const appConfig={supportUrl:'https://fixture.invalid'};`,
              };
            }
            const exportName = path.includes("@angular/forms")
              ? "FormsModule"
              : path.includes("app.component")
                ? "AppComponent"
                : path.includes("app-icon.component")
                  ? "AppIconComponent"
                  : path.includes("language-switcher.component")
                    ? "LanguageSwitcherComponent"
                    : path.includes("i18n.pipe")
                      ? "I18nPipe"
                      : "Card";
            return { contents: `export const ${exportName}={};` };
          });
        },
      },
    ],
  });
  const { SessionComponent } = await import(
    "data:text/javascript;base64," +
      Buffer.from(result.outputFiles[0].text).toString("base64")
  );
  const page = new SessionComponent();
  listener("PASSWORD_RECOVERY", { user: { id: "recovery" } });
  finish({ data: { session: { user: { id: "old" } } }, error: null });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(page.mode(), "password");
  assert.equal(page.ready(), false);
  destroy();
  assert.equal(unsubscribed, true);
  listener("SIGNED_IN", { user: { id: "late" } });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(page.ready(), false);
  const empty = new SessionComponent();
  listener("INITIAL_SESSION", null);
  assert.equal(empty.loading(), false);
  assert.equal(empty.ready(), false);
  finish({ data: { session: null }, error: null });
  await new Promise((resolve) => setImmediate(resolve));
  destroy();
  delete globalThis.__fixtureAuth;
  delete globalThis.__fixtureDestroy;
});

test("deletion CORS permits configured origins and rejects unknown ones before backend access", async () => {
  let handler;
  globalThis.Deno = {
    env: {
      get: (name) =>
        name === "APP_ALLOWED_ORIGINS"
          ? "https://app-test.invalid, https://preview-test.invalid"
          : undefined,
    },
    serve: (value) => (handler = value),
  };
  const result = await build({
    entryPoints: ["supabase/functions/delete-account/index.ts"],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    plugins: [
      {
        name: "edge-fixture",
        setup(b) {
          b.onResolve({ filter: /^npm:/ }, () => ({
            path: "client",
            namespace: "fixture",
          }));
          b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
            contents:
              'export const createClient=()=>{throw new Error("Backend should not be called")};',
          }));
        },
      },
    ],
  });
  await import(
    "data:text/javascript;base64," +
      Buffer.from(result.outputFiles[0].text).toString("base64")
  );
  const allowed = await handler(
    new Request("https://fixture.invalid", {
      method: "OPTIONS",
      headers: { Origin: "https://preview-test.invalid" },
    }),
  );
  assert.equal(allowed.status, 204);
  assert.equal(
    allowed.headers.get("Access-Control-Allow-Origin"),
    "https://preview-test.invalid",
  );
  const denied = await handler(
    new Request("https://fixture.invalid", {
      method: "OPTIONS",
      headers: { Origin: "https://unknown.invalid" },
    }),
  );
  assert.equal(denied.status, 403);
  assert.equal(
    (
      await handler(
        new Request("https://fixture.invalid", {
          method: "POST",
          headers: { Origin: "https://app-test.invalid" },
        }),
      )
    ).status,
    401,
  );
  delete globalThis.Deno;
});
