import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import ErrorBoundary from './src/components/ErrorBoundary';
import WatchFrame from './src/components/WatchFrame';
import PageDots from './src/components/PageDots';
import HomeScreen from './src/screens/HomeScreen';
import AlertScreen from './src/screens/AlertScreen';
import AssistantScreen from './src/screens/AssistantScreen';
import ConfigScreen from './src/screens/ConfigScreen';
import { WorkerProvider, useWorker } from './src/context/WorkerContext';
import useApiStatus from './src/hooks/useApiStatus';
import { COLORS, WATCH_SIZE } from './src/theme/tokens';
import { isWatchMode } from './src/utils/watchMode';

const SCREENS = ['home', 'alert', 'assistant'];
const GLOW = { home: '#60EFFF', alert: '#FF416C', assistant: '#A855F7' };
const W = WATCH_SIZE;
const WATCH_MODE = isWatchMode();

export default function App() {
  return (
    <ErrorBoundary>
      <WorkerProvider>
        {WATCH_MODE ? <KeepScreenOn /> : null}
        <WatchApp />
      </WorkerProvider>
    </ErrorBoundary>
  );
}

// En el reloj físico la pantalla no se apaga mientras la app está abierta (turno de trabajo).
function KeepScreenOn() {
  useKeepAwake();
  return null;
}

// WatchContainer: emula el smartwatch y navega entre Dashboard → Alerta IA → Asistente IA.
// La configuración del puesto (equipo y turno) se abre como una capa sobre el dashboard.
function WatchApp() {
  const { hydrated, setTaskStatus, setAlert, triggerAlert, simulationSeconds } = useWorker();
  const [screen, setScreen] = useState('home');
  const [configOpen, setConfigOpen] = useState(false);
  const progress = useRef(new Animated.Value(0)).current; // 0 home · 1 alerta · 2 asistente
  const screenRef = useRef('home');
  const configRef = useRef(false);

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

  const openConfig = useCallback(() => {
    configRef.current = true;
    setConfigOpen(true);
  }, []);
  const closeConfig = useCallback(() => {
    configRef.current = false;
    setConfigOpen(false);
  }, []);

  // Alerta simulada del sensor del equipo configurado
  const simulateAlert = useCallback(() => {
    triggerAlert();
    setTaskStatus('active');
    closeConfig();
    goTo('alert');
  }, [triggerAlert, setTaskStatus, closeConfig, goTo]);

  // Simulación automática: lanza una falla cada N segundos mientras el trabajador está en el dashboard
  useEffect(() => {
    if (!simulationSeconds || !hydrated) return undefined;
    const id = setInterval(() => {
      if (screenRef.current === 'home' && !configRef.current) simulateAlert();
    }, simulationSeconds * 1000);
    return () => clearInterval(id);
  }, [simulationSeconds, hydrated, simulateAlert]);

  // Botón/gesto "atrás" del reloj (Wear OS y Android): cierra la configuración o vuelve de pantalla
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (configRef.current) {
        closeConfig();
        return true;
      }
      const i = SCREENS.indexOf(screenRef.current);
      if (i > 0) {
        goTo(SCREENS[i - 1]);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [closeConfig, goTo]);

  // Gesto: deslizar ← avanza, → retrocede
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !configRef.current && Math.abs(g.dx) > 25 && Math.abs(g.dy) < 25,
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
    setAlert(null);
    goTo('home');
  };

  const reset = () => {
    setTaskStatus('active');
    setAlert(null);
    closeConfig();
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

      <WatchFrame glow={GLOW[screen]} panHandlers={pan.panHandlers} fullscreen={WATCH_MODE}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { opacity: homeOpacity, transform: [{ translateX: homeX }] },
          ]}
          pointerEvents={screen === 'home' && !configOpen ? 'auto' : 'none'}
        >
          <HomeScreen onOpenConfig={openConfig} />
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

        {configOpen ? (
          <View style={StyleSheet.absoluteFill}>
            <ConfigScreen onClose={closeConfig} onSimulate={simulateAlert} />
          </View>
        ) : null}
      </WatchFrame>

      {WATCH_MODE ? null : (
        <DemoPanel
          onDashboard={() => {
            closeConfig();
            goTo('home');
          }}
          onAlert={simulateAlert}
          onAssistant={() => {
            closeConfig();
            goTo('assistant');
          }}
          onConfig={() => {
            goTo('home');
            openConfig();
          }}
          onReset={reset}
        />
      )}
    </View>
  );
}

// Controles de demostración (fuera del reloj). No se muestran en el modo reloj.
function DemoPanel({ onDashboard, onAlert, onAssistant, onConfig, onReset }) {
  const { status, model } = useApiStatus();
  const labels = {
    unconfigured: ['#A7B0C0', 'IA sin backend · modo sin conexión'],
    checking: ['#FFB020', 'Conectando con el backend…'],
    online: ['#00FF87', `IA conectada${model ? ` · ${model}` : ''}`],
    degraded: ['#FFB020', 'Backend activo, falta GEMINI_API_KEY'],
    offline: ['#FF416C', 'Backend sin respuesta · modo sin conexión'],
  };
  const [color, text] = labels[status];

  return (
    <>
      <Text style={styles.hint}>Desliza ← → dentro del reloj o usa los botones</Text>
      <View style={styles.controls}>
        <DemoButton label="DASHBOARD" onPress={onDashboard} />
        <DemoButton label="SIMULAR ALERTA" onPress={onAlert} />
        <DemoButton label="ASISTENTE" onPress={onAssistant} />
        <DemoButton label="CONFIGURAR" onPress={onConfig} />
        <DemoButton label="REINICIAR" onPress={onReset} />
      </View>
      <View style={styles.status}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <Text style={styles.statusText}>{text}</Text>
      </View>
    </>
  );
}

function DemoButton({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.demoBtn, pressed && { opacity: 0.6 }]}
    >
      <Text style={styles.demoText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { color: COLORS.dim, fontSize: 12, marginTop: 28 },
  controls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 420,
  },
  demoBtn: {
    borderWidth: 1,
    borderColor: '#2A3350',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  demoText: { color: COLORS.dim, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: COLORS.dim, fontSize: 12, fontWeight: '600' },
});
