import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS } from '../../theme/tokens';

export default function SectionTitle({ children, color = COLORS.cyan }) {
  return <Text style={[styles.title, { color }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: { fontSize: 12, fontWeight: '900', letterSpacing: 2, marginTop: 16, marginBottom: 2, width: 270 },
});
