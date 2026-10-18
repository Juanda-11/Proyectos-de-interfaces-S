import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'workerwatch:config:v2';

export async function loadConfig() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function saveConfig(config) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(config));
  } catch (e) {
    // El almacenamiento es opcional: la app sigue funcionando sin persistir.
  }
}
