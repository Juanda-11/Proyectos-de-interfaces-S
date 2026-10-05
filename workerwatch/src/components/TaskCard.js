import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/tokens';
import StatusBadge from './StatusBadge';

// Tarjeta traslúcida (glass) con la máquina asignada y su badge de estado.
export default function TaskCard({ machine = 'Máquina #04', badge }) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>MÁQUINA ASIGNADA</Text>
        <Text style={styles.machine} numberOfLines={1}>{machine}</Text>
      </View>
      <StatusBadge label={badge.label} variant={badge.variant} pulse={badge.pulse} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  label: { color: COLORS.dim, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  machine: { color: COLORS.white, fontSize: 22, fontWeight: '900', marginTop: 1 },
});
