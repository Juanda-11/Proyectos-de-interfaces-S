import { DEFAULT_MACHINE_TYPE_ID, getMachineType } from '../data/machineTypes';
import { DEFAULT_SHIFT, getShiftPreset } from '../data/shiftPresets';
import { parseTime } from '../utils/shift';

export const SIMULATION_OPTIONS = [
  { id: 'off', label: 'Manual', seconds: 0 },
  { id: '30s', label: '30 s', seconds: 30 },
  { id: '2m', label: '2 min', seconds: 120 },
  { id: '5m', label: '5 min', seconds: 300 },
];

export const DEFAULT_CONFIG = {
  machineTypeId: DEFAULT_MACHINE_TYPE_ID,
  machineNumber: 4,
  customName: '',
  shift: DEFAULT_SHIFT,
  simulation: 'off',
  voice: true,
};

// Normaliza una configuración (guardada o parcial) para que siempre sea válida.
export function sanitizeConfig(input) {
  const base = { ...DEFAULT_CONFIG, ...(input ?? {}) };
  const number = Math.round(Number(base.machineNumber));
  const shift = { ...DEFAULT_SHIFT, ...(base.shift ?? {}) };
  const preset = getShiftPreset(shift.presetId);
  return {
    machineTypeId: getMachineType(base.machineTypeId).id,
    machineNumber: Number.isFinite(number) ? Math.min(99, Math.max(1, number)) : 1,
    customName: String(base.customName ?? '').slice(0, 24),
    shift: {
      presetId: preset.id,
      start: parseTime(shift.start) === null ? preset.start : shift.start,
      end: parseTime(shift.end) === null ? preset.end : shift.end,
    },
    simulation: SIMULATION_OPTIONS.some((o) => o.id === base.simulation) ? base.simulation : 'off',
    voice: base.voice !== false,
  };
}

export function configReducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return sanitizeConfig(action.config);
    case 'setMachineType':
      return sanitizeConfig({ ...state, machineTypeId: action.id });
    case 'setMachineNumber':
      return sanitizeConfig({ ...state, machineNumber: action.value });
    case 'setCustomName':
      return sanitizeConfig({ ...state, customName: action.value });
    case 'setShiftPreset': {
      const preset = getShiftPreset(action.id);
      // "Personalizado" conserva las horas actuales; los demás aplican las del preset.
      const shift =
        preset.id === 'custom'
          ? { ...state.shift, presetId: 'custom' }
          : { presetId: preset.id, start: preset.start, end: preset.end };
      return sanitizeConfig({ ...state, shift });
    }
    case 'setShiftTime':
      return sanitizeConfig({
        ...state,
        shift: { ...state.shift, presetId: 'custom', [action.field]: action.value },
      });
    case 'setSimulation':
      return sanitizeConfig({ ...state, simulation: action.id });
    case 'setVoice':
      return sanitizeConfig({ ...state, voice: action.value });
    case 'reset':
      return DEFAULT_CONFIG;
    default:
      return state;
  }
}
