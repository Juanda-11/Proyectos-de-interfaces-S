import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

// En web no hay vibración: se ignoran las llamadas sin romper la app.
const run = (fn) => {
  if (Platform.OS === 'web') return;
  try {
    Promise.resolve(fn()).catch(() => {});
  } catch (e) {}
};

export const tap = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
export const warning = () =>
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
export const success = () =>
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const stopVibration = () => {
  if (Platform.OS === 'web') {
    try {
      navigator.vibrate?.(0);
    } catch (e) {}
    return;
  }
  run(() => Vibration.cancel());
};

// Patrón según severidad: las alertas críticas vibran más y con más pulsos que las medias.
const PATTERNS = {
  medium: [0, 200, 150, 200],
  high: [0, 250, 120, 250, 120, 250],
  critical: [0, 400, 100, 400, 100, 400, 100, 400],
};
export const alertVibrationFor = (severity) => {
  const pattern = PATTERNS[severity] ?? PATTERNS.high;
  if (Platform.OS === 'web') {
    // Android Chrome sí vibra; en escritorio la API no existe y se ignora.
    try {
      navigator.vibrate?.(pattern);
    } catch (e) {}
    return;
  }
  run(() => Vibration.vibrate(pattern));
};
