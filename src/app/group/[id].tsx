import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  mockGroups,
  mockExpenses,
  mockUsers,
  getBalances,
  type Group,
} from '@/data/mockData';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant-outline',
  travel: 'airplane-outline',
  bills: 'receipt-outline',
  shopping: 'cart-outline',
  entertainment: 'film-outline',
  other: 'ellipsis-horizontal-outline',
};

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = mockGroups.find((g) => g.id === id);
  const expenses = mockExpenses.filter((e) => e.groupId === id);
  const balances = getBalances(id || '');

  if (!group) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Group not found</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const getUserName = (userId: string) => {
    return mockUsers.find((u) => u.id === userId)?.name || 'Unknown';
  };

  const sortedExpenses = [...expenses].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const totalOwed = balances.reduce((sum, b) => sum + b.balance, 0);
  const netColor = totalOwed > 0 ? Colors.light.success : totalOwed < 0 ? Colors.light.danger : Colors.light.textSecondary;

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
              <ThemedText type="small" themeColor="textSecondary">Total balance</ThemedText>
              <ThemedText type="subtitle" style={[styles.netAmount, { color: netColor }]}>
                {totalOwed === 0 ? 'Settled up' : totalOwed > 0 ? `You get $${totalOwed.toFixed(2)}` : `You owe $${Math.abs(totalOwed).toFixed(2)}`}
              </ThemedText>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={() => router.push('/expense')}>
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
              BALANCES
            </ThemedText>
            {balances.map((b) => {
              const isPositive = b.balance > 0;
              const isNegative = b.balance < 0;
              const color = isPositive ? Colors.light.success : isNegative ? Colors.light.danger : Colors.light.textSecondary;
              return (
                <View key={b.userId} style={styles.balanceRow}>
                  <View style={styles.balanceUser}>
                    <View style={styles.balanceAvatar}>
                      <ThemedText style={styles.balanceAvatarText}>
                        {getUserName(b.userId).charAt(0).toUpperCase()}
                      </ThemedText>
                    </View>
                    <ThemedText>{getUserName(b.userId)}</ThemedText>
                  </View>
                  <ThemedText style={[styles.balanceAmount, { color }]}>
                    {b.balance === 0
                      ? 'Settled up'
                      : isPositive
                      ? `Gets $${b.balance.toFixed(2)}`
                      : `Owes $${Math.abs(b.balance).toFixed(2)}`}
                  </ThemedText>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
              EXPENSES
            </ThemedText>
            {sortedExpenses.map((expense) => {
              const iconName = CATEGORY_ICONS[expense.category] || 'ellipsis-horizontal-outline';
              const isPaidByYou = expense.paidBy === 'user1';
              const amountColor = isPaidByYou ? Colors.light.success : Colors.light.text;
              return (
                <Pressable key={expense.id} style={({ pressed }) => [styles.expenseItem, pressed && styles.expensePressed]}>
                  <View style={styles.expenseIcon}>
                    <Ionicons name={iconName} size={22} color={Colors.light.primary} />
                  </View>
                  <View style={styles.expenseInfo}>
                    <ThemedText type="subtitle">{expense.note}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {getUserName(expense.paidBy)} paid · {expense.category}
                    </ThemedText>
                  </View>
                  <ThemedText type="subtitle" style={[styles.expenseAmount, { color: amountColor }]}>
                    ${expense.amount.toFixed(2)}
                  </ThemedText>
                </Pressable>
              );
            })}
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
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.one,
  },
  balanceUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },
  balanceAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceAmount: { fontWeight: '600' },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.one,
  },
  expensePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },
  expenseInfo: { flex: 1 },
  expenseAmount: {
    fontWeight: '600',
    marginLeft: Spacing.two,
  },
});