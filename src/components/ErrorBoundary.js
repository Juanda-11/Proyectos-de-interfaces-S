import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/tokens';

// Evita la pantalla en blanco si algo falla: muestra un mensaje y permite reintentar.
export default class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('WorkerWatch error:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.root}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Algo salió mal</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => this.setState({ failed: false })}
          style={styles.button}
        >
          <Text style={styles.buttonText}>REINTENTAR</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  icon: { fontSize: 48 },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
  button: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  buttonText: { color: COLORS.dim, fontWeight: '800', letterSpacing: 1 },
});
