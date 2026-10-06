import { Injectable } from "@angular/core";
import {
  supabase,
  accountScope,
  accountSession,
  clearAccountCache,
  SUPABASE_URL,
  PUBLIC_KEY,
} from "../account";
import { commitBatch, flush, hasPending } from "../sync";
import { Preferences } from "../models";
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
    await flush();
    if (hasPending()) throw new Error("Pending sync");
    const { error } = await this.auth.signOut({ scope: "local" });
    if (error) throw error;
    window.dispatchEvent(new Event("study-account-exit"));
  }
  async support(message: string) {
    const scope = accountScope();
    const { error } = await supabase
      .from("support_requests")
      .insert({ user_id: scope, message });
    if (error) throw error;
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
    window.dispatchEvent(new Event("study-account-exit"));
  }
}
