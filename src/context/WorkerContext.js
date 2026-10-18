import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { DEFAULT_CONFIG, SIMULATION_OPTIONS, configReducer } from './configReducer';
import { loadConfig, saveConfig } from './storage';
import { createSimulatedAlert, machineDisplayName } from '../utils/faults';
import { getMachineType } from '../data/machineTypes';

const WorkerContext = createContext(null);

// Estado global de WorkerWatch: configuración del puesto, tarea actual y alerta activa.
export function WorkerProvider({ children, initialConfig }) {
  const [config, dispatch] = useReducer(configReducer, initialConfig ?? DEFAULT_CONFIG);
  const [hydrated, setHydrated] = useState(Boolean(initialConfig));
  const [taskStatus, setTaskStatus] = useState('active'); // 'active' | 'attending' | 'reported'
  const [alert, setAlert] = useState(null);
  const alertListeners = useRef(new Set());

  useEffect(() => {
    if (initialConfig) return undefined;
    let cancelled = false;
    loadConfig().then((saved) => {
      if (cancelled) return;
      if (saved) dispatch({ type: 'hydrate', config: saved });
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [initialConfig]);

  useEffect(() => {
    if (hydrated) saveConfig(config);
  }, [config, hydrated]);

  // Crea una alerta simulada y avisa a quien escuche (para saltar a la pantalla de alerta).
  const triggerAlert = useCallback(
    (faultId) => {
      const next = createSimulatedAlert(config, { faultId });
      setAlert(next);
      alertListeners.current.forEach((fn) => fn(next));
      return next;
    },
    [config]
  );

  const onAlert = useCallback((fn) => {
    alertListeners.current.add(fn);
    return () => alertListeners.current.delete(fn);
  }, []);

  const value = useMemo(() => {
    const type = getMachineType(config.machineTypeId);
    return {
      config,
      dispatch,
      hydrated,
      machine: {
        typeId: type.id,
        typeLabel: type.label,
        icon: type.icon,
        name: machineDisplayName(config),
      },
      taskStatus,
      setTaskStatus,
      alert,
      setAlert,
      triggerAlert,
      onAlert,
      simulationSeconds: SIMULATION_OPTIONS.find((o) => o.id === config.simulation)?.seconds ?? 0,
    };
  }, [config, hydrated, taskStatus, alert, triggerAlert, onAlert]);

  return <WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>;
}

export function useWorker() {
  const ctx = useContext(WorkerContext);
  if (!ctx) throw new Error('useWorker debe usarse dentro de <WorkerProvider>');
  return ctx;
}
