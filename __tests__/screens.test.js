import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { WorkerProvider } from '../src/context/WorkerContext';
import { DEFAULT_CONFIG } from '../src/context/configReducer';
import ConfigScreen from '../src/screens/ConfigScreen';
import HomeScreen from '../src/screens/HomeScreen';

// El anillo anima con requestAnimationFrame; en las pruebas solo importa su contenido.
jest.mock('../src/components/ProgressRing', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('expo-battery', () => ({
  getBatteryLevelAsync: jest.fn().mockResolvedValue(0.5),
  addBatteryLevelListener: jest.fn(() => ({ remove: jest.fn() })),
}));

const wrap = (ui, config = DEFAULT_CONFIG) => (
  <WorkerProvider initialConfig={config}>{ui}</WorkerProvider>
);

afterEach(() => {
  jest.useRealTimers();
});

describe('HomeScreen', () => {
  it('muestra el tiempo restante dentro del turno', async () => {
    jest.useFakeTimers({ now: new Date(2026, 0, 15, 12, 0, 0) });
    await render(wrap(<HomeScreen onOpenConfig={jest.fn()} />));
    expect(screen.getByText('4h 00m')).toBeTruthy();
    expect(screen.getByText('restante')).toBeTruthy();
    expect(screen.getByText('08:00 - 16:00')).toBeTruthy();
  });

  it('indica cuándo empieza el turno si está fuera de horario', async () => {
    jest.useFakeTimers({ now: new Date(2026, 0, 15, 18, 0, 0) });
    await render(wrap(<HomeScreen onOpenConfig={jest.fn()} />));
    expect(screen.getByText('FUERA DE TURNO')).toBeTruthy();
    expect(screen.getByText('14h 00m')).toBeTruthy();
  });

  it('muestra el equipo configurado y abre la configuración al tocarlo', async () => {
    const onOpenConfig = jest.fn();
    const config = { ...DEFAULT_CONFIG, machineTypeId: 'press', machineNumber: 7 };
    await render(wrap(<HomeScreen onOpenConfig={onOpenConfig} />, config));
    const card = screen.getByLabelText(/Equipo asignado: Prensa hidráulica #07/);
    await fireEvent.press(card);
    expect(onOpenConfig).toHaveBeenCalled();
  });
});

describe('ConfigScreen', () => {
  it('cambia el tipo de equipo y el número', async () => {
    await render(wrap(<ConfigScreen onClose={jest.fn()} onSimulate={jest.fn()} />));
    expect(screen.getByText('Caldera #04')).toBeTruthy();

    await fireEvent.press(screen.getByText('Torno CNC'));
    expect(screen.getByText('Torno CNC #04')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('NÚMERO más'));
    expect(screen.getByText('Torno CNC #05')).toBeTruthy();
  });

  it('el turno nocturno actualiza la duración y el turno personalizado muestra las horas', async () => {
    await render(wrap(<ConfigScreen onClose={jest.fn()} onSimulate={jest.fn()} />));
    await fireEvent.press(screen.getByText('Noche'));
    expect(screen.getByText('Duración: 8h 00m')).toBeTruthy();

    await fireEvent.press(screen.getByText('Personalizado'));
    expect(screen.getByText('ENTRADA')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('SALIDA más'));
    expect(screen.getByText('Duración: 8h 30m')).toBeTruthy();
  });

  it('el botón SIMULAR FALLA y LISTO llaman a sus acciones', async () => {
    const onClose = jest.fn();
    const onSimulate = jest.fn();
    await render(wrap(<ConfigScreen onClose={onClose} onSimulate={onSimulate} />));
    await fireEvent.press(screen.getByLabelText('SIMULAR FALLA'));
    await fireEvent.press(screen.getByLabelText('LISTO'));
    expect(onSimulate).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
