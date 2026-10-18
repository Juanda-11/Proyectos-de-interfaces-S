import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../theme/tokens';
import { tap } from '../../utils/haptics';

// Fila seleccionable (icono + texto) para listas de opciones del reloj.
export default function OptionRow({ icon, label, detail, selected, onPress, accent = COLORS.cyan }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.row,
        selected && { borderColor: accent, backgroundColor: 'rgba(255,255,255,0.12)' },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, selected && { color: COLORS.white }]} numberOfLines={1}>
        {label}
      </Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {selected ? <Text style={[styles.check, { color: accent }]}>●</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: 270,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  icon: { fontSize: 20 },
  label: { flex: 1, color: COLORS.dim, fontSize: 16, fontWeight: '800' },
  detail: { color: COLORS.dim, fontSize: 12, fontWeight: '700' },
  check: { fontSize: 14 },
});
