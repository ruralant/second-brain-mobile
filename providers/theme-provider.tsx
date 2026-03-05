import { getSetting, setSetting } from '@/db/settings';
import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextType = {
  /** The resolved theme to actually render */
  theme: 'light' | 'dark';
  /** The user's stored preference */
  preference: ThemePreference;
  /** Update the preference (persists to SQLite) */
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  preference: 'system',
  setPreference: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const SETTING_KEY = 'themePreference';

export function AppThemeProvider({ children }: PropsWithChildren) {
  const osScheme = useRNColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const stored = getSetting(SETTING_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  });

  const theme: 'light' | 'dark' =
    preference === 'system'
      ? (osScheme === 'dark' ? 'dark' : 'light')
      : preference;

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    setSetting(SETTING_KEY, pref);
  }, []);

  return (
    <ThemeContext value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext>
  );
}
