import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';

// Texto a voz con control de cancelación. `enabled=false` silencia sin romper el flujo.
// Si el dispositivo no tiene voz disponible, `speaking` termina por un temporizador de respaldo.
export default function useSpeaker({ enabled = true, lang = 'es-ES', rate = 1.0 } = {}) {
  const [speaking, setSpeaking] = useState(false);
  const token = useRef(0);
  const timer = useRef(null);

  const stop = useCallback(() => {
    token.current += 1;
    clearTimeout(timer.current);
    try {
      Speech.stop();
    } catch (e) {
      // sin motor de voz
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text) => {
      stop();
      if (!text) return;
      const id = token.current;
      const finish = () => {
        if (token.current === id) setSpeaking(false);
      };
      setSpeaking(true);
      timer.current = setTimeout(finish, text.length * 80 + 1500);
      if (!enabled) return;
      try {
        Speech.speak(text, {
          language: lang,
          rate,
          onDone: finish,
          onStopped: finish,
          onError: finish,
        });
      } catch (e) {
        finish();
      }
    },
    [enabled, lang, rate, stop]
  );

  useEffect(() => stop, [stop]);

  return { speak, stop, speaking };
}
