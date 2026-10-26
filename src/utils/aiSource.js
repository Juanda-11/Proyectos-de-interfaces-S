// Texto corto del origen de la respuesta para el chip del asistente (cabe en la pantalla redonda).
// Cuando la IA no responde, el chip indica el motivo para poder diagnosticarlo en el dispositivo.
const REASONS = {
  not_configured: 'SIN URL',
  network: 'SIN RED',
  timeout: 'LENTO',
};

export function aiSourceLabel(plan) {
  if (!plan) return null;
  if (plan.source === 'gemini') return 'GEMINI';
  const reason = plan.fallbackReason;
  if (!reason) return 'OFFLINE';
  if (REASONS[reason]) return REASONS[reason];
  if (reason.startsWith('http_')) return `HTTP ${reason.slice(5)}`;
  return 'ERROR IA';
}
