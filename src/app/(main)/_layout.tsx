import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View, Pressable, Text, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLinkBuilder } from '@react-navigation/native';

import { Colors } from '@/constants/theme';

function CenteredTabBar({ state, descriptors, navigation }: any) {
  const { buildHref } = useLinkBuilder();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.tabBarWrapper, { backgroundColor: colors.background, borderTopColor: colors.backgroundElement }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];

          if (options.tabBarButton || options.href === null) {
            return null;
          }

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              href={buildHref(route.name, route.params)}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              {options.tabBarIcon?.({
                color: isFocused ? colors.primary : colors.textSecondary,
                focused: isFocused,
                size: 24,
              })}
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.primary : colors.textSecondary },
                ]}
              >
                {typeof label === 'string' ? label : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

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
            borderTopWidth: 1,
          },
          headerShown: false,
        }}
        tabBar={(props) => <CenteredTabBar {...props} />}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Groups',
            tabBarIcon: ({ color }) => (
              <Ionicons name="people-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="expense"
          options={{
            title: 'Add',
            tabBarIcon: ({ color }) => (
              <Ionicons name="add-circle" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color }) => (
              <Ionicons name="time-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="create-group"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="group/index"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="group/[id]"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="group/add-member"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="expense/[id]"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="+not-found"
          options={{
            tabBarButton: () => null,
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 500,
    width: '100%',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginTop: 4,
  },
});
