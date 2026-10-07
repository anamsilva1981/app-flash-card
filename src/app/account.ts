import { publish } from "./platform/events";
import { signal } from "@angular/core";
import { createClient, Session } from "@supabase/supabase-js";
import { appConfig } from "./app-config.generated";
import { browserPlatform } from "./platform/browser-platform";
export const SUPABASE_URL = appConfig.supabaseUrl;
export const PUBLIC_KEY = appConfig.supabasePublishableKey;
export const supabase = createClient(SUPABASE_URL, PUBLIC_KEY);
export const accountSession = signal<Session | null>(null);
let scope = "guest";
export function setScope(value: string) {
  scope = value;
  publish("study-scope-changed", undefined);
  browserPlatform.storage.setItem("study-active-scope", value);
}
export function accountScope() {
  return scope;
}
export function storageName(key: string) {
  return `study:${scope}:${key}`;
}
export const personalKeys = [
  "flashcards",
  "study-subject-config",
  "study-queue",
  "study-history",
  "study-pending-v1",
  "subject-routine-migrated",
];
export function clearAccountCache(targetScope = scope) {
  const prefix = `study:${targetScope}:`;
  for (let index = browserPlatform.storage.length - 1; index >= 0; index--) {
    const key = browserPlatform.storage.key(index);
    if (key?.startsWith(prefix)) browserPlatform.storage.removeItem(key);
  }
}
