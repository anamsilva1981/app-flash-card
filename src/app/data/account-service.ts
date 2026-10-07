import { publish } from "../platform/events";
import { Injectable } from "@angular/core";
import {
  accountScope,
  accountSession,
  clearAccountCache,
  PUBLIC_KEY,
  supabase,
  SUPABASE_URL,
} from "../account";
import { Preferences } from "../models";
import { commitBatch, flush, hasPending } from "../sync";
@Injectable({ providedIn: "root" })
export class AccountService {
  readonly auth = supabase.auth;
  async savePreferences(
    preferences: Preferences,
    patch: Record<string, unknown>,
  ) {
    await commitBatch(patch, [
      { path: "account_preferences", body: preferences },
    ]);
  }
  async logout() {
    const scope = accountScope();
    await flush();
    if (scope !== accountScope()) throw new Error("Account changed");
    if (hasPending(scope)) throw new Error("Pending sync");
    const { error } = await this.auth.signOut({ scope: "local" });
    if (error) throw error;
    publish("study-account-exit", undefined);
  }
  async support(message: string) {
    const scope = accountScope();
    const session = accountSession();
    if (session?.user.id !== scope) throw new Error("Authentication required");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/support_requests`, {
      method: "POST",
      headers: {
        apikey: PUBLIC_KEY,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: scope, message }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error("Support request failed");
    if (scope !== accountScope()) throw new Error("Account changed");
  }
  async deleteAccount(password: string) {
    const session = accountSession();
    if (!session?.user.email) throw new Error("Authentication required");
    const scope = accountScope();
    const { data: credentials, error: reauth } =
      await this.auth.signInWithPassword({
        email: session.user.email,
        password,
      });
    if (reauth) throw reauth;
    if (scope !== accountScope()) throw new Error("Account changed");
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/delete-account`,
      {
        method: "POST",
        headers: {
          apikey: PUBLIC_KEY,
          Authorization: `Bearer ${credentials.session!.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmation: "EXCLUIR" }),
        signal: AbortSignal.timeout(15000),
      },
    );
    const data: unknown = await response.json();
    if (
      !response.ok ||
      !data ||
      typeof data !== "object" ||
      !("deleted" in data) ||
      data.deleted !== true
    )
      throw new Error("Deletion not confirmed");
    clearAccountCache(scope);
    if (scope !== accountScope()) return;
    await this.auth.signOut({ scope: "local" });
    accountSession.set(null);
    publish("study-account-exit", undefined);
  }
}
