import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useActivities } from '@/hooks/useActivities';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import ActivityItem from '@/components/ActivityItem';

export default function ActivityScreen() {
  const theme = useTheme();
  const { data: activities, isLoading, error, refetch } = useActivities();

  useFocusEffect(() => {
    refetch();
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Activity</ThemedText>
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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                RECENT ACTIVITY
              </ThemedText>
              {(activities || []).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </View>
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
    paddingVertical: Spacing.four,
  },
  scrollContent: {
    paddingBottom: Spacing.five,
    flexGrow: 1,
  },
  sectionHeader: {
    paddingVertical: Spacing.two,
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 1,
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
