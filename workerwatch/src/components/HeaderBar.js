import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/tokens';

// Encabezado: hora actual + indicador de batería.
export default function HeaderBar({ time, battery = 82 }) {
  const low = battery <= 20;
  return (
    <View style={styles.row}>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.battery}>
        <View style={styles.body}>
          <View
            style={[
              styles.level,
              { width: `${battery}%`, backgroundColor: low ? '#FF416C' : '#00FF87' },
            ]}
          />
        </View>
        <View style={styles.cap} />
        <Text style={styles.pct}>{battery}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  time: { color: COLORS.white, fontSize: 28, fontWeight: '900', letterSpacing: 1, marginRight: 12 },
  battery: { flexDirection: 'row', alignItems: 'center' },
  body: {
    width: 26,
    height: 13,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 3,
    padding: 1,
  },
  level: { flex: 1, borderRadius: 1 },
  cap: { width: 2, height: 6, backgroundColor: COLORS.white, marginLeft: 1 },
  pct: { color: COLORS.dim, fontSize: 12, fontWeight: '700', marginLeft: 5 },
});
