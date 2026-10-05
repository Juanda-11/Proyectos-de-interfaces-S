import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { COLORS, WATCH_SIZE } from '../theme/tokens';

// Marco circular que emula el smartwatch (380 x 380). Se reduce solo en pantallas angostas.
export default function WatchFrame({ children, glow = '#60EFFF', panHandlers }) {
  const { width } = useWindowDimensions();
  const scale = Math.min(1, (width - 32) / (WATCH_SIZE + 12));

  return (
    <View style={{ width: WATCH_SIZE, height: WATCH_SIZE, transform: [{ scale }] }}>
      <View style={styles.crown} />
      {/* Capa exterior: borde + resplandor (la sombra no se recorta aquí) */}
      <View style={[styles.ring, { shadowColor: glow }]}>
        {/* Capa interior: recorta el contenido en círculo */}
        <View style={styles.screen} {...panHandlers}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: WATCH_SIZE,
    height: WATCH_SIZE,
    borderRadius: WATCH_SIZE / 2,
    backgroundColor: COLORS.bg,
    borderWidth: 5,
    borderColor: COLORS.bezel,
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  screen: {
    flex: 1,
    borderRadius: WATCH_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: COLORS.bg,
  },
  crown: {
    position: 'absolute',
    right: -9,
    top: 150,
    width: 14,
    height: 60,
    borderRadius: 7,
    backgroundColor: COLORS.bezel,
  },
});
