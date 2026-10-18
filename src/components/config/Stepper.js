import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme/tokens';
import { tap } from '../../utils/haptics';

// Control [-] valor [+] con botones grandes para uso táctil en el reloj.
export default function Stepper({ label, value, onMinus, onPlus, accessibilityLabel }) {
  const press = (fn) => () => {
    tap();
    fn();
  };
  return (
    <View style={styles.row} accessibilityLabel={accessibilityLabel ?? label}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} menos`}
          onPress={press(onMinus)}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} más`}
          onPress={press(onPlus)}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 270 },
  label: { color: COLORS.dim, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    minWidth: 70,
    textAlign: 'center',
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: COLORS.white, fontSize: 26, fontWeight: '900', marginTop: -2 },
  pressed: { opacity: 0.6, transform: [{ scale: 0.94 }] },
});
