import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGroupStore } from '@/store/groupStore';
import { useExpenseStore } from '@/store/expenseStore';
import ExpenseCard from '@/components/ExpenseCard';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { groups } = useGroupStore();
  const { expenses } = useExpenseStore();

  const group = groups.find((g) => g.id === id);
  const groupExpenses = expenses.filter((e) => e.groupId === id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!group) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Group not found</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const handleAddExpense = () => {
    router.push(`/expense?groupId=${id}`);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {group.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText type="title" style={styles.groupName}>
              {group.name}
            </ThemedText>
            <View style={styles.netBalance}>
              <ThemedText type="small" themeColor="textSecondary">Total expenses</ThemedText>
              <ThemedText type="subtitle" style={styles.netAmount}>
                ${groupExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={handleAddExpense}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.light.primary} />
              <ThemedText type="small" style={styles.actionText}>Add Expense</ThemedText>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Ionicons name="swap-horizontal-outline" size={20} color={Colors.light.text} />
              <ThemedText type="small" style={styles.actionText}>Settle Up</ThemedText>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Ionicons name="person-add-outline" size={20} color={Colors.light.text} />
              <ThemedText type="small" style={styles.actionText}>Add Member</ThemedText>
            </Pressable>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
              EXPENSES ({groupExpenses.length})
            </ThemedText>
            {groupExpenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={Colors.light.textSecondary} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>No expenses yet</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                  Add an expense to start tracking
                </ThemedText>
              </View>
            ) : (
              groupExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onPress={() => router.push(`/expense/${expense.id}`)}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  groupName: { marginBottom: Spacing.one },
  netBalance: {
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  netAmount: {
    fontWeight: '700',
    marginTop: Spacing.half,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.four,
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  actionText: {
    marginTop: Spacing.one,
    fontWeight: '500',
  },
  section: { marginBottom: Spacing.four },
  sectionLabel: {
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
  emptyTitle: {
    marginTop: Spacing.two,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
});
