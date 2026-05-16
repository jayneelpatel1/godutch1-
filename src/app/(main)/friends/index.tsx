/**
 * @screen FriendsScreen
 * @description Shows all unique friends (people the current user shares groups with)
 *              with their total net balance aggregated across all groups.
 *              Tapping a friend navigates to the friend detail screen for per-group breakdown.
 *
 * @route /friends (tab)
 * @auth Required
 *
 * @dependencies useFriendBalances
 */

import { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useFriendBalances } from '@/hooks/useFriends';
import { Spacing, BorderRadius } from '@/constants/theme';
import Footer from '@/components/footer';

export default function FriendsScreen() {
  const theme = useTheme();
  const { friends, isLoading, error, refetch } = useFriendBalances();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleFriendPress = (friendId: string) => {
    router.push(`/friends/${friendId}` as any);
  };

  const friendCount = friends.length;
  const nonZeroCount = friends.filter((f) => f.totalAmount !== 0).length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Friends</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {friendCount} {friendCount === 1 ? 'friend' : 'friends'}
              {nonZeroCount > 0 ? ` · ${nonZeroCount} outstanding` : ''}
            </ThemedText>
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
            {friendCount === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={theme.textSecondary} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>No friends yet</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                  Create a group and add members to see them here
                </ThemedText>
                <Pressable
                  style={[styles.emptyButton, { backgroundColor: theme.primary }]}
                  onPress={() => router.push('/create-group')}>
                  <ThemedText style={[styles.emptyButtonText, { color: '#FFFFFF' }]}>Create Group</ThemedText>
                </Pressable>
              </View>
            ) : (
              friends.map((friend) => {
                const amount = friend.totalAmount;
                const isPositive = amount > 0;
                const isNegative = amount < 0;
                const isSettled = amount === 0;

                return (
                  <Pressable
                    key={friend.userId}
                    style={({ pressed }) => [
                      styles.friendCard,
                      { backgroundColor: theme.backgroundElement },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleFriendPress(friend.userId)}>
                    <View style={[styles.avatar, { backgroundColor: isPositive ? theme.success : isNegative ? theme.danger : theme.textSecondary }]}>
                      <ThemedText style={styles.avatarText}>
                        {friend.userName.charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={styles.friendInfo}>
                      <ThemedText type="default">{friend.userName}</ThemedText>
                      <ThemedText
                        type="small"
                        style={{
                          color: isPositive ? theme.success : isNegative ? theme.danger : theme.textSecondary,
                        }}>
                        {isPositive
                          ? `owes you ₹${amount.toFixed(2)}`
                          : isNegative
                            ? `you owe ₹${Math.abs(amount).toFixed(2)}`
                            : 'settled up'}
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                  </Pressable>
                );
              })
            )}
            <Footer />
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
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius,
    marginBottom: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  friendInfo: {
    flex: 1,
    marginLeft: Spacing.three,
  },
});
