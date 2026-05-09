import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import SplitSelector from '@/components/SplitSelector';
import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { useExpense, useUpdateExpense } from '@/hooks/useExpenses';
import { showToast, Toast } from '@/components/Toast';
import { fetchUsersByIds } from '@/services/userService';
import type { ExpenseSplit, ExpenseCategory, SplitType } from '@/types/expense';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const categories: { id: ExpenseCategory; label: string; icon: string }[] = [
  { id: 'food', label: 'Food', icon: 'restaurant-outline' },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline' },
  { id: 'shopping', label: 'Shopping', icon: 'bag-outline' },
  { id: 'entertainment', label: 'Fun', icon: 'film-outline' },
  { id: 'utilities', label: 'Bills', icon: 'receipt-outline' },
  { id: 'petrol', label: 'Petrol', icon: 'car-outline' },
  { id: 'rent', label: 'Rent', icon: 'home-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function EditExpenseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { groups } = useGroupStore();
  const theme = useTheme();

  const { expense, isLoading: loadingExpense } = useExpense(id as string);
  const updateExpenseMutation = useUpdateExpense(expense?.groupId || '');

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [memberNames, setMemberNames] = useState<{ userId: string; name: string }[]>([]);

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setNote(expense.note);
      setCategory(expense.category);
      setSplitType(expense.splitType);
      setSplits(expense.splits || []);
    }
  }, [expense]);

  const group = groups.find((g) => g.id === expense?.groupId);
  const memberIds = group
    ? group.members.map((m) => m.user_id)
    : ['current-user', 'user2', 'user3'];

  React.useEffect(() => {
    if (!group?.members || group.members.length === 0) return;
    
    const userIds = group.members.map((m) => m.user_id);
    fetchUsersByIds(userIds).then((result) => {
      if (result.users) {
        const names = result.users.map((u) => ({ userId: u.id, name: u.name }));
        setMemberNames(names);
      }
    }).catch((e) => {
      console.error('[edit-expense] Failed to fetch user names:', e);
    });
  }, [group?.id]);

  const handleUpdateExpense = async () => {
    if (!amount || !note || !category || !user?.id || !expense) return;

    try {
      const finalSplits = splits.length > 0 ? splits : memberNames.map((m) => ({
        userId: m.userId,
        owedAmount: Math.round((parseFloat(amount) / memberNames.length) * 100) / 100,
      }));

      const totalSplit = finalSplits.reduce((sum, s) => sum + s.owedAmount, 0);
      if (Math.abs(totalSplit - parseFloat(amount)) > 0.01) {
        showToast('error', `Split total (₹${totalSplit.toFixed(2)}) must equal amount (₹${parseFloat(amount).toFixed(2)})`);
        return;
      }

      await updateExpenseMutation.mutateAsync({
        expenseId: expense.id,
        updates: {
          paidBy: expense.paidBy,
          amount: parseFloat(amount),
          note,
          category,
          splitType,
          date: expense.date,
          splits: finalSplits,
        },
      });

      showToast('success', 'Expense updated successfully');
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update expense';
      console.error('[edit-expense] handleUpdateExpense error:', error);
      showToast('error', message);
    }
  };

  const isLoading = loadingExpense || updateExpenseMutation.isPending;

  if (loadingExpense) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="title">Edit Expense</ThemedText>
            <View style={styles.placeholder} />
          </View>
          <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!expense) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="title">Expense Not Found</ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Toast />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="title">Edit Expense</ThemedText>
            <View style={styles.placeholder} />
          </View>

          <View style={[styles.amountSection, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="small" style={styles.amountLabel}>AMOUNT</ThemedText>
            <View style={styles.amountRow}>
              <ThemedText type="small" style={[styles.currency, { color: theme.textSecondary }]}>₹</ThemedText>
              <TextInput
                style={[styles.amountInput, { color: theme.text }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" style={styles.label}>NOTE</ThemedText>
            <TextInput
              style={[styles.noteInput, { backgroundColor: theme.backgroundElement, color: theme.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="What's this expense for?"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <ThemedText type="small" style={styles.label}>CATEGORY</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    category === cat.id && styles.categorySelected,
                  ]}
                  onPress={() => setCategory(cat.id)}>
                  <View style={[
                    styles.categoryIconWrap,
                    { backgroundColor: theme.backgroundElement },
                    category === cat.id && { backgroundColor: theme.primary },
                  ]}>
                    <Ionicons name={cat.icon as any} size={24} color={category === cat.id ? '#FFFFFF' : theme.textSecondary} />
                  </View>
                  <ThemedText
                    style={[
                      styles.categoryLabel,
                      { color: theme.textSecondary },
                      category === cat.id && { color: theme.primary, fontWeight: '600' },
                    ]}>
                    {cat.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <ThemedText type="small" style={styles.label}>SPLIT TYPE</ThemedText>
            <SplitSelector
              type={splitType}
              onTypeChange={setSplitType}
              amount={parseFloat(amount) || 0}
              members={memberNames}
              splits={splits}
              onSplitsChange={setSplits}
            />
          </View>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: theme.primary },
              (!amount || !note || updateExpenseMutation.isPending) && styles.buttonDisabled,
            ]}
            onPress={handleUpdateExpense}
            disabled={!amount || !note || updateExpenseMutation.isPending}>
            {updateExpenseMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Update Expense</ThemedText>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.five },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  backButton: { padding: Spacing.one },
  placeholder: { width: 40 },
  loader: { marginTop: 40 },
  amountSection: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius,
    marginBottom: Spacing.three,
  },
  amountLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    paddingHorizontal: Spacing.two,
  },
  currency: {
    fontSize: 28,
    fontWeight: '400',
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
    maxWidth: '80%',
  },
  section: { marginBottom: Spacing.three },
  label: {
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  noteInput: {
    borderRadius: BorderRadius,
    padding: Spacing.three,
    fontSize: 16,
  },
  categoryScroll: {
    paddingVertical: Spacing.one,
    flexGrow: 0,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.one,
    marginRight: Spacing.two,
    minWidth: 64,
  },
  categorySelected: {},
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  categoryLabel: {
    fontSize: 12,
  },
  button: {
    borderRadius: BorderRadius,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.five,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
