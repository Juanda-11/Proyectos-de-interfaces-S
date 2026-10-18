import { useEffect, useState } from 'react';
import { getHealth, isApiConfigured } from '../api/client';

// Estado del backend para el panel de demostración: 'unconfigured' | 'checking' | 'online' | 'degraded' | 'offline'
export default function useApiStatus() {
  const [status, setStatus] = useState(isApiConfigured() ? 'checking' : 'unconfigured');
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (!isApiConfigured()) return undefined;
    let cancelled = false;
    getHealth()
      .then((h) => {
        if (cancelled) return;
        setStatus(h.ai === 'configured' ? 'online' : 'degraded');
        setModel(h.model ?? null);
      })
      .catch(() => !cancelled && setStatus('offline'));
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, model };
}
