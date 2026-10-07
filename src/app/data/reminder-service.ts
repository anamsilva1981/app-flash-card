import { DestroyRef, inject, Injectable } from "@angular/core";
import { I18nService } from "../i18n.service";
import { browserPlatform } from "../platform/browser-platform";
import { shouldShowReminder } from "../reminder-policy";
import { studyDate, studyTimeZone } from "../study-clock";
import { cache, cached } from "../sync";
@Injectable()
export class ReminderService {
  private destroyRef = inject(DestroyRef);
  private i18n = inject(I18nService);
  private started = false;
  start(onClick: () => void) {
    if (this.started) return;
    this.started = true;
    const timer = browserPlatform.events.setInterval(
      () => this.check(onClick),
      30000,
    );
    this.destroyRef.onDestroy(() =>
      browserPlatform.events.clearInterval(timer),
    );
  }
  private check(onClick: () => void) {
    const granted = browserPlatform.notificationGranted();
    const date = studyDate();
    const now = browserPlatform.now();
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
    browserPlatform.notify(
      this.i18n.t("reminder.title"),
      this.i18n.t("reminder.body"),
      "study-reminder",
      onClick,
    );
  }
}
