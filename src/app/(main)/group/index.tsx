import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="add-member" options={{ headerShown: false }} />
    </Stack>
  );
}
