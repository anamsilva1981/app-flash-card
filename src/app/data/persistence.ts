import { Operation, OperationInput } from "../models";
import {
  parseCards,
  parseSubjects,
  parseTopics,
  parseHistory,
  record,
} from "./validation";
function validateValue(key: string, value: unknown): unknown {
  switch (key) {
    case "flashcards":
      return parseCards(value);
    case "study-subject-config":
      return parseSubjects(value);
    case "study-queue":
      return parseTopics(value);
    case "study-history":
      return parseHistory(value);
    case "display-name":
    case "reminder-shown":
      if (typeof value !== "string") throw new Error("Invalid cached text");
      return value;
    case "reminder-time":
      if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))
        throw new Error("Invalid cached time");
      return value;
    case "reminder-days":
      if (
        !Array.isArray(value) ||
        !value.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)
      )
        throw new Error("Invalid cached days");
      return value;
    case "browser-reminders":
    case "onboarding-dismissed":
      if (typeof value !== "boolean") throw new Error("Invalid cached flag");
      return value;
    case "review-session-limit":
      if (
        !Number.isSafeInteger(value) ||
        Number(value) < 0 ||
        Number(value) > 1000
      )
        throw new Error("Invalid cached limit");
      return value;
    default:
      return value;
  }
}
function parseOperations(value: unknown): Operation[] {
  if (!Array.isArray(value)) throw new Error("Invalid replay queue");
  return value.map((item) => {
    const op = record(item);
    if (
      typeof op["id"] !== "string" ||
      !op["id"] ||
      typeof op["path"] !== "string" ||
      !op["path"] ||
      !Object.hasOwn(op, "body") ||
      (op["method"] !== undefined && typeof op["method"] !== "string") ||
      (op["prefer"] !== undefined && typeof op["prefer"] !== "string")
    )
      throw new Error("Invalid replay operation");
    return op as unknown as Operation;
  });
}
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
      const data = record(JSON.parse(raw));
      if (
        data["version"] !== 2 ||
        !Number.isSafeInteger(data["revision"]) ||
        Number(data["revision"]) < 0
      )
        throw new Error("Invalid account cache");
      return {
        version: 2,
        values: record(data["values"]),
        pending: parseOperations(data["pending"]),
        revision: Number(data["revision"]),
      };
    }
    return {
      version: 2,
      values: {},
      pending: parseOperations(
        JSON.parse(
          this.storage.getItem(`study:${scope}:study-pending-v1`) || "[]",
        ),
      ),
      revision: 0,
    };
  }
  cached<T>(scope: string, key: string, fallback: T): T {
    try {
      const state = this.read(scope);
      if (Object.hasOwn(state.values, key))
        return validateValue(key, state.values[key]) as T;
      return validateValue(
        key,
        JSON.parse(this.storage.getItem(`study:${scope}:${key}`) || "null") ??
          fallback,
      ) as T;
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
    for (const [key, value] of Object.entries(patch)) validateValue(key, value);
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
