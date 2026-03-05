import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DatabaseProvider } from '@/providers/database-provider';
import { AppThemeProvider } from '@/providers/theme-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigation() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="feed/[id]" options={{ title: 'Articles' }} />
        <Stack.Screen name="reading-list" options={{ title: 'Reading List' }} />
        <Stack.Screen name="add-feed" options={{ presentation: 'modal', title: 'Add Feed' }} />
        <Stack.Screen name="add-task" options={{ presentation: 'modal', title: 'Add Task' }} />
        <Stack.Screen name="manage-categories" options={{ presentation: 'modal', title: 'Categories' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <AppThemeProvider>
        <RootNavigation />
      </AppThemeProvider>
    </DatabaseProvider>
  );
}
