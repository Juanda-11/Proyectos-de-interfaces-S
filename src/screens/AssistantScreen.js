import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import MicButton from '../components/MicButton';
import QuickFaults from '../components/QuickFaults';
import VoiceWave from '../components/VoiceWave';
import { useWorker } from '../context/WorkerContext';
import { getMachineType } from '../data/machineTypes';
import useAssistant from '../hooks/useAssistant';
import { COLORS, GRADIENTS } from '../theme/tokens';
import { tap } from '../utils/haptics';

// Panel del asistente IA (Gemini): guía la reparación paso a paso por voz y entiende preguntas
// habladas o escritas. Si no hay conexión usa los planes locales del catálogo.
export default function AssistantScreen({ active, onDone }) {
  const { alert, machine, config } = useWorker();
  const a = useAssistant({ active, alert, machine, voiceEnabled: config.voice });
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const faults = getMachineType(config.machineTypeId).faults;
  const { voice } = a;

  const finish = () => (a.last ? onDone() : a.next());
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setTyping(false);
    a.ask(text);
  };

  const waveActive = a.speaking || a.phase === 'thinking' || voice.listening;
  const sourceLabel = a.plan?.source === 'gemini' ? 'GEMINI' : a.plan ? 'OFFLINE' : null;

  let body;
  if (voice.listening) {
    body = (
      <>
        <Text style={styles.caption}>TE ESCUCHO…</Text>
        <Text style={styles.title} numberOfLines={3}>
          {voice.transcript || 'Describe el problema'}
        </Text>
        <MicButton listening onPress={voice.stop} size={60} />
      </>
    );
  } else if (a.phase === 'thinking') {
    body = (
      <>
        <Text style={styles.caption}>ANALIZANDO…</Text>
        <Text style={styles.title}>Consultando a la IA</Text>
      </>
    );
  } else if (typing) {
    body = (
      <>
        <Text style={styles.caption}>ESCRIBE O DICTA</Text>
        <TextInput
          autoFocus
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          returnKeyType="send"
          placeholder="Ej: la prensa suena raro"
          placeholderTextColor={COLORS.dim}
          style={styles.input}
          accessibilityLabel="Describe el problema"
        />
        <View style={styles.row}>
          <Pressable
            onPress={() => setTyping(false)}
            style={styles.roundBtn}
            accessibilityLabel="Cancelar"
          >
            <Text style={styles.roundIcon}>✕</Text>
          </Pressable>
          <GradientButton
            label="ENVIAR"
            variant="ai"
            width={170}
            height={56}
            fontSize={20}
            onPress={send}
          />
        </View>
      </>
    );
  } else if (a.phase === 'steps' && a.plan) {
    const current = a.plan.steps[a.step];
    body = (
      <>
        <Text style={[styles.caption, a.plan.escalate && !a.speaking && { color: COLORS.warn }]}>
          {a.speaking
            ? 'HABLANDO…'
            : a.plan.escalate
              ? `PASO ${a.step + 1} DE ${a.total} · AVISA AL SUPERVISOR`
              : `PASO ${a.step + 1} DE ${a.total}`}
        </Text>
        <Text style={[styles.title, a.reply && styles.reply]} numberOfLines={a.reply ? 4 : 2}>
          {a.reply ?? current.title}
        </Text>
        <View style={styles.steps}>
          {a.plan.steps.map((s, i) => (
            <View key={s.id ?? i} style={[styles.stepBar, i <= a.step && styles.stepBarOn]} />
          ))}
        </View>
        <View style={styles.row}>
          <Pressable
            accessibilityLabel="Repetir"
            onPress={() => {
              tap();
              a.replay();
            }}
            style={({ pressed }) => [styles.roundBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.roundIcon}>↻</Text>
          </Pressable>
          <GradientButton
            label={a.last ? 'LISTO' : 'SIGUIENTE'}
            variant={a.last ? 'safe' : 'ai'}
            width={150}
            height={56}
            fontSize={20}
            onPress={finish}
          />
          <MicButton listening={false} onPress={voice.start} size={56} />
        </View>
      </>
    );
  } else {
    body = (
      <>
        <Text style={styles.caption}>¿QUÉ SUCEDE?</Text>
        <Text style={[styles.title, styles.reply]} numberOfLines={3}>
          {a.reply ?? voice.error ?? 'Habla, escribe o elige la falla'}
        </Text>
        <QuickFaults
          faults={faults}
          onPick={(f) =>
            a.diagnose({
              faultAlert: { faultId: f.id, title: f.title, metric: f.metric },
              description: f.title,
            })
          }
        />
        <View style={styles.row}>
          <MicButton listening={false} onPress={voice.start} size={60} />
          <Pressable
            accessibilityLabel="Escribir"
            onPress={() => setTyping(true)}
            style={({ pressed }) => [styles.roundBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.roundIcon}>⌨</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={GRADIENTS.ai}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.chip}
      >
        <Text style={styles.chipText}>
          {sourceLabel ? `🤖 IA · ${sourceLabel}` : '🤖 ASISTENTE IA'}
        </Text>
      </LinearGradient>
      <VoiceWave active={waveActive} />
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 18, gap: 4 },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 999, marginBottom: 6 },
  chipText: { color: COLORS.black, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  caption: { color: COLORS.ai, fontSize: 12, fontWeight: '900', letterSpacing: 1.6, marginTop: 6 },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    width: 270,
    minHeight: 58,
    marginTop: 2,
  },
  reply: { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  steps: { flexDirection: 'row', gap: 6, marginVertical: 6 },
  stepBar: { width: 28, height: 5, borderRadius: 3, backgroundColor: COLORS.line },
  stepBarOn: { backgroundColor: COLORS.ai },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  roundBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundIcon: { color: COLORS.white, fontSize: 26, fontWeight: '900', marginTop: -2 },
  input: {
    width: 250,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 8,
  },
});
