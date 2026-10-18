import { Platform } from 'react-native';

// Modo reloj: la interfaz ocupa toda la pantalla (sin el marco ni los controles de demostración).
// Se activa con EXPO_PUBLIC_WATCH_MODE=true al compilar el APK del smartwatch,
// o con ?watch=1 en la URL de la versión web.
export function isWatchMode() {
  if (process.env.EXPO_PUBLIC_WATCH_MODE === 'true') return true;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      return new URLSearchParams(window.location.search).get('watch') === '1';
    } catch (e) {
      return false;
    }
  }
  return false;
}
