import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Battery from 'expo-battery';

const FALLBACK = 82; // valor de demostración cuando el dispositivo no expone la batería

// Nivel de batería real (0-100). En web usa la Battery API si existe; si no, el valor de demostración.
export default function useBattery() {
  const [level, setLevel] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    let subscription;
    let webBattery;
    const onWebChange = () => !cancelled && setLevel(Math.round(webBattery.level * 100));

    (async () => {
      try {
        if (Platform.OS === 'web') {
          if (typeof navigator?.getBattery !== 'function') return;
          webBattery = await navigator.getBattery();
          onWebChange();
          webBattery.addEventListener('levelchange', onWebChange);
          return;
        }
        const value = await Battery.getBatteryLevelAsync();
        if (!cancelled && value >= 0) setLevel(Math.round(value * 100));
        subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
          if (batteryLevel >= 0) setLevel(Math.round(batteryLevel * 100));
        });
      } catch (e) {
        // sin acceso a la batería: se mantiene el valor de demostración
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
      webBattery?.removeEventListener('levelchange', onWebChange);
    };
  }, []);

  return level;
}
