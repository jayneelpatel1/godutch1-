/**
 * @component ExpenseCard
 * @description Displays a single expense row with category icon, note,
 *              paid-by name, date, amount, and the current user's share/owe amount.
 *
 * @used-in ExpenseList, GroupDetail
 *
 * @props
 *   - expense: Expense         — The expense data to display
 *   - onPress?: () => void     — Tap handler
 *   - paidByName?: string      — Display name of the person who paid
 *
 * @platform Android ✅ | iOS ✅ | Web ✅
 */

import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from './themed-text';
import type { Expense, ExpenseSplit } from '@/types/expense';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/authStore';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  showGroup?: boolean;
  splits?: (ExpenseSplit & { name?: string })[];
  paidByName?: string;
  onDelete?: () => void;
  groupId?: string;
}

const categoryIcons: Record<string, string> = {
  food: 'restaurant-outline',
  rent: 'home-outline',
  petrol: 'car-outline',
  travel: 'airplane-outline',
  shopping: 'bag-outline',
  utilities: 'flash-outline',
  entertainment: 'film-outline',
  other: 'ellipsis-horizontal-outline',
};

export default function ExpenseCard({ expense, onPress, paidByName }: ExpenseCardProps) {
  const theme = useTheme();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const icon = categoryIcons[expense.category] || 'ellipsis-horizontal-outline';
  const isPayer = expense.paidBy === currentUserId;

  const userSplit = (expense.splits || []).find((s) => s.userId === currentUserId);
  const userOwedAmount = userSplit?.owedAmount ?? null;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.leftSection}>
        <View style={[styles.iconWrap, { backgroundColor: theme.primary + '18' }]}>
          <Ionicons name={icon as any} size={20} color={theme.primary} />
        </View>
        <View style={styles.info}>
          <ThemedText type="default" style={styles.note} numberOfLines={1}>
            {expense.note || 'No description'}
          </ThemedText>
          {paidByName && (
            <>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                Paid by {paidByName}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.dateText}>
                {new Date(expense.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </ThemedText>
            </>
          )}
        </View>
      </View>
      <View style={styles.rightSection}>
        <ThemedText type="subtitle" style={[styles.amount, { color: isPayer ? theme.success : theme.text }]}>
          {'\u20B9'}{expense.amount.toFixed(2)}
        </ThemedText>
        {userOwedAmount !== null && (
          <ThemedText type="small" style={[styles.owedLabel, { color: isPayer ? theme.textSecondary : theme.danger }]}>
            {isPayer ? 'Your share: ' : 'You owe '}
            {'\u20B9'}{userOwedAmount.toFixed(2)}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },
  info: {
    flex: 1,
  },
  note: {
    marginBottom: 2,
  },
  dateText: {
    marginTop: 1,
    fontSize: 12,
  },
  rightSection: {
    marginLeft: Spacing.two,
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '700',
  },
  owedLabel: {
    marginTop: 2,
  },
});
