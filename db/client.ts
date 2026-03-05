import { openDatabaseSync } from 'expo-sqlite';

export const db = openDatabaseSync('second-brain.db', {
  enableChangeListener: true,
});
