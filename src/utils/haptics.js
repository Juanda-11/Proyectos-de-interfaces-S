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
// Patrón de vibración para alerta crítica: 3 pulsos largos
export const alertVibration = () => run(() => Vibration.vibrate([0, 250, 120, 250, 120, 250]));
export const stopVibration = () => run(() => Vibration.cancel());
