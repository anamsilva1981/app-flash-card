import { signal } from "@angular/core";
import {
  accountSession,
  accountScope,
  SUPABASE_URL,
  PUBLIC_KEY,
} from "./account";
import { AccountPersistence } from "./data/persistence";
import { parseSnapshot, record } from "./data/validation";
import {
  EMPTY_SNAPSHOT,
  Operation,
  OperationInput,
  StudySnapshot,
} from "./models";
export const syncStatus = signal("sync.local");
const storage = () => new AccountPersistence(localStorage);
const drains = new Map<string, Promise<void>>();
const controllers = new Map<string, Set<AbortController>>();
const snapshots = new Map<
  string,
  { revision: number; promise: Promise<StudySnapshot> }
>();
export function cached<T>(key: string, fallback: T, scope = accountScope()): T {
  return storage().cached(scope, key, fallback);
}
export function cache(key: string, value: unknown) {
  storage().commit(accountScope(), { [key]: value }, [], false);
}
export function writeRevision() {
  return storage().revision(accountScope());
}
export function hasPending(scope = accountScope()) {
  return storage().pending(scope).length > 0;
}
function signedIn(scope: string) {
  return accountSession()?.user.id === scope;
}
function status(scope: string, text: string) {
  if (scope === accountScope()) syncStatus.set(text);
}
async function lock<T>(key: string, action: () => T | Promise<T>): Promise<T> {
  return typeof navigator !== "undefined" && navigator.locks
    ? navigator.locks.request(key, action)
    : action();
}
function invalidate(scope: string) {
  snapshots.delete(scope);
}
export type CacheReader = <T>(key: string, fallback: T) => T;
export async function commitTransaction(
  build: (read: CacheReader) => {
    patch: Record<string, unknown>;
    operations: OperationInput[];
  },
  scope = accountScope(),
  expectedRevision?: number,
) {
  await lock("study-storage:" + scope, () => {
    if (scope !== accountScope()) throw new Error("Account changed");
    if (
      expectedRevision !== undefined &&
      storage().revision(scope) !== expectedRevision
    )
      throw new Error("Stale account snapshot");
    const prepared = build((key, fallback) =>
      storage().cached(scope, key, fallback),
    );
    storage().commit(
      scope,
      prepared.patch,
      prepared.operations,
      signedIn(scope),
    );
  });
  invalidate(scope);
  status(scope, signedIn(scope) ? "sync.saving" : "sync.local");
  if (signedIn(scope) && hasPending(scope)) void flush();
}
export async function commitBatch(
  patch: Record<string, unknown>,
  operations: OperationInput[],
  scope = accountScope(),
  expectedRevision?: number,
) {
  return commitTransaction(
    () => ({ patch, operations }),
    scope,
    expectedRevision,
  );
}
export async function write(
  path: string,
  body: unknown,
  method = "POST",
  prefer = "resolution=merge-duplicates,return=minimal",
) {
  return commitBatch({}, [{ path, body, method, prefer }]);
}
async function request(
  scope: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const session = accountSession();
  if (scope !== accountScope() || session?.user.id !== scope)
    throw new Error("Account changed");
  const controller = new AbortController();
  const set = controllers.get(scope) || new Set<AbortController>();
  set.add(controller);
  controllers.set(scope, set);
  try {
    return await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: PUBLIC_KEY,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]),
    });
  } finally {
    set.delete(controller);
    if (!set.size) controllers.delete(scope);
  }
}
export async function readAccountSnapshot(): Promise<StudySnapshot> {
  const scope = accountScope();
  if (!signedIn(scope)) return structuredClone(EMPTY_SNAPSHOT);
  const revision = writeRevision();
  const existing = snapshots.get(scope);
  if (existing?.revision === revision) return existing.promise;
  const promise = (async () => {
    const response = await request(
      scope,
      `account_studies?select=data&user_id=eq.${encodeURIComponent(scope)}`,
    );
    if (!response.ok) throw new Error("Snapshot unavailable");
    const rows: unknown = await response.json();
    const row = Array.isArray(rows) ? rows[0] : rows;
    const data = row ? record(row)["data"] : EMPTY_SNAPSHOT;
    const snapshot = parseSnapshot(data ?? EMPTY_SNAPSHOT);
    if (scope !== accountScope() || revision !== writeRevision())
      throw new Error("Stale account snapshot");
    return snapshot;
  })();
  snapshots.set(scope, { revision, promise });
  try {
    return await promise;
  } catch (error) {
    if (snapshots.get(scope)?.promise === promise) snapshots.delete(scope);
    status(scope, navigator.onLine ? "sync.unavailable" : "sync.cached");
    throw error;
  }
}
export async function api(
  path: string,
  _options: RequestInit = {},
): Promise<Response> {
  const snapshot = await readAccountSnapshot();
  const field = path.startsWith("study_subjects")
    ? "subjects"
    : path.startsWith("study_queue")
      ? "queue"
      : path.startsWith("study_activity")
        ? "activity"
        : path.startsWith("seed_card_progress")
          ? "progress"
          : path.startsWith("account_cards")
            ? "cards"
            : "preferences";
  return new Response(JSON.stringify(snapshot[field]), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
async function send(scope: string, op: Operation) {
  const batch = op.path === "rpc/apply_account_batch";
  const response = await request(
    scope,
    batch ? "rpc/apply_account_batch" : "rpc/apply_account_operation",
    {
      method: "POST",
      body: JSON.stringify(
        batch
          ? { batch_id: op.id, operations: op.body }
          : {
              operation_id: op.id,
              path: op.path,
              payload: op.body,
              prefer: op.prefer || "",
            },
      ),
    },
  );
  if (!response.ok)
    throw new Error(`Sync operation rejected (${response.status})`);
}
async function drain(scope: string) {
  try {
    while (signedIn(scope) && scope === accountScope()) {
      const op = await lock(
        "study-storage:" + scope,
        () => storage().pending(scope)[0],
      );
      if (!op) break;
      await send(scope, op);
      if (scope !== accountScope()) return;
      await lock("study-storage:" + scope, () =>
        storage().remove(scope, op.id),
      );
    }
    invalidate(scope);
    status(scope, "sync.complete");
  } catch {
    status(scope, navigator.onLine ? "sync.pending" : "sync.offline");
  }
}
export function flush(): Promise<void> {
  const scope = accountScope();
  if (!signedIn(scope)) return Promise.resolve();
  const running = drains.get(scope);
  if (running) return running;
  const promise = lock("study-drain:" + scope, () => drain(scope)).finally(
    () => {
      drains.delete(scope);
    },
  );
  drains.set(scope, promise);
  return promise;
}
export function abortPreviousAccount() {
  for (const [scope, set] of controllers)
    if (scope !== accountScope()) {
      for (const controller of set) controller.abort();
      controllers.delete(scope);
      invalidate(scope);
    }
}
export function startSyncLifecycle(onStorage?: () => void): () => void {
  const online = () => {
    invalidate(accountScope());
    void flush();
  };
  const changed = () => {
    abortPreviousAccount();
    syncStatus.set("sync.local");
  };
  const crossTab = (event: StorageEvent) => {
    if (event.key === `study:${accountScope()}:state-v2`) {
      invalidate(accountScope());
      onStorage?.();
      void flush();
    }
  };
  window.addEventListener("online", online);
  window.addEventListener("study-scope-changed", changed);
  window.addEventListener("storage", crossTab);
  const timer = window.setInterval(() => {
    if (hasPending()) void flush();
  }, 30000);
  return () => {
    window.removeEventListener("online", online);
    window.removeEventListener("study-scope-changed", changed);
    window.removeEventListener("storage", crossTab);
    window.clearInterval(timer);
    for (const set of controllers.values()) for (const c of set) c.abort();
  };
}
