import { DestroyRef, Injectable, signal } from "@angular/core";
import { studyDate } from "../study-clock";
import { browserPlatform } from "./browser-platform";
@Injectable({ providedIn: "root" })
export class StudyClock {
  readonly today = signal(studyDate());
  private started = false;
  refresh(now = browserPlatform.now()) {
    this.today.set(studyDate(now));
  }
  start(destroy: DestroyRef) {
    if (this.started) return;
    this.started = true;
    const refresh = () => this.refresh();
    const timer = browserPlatform.events.setInterval(refresh, 30000);
    browserPlatform.events.addEventListener("focus", refresh);
    destroy.onDestroy(() => {
      browserPlatform.events.clearInterval(timer);
      browserPlatform.events.removeEventListener("focus", refresh);
      this.started = false;
    });
  }
}
