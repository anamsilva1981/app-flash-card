export interface ReminderPolicyInput {
  enabled: boolean;
  permissionGranted: boolean;
  localTime: string;
  currentDay: number;
  allowedDays: number[];
  configuredTime: string;
  shownToday: boolean;
}

export function shouldShowReminder(input: ReminderPolicyInput): boolean {
  return (
    input.enabled &&
    input.permissionGranted &&
    input.localTime === input.configuredTime &&
    input.allowedDays.includes(input.currentDay) &&
    !input.shownToday
  );
}
