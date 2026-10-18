import {
  formatDuration,
  formatTime,
  getShiftStatus,
  parseTime,
  shiftDuration,
  shiftTime,
} from '../src/utils/shift';

const at = (h, m = 0, s = 0) => new Date(2026, 0, 15, h, m, s);

describe('parseTime / formatTime', () => {
  it('convierte HH:MM a minutos', () => {
    expect(parseTime('08:30')).toBe(510);
    expect(parseTime('0:05')).toBe(5);
  });

  it('rechaza valores inválidos', () => {
    expect(parseTime('25:00')).toBeNull();
    expect(parseTime('12:75')).toBeNull();
    expect(parseTime('abc')).toBeNull();
    expect(parseTime(undefined)).toBeNull();
  });

  it('formatea dando la vuelta al día', () => {
    expect(formatTime(510)).toBe('08:30');
    expect(formatTime(24 * 60 + 15)).toBe('00:15');
    expect(formatTime(-30)).toBe('23:30');
  });

  it('suma minutos a una hora', () => {
    expect(shiftTime('23:30', 60)).toBe('00:30');
    expect(shiftTime('00:10', -30)).toBe('23:40');
  });
});

describe('formatDuration', () => {
  it('muestra horas y minutos', () => {
    expect(formatDuration(185)).toBe('3h 05m');
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(-5)).toBe('0m');
  });
});

describe('shiftDuration', () => {
  it('calcula turnos de un solo día', () => {
    expect(shiftDuration({ start: '08:00', end: '16:00' })).toBe(480);
  });

  it('calcula turnos nocturnos que cruzan la medianoche', () => {
    expect(shiftDuration({ start: '22:00', end: '06:00' })).toBe(480);
  });

  it('devuelve 0 con datos inválidos', () => {
    expect(shiftDuration({ start: 'x', end: '06:00' })).toBe(0);
  });
});

describe('getShiftStatus', () => {
  const day = { start: '08:00', end: '16:00' };
  const night = { start: '22:00', end: '06:00' };

  it('está activo a mitad del turno', () => {
    const s = getShiftStatus(day, at(12));
    expect(s.active).toBe(true);
    expect(s.progress).toBeCloseTo(0.5);
    expect(s.remainingMinutes).toBeCloseTo(240);
  });

  it('el 62 % del turno estándar coincide con la demo original', () => {
    const s = getShiftStatus(day, at(12, 58, 12));
    expect(s.progress).toBeCloseTo(0.62, 2);
  });

  it('antes del inicio calcula cuánto falta', () => {
    const s = getShiftStatus(day, at(6, 30));
    expect(s.active).toBe(false);
    expect(s.minutesUntilStart).toBeCloseTo(90);
  });

  it('después del fin espera al día siguiente', () => {
    const s = getShiftStatus(day, at(18));
    expect(s.active).toBe(false);
    expect(s.minutesUntilStart).toBeCloseTo(14 * 60);
  });

  it('turno nocturno: activo antes de la medianoche', () => {
    const s = getShiftStatus(night, at(23));
    expect(s.active).toBe(true);
    expect(s.progress).toBeCloseTo(1 / 8);
  });

  it('turno nocturno: activo después de la medianoche', () => {
    const s = getShiftStatus(night, at(3));
    expect(s.active).toBe(true);
    expect(s.remainingMinutes).toBeCloseTo(180);
  });

  it('turno nocturno: inactivo a mediodía', () => {
    const s = getShiftStatus(night, at(12));
    expect(s.active).toBe(false);
    expect(s.minutesUntilStart).toBeCloseTo(600);
  });

  it('el instante exacto de fin ya no es turno', () => {
    expect(getShiftStatus(day, at(16)).active).toBe(false);
    expect(getShiftStatus(day, at(8)).active).toBe(true);
  });
});
