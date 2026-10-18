import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, GLOW } from '../theme/tokens';
import { tap } from '../utils/haptics';

// Botón de micrófono con halo pulsante mientras escucha.
export default function MicButton({ listening, onPress, size = 56, disabled }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!listening) {
      pulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [listening, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={listening ? 'Detener micrófono' : 'Hablar con el asistente'}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        { width: size, height: size, opacity: disabled ? 0.4 : 1 },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          { borderRadius: size / 2, backgroundColor: GLOW.alert, opacity, transform: [{ scale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.button,
          { borderRadius: size / 2, backgroundColor: listening ? COLORS.alert : COLORS.ai },
        ]}
      >
        <Text style={[styles.icon, { fontSize: size * 0.46 }]}>{listening ? '■' : '🎤'}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  halo: { ...StyleSheet.absoluteFillObject },
  button: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { color: COLORS.white },
});
