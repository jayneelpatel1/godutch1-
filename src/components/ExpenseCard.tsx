import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from './themed-text';
import type { Expense, ExpenseSplit } from '@/types/expense';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  showGroup?: boolean;
  splits?: (ExpenseSplit & { name?: string })[];
  paidByName?: string;
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

export default function ExpenseCard({ expense, onPress, showGroup, splits, paidByName }: ExpenseCardProps) {
  const icon = categoryIcons[expense.category] || 'ellipsis-horizontal-outline';

  const renderSplitDetails = () => {
    if (!splits || splits.length === 0) return null;
    
    return (
      <View style={styles.splitDetails}>
        {splits.map((split, index) => (
          <View key={split.userId} style={styles.splitRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {split.name || split.userId}
            </ThemedText>
            <ThemedText type="small" style={styles.splitAmount}>
              ₹{split.owedAmount.toFixed(2)}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.leftSection}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon as any} size={20} color={Colors.light.primary} />
        </View>
        <View style={styles.info}>
          <ThemedText type="subtitle" style={styles.note}>
            {expense.note || 'No description'}
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {expense.category}
            </ThemedText>
            {showGroup && (
              <>
                <ThemedText type="small" themeColor="textSecondary"> · </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Group
                </ThemedText>
              </>
            )}
            {paidByName && (
              <>
                <ThemedText type="small" themeColor="textSecondary"> · </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Paid by {paidByName}
                </ThemedText>
              </>
            )}
          </View>
          {renderSplitDetails()}
        </View>
      </View>
      <View style={styles.rightSection}>
        <ThemedText type="subtitle" style={styles.amount}>
          ₹{expense.amount.toFixed(2)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.backgroundElement,
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
    backgroundColor: '#E5F5EE',
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitDetails: {
    marginTop: Spacing.one,
    paddingTop: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: Colors.light.backgroundSelected,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  splitAmount: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  rightSection: {
    marginLeft: Spacing.two,
  },
  amount: {
    fontWeight: '700',
    color: Colors.light.text,
  },
});
