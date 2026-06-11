import type { Session } from '../types/f1';

export function combineDateTime(date: string, time?: string): Date {
  return new Date(`${date}T${time ?? '00:00:00Z'}`);
}

export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate) return 'TBC';
  const start = new Date(`${startDate}T00:00:00`);
  const end = endDate ? new Date(`${endDate}T00:00:00`) : start;
  const sameMonth = start.getMonth() === end.getMonth();
  const month = new Intl.DateTimeFormat(undefined, { month: 'short' });
  if (start.toDateString() === end.toDateString()) {
    return `${month.format(start)} ${start.getDate()}, ${start.getFullYear()}`;
  }
  return sameMonth
    ? `${month.format(start)} ${start.getDate()}-${end.getDate()}, ${end.getFullYear()}`
    : `${month.format(start)} ${start.getDate()} - ${month.format(end)} ${end.getDate()}, ${end.getFullYear()}`;
}

export function formatDateTime(date: string, time?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(combineDateTime(date, time));
}

export function formatClock(date: string, time?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(combineDateTime(date, time));
}

export function getSessionStatus(date: string, time?: string, durationHours = 2): Session['status'] {
  const now = Date.now();
  const start = combineDateTime(date, time).getTime();
  const end = start + durationHours * 60 * 60 * 1000;
  if (now < start) return 'upcoming';
  if (now <= end) return 'live';
  return 'completed';
}

export function getCountdownParts(target?: string): { label: string; value: string }[] {
  if (!target) {
    return [
      { label: 'Days', value: '--' },
      { label: 'Hours', value: '--' },
      { label: 'Mins', value: '--' },
      { label: 'Secs', value: '--' },
    ];
  }
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return [
    { label: 'Days', value: String(days).padStart(2, '0') },
    { label: 'Hours', value: String(hours).padStart(2, '0') },
    { label: 'Mins', value: String(minutes).padStart(2, '0') },
    { label: 'Secs', value: String(seconds).padStart(2, '0') },
  ];
}
