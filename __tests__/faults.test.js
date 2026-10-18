import { MACHINE_TYPES } from '../src/data/machineTypes';
import {
  createSimulatedAlert,
  localPlan,
  machineDisplayName,
  matchFaultByText,
} from '../src/utils/faults';

const config = { machineTypeId: 'boiler', machineNumber: 4, customName: '' };

describe('catálogo de equipos', () => {
  it('cada falla tiene pasos que caben en el reloj', () => {
    for (const type of MACHINE_TYPES) {
      expect(type.faults.length).toBeGreaterThan(0);
      for (const fault of type.faults) {
        expect(fault.steps.length).toBeGreaterThanOrEqual(3);
        for (const step of fault.steps) {
          expect(step.title.length).toBeLessThanOrEqual(34);
          expect(step.voice.length).toBeGreaterThan(10);
        }
        expect(fault.range[0]).toBeLessThanOrEqual(fault.range[1]);
      }
    }
  });

  it('los ids de falla son únicos', () => {
    const ids = MACHINE_TYPES.flatMap((t) => t.faults.map((f) => f.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('machineDisplayName', () => {
  it('usa tipo y número con ceros a la izquierda', () => {
    expect(machineDisplayName(config)).toBe('Caldera #04');
  });

  it('prefiere el nombre personalizado', () => {
    expect(machineDisplayName({ ...config, customName: ' Línea 2 ' })).toBe('Línea 2');
  });
});

describe('createSimulatedAlert', () => {
  it('genera una lectura dentro del rango de la falla', () => {
    const alert = createSimulatedAlert(config, { faultId: 'boiler-overheat', rand: () => 0.5 });
    expect(alert.title).toBe('TEMPERATURA ALTA');
    expect(alert.reading).toBe('99°C');
    expect(alert.machine).toBe('Caldera #04');
  });

  it('elige una falla del tipo de equipo configurado', () => {
    const alert = createSimulatedAlert({ ...config, machineTypeId: 'press' }, { rand: () => 0 });
    expect(alert.faultId.startsWith('press-')).toBe(true);
  });
});

describe('matchFaultByText', () => {
  it('reconoce síntomas ignorando tildes y mayúsculas', () => {
    expect(matchFaultByText('press', 'Hay una FUGA de aceite')?.id).toBe('press-leak');
    expect(matchFaultByText('press', 'hace un ruido metalico')?.id).toBe('press-noise');
  });

  it('devuelve null si no hay coincidencia', () => {
    expect(matchFaultByText('press', 'hola')).toBeNull();
    expect(matchFaultByText('press', '')).toBeNull();
  });
});

describe('localPlan', () => {
  it('devuelve los pasos de la falla indicada', () => {
    const plan = localPlan({ machineTypeId: 'boiler', faultId: 'boiler-overheat' });
    expect(plan.steps).toHaveLength(4);
    expect(plan.steps[0].id).toBe(1);
    expect(plan.source).toBe('offline');
  });

  it('usa el plan genérico y escala si no reconoce la falla', () => {
    const plan = localPlan({ machineTypeId: 'boiler', description: 'algo raro' });
    expect(plan.escalate).toBe(true);
    expect(plan.steps.length).toBeGreaterThan(0);
  });
});
