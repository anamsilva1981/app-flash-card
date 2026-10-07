import { Injectable, DestroyRef, inject } from "@angular/core";
import { cached, cache } from "../sync";
import { studyDate, studyTimeZone } from "../domain/time/study-clock";
import { shouldShowReminder } from "../reminder-policy";
import { I18nService } from "../i18n.service";

@Injectable()
export class ReminderService {
  private destroyRef = inject(DestroyRef);
  private i18n = inject(I18nService);
  private started = false;
  start(onClick: () => void) {
    if (this.started) return;
    this.started = true;
    const timer = window.setInterval(() => this.check(onClick), 30000);
    this.destroyRef.onDestroy(() => window.clearInterval(timer));
  }
  private check(onClick: () => void) {
    const granted =
      "Notification" in window && Notification.permission === "granted";
    const date = studyDate();
    const now = new Date();
    const time = now.toLocaleTimeString("en-GB", {
      timeZone: studyTimeZone(),
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    if (
      !shouldShowReminder({
        enabled: cached("browser-reminders", false),
        permissionGranted: granted,
        localTime: time,
        currentDay: new Date(date + "T12:00:00").getDay(),
        allowedDays: cached("reminder-days", [0, 1, 2, 3, 4, 5, 6]),
        configuredTime: cached("reminder-time", "20:00"),
        shownToday: cached("reminder-shown", "") === date,
      })
    )
      return;
    cache("reminder-shown", date);
    const n = new Notification(this.i18n.t("reminder.title"), {
      body: this.i18n.t("reminder.body"),
      tag: "study-reminder",
    });
    n.onclick = () => {
      window.focus();
      onClick();
      n.close();
    };
  }
}
