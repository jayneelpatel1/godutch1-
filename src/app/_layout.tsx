import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.backgroundElement,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Groups',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="list" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="expense"
          options={{
            title: 'Add',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="add-circle" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="time" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="person" color={color} />
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}

function TabBarIcon({ name, color }: { name: string; color: string }) {
  return null;
}
