import { useMemo, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useActivities } from '@/hooks/useActivities';
import { deleteOldActivities } from '@/services/activityService';
import { Spacing, BorderRadius } from '@/constants/theme';
import ActivityItem from '@/components/ActivityItem';
import Footer from '@/components/footer';

export default function ActivityScreen() {
  const theme = useTheme();
  const { activities, isLoading, error, refetch } = useActivities();

  useFocusEffect(useCallback(() => {
    deleteOldActivities(7);
    refetch();
  }, [refetch]));

  const groupedActivities = useMemo(() => {
    const groups: { month: string; activities: typeof activities }[] = [];
    const monthMap = new Map<string, typeof activities>();

    (activities || []).forEach((activity) => {
      const date = new Date(activity.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, []);
      }
      monthMap.get(monthKey)!.push(activity);
    });

    const sortedKeys = Array.from(monthMap.keys()).sort().reverse();
    sortedKeys.forEach((key) => {
      const [year, month] = key.split('-');
      const d = new Date(parseInt(year), parseInt(month));
      const monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      groups.push({ month: monthLabel, activities: monthMap.get(key)! });
    });

    return groups;
  }, [activities]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <ThemedText type="title" style={styles.headerTitle}>Activity</ThemedText>
          <View style={styles.headerSide}>
            <Pressable style={styles.settingsBtn} hitSlop={8}>
              <Ionicons name="settings-outline" size={22} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: theme.danger + '20' }]}>
            <Ionicons name="warning" size={16} color={theme.danger} />
            <ThemedText style={[styles.errorText, { color: theme.danger }]}>{error}</ThemedText>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : !activities || activities.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="time-outline" size={32} color={theme.textSecondary} />
            </View>
            <ThemedText type="subtitle" style={styles.emptyTitle}>No activity yet</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyDesc}>
              Expenses and settlements will appear here
            </ThemedText>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>

              <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.summaryRow}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Total Balance
                  </ThemedText>
                  <View style={styles.summaryActions}>
                    <Pressable style={styles.summaryActionBtn} hitSlop={6}>
                      <Ionicons name="eye-outline" size={16} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </View>
                <ThemedText type="title" style={styles.summaryAmount}>
                  {'\u20B9'}0.00
                </ThemedText>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}
                  onPress={() => router.push('/expense')}>
                  <Ionicons name="add-circle-outline" size={18} color={theme.primary} />
                  <ThemedText type="small" style={[styles.actionBtnLabel, { color: theme.primary }]}>Add</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}
                  onPress={() => router.push('/(main)')}>
                  <Ionicons name="swap-horizontal-outline" size={18} color={theme.text} />
                  <ThemedText type="small" style={styles.actionBtnLabel}>Settle</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: theme.background, borderColor: theme.backgroundSelected }]}
                  onPress={() => router.push('/(main)')}>
                  <Ionicons name="people-outline" size={18} color={theme.text} />
                  <ThemedText type="small" style={styles.actionBtnLabel}>Groups</ThemedText>
                </Pressable>
              </View>

              {groupedActivities.map((group) => (
                <View key={group.month} style={styles.monthSection}>
                  <ThemedText style={[styles.monthHeader, { color: theme.textSecondary }]}>
                    {group.month.toUpperCase()}
                  </ThemedText>
                  {group.activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </View>
              ))}

              <Footer />
            </ScrollView>

            <View style={styles.fabContainer} pointerEvents="box-none">
              <Pressable style={[styles.fab, styles.fabSecondary, { backgroundColor: theme.backgroundElement, shadowColor: '#000' }]}>
                <Ionicons name="swap-horizontal" size={20} color={theme.text} />
              </Pressable>
              <Pressable style={[styles.fab, styles.fabPrimary, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                <Ionicons name="add" size={26} color="#FFFFFF" />
              </Pressable>
            </View>
          </>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 28,
    textAlign: 'center',
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-end',
  },
  settingsBtn: {
    padding: Spacing.one,
  },
  summaryCard: {
    borderRadius: BorderRadius,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryActionBtn: {
    padding: 2,
  },
  summaryAmount: {
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two + 4,
    borderRadius: BorderRadius,
    borderWidth: 1,
  },
  actionBtnLabel: {
    fontWeight: '600',
  },
  monthSection: {
    marginBottom: Spacing.three,
  },
  monthHeader: {
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 13,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.half,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: 130,
    flexGrow: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: Spacing.three,
    gap: Spacing.two,
    alignItems: 'center',
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabSecondary: {
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  fabPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    flex: 1,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  emptyTitle: {
    marginBottom: Spacing.one,
  },
  emptyDesc: {
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: Spacing.two,
    borderRadius: 8,
    marginBottom: Spacing.two,
  },
  errorText: {},
});
