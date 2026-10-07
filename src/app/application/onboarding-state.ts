import { Injectable, signal } from "@angular/core";
import { cache, cached } from "../sync";
@Injectable()
export class OnboardingState {
  readonly dismissed = signal(cached("onboarding-dismissed", false));
  dismiss() {
    cache("onboarding-dismissed", true);
    this.dismissed.set(true);
  }
}
