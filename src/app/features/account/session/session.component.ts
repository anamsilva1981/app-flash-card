import { AccountService } from "../../../core/data/account-service";
import { I18nService } from "../../../core/i18n.service";
import { Card } from "../../../core/models";
import { LanguageSwitcherComponent } from "../../../core/language-switcher.component";
import { I18nPipe } from "../../../core/i18n.pipe";
import { appConfig } from "../../../core/app-config.generated";
import { Component, signal, inject, DestroyRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "../../../app.component";
import { AppIconComponent } from "../../../shared/components/app-icon/app-icon.component";
import { accountSession, accountScope, setScope } from "../../../core/account";
@Component({
  selector: "app-session",
  standalone: true,
  imports: [
    I18nPipe,
    LanguageSwitcherComponent,
    FormsModule,
    AppComponent,
    AppIconComponent,
  ],
  templateUrl: "./session.component.html",
})
export class SessionComponent {
  private account = inject(AccountService);
  private destroyRef = inject(DestroyRef);
  readonly i18n = inject(I18nService);
  private destroyed = false;
  private authEpoch = 0;
  config = appConfig;
  readonly accountId = signal(accountScope());
  loading = signal(true);
  ready = signal(false);
  mode = signal<"login" | "signup" | "signup-success" | "reset" | "password">(
    "login",
  );
  email = "";
  password = "";
  name = "";
  accepted = false;
  busy = signal(false);
  message = signal("");
  notice = signal<{
    type: "success" | "error" | "info";
    title: string;
    text: string;
  } | null>(null);
  page = signal(new URLSearchParams(location.search).get("page") || "");
  constructor() {
    const required = (event: Event) => {
      const detail = (event as CustomEvent<{ type: string; card: Card }>)
        .detail;
      try {
        sessionStorage.setItem(
          "study-pending-action",
          JSON.stringify(detail || {}),
        );
      } catch {
        /* Saving continues through the account flow. */
      }
      this.showAccount("signup");
    };
    const exited = () => {
      this.ready.set(false);
      this.message.set("");
      this.password = "";
      localStorage.removeItem("study-guest-entered");
      setScope("guest");
    };
    window.addEventListener("study-account-required", required);
    window.addEventListener("study-account-exit", exited);
    const initialEpoch = this.authEpoch;
    const {
      data: { subscription },
    } = this.account.auth.onAuthStateChange((event, session) => {
      this.authEpoch++;
      accountSession.set(session);
      this.loading.set(false);
      if (event === "PASSWORD_RECOVERY") {
        this.mode.set("password");
        this.ready.set(false);
        this.loading.set(false);
        return;
      }
      if (event === "SIGNED_OUT") {
        exited();
        this.loading.set(false);
      }
      if (session) {
        const epoch = this.authEpoch;
        queueMicrotask(() => {
          if (
            !this.destroyed &&
            epoch === this.authEpoch &&
            this.mode() !== "password" &&
            this.mode() !== "signup-success"
          )
            this.enter(session.user.id);
        });
      }
    });
    void this.account.auth
      .getSession()
      .then(({ data, error }) => {
        if (this.destroyed || this.authEpoch !== initialEpoch) return;
        if (error) {
          this.loading.set(false);
          this.message.set(this.i18n.t("auth.connection"));
          return;
        }
        accountSession.set(data.session);
        this.loading.set(false);
        if (
          data.session &&
          this.mode() !== "password" &&
          this.mode() !== "signup-success"
        )
          this.enter(data.session.user.id);
      })
      .catch(() => {
        if (!this.destroyed) {
          this.loading.set(false);
          this.message.set(this.i18n.t("auth.connection"));
        }
      });
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      subscription.unsubscribe();
      window.removeEventListener("study-account-required", required);
      window.removeEventListener("study-account-exit", exited);
    });
  }
  enter(id: string) {
    const changed = id !== accountScope();
    if (changed && this.ready()) this.ready.set(false);
    setScope(id);
    this.accountId.set(id);
    this.loading.set(false);
    queueMicrotask(() => {
      if (this.destroyed || id !== accountScope()) return;
      this.ready.set(true);
      if (id !== "guest")
        window.dispatchEvent(new CustomEvent("study-account-ready"));
    });
  }
  showAccount(mode: "login" | "signup" = "signup") {
    this.ready.set(false);
    this.mode.set(mode);
    this.message.set("");
    this.notice.set(null);
    this.password = "";
  }
  switchMode(mode: "login" | "signup" | "reset") {
    this.mode.set(mode);
    this.message.set("");
    this.notice.set(null);
    this.password = "";
  }
  closeNotice() {
    const wasSignupSuccess = this.mode() === "signup-success";
    this.notice.set(null);
    if (wasSignupSuccess) this.switchMode("login");
  }
  passwordChecks() {
    const value = this.password;
    return {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
    };
  }
  passwordValid() {
    const checks = this.passwordChecks();
    return (
      checks.length &&
      checks.upper &&
      checks.lower &&
      checks.number &&
      checks.special
    );
  }
  passwordError() {
    return this.i18n.t("auth.passwordPolicy");
  }
  async submit() {
    if (this.busy()) return;
    this.message.set("");
    this.notice.set(null);
    this.busy.set(true);
    try {
      const redirect = new URL(location.pathname, location.origin).href;
      if (this.mode() === "signup") {
        if (!this.accepted || !this.name.trim())
          throw new Error(this.i18n.t("auth.namePrivacy"));
        if (!this.passwordValid()) throw new Error(this.passwordError());
        const { data, error } = await this.account.auth.signUp({
          email: this.email.trim(),
          password: this.password,
          options: {
            data: { display_name: this.name.trim() },
            emailRedirectTo: redirect,
          },
        });
        if (error) throw error;
        this.password = "";
        this.mode.set("signup-success");
        const text = data.session
          ? this.i18n.t("auth.created")
          : this.i18n.t("auth.confirmation", { email: this.email.trim() });
        this.message.set(text);
        this.notice.set({
          type: "success",
          title: this.i18n.t("auth.createdTitle"),
          text,
        });
      } else if (this.mode() === "reset") {
        const { error } = await this.account.auth.resetPasswordForEmail(
          this.email.trim(),
          { redirectTo: redirect },
        );
        if (error) throw error;
        const text = this.i18n.t("auth.resetSent");
        this.message.set(text);
        this.notice.set({
          type: "info",
          title: this.i18n.t("auth.checkEmail"),
          text,
        });
      } else if (this.mode() === "password") {
        if (!this.passwordValid()) throw new Error(this.passwordError());
        const { error } = await this.account.auth.updateUser({
          password: this.password,
        });
        if (error) throw error;
        this.password = "";
        this.enter(accountSession()!.user.id);
      } else {
        const { error } = await this.account.auth.signInWithPassword({
          email: this.email.trim(),
          password: this.password,
        });
        if (error) throw error;
        this.password = "";
      }
    } catch (error: unknown) {
      const failure =
        error && typeof error === "object"
          ? (error as { message?: string; code?: string; status?: number })
          : {};
      const text =
        failure?.message === "Invalid login credentials"
          ? this.i18n.t("auth.invalidCredentials")
          : failure?.message === "Email not confirmed"
            ? this.i18n.t("auth.unconfirmed")
            : failure?.code === "email_address_not_authorized"
              ? this.i18n.t("auth.emailBlocked")
              : failure?.code === "over_email_send_rate_limit" ||
                  failure?.status === 429
                ? this.i18n.t("auth.rateLimit")
                : failure?.message || this.i18n.t("auth.connection");
      this.message.set(text);
      this.notice.set({
        type: "error",
        title: this.i18n.t("auth.failureTitle"),
        text,
      });
    } finally {
      this.busy.set(false);
    }
  }
  beginDeletion() {
    localStorage.setItem("study-open-settings", "yes");
    this.closePage();
    if (!accountSession()) {
      this.ready.set(false);
      this.mode.set("login");
    }
  }
  closePage() {
    history.replaceState(null, "", location.pathname);
    this.page.set("");
  }
}
