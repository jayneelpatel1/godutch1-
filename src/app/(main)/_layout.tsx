import { ThemeProvider, useLinkBuilder } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View, Pressable, Text, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing } from '@/constants/theme';
import { Toast } from '@/components/Toast';

const NavDarkTheme = {
  dark: true,
  colors: {
    primary: '#818CF8',
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    border: '#334155',
    notification: '#818CF8',
  },
  fonts: Platform.select({
    default: { regular: { fontFamily: 'system-ui', fontWeight: '400' }, medium: { fontFamily: 'system-ui', fontWeight: '500' }, bold: { fontFamily: 'system-ui', fontWeight: '700' }, heavy: { fontFamily: 'system-ui', fontWeight: '900' } },
  }) as any,
};

const NavLightTheme = {
  dark: false,
  colors: {
    primary: '#4F46E5',
    background: '#FFFFFF',
    card: '#F1F5F9',
    text: '#1E1B4B',
    border: '#E2E8F0',
    notification: '#4F46E5',
  },
  fonts: Platform.select({
    default: { regular: { fontFamily: 'system-ui', fontWeight: '400' }, medium: { fontFamily: 'system-ui', fontWeight: '500' }, bold: { fontFamily: 'system-ui', fontWeight: '700' }, heavy: { fontFamily: 'system-ui', fontWeight: '900' } },
  }) as any,
};

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
              <View style={styles.tabIconWrap}>
                {options.tabBarIcon?.({
                  color: isFocused ? colors.primary : colors.textSecondary,
                  focused: isFocused,
                  size: 24,
                })}

              </View>
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
    <ThemeProvider value={colorScheme === 'dark' ? NavDarkTheme : NavLightTheme}>
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
          name="expense"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="create-group"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="group/settle-up"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="expense/[id]/edit"
          options={{
            tabBarButton: () => null,
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
      <Toast />
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
    paddingHorizontal: Spacing.four,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  tabIconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginTop: Spacing.one + 2,
  },
});
