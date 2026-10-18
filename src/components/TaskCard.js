import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/tokens';
import StatusBadge from './StatusBadge';

// Tarjeta traslúcida (glass) con el equipo asignado y su estado. Al tocarla se abre la configuración.
export default function TaskCard({ machine = 'Máquina #04', icon, badge, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Equipo asignado: ${machine}. Toca para configurar`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.top}>
        <Text style={styles.label}>EQUIPO ASIGNADO ⚙</Text>
        <StatusBadge label={badge.label} variant={badge.variant} pulse={badge.pulse} compact />
      </View>
      <Text style={styles.machine} numberOfLines={1}>
        {icon ? `${icon} ` : ''}
        {machine}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 270,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 4,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: COLORS.dim, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  machine: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
});
