import React from 'react';
import { StyleSheet, View } from 'react-native';

const DOT_COLORS = ['#60EFFF', '#FF416C', '#A855F7']; // home, alerta, asistente

// Indicador de página (3 puntos). El activo se alarga y toma el color de la pantalla.
export default function PageDots({ index = 0 }) {
  return (
    <View pointerEvents="none" style={styles.row}>
      {DOT_COLORS.map((color, i) => (
        <View
          key={color}
          style={[styles.dot, i === index && { width: 20, backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { position: 'absolute', left: 0, right: 0, bottom: 22, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2A3350' },
});
