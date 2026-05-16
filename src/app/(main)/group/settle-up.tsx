/**
 * @screen SettleUpScreen
 * @description Shows balances per member (who owes you / you owe them).
 *              User can initiate a settlement by clicking on a balance row,
 *              entering an amount, and confirming payment.
 *              Past settlements are shown below with delete capability.
 *
 * @route /group/[id]/settle-up
 * @auth Required
 *
 * @dependencies useExpenses, useSettlements, useCreateSettlement, useDeleteSettlement
 *
 * @remarks
 *   - "All settled up" empty state shown when no active balances
 *   - Settlement amounts default to the owed amount but can be overridden
 *   - Past settlements can be deleted to undo mistakes
 */

import { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useGroupStore } from '@/store/groupStore';
import { useAuthStore } from '@/store/authStore';
import { useExpenses } from '@/hooks/useExpenses';
import { useSettlements, useCreateSettlement, useDeleteSettlement } from '@/hooks/useSettlements';
import { computeBalances } from '@/utils/balance';
import { fetchUsersByIds } from '@/services/userService';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { showToast } from '@/components/Toast';

export default function SettleUpScreen() {
  const theme = useTheme();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { groups } = useGroupStore();
  const { expenses, isLoading: expensesLoading } = useExpenses(groupId as string);
  const { settlements, isLoading: settlementsLoading } = useSettlements(groupId as string);
  const createSettlement = useCreateSettlement(groupId as string);
  const deleteSettlement = useDeleteSettlement(groupId as string);

  const group = groups.find((g) => g.id === groupId);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const currentUserName = useAuthStore((state) => state.user?.name);

  const memberIds = group?.members?.map((m) => m.user_id) || [];
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [settlingUserId, setSettlingUserId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');

  useEffect(() => {
    const memberUserIds = group?.members?.map((m) => m.user_id) || [];
    const settlementUserIds = settlements.flatMap((s) => [s.payerId, s.receiverId]);
    const expensePayerIds = expenses.map((e) => e.paidBy);
    const allIds = [...new Set([...memberUserIds, ...settlementUserIds, ...expensePayerIds])];

    if (allIds.length > 0) {
      fetchUsersByIds(allIds).then(({ users }) => {
        const map: Record<string, string> = {};
        users.forEach((u) => { map[u.id] = u.name; });
        setUserMap(map);
      });
    }
  }, [group?.id, settlements.length, expenses.length]);

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [expenses]
  );

  const balances = useMemo(() => {
    if (!currentUserId) return [];
    return computeBalances(sortedExpenses, memberIds, currentUserId, settlements);
  }, [sortedExpenses, memberIds, currentUserId, settlements]);

  const positiveBalances = balances.filter((b) => b.amount > 0);
  const negativeBalances = balances.filter((b) => b.amount < 0);

  const handleSettle = () => {
    if (!settlingUserId || !settleAmount || !currentUserId) return;

    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('error', 'Please enter a valid amount');
      return;
    }

    const balance = balances.find((b) => b.userId === settlingUserId);
    if (!balance) return;

    const maxAmount = Math.abs(balance.amount);
    if (amount > maxAmount) {
      showToast('error', `Amount cannot exceed ₹${maxAmount.toFixed(2)}`);
      return;
    }

    const isCurrentUserPayer = balance.amount < 0;

    createSettlement.mutate(
      {
        groupId: groupId as string,
        payerId: isCurrentUserPayer ? currentUserId : settlingUserId,
        receiverId: isCurrentUserPayer ? settlingUserId : currentUserId,
        amount,
        note: settleNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast('success', 'Settlement recorded successfully');
          setSettlingUserId(null);
          setSettleAmount('');
          setSettleNote('');
          router.replace(`/group/${groupId}`);
        },
        onError: (error: any) => {
          showToast('error', error.message || 'Failed to record settlement');
        },
      }
    );
  };

  const handleDeleteSettlement = (settlementId: string) => {
    Alert.alert(
      'Delete Settlement',
      'Are you sure you want to delete this settlement? The balance will be updated accordingly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSettlement.mutate(settlementId, {
              onSuccess: () => {
                showToast('success', 'Settlement deleted');
              },
              onError: (error: any) => {
                showToast('error', error.message || 'Failed to delete settlement');
              },
            });
          },
        },
      ]
    );
  };

  if (!group) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText>Group not found</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="title">Settle Up</ThemedText>
          <View style={styles.backButton} />
        </View>

        <ThemedText type="subtitle" style={styles.groupName}>{group.name}</ThemedText>

        {expensesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {positiveBalances.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                  They owe you
                </ThemedText>
                {positiveBalances.map((b) => (
                  <View key={b.userId}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.balanceCard,
                        { backgroundColor: theme.backgroundElement },
                        pressed && styles.pressed,
                        settlingUserId === b.userId && { borderColor: theme.primary, borderWidth: 1 },
                      ]}
                      onPress={() => {
                        setSettlingUserId(settlingUserId === b.userId ? null : b.userId);
                        setSettleAmount(b.amount.toFixed(2));
                      }}
                    >
                      <View style={styles.balanceInfo}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                          <ThemedText style={styles.avatarText}>
                            {(userMap[b.userId] || '?').charAt(0).toUpperCase()}
                          </ThemedText>
                        </View>
                        <View>
                          <ThemedText type="default">{userMap[b.userId] || 'Unknown'}</ThemedText>
                          <ThemedText type="small" style={{ color: theme.success }}>
                            owes you
                          </ThemedText>
                        </View>
                      </View>
                      <ThemedText type="subtitle" style={{ color: theme.success, fontWeight: '700' }}>
                        ₹{b.amount.toFixed(2)}
                      </ThemedText>
                    </Pressable>
                    {settlingUserId === b.userId && (
                      <View style={[styles.settleForm, { backgroundColor: theme.backgroundElement }]}>
                        <ThemedText type="small" themeColor="textSecondary">
                          {userMap[b.userId]} owes you ₹{b.amount.toFixed(2)}
                        </ThemedText>
                        <View style={styles.inputRow}>
                          <TextInput
                            style={[styles.amountInput, { color: theme.text, borderColor: theme.textSecondary }]}
                            value={settleAmount}
                            onChangeText={setSettleAmount}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor={theme.textSecondary}
                          />
                        </View>
                        <TextInput
                          style={[styles.noteInput, { color: theme.text, borderColor: theme.textSecondary }]}
                          value={settleNote}
                          onChangeText={setSettleNote}
                          placeholder="Note (optional)"
                          placeholderTextColor={theme.textSecondary}
                        />
                        <Pressable
                          style={[styles.confirmButton, { backgroundColor: theme.primary, alignSelf: 'flex-end', marginTop: Spacing.two }]}
                          onPress={handleSettle}
                        >
                          {createSettlement.isPending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <ThemedText style={styles.confirmText}>Settle</ThemedText>
                          )}
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {negativeBalances.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                  You owe them
                </ThemedText>
                {negativeBalances.map((b) => (
                  <View key={b.userId}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.balanceCard,
                        { backgroundColor: theme.backgroundElement },
                        pressed && styles.pressed,
                        settlingUserId === b.userId && { borderColor: theme.danger, borderWidth: 1 },
                      ]}
                      onPress={() => {
                        setSettlingUserId(settlingUserId === b.userId ? null : b.userId);
                        setSettleAmount(Math.abs(b.amount).toFixed(2));
                      }}
                    >
                      <View style={styles.balanceInfo}>
                        <View style={[styles.avatar, { backgroundColor: theme.danger }]}>
                          <ThemedText style={styles.avatarText}>
                            {(userMap[b.userId] || '?').charAt(0).toUpperCase()}
                          </ThemedText>
                        </View>
                        <View>
                          <ThemedText type="default">{userMap[b.userId] || 'Unknown'}</ThemedText>
                          <ThemedText type="small" style={{ color: theme.danger }}>
                            you owe
                          </ThemedText>
                        </View>
                      </View>
                      <ThemedText type="subtitle" style={{ color: theme.danger, fontWeight: '700' }}>
                        ₹{Math.abs(b.amount).toFixed(2)}
                      </ThemedText>
                    </Pressable>
                    {settlingUserId === b.userId && (
                      <View style={[styles.settleForm, { backgroundColor: theme.backgroundElement }]}>
                        <ThemedText type="small" themeColor="textSecondary">
                          You owe {userMap[b.userId]} ₹{Math.abs(b.amount).toFixed(2)}
                        </ThemedText>
                        <View style={styles.inputRow}>
                          <TextInput
                            style={[styles.amountInput, { color: theme.text, borderColor: theme.textSecondary }]}
                            value={settleAmount}
                            onChangeText={setSettleAmount}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor={theme.textSecondary}
                          />
                        </View>
                        <TextInput
                          style={[styles.noteInput, { color: theme.text, borderColor: theme.textSecondary }]}
                          value={settleNote}
                          onChangeText={setSettleNote}
                          placeholder="Note (optional)"
                          placeholderTextColor={theme.textSecondary}
                        />
                        <Pressable
                          style={[styles.confirmButton, { backgroundColor: theme.primary, alignSelf: 'flex-end', marginTop: Spacing.two }]}
                          onPress={handleSettle}
                        >
                          {createSettlement.isPending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <ThemedText style={styles.confirmText}>Settle</ThemedText>
                          )}
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {settlements.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                  PAST SETTLEMENTS
                </ThemedText>
                {settlements.map((s) => {
                  const isPayer = s.payerId === currentUserId;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => handleDeleteSettlement(s.id)}
                      activeOpacity={0.85}
                      style={[styles.pastSettlementCard, { backgroundColor: theme.backgroundElement }]}
                    >
                      <View style={styles.pastSettlementContent}>
                        <View style={[styles.pastSettlementIcon, { backgroundColor: theme.textSecondary + '30' }]}>
                          <Ionicons name="swap-horizontal" size={18} color={theme.textSecondary} />
                        </View>
                        <View style={styles.pastSettlementInfo}>
                          <ThemedText type="default" style={{ marginBottom: 2 }}>
                            {isPayer
                              ? `You paid ${userMap[s.receiverId] || 'Unknown'}`
                              : `${userMap[s.payerId] || 'Unknown'} paid you`}
                          </ThemedText>
                          {s.note ? (
                            <ThemedText type="small" themeColor="textSecondary" style={{ marginBottom: 2 }}>
                              {s.note}
                            </ThemedText>
                          ) : null}
                          <ThemedText type="small" themeColor="textSecondary">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.pastSettlementActions}>
                        <ThemedText type="subtitle" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                          ₹{s.amount.toFixed(2)}
                        </ThemedText>
                        <View style={[styles.pastSettlementDeleteBtn, { backgroundColor: theme.danger + '15' }]}>
                          <Ionicons name="trash-outline" size={16} color={theme.danger} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {positiveBalances.length === 0 && negativeBalances.length === 0 && settlements.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={64} color={theme.success} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>All settled up</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  No outstanding balances in this group
                </ThemedText>
              </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    marginBottom: Spacing.four,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  section: {
    marginBottom: Spacing.four,
  },
  sectionLabel: {
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius,
    marginBottom: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  settleForm: {
    padding: Spacing.three,
    borderRadius: BorderRadius,
    marginBottom: Spacing.two,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius,
    padding: Spacing.two,
    fontSize: 18,
    fontWeight: '600',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: BorderRadius,
    padding: Spacing.two,
    fontSize: 14,
    marginTop: Spacing.two,
  },
  confirmButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius,
    minWidth: 80,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pastSettlementCard: {
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pastSettlementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.two,
  },
  pastSettlementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastSettlementInfo: {
    flex: 1,
  },
  pastSettlementActions: {
    marginLeft: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
  },
  pastSettlementDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  emptyTitle: {
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
  },
});
