import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '../theme/tokens';

const BARS = 24;
const HEIGHT = 56;

// Visualizador de onda de voz en degradado púrpura-azul.
// `active` = true cuando el asistente está hablando.
export default function VoiceWave({ active }) {
  const values = useRef(Array.from({ length: BARS }, () => new Animated.Value(0.15))).current;

  // Envolvente: las barras del centro son más altas
  const envelope = useMemo(
    () =>
      Array.from({ length: BARS }, (_, i) => 0.35 + 0.65 * Math.sin((Math.PI * (i + 0.5)) / BARS)),
    []
  );

  useEffect(() => {
    if (!active) {
      values.forEach((v) =>
        Animated.timing(v, { toValue: 0.15, duration: 250, useNativeDriver: true }).start()
      );
      return undefined;
    }
    const loops = values.map((v, i) => {
      const peak = envelope[i] * (0.6 + Math.random() * 0.4);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: peak,
            duration: 220 + Math.random() * 260,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.18,
            duration: 220 + Math.random() * 260,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return loop;
    });
    return () => loops.forEach((l) => l.stop());
  }, [active, values, envelope]);

  return (
    <View style={styles.row}>
      {values.map((v, i) => (
        <Animated.View key={i} style={[styles.bar, { transform: [{ scaleY: v }] }]}>
          <LinearGradient
            colors={GRADIENTS.ai}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.fill}
          />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: HEIGHT, flexDirection: 'row', alignItems: 'center', gap: 4 },
  bar: { width: 5, height: HEIGHT, borderRadius: 3, overflow: 'hidden' },
  fill: { flex: 1 },
});
