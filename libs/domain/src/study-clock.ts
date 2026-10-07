/** Calendar rules use the device timezone; no user's location is baked into the app. */
export function studyTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function studyDate(
  now = new Date(),
  timeZone = studyTimeZone(),
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: string) =>
    parts.find((part) => part.type === type)!.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
