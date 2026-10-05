import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import VoiceWave from '../components/VoiceWave';
import GradientButton from '../components/GradientButton';
import { COLORS, GRADIENTS } from '../theme/tokens';
import { STEPS } from '../data/repairSteps';
import { tap } from '../utils/haptics';

// Panel del asistente IA: onda de voz + pasos de reparación leídos en voz alta.
export default function AssistantScreen({ active, onDone }) {
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const token = useRef(0);
  const last = step === STEPS.length - 1;

  useEffect(() => {
    const id = ++token.current; // ignora callbacks de lecturas anteriores
    const stopped = () => {
      if (token.current === id) setSpeaking(false);
    };

    if (!active) {
      try { Speech.stop(); } catch (e) {}
      setSpeaking(false);
      const t = setTimeout(() => setStep(0), 450); // reinicia al salir
      return () => clearTimeout(t);
    }

    const text = STEPS[step].voice;
    setSpeaking(true);
    try {
      Speech.stop();
      Speech.speak(text, { language: 'es-ES', rate: 1.0, onDone: stopped, onStopped: stopped, onError: stopped });
    } catch (e) {}
    const fallback = setTimeout(stopped, text.length * 70 + 800); // por si no hay voz disponible
    return () => {
      clearTimeout(fallback);
      try { Speech.stop(); } catch (e) {}
    };
  }, [active, step, replay]);

  const next = () => (last ? onDone() : setStep((s) => s + 1));

  return (
    <View style={styles.root}>
      <LinearGradient colors={GRADIENTS.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.chip}>
        <Text style={styles.chipText}>🤖 ASISTENTE IA</Text>
      </LinearGradient>

      <VoiceWave active={speaking} />

      <Text style={styles.caption}>
        {speaking ? 'HABLANDO…' : `PASO ${step + 1} DE ${STEPS.length}`}
      </Text>
      <Text style={styles.title} numberOfLines={2}>{STEPS[step].title}</Text>

      {/* Progreso por pasos */}
      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <View key={s.id} style={[styles.stepBar, i <= step && styles.stepBarOn]} />
        ))}
      </View>

      <View style={styles.row}>
        <Pressable
          onPress={() => { tap(); setReplay((r) => r + 1); }}
          style={({ pressed }) => [styles.replay, pressed && { opacity: 0.6, transform: [{ scale: 0.94 }] }]}
        >
          <Text style={styles.replayIcon}>↻</Text>
        </Pressable>
        <GradientButton
          label={last ? 'LISTO' : 'SIGUIENTE'}
          variant={last ? 'safe' : 'ai'}
          width={180}
          height={60}
          fontSize={22}
          onPress={next}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 18 },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 999, marginBottom: 10 },
  chipText: { color: COLORS.black, fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
  caption: { color: '#A855F7', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginTop: 8 },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    width: 270,
    height: 60,
    marginTop: 2,
  },
  steps: { flexDirection: 'row', gap: 6, marginVertical: 8 },
  stepBar: { width: 28, height: 5, borderRadius: 3, backgroundColor: '#2A3350' },
  stepBarOn: { backgroundColor: '#A855F7' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  replay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayIcon: { color: COLORS.white, fontSize: 30, fontWeight: '900', marginTop: -3 },
});
