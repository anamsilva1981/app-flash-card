import { appConfig } from "./app-config.generated";
import { signal } from "@angular/core";
import { createClient, Session } from "@supabase/supabase-js";
export const SUPABASE_URL = appConfig.supabaseUrl;
export const PUBLIC_KEY = appConfig.supabasePublishableKey;
export const supabase = createClient(SUPABASE_URL, PUBLIC_KEY);
export const accountSession = signal<Session | null>(null);
let scope = "guest";
export function setScope(value: string) {
  scope = value;
  window.dispatchEvent(new Event("study-scope-changed"));
  localStorage.setItem("study-active-scope", value);
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
  for (let index = localStorage.length - 1; index >= 0; index--) {
    const key = localStorage.key(index);
    if (key?.startsWith(prefix)) localStorage.removeItem(key);
  }
}
