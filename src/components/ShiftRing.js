import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ProgressRing from './ProgressRing';
import { COLORS, GRADIENTS } from '../theme/tokens';
import { formatDuration } from '../utils/shift';

// Anillo del turno. Dentro del turno muestra el tiempo restante; fuera de turno, cuándo inicia.
export default function ShiftRing({ range = '08:00 - 16:00', status }) {
  const active = status.active;
  return (
    <ProgressRing
      size={158}
      stroke={13}
      progress={active ? status.progress : 0}
      colors={active ? GRADIENTS.safe : GRADIENTS.muted}
    >
      <Text style={[styles.label, !active && { color: COLORS.dim }]}>
        {active ? 'TURNO' : 'FUERA DE TURNO'}
      </Text>
      <Text style={styles.time}>
        {formatDuration(active ? status.remainingMinutes : status.minutesUntilStart)}
      </Text>
      <Text style={styles.sub}>{active ? 'restante' : 'para iniciar'}</Text>
      <Text style={styles.range}>{range}</Text>
    </ProgressRing>
  );
}

const styles = StyleSheet.create({
  label: { color: '#60EFFF', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  time: { color: COLORS.white, fontSize: 32, fontWeight: '900' },
  sub: { color: COLORS.dim, fontSize: 12, fontWeight: '600', marginTop: -2 },
  range: { color: COLORS.white, fontSize: 13, fontWeight: '700', marginTop: 4 },
});
