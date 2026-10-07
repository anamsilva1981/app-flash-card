import { publish } from "./platform/events";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { accountSession } from "./account";
import { appConfig } from "./app-config.generated";
import { AccountService } from "./data/account-service";
import { I18nPipe } from "./i18n.pipe";
import { I18nService } from "./i18n.service";
import { browserPlatform } from "./platform/browser-platform";
import { calendarReminder } from "./reminders";
import { studyTimeZone } from "./study-clock";
import { cache, cached } from "./sync";
@Component({
  selector: "app-account-panel",
  standalone: true,
  imports: [FormsModule, I18nPipe],
  templateUrl: "./account-panel.component.html",
})
export class AccountPanelComponent {
  private account = inject(AccountService);
  readonly i18n = inject(I18nService);
  readonly config = appConfig;
  readonly timeZone = studyTimeZone();
  readonly session = accountSession;
  name = cached(
    "display-name",
    String(accountSession()?.user.user_metadata["display_name"] || ""),
  );
  time = cached("reminder-time", "20:00");
  readonly days = signal<number[]>(
    cached("reminder-days", [0, 1, 2, 3, 4, 5, 6]),
  );
  readonly week = [0, 1, 2, 3, 4, 5, 6].map((d) => "week." + d);
  readonly message = signal("");
  readonly busy = signal(false);
  support = "";
  readonly deleteOpen = signal(false);
  confirmation = "";
  password = "";
  readonly notifications = signal(cached("browser-reminders", false));
  async saveName() {
    try {
      await this.account.savePreferences(
        { display_name: this.name.trim() },
        { "display-name": this.name.trim() },
      );
      this.message.set(this.i18n.t("account.nameSaved"));
      publish("study-profile-changed", undefined);
    } catch {
      this.message.set(this.i18n.t("error.save"));
    }
  }
  async toggleDay(day: number) {
    this.days.update((v) =>
      v.includes(day) ? v.filter((x) => x !== day) : [...v, day],
    );
    await this.saveReminder();
  }
  async saveReminder() {
    try {
      await this.account.savePreferences(
        { reminder_time: this.time, reminder_days: this.days() },
        { "reminder-time": this.time, "reminder-days": this.days() },
      );
    } catch {
      this.message.set(this.i18n.t("error.save"));
    }
  }
  async exportCalendar() {
    try {
      await this.saveReminder();
      const text = calendarReminder(this.time, this.days());
      browserPlatform.saveText(
        "minha-rotina-de-estudos.ics",
        text,
        "text/calendar;charset=utf-8",
      );
      this.message.set(this.i18n.t("account.calendarExported"));
    } catch {
      this.message.set(this.i18n.t("account.calendarInvalid"));
    }
  }
  async enableNotifications() {
    if (!browserPlatform.notificationsAvailable()) {
      this.message.set(this.i18n.t("account.noNotifications"));
      return;
    }
    const enabled = await browserPlatform.requestPermission();
    cache("browser-reminders", enabled);
    this.notifications.set(enabled);
    this.message.set(
      this.i18n.t(
        enabled
          ? "account.notificationsEnabled"
          : "account.notificationsDenied",
      ),
    );
  }
  disableNotifications() {
    cache("browser-reminders", false);
    this.notifications.set(false);
  }
  async logout() {
    try {
      await this.account.logout();
    } catch {
      this.message.set(this.i18n.t("account.logoutPending"));
    }
  }
  exitGuest() {
    publish("study-account-exit", undefined);
  }
  async sendSupport() {
    if (this.support.trim().length < 10) {
      this.message.set(this.i18n.t("account.supportRequired"));
      return;
    }
    this.busy.set(true);
    try {
      await this.account.support(this.support.trim());
      this.support = "";
      this.message.set(this.i18n.t("account.supportSent"));
    } catch {
      this.message.set(this.i18n.t("account.supportFailed"));
    } finally {
      this.busy.set(false);
    }
  }
  async deleteAccount() {
    if (
      this.confirmation !== "EXCLUIR" ||
      !this.password ||
      !this.session() ||
      this.busy()
    )
      return;
    this.busy.set(true);
    const password = this.password;
    this.password = "";
    try {
      await this.account.deleteAccount(password);
    } catch {
      this.message.set(this.i18n.t("account.deleteFailed"));
    } finally {
      this.busy.set(false);
    }
  }
}
