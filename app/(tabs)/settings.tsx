import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme, type ThemePreference } from '@/providers/theme-provider';

const OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { preference, setPreference } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Appearance
        </ThemedText>
        <View
          style={[
            styles.segmentedControl,
            { backgroundColor: Colors[colorScheme].icon + '15' },
          ]}
        >
          {OPTIONS.map((option) => {
            const isSelected = preference === option.value;
            return (
              <Pressable
                key={option.value}
                style={[
                  styles.segment,
                  isSelected && [
                    styles.segmentSelected,
                    { backgroundColor: Colors[colorScheme].tint },
                  ],
                ]}
                onPress={() => setPreference(option.value)}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    { color: isSelected ? '#fff' : Colors[colorScheme].text },
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    opacity: 0.5,
    letterSpacing: 0.5,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
