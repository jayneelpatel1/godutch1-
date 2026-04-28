import { Tabs } from 'expo-router';
import React from 'react';

export default function AppTabs() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Groups',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          title: 'Add',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}