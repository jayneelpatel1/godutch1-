import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGroupStore } from '@/store/groupStore';
import { useAuthStore } from '@/store/authStore';
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses';
import ExpenseCard from '@/components/ExpenseCard';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function GroupDetailsScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { groups } = useGroupStore();
  const { expenses, isLoading } = useExpenses(id as string);
  const deleteExpenseMutation = useDeleteExpense(id as string);

  const group = groups.find((g) => g.id === id);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const netBalance = sortedExpenses.reduce((net, expense) => {
    if (!currentUserId) return net;
    let balance = 0;
    if (expense.paidBy === currentUserId) {
      const othersOwed = expense.splits
        .filter(s => s.userId !== currentUserId)
        .reduce((sum, s) => sum + s.owedAmount, 0);
      balance += othersOwed;
    }
    const userSplit = expense.splits?.find(s => s.userId === currentUserId);
    if (userSplit) balance -= userSplit.owedAmount;
    return net + balance;
  }, 0);

  const balanceLabel = netBalance > 0 ? 'You are owed' : netBalance < 0 ? 'You owe' : 'All settled up';

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

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpenseMutation.mutate(expenseId);
    }
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
              <ThemedText type="small" themeColor="textSecondary">{balanceLabel}</ThemedText>
              <ThemedText type="subtitle" style={[styles.netAmount, { color: netBalance > 0 ? Colors.light.success : netBalance < 0 ? Colors.light.danger : Colors.light.text }]}>
                {netBalance !== 0 ? `₹${Math.abs(netBalance).toFixed(2)}` : '₹0.00'}
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
            <Pressable style={styles.actionButton} onPress={() => router.push(`/group/add-member?groupId=${id}`)}>
              <Ionicons name="person-add-outline" size={20} color={Colors.light.text} />
              <ThemedText type="small" style={styles.actionText}>Add Member</ThemedText>
            </Pressable>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
              EXPENSES ({sortedExpenses.length})
            </ThemedText>
            {isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : sortedExpenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={Colors.light.textSecondary} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>No expenses yet</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                  Add an expense to start tracking
                </ThemedText>
              </View>
            ) : (
              sortedExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onPress={() => router.push(`/expense/${expense.id}`)}
                  onDelete={() => handleDeleteExpense(expense.id)}
                  groupId={id as string}
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
