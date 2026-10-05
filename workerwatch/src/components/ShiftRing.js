import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ProgressRing from './ProgressRing';
import { COLORS } from '../theme/tokens';

// Anillo del turno con el tiempo restante en el centro.
// `progress` es un valor de demostración (0.62 = 62 % del turno cumplido).
export default function ShiftRing({ range = '08:00 - 16:00', progress = 0.62, totalMinutes = 480 }) {
  const remaining = Math.round((1 - progress) * totalMinutes);
  const h = Math.floor(remaining / 60);
  const m = String(remaining % 60).padStart(2, '0');

  return (
    <ProgressRing size={158} stroke={13} progress={progress}>
      <Text style={styles.label}>TURNO</Text>
      <Text style={styles.time}>{h}h {m}m</Text>
      <Text style={styles.sub}>restante</Text>
      <Text style={styles.range}>{range}</Text>
    </ProgressRing>
  );
}

const styles = StyleSheet.create({
  label: { color: '#60EFFF', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  time: { color: COLORS.white, fontSize: 34, fontWeight: '900' },
  sub: { color: COLORS.dim, fontSize: 12, fontWeight: '600', marginTop: -2 },
  range: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginTop: 4 },
});
