/**
 * @screen FriendDetailScreen
 * @description Shows per-group balance breakdown for a single friend, allows
 *              settling up per group or all at once. Past settlements are
 *              shown below with delete capability.
 *
 * @route /friends/[id]
 * @auth Required
 *
 * @dependencies useFriendBalances, useSettlementsBetweenUsers
 */

import { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/authStore';
import { useFriendBalances, useSettlementsBetweenUsers } from '@/hooks/useFriends';
import { createSettlement, deleteSettlement } from '@/services/settlementService';
import { Spacing, BorderRadius } from '@/constants/theme';
import { showToast } from '@/components/Toast';

export default function FriendDetailScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const friendId = id as string;
  const currentUserId = useAuthStore((state) => state.user?.id);

  const { friends, isLoading: balancesLoading } = useFriendBalances();
  const { settlements, isLoading: settlementsLoading, refetch: refetchSettlements } = useSettlementsBetweenUsers(friendId);

  const friend = friends.find((f) => f.userId === friendId);

  const [settleModalVisible, setSettleModalVisible] = useState(false);
  const [settleGroupId, setSettleGroupId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const activeGroups = useMemo(() => {
    if (!friend) return [];
    return friend.groupBalances.filter((g) => g.amount !== 0);
  }, [friend]);

  const totalAmount = friend?.totalAmount ?? 0;
  const isTotalPositive = totalAmount > 0;
  const isTotalNegative = totalAmount < 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['friendBalances', currentUserId] });
    queryClient.invalidateQueries({ queryKey: ['settlementsBetween', currentUserId, friendId] });
    queryClient.invalidateQueries({ queryKey: ['groupBalances', currentUserId] });
  };

  const openSettleSingle = (groupId: string, amount: number) => {
    setSettleGroupId(groupId);
    setSettleAmount(Math.abs(amount).toFixed(2));
    setSettleNote('');
    setBatchMode(false);
    setSettleModalVisible(true);
  };

  const openSettleAll = () => {
    setSettleGroupId(null);
    setSettleAmount(Math.abs(totalAmount).toFixed(2));
    setSettleNote('');
    setBatchMode(true);
    setSettleModalVisible(true);
  };

  const handleSettle = async () => {
    if (!currentUserId || !friendId) return;

    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('error', 'Please enter a valid amount');
      return;
    }

    setIsSettling(true);

    try {
      if (batchMode) {
        const nonZeroGroups = activeGroups.filter((g) => g.amount !== 0);
        for (const group of nonZeroGroups) {
          const isCurrentUserPayer = group.amount < 0;
          const settleAmountNum = Math.abs(group.amount);
          const { error } = await createSettlement({
            groupId: group.groupId,
            payerId: isCurrentUserPayer ? currentUserId : friendId,
            receiverId: isCurrentUserPayer ? friendId : currentUserId,
            amount: settleAmountNum,
            note: settleNote.trim() || undefined,
          });
          if (error) throw new Error(error);
        }
        showToast('success', 'All settlements recorded');
      } else {
        if (!settleGroupId) return;
        const groupBalance = activeGroups.find((g) => g.groupId === settleGroupId);
        if (!groupBalance) return;
        const maxAmount = Math.abs(groupBalance.amount);
        if (amount > maxAmount) {
          showToast('error', `Amount cannot exceed ₹${maxAmount.toFixed(2)}`);
          setIsSettling(false);
          return;
        }
        const isCurrentUserPayer = groupBalance.amount < 0;
        const { error } = await createSettlement({
          groupId: settleGroupId,
          payerId: isCurrentUserPayer ? currentUserId : friendId,
          receiverId: isCurrentUserPayer ? friendId : currentUserId,
          amount,
          note: settleNote.trim() || undefined,
        });
        if (error) throw new Error(error);
        showToast('success', 'Settlement recorded');
      }

      setSettleModalVisible(false);
      setSettleAmount('');
      setSettleNote('');
      invalidate();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to record settlement');
    } finally {
      setIsSettling(false);
    }
  };

  const handleDeleteSettlement = (settlementId: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Delete this settlement? The balance will be updated accordingly.');
      if (!confirmed) return;
    } else {
      Alert.alert(
        'Delete Settlement',
        'Are you sure you want to delete this settlement?',
        [
          { text: 'Cancel', style: 'cancel' as const },
          {
            text: 'Delete',
            style: 'destructive' as const,
            onPress: () => doDeleteSettlement(settlementId),
          },
        ]
      );
      return;
    }
    doDeleteSettlement(settlementId);
  };

  const doDeleteSettlement = async (settlementId: string) => {
    const { error } = await deleteSettlement(settlementId);
    if (error) {
      showToast('error', error);
    } else {
      showToast('success', 'Settlement deleted');
      invalidate();
    }
  };

  const isLoading = balancesLoading || settlementsLoading;
  const canSettleAll = activeGroups.length > 1;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <View style={styles.headerInfo}>
            <View style={[styles.headerAvatar, { backgroundColor: isTotalPositive ? theme.success : isTotalNegative ? theme.danger : theme.textSecondary }]}>
              <ThemedText style={styles.headerAvatarText}>
                {(friend?.userName || '?').charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.headerName}>
              {friend?.userName || 'Unknown'}
            </ThemedText>
          </View>
          <View style={styles.backButton} />
        </View>

        {isLoading && !friend ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : !friend ? (
          <View style={styles.emptyState}>
            <ThemedText type="subtitle">Friend not found</ThemedText>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <View style={[styles.totalBalanceCard, { backgroundColor: isTotalPositive ? theme.success + '15' : isTotalNegative ? theme.danger + '15' : theme.backgroundElement }]}>
              <ThemedText
                type="small"
                style={[styles.balanceLabel, { color: isTotalPositive ? theme.success : isTotalNegative ? theme.danger : theme.textSecondary }]}>
                {isTotalPositive
                  ? `${friend.userName} owes you`
                  : isTotalNegative
                    ? `You owe ${friend.userName}`
                    : 'All settled up'}
              </ThemedText>
              <ThemedText
                type="title"
                style={[styles.netAmount, { color: isTotalPositive ? theme.success : isTotalNegative ? theme.danger : theme.text }]}>
                {totalAmount !== 0 ? `₹${Math.abs(totalAmount).toFixed(2)}` : '₹0.00'}
              </ThemedText>
            </View>

            {activeGroups.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                  GROUP BREAKDOWN
                </ThemedText>
                {activeGroups.map((gb) => {
                  const isPositive = gb.amount > 0;
                  return (
                    <View key={gb.groupId} style={[styles.groupRow, { backgroundColor: theme.backgroundElement }]}>
                      <View style={styles.groupRowInfo}>
                        <ThemedText type="default">{gb.groupName}</ThemedText>
                        <ThemedText
                          type="small"
                          style={{ color: isPositive ? theme.success : theme.danger, marginTop: 2 }}>
                          {isPositive
                            ? `${friend.userName} owes you`
                            : `you owe`}
                          {' '}₹{Math.abs(gb.amount).toFixed(2)}
                        </ThemedText>
                      </View>
                      <Pressable
                        style={[styles.settleButton, { backgroundColor: theme.primary }]}
                        onPress={() => openSettleSingle(gb.groupId, gb.amount)}>
                        <ThemedText style={styles.settleButtonText}>Settle</ThemedText>
                      </Pressable>
                    </View>
                  );
                })}

                {canSettleAll && (
                  <Pressable
                    style={[styles.settleAllButton, { backgroundColor: theme.primary }]}
                    onPress={openSettleAll}>
                    <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
                    <ThemedText style={styles.settleAllText}>
                      Settle All ₹{Math.abs(totalAmount).toFixed(2)}
                    </ThemedText>
                  </Pressable>
                )}
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
                    <Pressable
                      key={s.id}
                      onPress={() => handleDeleteSettlement(s.id)}
                      style={({ pressed }) => [
                        styles.pastSettlementCard,
                        { backgroundColor: theme.backgroundElement },
                        pressed && styles.pressed,
                      ]}>
                      <View style={styles.pastSettlementContent}>
                        <View style={[styles.pastSettlementIcon, { backgroundColor: theme.textSecondary + '30' }]}>
                          <Ionicons name="swap-horizontal" size={18} color={theme.textSecondary} />
                        </View>
                        <View style={styles.pastSettlementInfo}>
                          <ThemedText type="default" style={{ marginBottom: 2 }}>
                            {isPayer
                              ? `You paid ${friend.userName}`
                              : `${friend.userName} paid you`}
                          </ThemedText>
                          <ThemedText type="small" themeColor="textSecondary" style={{ marginBottom: 2 }}>
                            in {s.groupName}
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
                    </Pressable>
                  );
                })}
              </View>
            )}

            {activeGroups.length === 0 && settlements.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={64} color={theme.success} />
                <ThemedText type="subtitle" style={styles.emptyTitle}>All settled up</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  No outstanding balances with {friend.userName}
                </ThemedText>
              </View>
            )}
          </ScrollView>
        )}

        {friend && (
        <Modal visible={settleModalVisible} transparent animationType="fade" onRequestClose={() => setSettleModalVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => !isSettling && setSettleModalVisible(false)}>
            <Pressable style={[styles.modalContent, { backgroundColor: theme.background }]} onPress={() => {}}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                {batchMode ? 'Settle All' : 'Settle Up'}
              </ThemedText>

              {batchMode ? (
                <View style={styles.batchSummary}>
                  <ThemedText type="small" themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
                    Settling all balances with {friend.userName}:
                  </ThemedText>
                  {activeGroups.map((g) => (
                    <View key={g.groupId} style={styles.batchGroupRow}>
                      <ThemedText type="small">{g.groupName}</ThemedText>
                      <ThemedText
                        type="small"
                        style={{ color: g.amount > 0 ? theme.success : theme.danger, fontWeight: '600' }}>
                        ₹{Math.abs(g.amount).toFixed(2)}
                      </ThemedText>
                    </View>
                  ))}
                  <View style={[styles.batchTotalRow, { borderTopColor: theme.backgroundSelected }]}>
                    <ThemedText type="default" style={{ fontWeight: '700' }}>Total</ThemedText>
                    <ThemedText type="default" style={{ fontWeight: '700', color: theme.primary }}>
                      ₹{Math.abs(totalAmount).toFixed(2)}
                    </ThemedText>
                  </View>
                </View>
              ) : (
                <>
                  <ThemedText type="small" themeColor="textSecondary" style={{ marginBottom: Spacing.three }}>
                    {activeGroups.find((g) => g.groupId === settleGroupId)?.groupName || 'Group'}
                  </ThemedText>
                  <TextInput
                    style={[styles.amountInput, { color: theme.text, borderColor: theme.textSecondary }]}
                    value={settleAmount}
                    onChangeText={setSettleAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                  />
                </>
              )}

              <TextInput
                style={[styles.noteInput, { color: theme.text, borderColor: theme.textSecondary }]}
                value={settleNote}
                onChangeText={setSettleNote}
                placeholder="Note (optional) — e.g. Paid via GPay"
                placeholderTextColor={theme.textSecondary}
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: theme.backgroundElement }]}
                  onPress={() => setSettleModalVisible(false)}
                  disabled={isSettling}>
                  <ThemedText>Cancel</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSettle}
                  disabled={isSettling}>
                  {isSettling ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText style={{ color: '#FFFFFF', fontWeight: '600' }}>Confirm</ThemedText>
                  )}
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
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
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  headerName: {
    fontSize: 20,
    lineHeight: 28,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalBalanceCard: {
    borderRadius: BorderRadius + 4,
    padding: Spacing.four,
    alignItems: 'center',
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  balanceLabel: {
    fontWeight: '500',
    marginBottom: Spacing.half,
  },
  netAmount: {
    fontWeight: '800',
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionLabel: {
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: BorderRadius,
    marginBottom: Spacing.two,
  },
  groupRowInfo: {
    flex: 1,
  },
  settleButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius,
    marginLeft: Spacing.two,
  },
  settleButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  settleAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: BorderRadius,
    marginTop: Spacing.two,
  },
  settleAllText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  pastSettlementCard: {
    borderRadius: BorderRadius,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius + 4,
    padding: Spacing.four,
  },
  modalTitle: {
    fontSize: 22,
    lineHeight: 30,
    marginBottom: Spacing.three,
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: BorderRadius,
    padding: Spacing.three,
    fontSize: 14,
    marginBottom: Spacing.three,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'flex-end',
  },
  modalBtn: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: BorderRadius,
    alignItems: 'center',
    minWidth: 80,
  },
  batchSummary: {
    marginBottom: Spacing.three,
  },
  batchGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  batchTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
    marginTop: Spacing.two,
    borderTopWidth: 1,
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
