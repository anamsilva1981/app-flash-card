import { Component, signal, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { appConfig } from "../../../core/config/app-config.generated";
import { AccountFacade } from "../application/account.facade";
import { I18nService } from "../../../core/i18n/i18n.service";
import { I18nPipe } from "../../../core/i18n/i18n.pipe";
import { studyTimeZone } from "../../../shared/utils/study-clock";
@Component({
  selector: "app-account-panel",
  standalone: true,
  imports: [FormsModule, I18nPipe],
  templateUrl: "./account-panel.component.html",
})
export class AccountPanelComponent {
  private facade = inject(AccountFacade);
  readonly i18n = inject(I18nService);
  readonly config = appConfig;
  readonly timeZone = studyTimeZone();
  readonly session = this.facade.session;
  readonly name = this.facade.name;
  readonly time = this.facade.time;
  readonly days = this.facade.days;
  readonly week = [0, 1, 2, 3, 4, 5, 6].map((day) => "week." + day);
  readonly message = signal("");
  readonly busy = signal(false);
  support = "";
  readonly deleteOpen = signal(false);
  confirmation = "";
  password = "";
  readonly notifications = this.facade.notifications;
  async saveName() {
    this.message.set(await this.facade.saveName());
  }
  async toggleDay(day: number) {
    this.message.set(await this.facade.toggleDay(day));
  }
  async saveReminder() {
    this.message.set(await this.facade.saveReminder());
  }
  async exportCalendar() {
    try {
      await this.saveReminder();
      this.message.set(this.facade.exportCalendar());
    } catch {
      this.message.set(this.i18n.t("account.calendarInvalid"));
    }
  }
  async enableNotifications() {
    this.message.set(await this.facade.enableNotifications());
  }
  disableNotifications() {
    this.facade.disableNotifications();
  }
  async logout() {
    this.message.set(await this.facade.logout());
  }
  exitGuest() {
    window.dispatchEvent(new Event("study-account-exit"));
  }
  async sendSupport() {
    if (this.support.trim().length < 10) {
      this.message.set(this.i18n.t("account.supportRequired"));
      return;
    }
    this.busy.set(true);
    try {
      const result = await this.facade.sendSupport(this.support);
      this.support = result.support;
      this.message.set(result.message);
    } finally {
      this.busy.set(false);
    }
  }
  async deleteAccount() {
    if (this.busy()) return;
    this.busy.set(true);
    const password = this.password;
    this.password = "";
    try {
      this.message.set(
        await this.facade.deleteAccount(this.confirmation, password),
      );
    } finally {
      this.busy.set(false);
    }
  }
}
