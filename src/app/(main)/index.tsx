import { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import GroupCard from '@/components/group-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/authStore';
import { useGroups } from '@/hooks/useGroups';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { groups, isLoading, error, refetch } = useGroups();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleGroupPress = (groupId: string) => {
    router.push(`/group/${groupId}`);
  };

  const handleCreateGroup = () => {
    router.push('/create-group');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Groups</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {groups.length} groups
            </ThemedText>
          </View>
          <View style={styles.headerButtons}>
            <Pressable style={styles.debugButton} onPress={() => {
              console.log('[DEBUG] Firebase UID:', user?.id);
              alert(`Firebase UID: ${user?.id || 'Not logged in'}`);
            }}>
              <Ionicons name="information-circle" size={20} color={theme.textSecondary} />
            </Pressable>
            <Pressable style={styles.createButton} onPress={handleCreateGroup}>
               <Ionicons name="add-circle" size={24} color={theme.primary} />
             </Pressable>
          </View>
        </View>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.danger + '20' }]}>
            <ThemedText type="small" style={{ color: theme.danger }}>{error}</ThemedText>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }>
            {groups.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={theme.textSecondary} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>No groups yet</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                  Create a group to start splitting expenses
                </ThemedText>
                <Pressable style={[styles.emptyButton, { backgroundColor: theme.primary }]}>
                  <ThemedText style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>Create Group</ThemedText>
                </Pressable>
              </View>
            ) : (
              groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPress={() => handleGroupPress(group.id)}
                />
              ))
            )}
          </ScrollView>
        )}
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  debugButton: {
    padding: Spacing.one,
  },
  createButton: {
    padding: Spacing.one,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: Spacing.five,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: Spacing.two,
    borderRadius: BorderRadius,
    marginBottom: Spacing.two,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six * 2,
  },
  emptyTitle: { marginTop: Spacing.three, marginBottom: Spacing.one },
  emptyText: { textAlign: 'center', marginBottom: Spacing.four },
  emptyButton: {
    borderRadius: BorderRadius,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  emptyButtonText: { fontWeight: '600' },
});
