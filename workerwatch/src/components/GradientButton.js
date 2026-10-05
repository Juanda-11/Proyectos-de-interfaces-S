import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, GLOW, COLORS } from '../theme/tokens';
import { tap } from '../utils/haptics';

// Botón táctil grande con degradado neón, glow y micro-animación al presionar.
export default function GradientButton({
  label,
  variant = 'safe',
  onPress,
  height = 64,
  width = 260,
  fontSize = 26,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    tap();
    Animated.spring(scale, { toValue: 0.94, speed: 40, bounciness: 0, useNativeDriver: true }).start();
  };
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, speed: 20, bounciness: 12, useNativeDriver: true }).start();

  return (
    <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
      <Animated.View
        style={[
          styles.shadow,
          {
            width,
            height,
            borderRadius: height / 2,
            backgroundColor: GRADIENTS[variant][0],
            shadowColor: GLOW[variant],
            transform: [{ scale }],
          },
        ]}
      >
        <LinearGradient
          colors={GRADIENTS[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fill, { borderRadius: height / 2 }]}
        >
          <Text style={[styles.label, { fontSize }]}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowOpacity: 0.85,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { color: COLORS.black, fontWeight: '900', letterSpacing: 1.5 },
});
