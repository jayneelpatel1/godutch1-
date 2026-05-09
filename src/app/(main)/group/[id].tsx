import { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator, Alert, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGroupStore } from '@/store/groupStore';
import { useAuthStore } from '@/store/authStore';
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses';
import { useDeleteGroup } from '@/hooks/useGroups';
import { useSettlements, useDeleteSettlement } from '@/hooks/useSettlements';
import ExpenseCard from '@/components/ExpenseCard';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/components/Toast';
import { computeBalances, computeNetBalance } from '@/utils/balance';
import { fetchUsersByIds } from '@/services/userService';
import type { Settlement } from '@/types/settlement';

export default function GroupDetailsScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { groups } = useGroupStore();
  const { expenses, isLoading: expensesLoading } = useExpenses(id as string);
  const { settlements, isLoading: settlementsLoading } = useSettlements(id as string);
  const deleteExpenseMutation = useDeleteExpense(id as string);
  const deleteGroupMutation = useDeleteGroup();
  const deleteSettlementMutation = useDeleteSettlement(id as string);

  const group = groups.find((g) => g.id === id);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const memberIds = group?.members?.map((m) => m.user_id) || [];
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (memberIds.length > 0) {
      fetchUsersByIds(memberIds).then(({ users }) => {
        const map: Record<string, string> = {};
        users.forEach((u) => { map[u.id] = u.name; });
        setUserMap(map);
      });
    }
  }, [group?.id]);

  const isLoading = expensesLoading || settlementsLoading;

  const balances = useMemo(() => {
    if (!currentUserId) return [];
    return computeBalances(sortedExpenses, memberIds, currentUserId, settlements);
  }, [sortedExpenses, memberIds, currentUserId, settlements]);

  const netBalance = useMemo(() => {
    if (!currentUserId) return 0;
    return computeNetBalance(sortedExpenses, currentUserId, settlements);
  }, [sortedExpenses, currentUserId, settlements]);

  const allTransactions = useMemo(() => {
    const expenseEntries = sortedExpenses.map((e) => ({
      type: 'expense' as const,
      id: e.id,
      createdAt: e.createdAt,
      data: e,
    }));
    const settlementEntries = settlements.map((s) => ({
      type: 'settlement' as const,
      id: s.id,
      createdAt: s.createdAt,
      data: s,
    }));
    return [...expenseEntries, ...settlementEntries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [sortedExpenses, settlements]);

  const balanceLabel = netBalance > 0 ? 'You are owed' : netBalance < 0 ? 'You owe' : 'All settled up';
  const positiveBalances = balances.filter((b) => b.amount > 0);
  const negativeBalances = balances.filter((b) => b.amount < 0);

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
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpenseMutation.mutate(expenseId),
        },
      ]
    );
  };

  const handleDeleteSettlement = (settlementId: string) => {
    console.log('[Settlement] handleDeleteSettlement called for:', settlementId);
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this settlement? The balance will be updated accordingly.')) {
        console.log('[Settlement] Web confirm accepted, deleting:', settlementId);
        deleteSettlementMutation.mutate(settlementId, {
          onSuccess: () => {
            console.log('[Settlement] Delete success:', settlementId);
            showToast('success', 'Settlement deleted');
          },
          onError: (error: any) => {
            console.error('[Settlement] Delete error:', error);
            showToast('error', error.message || 'Failed to delete settlement');
          },
        });
      }
    } else {
      Alert.alert(
        'Delete Settlement',
        'Are you sure you want to delete this settlement? The balance will be updated accordingly.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              console.log('[Settlement] Alert confirm accepted, deleting:', settlementId);
              deleteSettlementMutation.mutate(settlementId, {
                onSuccess: () => {
                  console.log('[Settlement] Delete success:', settlementId);
                  showToast('success', 'Settlement deleted');
                },
                onError: (error: any) => {
                  console.error('[Settlement] Delete error:', error);
                  showToast('error', error.message || 'Failed to delete settlement');
                },
              });
            },
          },
        ]
      );
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"? This action cannot be undone. All expenses in this group will also be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGroupMutation.mutate({ groupId: group.id, groupName: group.name }, {
              onSuccess: () => {
                showToast('success', 'Group deleted successfully');
                router.replace('/(main)');
              },
              onError: (error: any) => {
                showToast('error', error.message || 'Failed to delete group');
              },
            });
          },
        },
      ]
    );
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

            {positiveBalances.length > 0 && (
              <View style={styles.balancesSection}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.balancesLabel}>
                  They owe you
                </ThemedText>
                {positiveBalances.map((b) => (
                  <View key={b.userId} style={styles.balanceRow}>
                    <ThemedText type="subtitle">{userMap[b.userId] || 'Loading...'}</ThemedText>
                    <ThemedText type="subtitle" style={{ color: Colors.light.success }}>₹{b.amount.toFixed(2)}</ThemedText>
                  </View>
                ))}
              </View>
            )}
            {negativeBalances.length > 0 && (
              <View style={styles.balancesSection}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.balancesLabel}>
                  You owe them
                </ThemedText>
                {negativeBalances.map((b) => (
                  <View key={b.userId} style={styles.balanceRow}>
                    <ThemedText type="subtitle">{userMap[b.userId] || 'Loading...'}</ThemedText>
                    <ThemedText type="subtitle" style={{ color: Colors.light.danger }}>₹{Math.abs(b.amount).toFixed(2)}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={handleAddExpense}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.light.primary} />
              <ThemedText type="small" style={styles.actionText}>Add Expense</ThemedText>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => router.push(`/group/settle-up?groupId=${id}`)}>
              <Ionicons name="swap-horizontal-outline" size={20} color={Colors.light.text} />
              <ThemedText type="small" style={styles.actionText}>Settle Up</ThemedText>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => router.push(`/group/add-member?groupId=${id}`)}>
              <Ionicons name="person-add-outline" size={20} color={Colors.light.text} />
              <ThemedText type="small" style={styles.actionText}>Add Member</ThemedText>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleDeleteGroup}>
              <Ionicons name="trash-outline" size={20} color={Colors.light.danger} />
              <ThemedText type="small" style={[styles.actionText, { color: Colors.light.danger }]}>Delete</ThemedText>
            </Pressable>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
              TRANSACTIONS ({allTransactions.length})
            </ThemedText>
            {isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : allTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={Colors.light.textSecondary} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>No transactions yet</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
                  Add an expense to start tracking
                </ThemedText>
              </View>
            ) : (
              allTransactions.map((tx) => {
                if (tx.type === 'expense') {
                  return (
                    <ExpenseCard
                      key={tx.id}
                      expense={tx.data}
                      onPress={() => router.push(`/expense/${tx.id}`)}
                      onDelete={() => handleDeleteExpense(tx.id)}
                      groupId={id as string}
                    />
                  );
                }
                const settlement = tx.data as Settlement;
                const isPayer = settlement.payerId === currentUserId;
                const isReceiver = settlement.receiverId === currentUserId;
                return (
                  <Pressable
                    key={tx.id}
                    onPress={() => {
                      console.log('[Settlement] Card pressed, calling delete for:', tx.id);
                      handleDeleteSettlement(tx.id);
                    }}
                    style={({ pressed }) => [
                      styles.settlementCard,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View style={styles.settlementContent}>
                      <View style={styles.settlementIcon}>
                        <Ionicons name="swap-horizontal" size={20} color={Colors.light.success} />
                      </View>
                      <View style={styles.settlementInfo}>
                        <ThemedText type="subtitle" style={styles.settlementTitle}>
                          {isPayer
                            ? `You paid ${userMap[settlement.receiverId] || 'Unknown'}`
                            : isReceiver
                              ? `${userMap[settlement.payerId] || 'Unknown'} paid you`
                              : `${userMap[settlement.payerId] || 'Unknown'} paid ${userMap[settlement.receiverId] || 'Unknown'}`}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 2 }}>
                          Settlement · {new Date(settlement.createdAt).toLocaleDateString()}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.settlementActions}>
                      <ThemedText
                        type="subtitle"
                        style={[styles.settlementAmount, { color: isReceiver ? Colors.light.success : Colors.light.danger }]}
                      >
                        {isReceiver ? '+' : '-'}₹{settlement.amount.toFixed(2)}
                      </ThemedText>
                      <View style={styles.settlementDeleteBtn}>
                        <Ionicons name="trash-outline" size={16} color={Colors.light.danger} />
                      </View>
                    </View>
                  </Pressable>
                );
              })
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
  balancesSection: {
    marginBottom: Spacing.three,
  },
  balancesLabel: {
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
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
  settlementCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settlementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settlementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16A34A20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },
  settlementInfo: {
    flex: 1,
  },
  settlementTitle: {
    marginBottom: 2,
  },
  settlementActions: {
    marginLeft: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
  },
  settlementAmount: {
    fontWeight: '700',
  },
  settlementDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC262615',
    marginTop: 2,
  },
  settlementPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
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
