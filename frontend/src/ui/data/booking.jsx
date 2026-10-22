// Illustrative availability only. These times do not represent venue hours.
export const demoSlots = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '18:00', '19:00'];
export function localDate(offset = 0, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(now));
  const value = name => parts.find(part => part.type === name).value;
  const date = new Date(Date.UTC(Number(value('year')), Number(value('month')) - 1, Number(value('day')) + offset));
  return date.toISOString().slice(0, 10);
}
export function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}
export function slotsForDate(date) {
  const seed = Number(date.replaceAll('-', ''));
  return demoSlots.map((time, index) => ({ time, available: (seed + index) % 4 !== 0 }));
}
export function endTime(time) { return `${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:00`; }
