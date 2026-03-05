import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 12,
          paddingBottom: 8,
          height: 80,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feeds',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text" color={color} />,
          headerRight: () => (
            <Pressable onPress={() => router.push('/reading-list')} style={{ marginRight: 16 }}>
              <IconSymbol name="bookmark" size={24} color={Colors[colorScheme ?? 'light'].tint} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape" color={color} />,
        }}
      />
    </Tabs>
  );
}
