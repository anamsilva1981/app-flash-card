interface ReminderInput {
  enabled: boolean;
  permission: NotificationPermission | 'denied';
  now: Date;
  days: number[];
  time: string;
  shown: string;
}

export function reminderShouldFire(input: ReminderInput): { fire: boolean; today: string } {
  const today = input.now.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  if (!input.enabled || input.permission !== 'granted') return { fire: false, today };

  const localTime = input.now.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });
  const day = new Date(today + 'T12:00:00').getDay();
  return {
    fire: localTime === input.time && input.days.includes(day) && input.shown !== today,
    today
  };
}
