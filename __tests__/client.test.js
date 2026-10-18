describe('cliente de API', () => {
  const machine = { typeId: 'boiler', typeLabel: 'Caldera', name: 'Caldera #04' };
  const alert = {
    faultId: 'boiler-overheat',
    title: 'TEMPERATURA ALTA',
    metric: 'Temperatura',
    reading: '94°C',
  };

  const load = (url) => {
    jest.resetModules();
    if (url === undefined) delete process.env.EXPO_PUBLIC_API_URL;
    else process.env.EXPO_PUBLIC_API_URL = url;
    return require('../src/api/client');
  };

  afterEach(() => {
    delete global.fetch;
  });

  it('sin API configurada usa el plan local', async () => {
    const { requestDiagnosis, isApiConfigured } = load(undefined);
    expect(isApiConfigured()).toBe(false);
    const plan = await requestDiagnosis({ machine, alert });
    expect(plan.source).toBe('offline');
    expect(plan.steps).toHaveLength(4);
    expect(plan.fallbackReason).toBe('not_configured');
  });

  it('usa la respuesta del backend cuando está disponible', async () => {
    const { requestDiagnosis } = load('https://api.test/');
    const body = { summary: 'ok', source: 'gemini', steps: [{ id: 1, title: 'a', voice: 'b' }] };
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => body });
    const plan = await requestDiagnosis({ machine, alert });
    expect(plan).toEqual(body);
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe('https://api.test/api/diagnose');
    expect(JSON.parse(init.body).fault.title).toBe('TEMPERATURA ALTA');
  });

  it('si el backend falla, cae al plan local', async () => {
    const { requestDiagnosis } = load('https://api.test');
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: { code: 'ai_unavailable', message: 'x' } }),
    });
    const plan = await requestDiagnosis({ machine, alert });
    expect(plan.source).toBe('offline');
    expect(plan.fallbackReason).toBe('ai_unavailable');
  });

  it('si no hay red, el chat responde sin conexión con aviso de seguridad', async () => {
    const { requestChat } = load('https://api.test');
    global.fetch = jest.fn().mockRejectedValue(new TypeError('network'));
    const res = await requestChat({ machine, message: 'no sé qué pasa' });
    expect(res.source).toBe('offline');
    expect(res.reply).toMatch(/supervisor/i);
  });
});
