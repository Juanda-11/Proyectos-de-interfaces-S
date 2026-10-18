// Turnos predefinidos. `custom` permite elegir cualquier hora de inicio y fin.
export const SHIFT_PRESETS = [
  { id: 'standard', label: 'Estándar', icon: '🏢', start: '08:00', end: '16:00' },
  { id: 'morning', label: 'Mañana', icon: '🌅', start: '06:00', end: '14:00' },
  { id: 'afternoon', label: 'Tarde', icon: '🌇', start: '14:00', end: '22:00' },
  { id: 'night', label: 'Noche', icon: '🌙', start: '22:00', end: '06:00' },
  { id: 'custom', label: 'Personalizado', icon: '🛠️', start: '09:00', end: '17:00' },
];

export const DEFAULT_SHIFT = { presetId: 'standard', start: '08:00', end: '16:00' };

export function getShiftPreset(id) {
  return SHIFT_PRESETS.find((p) => p.id === id) ?? SHIFT_PRESETS[0];
}
