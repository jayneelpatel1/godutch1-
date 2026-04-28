import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import GroupCard from '@/components/group-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { mockGroups } from '@/data/mockData';
import { Colors, Spacing, BorderRadius, MaxContentWidth } from '@/constants/theme';

export default function HomeScreen() {
  const handleGroupPress = (groupId: string) => {
    router.push(`/group/${groupId}` as any);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Groups</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {mockGroups.length} groups
            </ThemedText>
          </View>
          <Pressable style={styles.createButton}>
            <Ionicons name="add-circle" size={24} color={Colors.light.primary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {mockGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={Colors.light.textSecondary} />
              <ThemedText type="subtitle" style={styles.emptyTitle}>No groups yet</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                Create a group to start splitting expenses
              </ThemedText>
              <Pressable style={styles.emptyButton}>
                <ThemedText style={styles.emptyButtonText}>Create Group</ThemedText>
              </Pressable>
            </View>
          ) : (
            mockGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onPress={() => handleGroupPress(group.id)}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  createButton: {
    padding: Spacing.one,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: Spacing.five,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six * 2,
  },
  emptyTitle: { marginTop: Spacing.three, marginBottom: Spacing.one },
  emptyText: { textAlign: 'center', marginBottom: Spacing.four },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  emptyButtonText: { color: '#FFFFFF', fontWeight: '600' },
});