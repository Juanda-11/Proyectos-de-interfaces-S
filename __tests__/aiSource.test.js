import { aiSourceLabel } from '../src/utils/aiSource';

describe('aiSourceLabel', () => {
  it('sin plan no muestra origen', () => {
    expect(aiSourceLabel(null)).toBeNull();
  });

  it('identifica a Gemini', () => {
    expect(aiSourceLabel({ source: 'gemini' })).toBe('GEMINI');
  });

  it('indica el motivo cuando la IA no responde', () => {
    const offline = (fallbackReason) => aiSourceLabel({ source: 'offline', fallbackReason });
    expect(offline('not_configured')).toBe('SIN URL');
    expect(offline('network')).toBe('SIN RED');
    expect(offline('timeout')).toBe('LENTO');
    expect(offline('http_404')).toBe('HTTP 404');
    expect(offline('ai_upstream_error')).toBe('ERROR IA');
  });

  it('sin motivo conocido dice OFFLINE', () => {
    expect(aiSourceLabel({ source: 'offline' })).toBe('OFFLINE');
  });
});
