import React from 'react';
import { StyleSheet, View } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import ShiftRing from '../components/ShiftRing';
import TaskCard from '../components/TaskCard';
import useClock from '../hooks/useClock';

// Estados posibles de la tarea y cómo se muestran en el badge
const BADGES = {
  active: { label: 'ACTIVA', variant: 'safe', pulse: true },
  attending: { label: 'ATENDIENDO', variant: 'ai', pulse: true },
  reported: { label: 'REPORTADA', variant: 'alert', pulse: true },
};

export default function HomeScreen({ taskStatus = 'active', battery = 82 }) {
  const time = useClock();

  return (
    <View style={styles.root}>
      <HeaderBar time={time} battery={battery} />
      <ShiftRing range="08:00 - 16:00" progress={0.62} />
      <TaskCard machine="Máquina #04" badge={BADGES[taskStatus]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', paddingTop: 34, gap: 8 },
});
