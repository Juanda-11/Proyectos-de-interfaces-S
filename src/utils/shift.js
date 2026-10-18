// Cálculos del turno de trabajo. Soporta turnos nocturnos que cruzan la medianoche (22:00 → 06:00).

const DAY = 24 * 60;

export function parseTime(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function formatTime(minutes) {
  const total = ((Math.round(minutes) % DAY) + DAY) % DAY;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// Suma `delta` minutos a una hora "HH:MM" dando la vuelta al día.
export function shiftTime(value, delta) {
  const base = parseTime(value);
  return formatTime((base ?? 0) + delta);
}

// "3h 05m" · "45m"
export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

// Duración del turno en minutos. Si fin <= inicio el turno cruza la medianoche.
export function shiftDuration(shift) {
  const start = parseTime(shift?.start);
  const end = parseTime(shift?.end);
  if (start === null || end === null) return 0;
  return end > start ? end - start : end + DAY - start;
}

/**
 * Estado del turno en un instante dado.
 * @returns {{ active: boolean, progress: number, remainingMinutes: number,
 *            minutesUntilStart: number, durationMinutes: number }}
 */
export function getShiftStatus(shift, now = new Date()) {
  const start = parseTime(shift?.start);
  const durationMinutes = shiftDuration(shift);
  if (start === null || durationMinutes === 0) {
    return { active: false, progress: 0, remainingMinutes: 0, minutesUntilStart: 0, durationMinutes: 0 };
  }

  const current = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const elapsed = (((current - start) % DAY) + DAY) % DAY;

  if (elapsed < durationMinutes) {
    return {
      active: true,
      progress: elapsed / durationMinutes,
      remainingMinutes: durationMinutes - elapsed,
      minutesUntilStart: 0,
      durationMinutes,
    };
  }

  return {
    active: false,
    progress: 0,
    remainingMinutes: 0,
    minutesUntilStart: DAY - elapsed,
    durationMinutes,
  };
}

export function shiftRangeLabel(shift) {
  return `${shift.start} - ${shift.end}`;
}
