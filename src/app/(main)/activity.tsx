import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ExpenseCard from '@/components/ExpenseCard';
import { useExpenseStore } from '@/store/expenseStore';
import { Colors, Spacing } from '@/constants/theme';

export default function ActivityScreen() {
  const { expenses } = useExpenseStore();

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">Activity</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {sortedExpenses.length} recent expenses
          </ThemedText>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {sortedExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <ThemedText style={styles.emptyIcon}>📋</ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.emptyTitle}>No activity yet</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Expenses will appear here
              </ThemedText>
            </View>
          ) : (
            sortedExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                showGroup
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
    paddingVertical: Spacing.four,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingBottom: Spacing.five,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    marginBottom: Spacing.one,
  },
});
