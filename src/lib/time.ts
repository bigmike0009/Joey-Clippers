export const DEFAULT_START_TIME = '09:00:00';

export function normalizeTimeForDb(time: string) {
  const [hours = '09', minutes = '00'] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
}

export function timeStringToDate(time?: string | null) {
  const [hours, minutes] = normalizeTimeForDb(time ?? DEFAULT_START_TIME).split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function dateToTimeString(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}:00`;
}

export function formatTime(time?: string | null) {
  return timeStringToDate(time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
