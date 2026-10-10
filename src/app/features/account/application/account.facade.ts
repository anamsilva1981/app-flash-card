import { Injectable, inject, signal } from "@angular/core";
import { accountSession } from "../../../core/auth/account";
import { AccountService } from "../../../core/auth/account-service";
import { I18nService } from "../../../core/i18n/i18n.service";
import { cached, cache } from "../../../core/persistence/sync";
import { calendarReminder } from "../../../core/notifications/reminders";

@Injectable()
export class AccountFacade {
  private readonly account = inject(AccountService);
  readonly i18n = inject(I18nService);
  readonly session = accountSession;
  readonly name = cached(
    "display-name",
    String(accountSession()?.user.user_metadata["display_name"] || ""),
  );
  readonly time = cached("reminder-time", "20:00");
  readonly days = signal<number[]>(
    cached("reminder-days", [0, 1, 2, 3, 4, 5, 6]),
  );
  readonly notifications = signal(cached("browser-reminders", false));

  async saveName(): Promise<string> {
    try {
      const name = this.name.trim();
      await this.account.savePreferences(
        { display_name: name },
        { "display-name": name },
      );
      window.dispatchEvent(new Event("study-profile-changed"));
      return this.i18n.t("account.nameSaved");
    } catch {
      return this.i18n.t("error.save");
    }
  }

  async saveReminder(): Promise<string> {
    try {
      await this.account.savePreferences(
        { reminder_time: this.time, reminder_days: this.days() },
        { "reminder-time": this.time, "reminder-days": this.days() },
      );
      return "";
    } catch {
      return this.i18n.t("error.save");
    }
  }

  toggleDay(day: number) {
    this.days.update((value) =>
      value.includes(day)
        ? value.filter((current) => current !== day)
        : [...value, day],
    );
    return this.saveReminder();
  }

  exportCalendar() {
    const text = calendarReminder(this.time, this.days());
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/calendar;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "minha-rotina-de-estudos.ics";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return this.i18n.t("account.calendarExported");
  }

  async enableNotifications() {
    if (!("Notification" in window))
      return this.i18n.t("account.noNotifications");
    const enabled = (await Notification.requestPermission()) === "granted";
    cache("browser-reminders", enabled);
    this.notifications.set(enabled);
    return this.i18n.t(
      enabled ? "account.notificationsEnabled" : "account.notificationsDenied",
    );
  }

  disableNotifications() {
    cache("browser-reminders", false);
    this.notifications.set(false);
  }

  async logout() {
    try {
      await this.account.logout();
      return "";
    } catch {
      return this.i18n.t("account.logoutPending");
    }
  }

  async sendSupport(support: string) {
    if (support.trim().length < 10)
      return { message: this.i18n.t("account.supportRequired"), support };
    try {
      await this.account.support(support.trim());
      return { message: this.i18n.t("account.supportSent"), support: "" };
    } catch {
      return { message: this.i18n.t("account.supportFailed"), support };
    }
  }

  async deleteAccount(confirmation: string, password: string) {
    if (confirmation !== "EXCLUIR" || !password || !this.session()) return "";
    try {
      await this.account.deleteAccount(password);
      return "";
    } catch {
      return this.i18n.t("account.deleteFailed");
    }
  }
}
