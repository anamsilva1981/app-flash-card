import { Operation, OperationInput } from "../models";
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
interface Envelope {
  version: 2;
  values: Record<string, unknown>;
  pending: Operation[];
  revision: number;
}
export class AccountPersistence {
  constructor(private storage: StoragePort) {}
  private key(scope: string) {
    return `study:${scope}:state-v2`;
  }
  private read(scope: string): Envelope {
    const raw = this.storage.getItem(this.key(scope));
    if (raw) {
      const data = JSON.parse(raw) as Envelope;
      if (data.version !== 2 || !data.values || !Array.isArray(data.pending))
        throw new Error("Invalid account cache");
      return data;
    }
    return {
      version: 2,
      values: {},
      pending: JSON.parse(
        this.storage.getItem(`study:${scope}:study-pending-v1`) || "[]",
      ) as Operation[],
      revision: 0,
    };
  }
  cached<T>(scope: string, key: string, fallback: T): T {
    try {
      const state = this.read(scope);
      if (Object.hasOwn(state.values, key)) return state.values[key] as T;
      return (
        (JSON.parse(
          this.storage.getItem(`study:${scope}:${key}`) || "null",
        ) as T) ?? fallback
      );
    } catch {
      return fallback;
    }
  }
  /** One durable write commits both study state and the replay queue. A quota failure changes neither. */
  commit(
    scope: string,
    patch: Record<string, unknown>,
    inputs: OperationInput[],
    signedIn: boolean,
  ): number {
    const state = this.read(scope);
    const added = signedIn
      ? inputs.map((op) => ({ ...op, id: crypto.randomUUID() }))
      : [];
    const next = {
      ...state,
      values: { ...state.values, ...patch },
      pending: [...state.pending, ...added],
      revision: state.revision + 1,
    };
    this.storage.setItem(this.key(scope), JSON.stringify(next));
    return next.revision;
  }
  pending(scope: string): Operation[] {
    return this.read(scope).pending;
  }
  remove(scope: string, id: string) {
    const state = this.read(scope);
    this.storage.setItem(
      this.key(scope),
      JSON.stringify({
        ...state,
        pending: state.pending.filter((op) => op.id !== id),
      }),
    );
  }
  revision(scope: string) {
    return this.read(scope).revision;
  }
}
