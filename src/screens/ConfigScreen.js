import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import GradientButton from '../components/GradientButton';
import OptionRow from '../components/config/OptionRow';
import SectionTitle from '../components/config/SectionTitle';
import Stepper from '../components/config/Stepper';
import { SIMULATION_OPTIONS } from '../context/configReducer';
import { useWorker } from '../context/WorkerContext';
import { MACHINE_TYPES } from '../data/machineTypes';
import { SHIFT_PRESETS } from '../data/shiftPresets';
import { COLORS } from '../theme/tokens';
import { formatDuration, shiftDuration, shiftTime } from '../utils/shift';

// Configuración del puesto: equipo, turno, simulación de fallas y voz. Se guarda automáticamente.
export default function ConfigScreen({ onClose, onSimulate }) {
  const { config, dispatch, machine } = useWorker();
  const isCustom = config.shift.presetId === 'custom';

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>⚙ CONFIGURACIÓN</Text>
        <Text style={styles.sub}>{machine.name}</Text>

        <SectionTitle>EQUIPO</SectionTitle>
        <View style={styles.list}>
          {MACHINE_TYPES.map((type) => (
            <OptionRow
              key={type.id}
              icon={type.icon}
              label={type.label}
              detail={type.sector}
              selected={type.id === config.machineTypeId}
              onPress={() => dispatch({ type: 'setMachineType', id: type.id })}
            />
          ))}
        </View>

        <View style={styles.gap} />
        <Stepper
          label="NÚMERO"
          value={`#${String(config.machineNumber).padStart(2, '0')}`}
          onMinus={() => dispatch({ type: 'setMachineNumber', value: config.machineNumber - 1 })}
          onPlus={() => dispatch({ type: 'setMachineNumber', value: config.machineNumber + 1 })}
        />
        <View style={styles.gap} />
        <TextInput
          value={config.customName}
          onChangeText={(value) => dispatch({ type: 'setCustomName', value })}
          placeholder="Nombre propio (opcional)"
          placeholderTextColor={COLORS.dim}
          maxLength={24}
          style={styles.input}
          accessibilityLabel="Nombre personalizado del equipo"
        />

        <SectionTitle color={COLORS.safe}>TURNO</SectionTitle>
        <View style={styles.list}>
          {SHIFT_PRESETS.map((preset) => (
            <OptionRow
              key={preset.id}
              icon={preset.icon}
              label={preset.label}
              detail={preset.id === 'custom' ? '' : `${preset.start}-${preset.end}`}
              selected={preset.id === config.shift.presetId}
              accent={COLORS.safe}
              onPress={() => dispatch({ type: 'setShiftPreset', id: preset.id })}
            />
          ))}
        </View>
        {isCustom ? (
          <View style={styles.list}>
            <View style={styles.gap} />
            <Stepper
              label="ENTRADA"
              value={config.shift.start}
              onMinus={() => dispatch({ type: 'setShiftTime', field: 'start', value: shiftTime(config.shift.start, -30) })}
              onPlus={() => dispatch({ type: 'setShiftTime', field: 'start', value: shiftTime(config.shift.start, 30) })}
            />
            <Stepper
              label="SALIDA"
              value={config.shift.end}
              onMinus={() => dispatch({ type: 'setShiftTime', field: 'end', value: shiftTime(config.shift.end, -30) })}
              onPlus={() => dispatch({ type: 'setShiftTime', field: 'end', value: shiftTime(config.shift.end, 30) })}
            />
          </View>
        ) : null}
        <Text style={styles.note}>Duración: {formatDuration(shiftDuration(config.shift))}</Text>

        <SectionTitle color={COLORS.ai}>SIMULACIÓN DE FALLAS</SectionTitle>
        <View style={styles.pills}>
          {SIMULATION_OPTIONS.map((o) => (
            <OptionRow
              key={o.id}
              icon={o.id === 'off' ? '✋' : '⏱️'}
              label={o.id === 'off' ? 'Solo manual' : `Cada ${o.label}`}
              selected={o.id === config.simulation}
              accent={COLORS.ai}
              onPress={() => dispatch({ type: 'setSimulation', id: o.id })}
            />
          ))}
        </View>

        <View style={styles.voiceRow}>
          <Text style={styles.voiceLabel}>🔊 Respuestas por voz</Text>
          <Switch
            value={config.voice}
            onValueChange={(value) => dispatch({ type: 'setVoice', value })}
            trackColor={{ false: COLORS.line, true: COLORS.ai }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.actions}>
          <GradientButton label="SIMULAR FALLA" variant="alert" width={260} height={54} fontSize={18} onPress={onSimulate} />
          <GradientButton label="LISTO" variant="safe" width={260} height={54} fontSize={20} onPress={onClose} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  content: { alignItems: 'center', paddingTop: 52, paddingBottom: 90, gap: 6 },
  heading: { color: COLORS.white, fontSize: 20, fontWeight: '900', letterSpacing: 1.5 },
  sub: { color: COLORS.dim, fontSize: 13, fontWeight: '700' },
  list: { gap: 6 },
  pills: { gap: 6 },
  gap: { height: 6 },
  note: { color: COLORS.dim, fontSize: 12, fontWeight: '700', marginTop: 4 },
  input: {
    width: 270,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  voiceRow: {
    width: 270,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  voiceLabel: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
  actions: { marginTop: 18, gap: 12 },
});
