import React, { useCallback, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import WatchFrame from './src/components/WatchFrame';
import PageDots from './src/components/PageDots';
import HomeScreen from './src/screens/HomeScreen';
import AlertScreen from './src/screens/AlertScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import { COLORS, WATCH_SIZE } from './src/theme/tokens';

const SCREENS = ['home', 'alert', 'assistant'];
const GLOW = { home: '#60EFFF', alert: '#FF416C', assistant: '#A855F7' };
const W = WATCH_SIZE;

// WatchContainer: emula el smartwatch y navega entre Dashboard → Alerta IA → Asistente IA.
export default function App() {
  const [screen, setScreen] = useState('home');
  const [taskStatus, setTaskStatus] = useState('active'); // 'active' | 'attending' | 'reported'
  const progress = useRef(new Animated.Value(0)).current; // 0 home · 1 alerta · 2 asistente
  const screenRef = useRef('home');

  const goTo = useCallback(
    (target) => {
      screenRef.current = target;
      setScreen(target);
      Animated.timing(progress, {
        toValue: SCREENS.indexOf(target),
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [progress]
  );

  // Gesto: deslizar ← avanza, → retrocede
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 25 && Math.abs(g.dy) < 25,
      onPanResponderRelease: (_, g) => {
        const i = SCREENS.indexOf(screenRef.current);
        if (g.dx < -40) goTo(SCREENS[Math.min(i + 1, SCREENS.length - 1)]);
        else if (g.dx > 40) goTo(SCREENS[Math.max(i - 1, 0)]);
      },
    })
  ).current;

  // ACEPTAR → abre el asistente · REPORTAR → vuelve al dashboard con la tarea reportada
  const handleAlertResolve = (type) => {
    if (type === 'accepted') {
      setTaskStatus('attending');
      goTo('assistant');
    } else {
      setTaskStatus('reported');
      goTo('home');
    }
  };

  // LISTO en el último paso → la máquina vuelve a estar activa
  const handleAssistantDone = () => {
    setTaskStatus('active');
    goTo('home');
  };

  // Transiciones slide + fade
  const range = [0, 1, 2];
  const homeX = progress.interpolate({ inputRange: range, outputRange: [0, -W, -W] });
  const homeOpacity = progress.interpolate({ inputRange: range, outputRange: [1, 0.2, 0.2] });
  const alertX = progress.interpolate({ inputRange: range, outputRange: [W, 0, -W] });
  const assistantX = progress.interpolate({ inputRange: range, outputRange: [W, W, 0] });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <WatchFrame glow={GLOW[screen]} panHandlers={pan.panHandlers}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: homeOpacity, transform: [{ translateX: homeX }] }]}
          pointerEvents={screen === 'home' ? 'auto' : 'none'}
        >
          <HomeScreen taskStatus={taskStatus} battery={82} />
        </Animated.View>

        <Animated.View
          style={[StyleSheet.absoluteFill, { transform: [{ translateX: alertX }] }]}
          pointerEvents={screen === 'alert' ? 'auto' : 'none'}
        >
          <AlertScreen active={screen === 'alert'} onResolve={handleAlertResolve} />
        </Animated.View>

        <Animated.View
          style={[StyleSheet.absoluteFill, { transform: [{ translateX: assistantX }] }]}
          pointerEvents={screen === 'assistant' ? 'auto' : 'none'}
        >
          <AssistantScreen active={screen === 'assistant'} onDone={handleAssistantDone} />
        </Animated.View>

        <PageDots index={SCREENS.indexOf(screen)} />
      </WatchFrame>

      {/* Controles de demostración (fuera del reloj) */}
      <Text style={styles.hint}>Desliza ← → dentro del reloj o usa los botones</Text>
      <View style={styles.controls}>
        <DemoButton label="DASHBOARD" onPress={() => goTo('home')} />
        <DemoButton label="SIMULAR ALERTA" onPress={() => goTo('alert')} />
        <DemoButton label="ASISTENTE" onPress={() => goTo('assistant')} />
        <DemoButton label="REINICIAR" onPress={() => { setTaskStatus('active'); goTo('home'); }} />
      </View>
    </View>
  );
}

function DemoButton({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.demoBtn, pressed && { opacity: 0.6 }]}>
      <Text style={styles.demoText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  hint: { color: COLORS.dim, fontSize: 12, marginTop: 28 },
  controls: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 380 },
  demoBtn: { borderWidth: 1, borderColor: '#2A3350', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  demoText: { color: COLORS.dim, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
