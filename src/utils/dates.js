const MS_DAY = 86400000;

export function toDateOnly(isoOrDate) {
  if (!isoOrDate) return null;
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function todayISO() {
  return toDateOnly(new Date());
}

export function parseDateOnly(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a, b) {
  return toDateOnly(a) === toDateOnly(b);
}

export function compareDateOnly(a, b) {
  const da = toDateOnly(a);
  const db = toDateOnly(b);
  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;
  return da < db ? -1 : da > db ? 1 : 0;
}

export function isOverdue(dueIso, status) {
  if (!dueIso || status === 'completed') return false;
  const due = parseDateOnly(dueIso);
  const today = startOfDay();
  return due < today;
}

export function isDueToday(dueIso, status) {
  if (!dueIso || status === 'completed') return false;
  return dueIso === todayISO();
}

export function isUpcoming(dueIso, status) {
  if (!dueIso || status === 'completed') return false;
  return dueIso > todayISO();
}

export function formatDate(iso, settings = {}) {
  if (!iso) return '—';
  const d = parseDateOnly(iso) ?? new Date(iso);
  const fmt = settings.dateFormat || 'medium';
  try {
    if (fmt === 'short') {
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
    }
    if (fmt === 'long') {
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function greetingForHour(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getCalendarDays(year, month, weekStartsOn = 0) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() - weekStartsOn + 7) % 7;
  const days = [];
  const gridStart = new Date(year, month, 1 - startPad);
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart.getTime() + i * MS_DAY);
    days.push({
      date: toDateOnly(d),
      inMonth: d.getMonth() === month,
      isToday: toDateOnly(d) === todayISO(),
    });
  }
  return { days, year, month, lastDay: last.getDate() };
}

export function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function weekdayHeaders(weekStartsOn = 0) {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const out = [];
  for (let i = 0; i < 7; i++) out.push(names[(weekStartsOn + i) % 7]);
  return out;
}
