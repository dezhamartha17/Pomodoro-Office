import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pomodoro_office_v1';

const PERSIST_KEYS = [
  'coins', 'totalXp', 'totalPomodoros', 'streak',
  'inventory', 'builtParts', 'myName', 'myAvatar', 'group',
];

export async function loadGameState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveGameState(state) {
  try {
    const persisted = {};
    PERSIST_KEYS.forEach((k) => { persisted[k] = state[k]; });
    await AsyncStorage.setItem(KEY, JSON.stringify(persisted));
  } catch {
    // silently fail — state still usable in memory
  }
}
