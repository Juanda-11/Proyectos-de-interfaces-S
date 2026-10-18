import { localPlan } from '../utils/faults';

// URL del backend (repositorio Proyectos-de-interfaces-SB). Se define en .env / Vercel:
//   EXPO_PUBLIC_API_URL=https://workerwatch-api.vercel.app
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const TIMEOUT_MS = 15000;

export const isApiConfigured = () => API_URL.length > 0;

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  if (!isApiConfigured()) throw new ApiError('API no configurada', { code: 'not_configured' });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  signal?.addEventListener('abort', () => controller.abort());

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiError(data?.error?.message ?? `Error ${res.status}`, {
        status: res.status,
        code: data?.error?.code,
      });
    }
    return data;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(e.name === 'AbortError' ? 'Tiempo de espera agotado' : 'Sin conexión', {
      code: e.name === 'AbortError' ? 'timeout' : 'network',
    });
  } finally {
    clearTimeout(timer);
  }
}

export const getHealth = () => request('/api/health');

const machinePayload = (machine) => ({
  typeId: machine.typeId,
  typeLabel: machine.typeLabel,
  name: machine.name,
});

/**
 * Pide un plan de reparación a Gemini (vía backend). Si el backend no responde,
 * devuelve el plan local del catálogo para que el asistente siga funcionando.
 */
export async function requestDiagnosis({ machine, alert, description }, options) {
  try {
    const data = await request('/api/diagnose', {
      method: 'POST',
      signal: options?.signal,
      body: {
        machine: machinePayload(machine),
        fault: alert ? { title: alert.title, metric: alert.metric, reading: alert.reading } : null,
        description: description || undefined,
        language: 'es',
      },
    });
    return data;
  } catch (e) {
    if (options?.signal?.aborted) throw e; // la pantalla ya no espera la respuesta
    return {
      ...localPlan({ machineTypeId: machine.typeId, faultId: alert?.faultId, description }),
      fallbackReason: e.code ?? 'error',
    };
  }
}

/**
 * Pregunta de seguimiento por voz/texto. Devuelve { reply, steps?, source }.
 * Sin backend responde con el plan local o un mensaje de seguridad.
 */
export async function requestChat(
  { machine, alert, steps, currentStep, message, history },
  options
) {
  try {
    return await request('/api/chat', {
      method: 'POST',
      signal: options?.signal,
      body: {
        machine: machinePayload(machine),
        fault: alert ? { title: alert.title, metric: alert.metric, reading: alert.reading } : null,
        steps: steps?.map((s) => ({ title: s.title })),
        currentStep,
        message,
        history: history?.slice(-6),
        language: 'es',
      },
    });
  } catch (e) {
    if (options?.signal?.aborted) throw e;
    const plan = localPlan({
      machineTypeId: machine.typeId,
      faultId: alert?.faultId,
      description: message,
    });
    const matched = plan.summary !== 'Procedimiento general de seguridad';
    return {
      reply: matched
        ? `Sin conexión con la IA. Esto es lo que indica el manual para ${plan.summary.toLowerCase()}.`
        : 'Sin conexión con la IA. Detén el equipo de forma segura y avisa a tu supervisor.',
      steps: plan.steps,
      severity: plan.severity,
      escalate: plan.escalate,
      source: 'offline',
      fallbackReason: e.code ?? 'error',
    };
  }
}
