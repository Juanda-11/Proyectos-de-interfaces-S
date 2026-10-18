import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import { useWorker } from '../context/WorkerContext';
import { COLORS, GRADIENTS, WATCH_SIZE } from '../theme/tokens';
import { alertVibration, stopVibration, success, warning } from '../utils/haptics';

// Alerta entrante de la IA: borde con pulse glow, vibración y dos botones gigantes.
export default function AlertScreen({ active, onResolve }) {
  const { alert } = useWorker();
  const tone = alert?.severity === 'medium' ? 'warn' : 'alert';
  const pulse = useRef(new Animated.Value(0)).current;
  const [result, setResult] = useState(null); // null | 'accepted' | 'reported'

  // Al activarse: vibra y pulsa el borde. Al salir: se detiene todo.
  useEffect(() => {
    if (!active) {
      stopVibration();
      const t = setTimeout(() => setResult(null), 450);
      return () => clearTimeout(t);
    }
    warning();
    alertVibration();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
      stopVibration();
    };
  }, [active, pulse]);

  const resolveTimer = useRef(null);
  useEffect(() => () => clearTimeout(resolveTimer.current), []);

  const choose = (type) => {
    stopVibration();
    if (type === 'accepted') success();
    else warning();
    setResult(type);
    resolveTimer.current = setTimeout(() => onResolve(type), 1000);
  };

  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] });

  return (
    <View style={styles.root}>
      {/* Borde de alerta intermitente */}
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { opacity: ringOpacity, borderColor: GRADIENTS[tone][0] }]}
      />

      {result ? (
        <View style={styles.center}>
          <Text style={styles.bigIcon}>{result === 'accepted' ? '✅' : '🚩'}</Text>
          <Text style={styles.resultText}>
            {result === 'accepted' ? 'ALERTA ACEPTADA' : 'FALLA REPORTADA'}
          </Text>
        </View>
      ) : (
        <View style={styles.center}>
          <LinearGradient
            colors={GRADIENTS[tone]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chip}
          >
            <Text style={styles.chipText}>
              {alert?.severity === 'critical' ? '🚨 ALERTA CRÍTICA' : '📳 ALERTA IA'}
            </Text>
          </LinearGradient>
          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.6}>
            {alert?.title ?? 'SIN ALERTAS'}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {alert ? `${alert.machine} · ${alert.reading}` : 'Todo en orden'}
          </Text>
          <View style={styles.buttons}>
            <GradientButton label="ACEPTAR" variant="safe" onPress={() => choose('accepted')} />
            <GradientButton label="REPORTAR" variant="alert" onPress={() => choose('reported')} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: WATCH_SIZE / 2,
    borderWidth: 7,
    borderColor: '#FF416C',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 999, marginBottom: 8 },
  chipText: { color: COLORS.black, fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },
  title: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.5,
    width: 280,
    textAlign: 'center',
  },
  sub: { color: COLORS.dim, fontSize: 16, fontWeight: '600', marginTop: 2, marginBottom: 14 },
  buttons: { gap: 12 },
  bigIcon: { fontSize: 64 },
  resultText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: 1,
  },
});
