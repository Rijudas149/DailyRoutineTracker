export function toMinutes(hours: string, minutes: string): number {
  const h = parseInt(hours, 10) || 0
  const m = parseInt(minutes, 10) || 0
  return h * 60 + m
}

export function fromMinutes(total: number): { hours: string; minutes: string } {
  const h = Math.floor(total / 60)
  const m = total % 60
  return { hours: String(h), minutes: String(m) }
}

export function setDurationFromTotal(
  total: number,
  setHours: (v: string) => void,
  setMinutes: (v: string) => void
) {
  const { hours, minutes } = fromMinutes(total)
  setHours(hours)
  setMinutes(minutes)
}

/** Duration in minutes between two HH:mm times (end may be next day). */
export function calcDurationFromTimeRange(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let s = sh * 60 + sm
  let e = eh * 60 + em
  if (e <= s) e += 24 * 60
  return e - s
}

export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}
