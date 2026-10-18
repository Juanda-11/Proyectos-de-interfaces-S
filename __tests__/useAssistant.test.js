import { act, renderHook, waitFor } from '@testing-library/react-native';

const mockSpeak = jest.fn();
const mockStop = jest.fn();
const mockDiagnosis = jest.fn();
const mockChat = jest.fn();

jest.mock('../src/hooks/useSpeaker', () => ({
  __esModule: true,
  default: () => ({ speak: mockSpeak, stop: mockStop, speaking: false }),
}));
jest.mock('../src/hooks/useVoiceInput', () => ({
  __esModule: true,
  default: () => ({
    supported: false,
    listening: false,
    transcript: '',
    error: null,
    start: jest.fn(),
    stop: jest.fn(),
  }),
}));
jest.mock('../src/api/client', () => ({
  requestDiagnosis: (...args) => mockDiagnosis(...args),
  requestChat: (...args) => mockChat(...args),
}));

import useAssistant from '../src/hooks/useAssistant';

const machine = { typeId: 'boiler', typeLabel: 'Caldera', name: 'Caldera #04' };
const alert = {
  faultId: 'boiler-overheat',
  title: 'TEMPERATURA ALTA',
  metric: 'Temperatura',
  reading: '94°C',
};
const plan = {
  summary: 'Temperatura alta',
  severity: 'high',
  source: 'gemini',
  steps: [
    { id: 1, title: 'Cierra la válvula', voice: 'Paso uno. Cierra la válvula.' },
    { id: 2, title: 'Espera', voice: 'Paso dos. Espera.' },
  ],
};

const setup = async (props = {}) =>
  await renderHook(
    (p) => useAssistant({ active: true, alert, machine, voiceEnabled: true, ...p }),
    {
      initialProps: props,
    }
  );

describe('useAssistant', () => {
  it('al activarse con una alerta pide el plan y lo lee en voz alta', async () => {
    mockDiagnosis.mockResolvedValue(plan);
    const { result } = await setup();
    await waitFor(() => expect(result.current.phase).toBe('steps'));
    expect(mockDiagnosis).toHaveBeenCalledWith(
      { machine, alert, description: undefined },
      expect.objectContaining({ signal: expect.anything() })
    );
    expect(result.current.total).toBe(2);
    expect(mockSpeak).toHaveBeenCalledWith('Temperatura alta. Paso uno. Cierra la válvula.');
  });

  it('avanza paso a paso y detecta el último', async () => {
    mockDiagnosis.mockResolvedValue(plan);
    const { result } = await setup();
    await waitFor(() => expect(result.current.phase).toBe('steps'));
    expect(result.current.last).toBe(false);
    await act(async () => {
      expect(result.current.next()).toBe(true);
    });
    expect(result.current.step).toBe(1);
    expect(result.current.last).toBe(true);
    expect(mockSpeak).toHaveBeenLastCalledWith('Paso dos. Espera.');
    await act(async () => {
      expect(result.current.next()).toBe(false);
    });
  });

  it('sin alerta espera a que el trabajador describa el problema', async () => {
    const { result } = await setup({ alert: null });
    expect(result.current.phase).toBe('idle');
    expect(mockDiagnosis).not.toHaveBeenCalled();
  });

  it('una pregunta sin plan nuevo muestra la respuesta y la dice', async () => {
    mockDiagnosis.mockResolvedValue(plan);
    mockChat.mockResolvedValue({ reply: 'Es la válvula roja.', source: 'gemini' });
    const { result } = await setup();
    await waitFor(() => expect(result.current.phase).toBe('steps'));
    await act(async () => {
      await result.current.ask('¿cuál válvula?');
    });
    expect(result.current.reply).toBe('Es la válvula roja.');
    expect(result.current.phase).toBe('steps');
    expect(mockSpeak).toHaveBeenLastCalledWith('Es la válvula roja.');
  });

  it('una descripción nueva reemplaza el plan y reinicia los pasos', async () => {
    mockDiagnosis.mockResolvedValue(plan);
    mockChat.mockResolvedValue({
      reply: 'Revisemos la fuga.',
      source: 'gemini',
      steps: [{ id: 1, title: 'Detén la prensa', voice: 'Paso uno. Detén la prensa.' }],
    });
    const { result } = await setup();
    await waitFor(() => expect(result.current.phase).toBe('steps'));
    await act(async () => {
      result.current.next();
    });
    await act(async () => {
      await result.current.ask('gotea aceite');
    });
    expect(result.current.step).toBe(0);
    expect(result.current.total).toBe(1);
    expect(result.current.reply).toBeNull();
    expect(mockSpeak).toHaveBeenLastCalledWith('Revisemos la fuga. Paso uno. Detén la prensa.');
  });

  it('ignora mensajes vacíos', async () => {
    const { result } = await setup({ alert: null });
    await act(async () => {
      await result.current.ask('   ');
    });
    expect(mockChat).not.toHaveBeenCalled();
  });

  it('al salir de la pantalla corta la voz y reinicia el estado', async () => {
    jest.useFakeTimers();
    mockDiagnosis.mockResolvedValue(plan);
    const { result, rerender } = await setup();
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.phase).toBe('steps');
    await rerender({ active: false });
    expect(mockStop).toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.plan).toBeNull();
    expect(result.current.phase).toBe('idle');
    jest.useRealTimers();
  });
});
