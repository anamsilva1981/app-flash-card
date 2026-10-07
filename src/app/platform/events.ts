import { Card } from "../models";
import { browserPlatform } from "./browser-platform";
export interface ApplicationEvents {
  "study-scope-changed": undefined;
  "study-account-exit": undefined;
  "study-account-ready": undefined;
  "study-profile-changed": undefined;
  "study-account-required": { type: "card"; card: Card };
}
export function publish<K extends keyof ApplicationEvents>(
  type: K,
  detail: ApplicationEvents[K],
) {
  browserPlatform.events.dispatchEvent(new CustomEvent(type, { detail }));
}
export function subscribe<K extends keyof ApplicationEvents>(
  type: K,
  action: (detail: ApplicationEvents[K]) => void,
): () => void {
  const listener = (event: Event) =>
    action((event as CustomEvent<ApplicationEvents[K]>).detail);
  browserPlatform.events.addEventListener(type, listener);
  return () => browserPlatform.events.removeEventListener(type, listener);
}
