import { DEFAULT_CONFIG, configReducer, sanitizeConfig } from '../src/context/configReducer';

describe('sanitizeConfig', () => {
  it('rellena los valores por defecto', () => {
    expect(sanitizeConfig(null)).toEqual(DEFAULT_CONFIG);
  });

  it('corrige valores inválidos guardados', () => {
    const c = sanitizeConfig({
      machineTypeId: 'no-existe',
      machineNumber: 500,
      shift: { presetId: 'night', start: 'zz', end: '25:00' },
      simulation: 'cada-segundo',
    });
    expect(c.machineTypeId).toBe(DEFAULT_CONFIG.machineTypeId);
    expect(c.machineNumber).toBe(99);
    expect(c.shift).toEqual({ presetId: 'night', start: '22:00', end: '06:00' });
    expect(c.simulation).toBe('off');
  });
});

describe('configReducer', () => {
  it('cambia el tipo de máquina', () => {
    expect(
      configReducer(DEFAULT_CONFIG, { type: 'setMachineType', id: 'press' }).machineTypeId
    ).toBe('press');
  });

  it('limita el número de máquina entre 1 y 99', () => {
    expect(
      configReducer(DEFAULT_CONFIG, { type: 'setMachineNumber', value: 0 }).machineNumber
    ).toBe(1);
    expect(
      configReducer(DEFAULT_CONFIG, { type: 'setMachineNumber', value: 120 }).machineNumber
    ).toBe(99);
  });

  it('aplicar un preset de turno actualiza las horas', () => {
    const s = configReducer(DEFAULT_CONFIG, { type: 'setShiftPreset', id: 'night' });
    expect(s.shift).toEqual({ presetId: 'night', start: '22:00', end: '06:00' });
  });

  it('editar una hora cambia el turno a personalizado', () => {
    const s = configReducer(DEFAULT_CONFIG, { type: 'setShiftTime', field: 'end', value: '17:30' });
    expect(s.shift).toEqual({ presetId: 'custom', start: '08:00', end: '17:30' });
  });

  it('ignora acciones desconocidas', () => {
    expect(configReducer(DEFAULT_CONFIG, { type: 'otra' })).toBe(DEFAULT_CONFIG);
  });
});
