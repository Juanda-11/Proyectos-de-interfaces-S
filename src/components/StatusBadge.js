import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS, GLOW, COLORS } from '../theme/tokens';

// Badge de estado con degradado neón. Si `pulse` es true, el punto y el halo laten.
export default function StatusBadge({ label, variant = 'safe', pulse = true, compact = false }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pulse) {
      anim.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, anim]);

  const dotOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] });
  const haloOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.5] });
  const haloScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

  return (
    <View>
      <Animated.View
        style={[
          styles.halo,
          {
            backgroundColor: GLOW[variant],
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />
      <LinearGradient
        colors={GRADIENTS[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.pill, compact && styles.pillCompact]}
      >
        <Animated.View
          style={[styles.dot, compact && styles.dotCompact, { opacity: dotOpacity }]}
        />
        <Text style={[styles.text, compact && styles.textCompact]}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { ...StyleSheet.absoluteFillObject, borderRadius: 999 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillCompact: { paddingVertical: 4, paddingHorizontal: 9 },
  dotCompact: { width: 7, height: 7, marginRight: 5 },
  textCompact: { fontSize: 11 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.black,
    marginRight: 6,
  },
  text: { color: COLORS.black, fontSize: 13, fontWeight: '900', letterSpacing: 0.8 },
});
