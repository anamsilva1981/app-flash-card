export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export interface FilePort {
  saveText(name: string, content: string, mime: string): void;
  readText(
    file: { size: number; text(): Promise<string> },
    limit: number,
  ): Promise<string>;
}
export interface ClockPort {
  now(): Date;
}
export interface ConnectivityPort {
  isOnline(): boolean;
}
export interface NotificationPort {
  notificationsAvailable(): boolean;
  notificationGranted(): boolean;
  notify(title: string, body: string, tag: string, onClick: () => void): void;
  requestPermission(): Promise<boolean>;
}
export interface LinkPort {
  openExternal(url: string): void;
}
