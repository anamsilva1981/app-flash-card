import { Injectable, signal } from "@angular/core";

export type AppTab = "home" | "studyPlan" | "progress" | "history" | "settings";

@Injectable()
export class AppNavigation {
  readonly activeTab = signal<AppTab>("home");

  setTab(tab: AppTab) {
    this.activeTab.set(tab);
  }
}
