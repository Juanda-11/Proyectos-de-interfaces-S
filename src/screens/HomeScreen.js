import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import ShiftRing from '../components/ShiftRing';
import TaskCard from '../components/TaskCard';
import { useWorker } from '../context/WorkerContext';
import useBattery from '../hooks/useBattery';
import useClock from '../hooks/useClock';
import useShift from '../hooks/useShift';
import { shiftRangeLabel } from '../utils/shift';

// Estados posibles de la tarea y cómo se muestran en el badge
const BADGES = {
  active: { label: 'ACTIVA', variant: 'safe', pulse: true },
  attending: { label: 'ATENDIENDO', variant: 'ai', pulse: true },
  reported: { label: 'REPORTADA', variant: 'alert', pulse: true },
};

// Dashboard: hora, batería, turno real y equipo asignado (ambos configurables).
export default function HomeScreen({ onOpenConfig }) {
  const time = useClock();
  const battery = useBattery();
  const { config, machine, taskStatus } = useWorker();
  const status = useShift(config.shift);

  return (
    <View style={styles.root}>
      <HeaderBar time={time} battery={battery} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Configurar turno"
        onPress={onOpenConfig}
      >
        <ShiftRing range={shiftRangeLabel(config.shift)} status={status} />
      </Pressable>
      <TaskCard
        machine={machine.name}
        icon={machine.icon}
        badge={BADGES[taskStatus]}
        onPress={onOpenConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', paddingTop: 34, gap: 8 },
});
