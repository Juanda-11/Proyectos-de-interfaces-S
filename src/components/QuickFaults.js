import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { COLORS } from '../theme/tokens';
import { tap } from '../utils/haptics';

// Fallas frecuentes del equipo configurado: un toque describe el problema sin escribir ni hablar.
export default function QuickFaults({ faults, onPick }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {faults.map((fault) => (
        <Pressable
          key={fault.id}
          accessibilityRole="button"
          onPress={() => {
            tap();
            onPick(fault);
          }}
          style={({ pressed }) => [styles.chip, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.text}>{fault.title}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, width: 300 },
  row: { paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: { color: COLORS.white, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
});
