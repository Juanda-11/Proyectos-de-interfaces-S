import { GENERIC_STEPS, getFault, getMachineType } from '../data/machineTypes';

// Nombre mostrado de la máquina configurada, p. ej. "Caldera #04".
export function machineDisplayName(config) {
  const custom = config.customName?.trim();
  if (custom) return custom;
  const type = getMachineType(config.machineTypeId);
  return `${type.label} #${String(config.machineNumber).padStart(2, '0')}`;
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length) % list.length];
}

// Genera una alerta simulada de un sensor para el equipo configurado.
export function createSimulatedAlert(config, { faultId, rand = Math.random, now = Date.now() } = {}) {
  const type = getMachineType(config.machineTypeId);
  const fault = (faultId && getFault(type.id, faultId)) || pick(type.faults, rand);
  const [min, max] = fault.range;
  const value = Math.round(min + (max - min) * rand());
  return {
    id: `${fault.id}-${now}`,
    faultId: fault.id,
    machineTypeId: type.id,
    title: fault.title,
    severity: fault.severity,
    metric: fault.metric,
    reading: `${value}${fault.unit}`,
    machine: machineDisplayName(config),
    createdAt: now,
  };
}

function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Reconoce una falla del catálogo a partir de texto libre (modo sin conexión).
export function matchFaultByText(machineTypeId, text) {
  const haystack = normalize(text);
  if (!haystack.trim()) return null;
  let best = null;
  let bestScore = 0;
  for (const fault of getMachineType(machineTypeId).faults) {
    const score = fault.keywords.filter((k) => haystack.includes(normalize(k))).length;
    if (score > bestScore) {
      best = fault;
      bestScore = score;
    }
  }
  return best;
}

// Plan de reparación local para una falla o para una descripción libre.
export function localPlan({ machineTypeId, faultId, description }) {
  const fault =
    (faultId && getFault(machineTypeId, faultId)) || matchFaultByText(machineTypeId, description);
  const steps = (fault?.steps ?? GENERIC_STEPS).map((s, i) => ({ id: i + 1, ...s }));
  return {
    summary: fault ? fault.title : 'Procedimiento general de seguridad',
    severity: fault?.severity ?? 'medium',
    source: 'offline',
    escalate: fault?.severity === 'critical' || !fault,
    steps,
  };
}
