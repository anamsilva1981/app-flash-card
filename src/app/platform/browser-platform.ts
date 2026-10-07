import {
  ClockPort,
  ConnectivityPort,
  FilePort,
  LinkPort,
  NotificationPort,
  StoragePort,
} from "../../../libs/platform/src/ports";
export class BrowserPlatform
  implements FilePort, ClockPort, ConnectivityPort, NotificationPort, LinkPort
{
  get storage(): Storage & StoragePort {
    return localStorage;
  }
  get sessionStorage(): Storage & StoragePort {
    return sessionStorage;
  }
  get events(): Window {
    return window;
  }
  now() {
    return new Date();
  }
  isOnline() {
    return navigator.onLine;
  }
  setLanguage(locale: string) {
    document.documentElement.lang = locale;
  }
  notificationsAvailable() {
    return "Notification" in window;
  }
  notificationGranted() {
    return (
      this.notificationsAvailable() && Notification.permission === "granted"
    );
  }
  notify(title: string, body: string, tag: string, onClick: () => void) {
    if (!this.notificationGranted()) return;
    const notification = new Notification(title, { body, tag });
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }
  async requestPermission() {
    return (
      "Notification" in window &&
      (await Notification.requestPermission()) === "granted"
    );
  }
  openExternal(url: string) {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol))
      throw new Error("Unsupported link");
    window.open(parsed.href, "_blank", "noopener,noreferrer");
  }
  saveText(name: string, content: string, mime: string) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async readText(
    file: { size: number; text(): Promise<string> },
    limit: number,
  ) {
    if (file.size > limit) throw new Error("File too large");
    return file.text();
  }
}
export const browserPlatform = new BrowserPlatform();
