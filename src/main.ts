import { bootstrapApplication } from "@angular/platform-browser";
import { provideServiceWorker } from "@angular/service-worker";
import "zone.js";
import { I18nService } from "./app/i18n.service";
import { SessionComponent } from "./app/session.component";

async function clearLegacyServiceWorkerCaches() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("ngsw:"))
          .map((key) => caches.delete(key)),
      );
    }
  } catch {}
}

void clearLegacyServiceWorkerCaches().finally(() => {
  bootstrapApplication(SessionComponent, {
    providers: [provideServiceWorker("ngsw-worker.js", { enabled: false })],
  })
    .then((ref) => {
      const i18n = ref.injector.get(I18nService);
      i18n.start();
    })
    .catch((err) => console.error(err));
});
