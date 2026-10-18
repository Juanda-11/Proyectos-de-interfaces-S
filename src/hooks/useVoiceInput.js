import { useCallback, useRef, useState } from 'react';

// expo-speech-recognition funciona en web (Web Speech API) y en Android/iOS con build de desarrollo.
// En Expo Go el módulo nativo no existe: se carga de forma segura y el hook indica `supported=false`
// para que la interfaz ofrezca el teclado (con dictado) como alternativa.
let Recognition = null;
try {
  Recognition = require('expo-speech-recognition');
} catch (e) {
  Recognition = null;
}

const noopEventHook = () => {};
const useRecognitionEvent = Recognition?.useSpeechRecognitionEvent ?? noopEventHook;

function isSupported() {
  try {
    return Boolean(Recognition?.ExpoSpeechRecognitionModule?.isRecognitionAvailable?.());
  } catch (e) {
    return false;
  }
}

const ERROR_MESSAGES = {
  'not-allowed': 'Permiso de micrófono denegado',
  'no-speech': 'No te escuché, intenta de nuevo',
  'audio-capture': 'No se detecta micrófono',
  network: 'Sin conexión para reconocer voz',
};

/**
 * Entrada por voz. Llama a `onFinal(texto)` cuando termina de dictar.
 * @returns {{ supported: boolean, listening: boolean, transcript: string, error: string|null,
 *            start: () => Promise<void>, stop: () => void }}
 */
export default function useVoiceInput({ lang = 'es-ES', onFinal } = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const latest = useRef('');
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useRecognitionEvent('start', () => setListening(true));
  useRecognitionEvent('result', (event) => {
    const text = event?.results?.[0]?.transcript ?? '';
    latest.current = text;
    setTranscript(text);
  });
  useRecognitionEvent('error', (event) => {
    setListening(false);
    setError(ERROR_MESSAGES[event?.error] ?? 'No se pudo usar el micrófono');
  });
  useRecognitionEvent('end', () => {
    setListening(false);
    const text = latest.current.trim();
    latest.current = '';
    if (text) onFinalRef.current?.(text);
  });

  const start = useCallback(async () => {
    const module = Recognition?.ExpoSpeechRecognitionModule;
    if (!module) {
      setError('Voz no disponible en este dispositivo');
      return;
    }
    setError(null);
    setTranscript('');
    latest.current = '';
    try {
      const permission = await module.requestPermissionsAsync();
      if (!permission.granted) {
        setError(ERROR_MESSAGES['not-allowed']);
        return;
      }
      module.start({ lang, interimResults: true, continuous: false });
    } catch (e) {
      setError('No se pudo iniciar el micrófono');
    }
  }, [lang]);

  const stop = useCallback(() => {
    try {
      Recognition?.ExpoSpeechRecognitionModule?.stop();
    } catch (e) {
      // ya estaba detenido
    }
  }, []);

  return { supported: isSupported(), listening, transcript, error, start, stop };
}
