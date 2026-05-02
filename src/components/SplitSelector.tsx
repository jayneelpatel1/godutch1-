import { StyleSheet, View, TextInput, Pressable } from 'react-native';

import { ThemedText } from './themed-text';
import type { SplitType, ExpenseSplit } from '@/types/expense';
import { Colors, Spacing } from '@/constants/theme';

interface SplitSelectorProps {
  type: SplitType;
  onTypeChange: (type: SplitType) => void;
  amount: number;
  members: string[];
  splits: ExpenseSplit[];
  onSplitsChange: (splits: ExpenseSplit[]) => void;
}

export default function SplitSelector({ type, onTypeChange, amount, members, splits, onSplitsChange }: SplitSelectorProps) {
  const splitTypes: { id: SplitType; label: string }[] = [
    { id: 'equal', label: 'Equal' },
    { id: 'exact', label: 'Exact' },
    { id: 'percentage', label: 'Percent' },
    { id: 'ratio', label: 'Ratio' },
  ];

  const handleTypeChange = (newType: SplitType) => {
    onTypeChange(newType);
    if (newType === 'equal' && members.length > 0) {
      const perPerson = amount / members.length;
      onSplitsChange(members.map((userId) => ({ userId, owedAmount: perPerson })));
    } else {
      onSplitsChange(members.map((userId) => ({ userId, owedAmount: 0 })));
    }
  };

  const updateSplitValue = (userId: string, value: number) => {
    const newSplits = splits.map((s) => (s.userId === userId ? { ...s, owedAmount: value } : s));
    onSplitsChange(newSplits);
  };

  const updateSplitPercentage = (userId: string, percentage: number) => {
    const owedAmount = (amount * percentage) / 100;
    const newSplits = splits.map((s) =>
      s.userId === userId ? { userId, owedAmount, percentage } : s
    );
    onSplitsChange(newSplits);
  };

  const updateSplitRatio = (userId: string, ratio: number) => {
    const totalRatio = splits.reduce((sum, s) => sum + (s.userId === userId ? ratio : (s.ratio || 1)), 0);
    const owedAmount = (amount * ratio) / totalRatio;
    const newSplits = splits.map((s) =>
      s.userId === userId ? { userId, owedAmount, ratio } : s
    );
    onSplitsChange(newSplits);
  };

  return (
    <View style={styles.container}>
      <View style={styles.typeRow}>
        {splitTypes.map((t) => (
          <Pressable
            key={t.id}
            style={[styles.typeButton, type === t.id && styles.typeSelected]}
            onPress={() => handleTypeChange(t.id)}>
            <ThemedText style={[styles.typeText, type === t.id && styles.typeTextSelected]}>
              {t.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.memberList}>
        {members.map((userId) => {
          const split = splits.find((s) => s.userId === userId);
          return (
            <View key={userId} style={styles.memberRow}>
              <ThemedText style={styles.memberName}>{userId}</ThemedText>
              {type === 'exact' && (
                <TextInput
                  style={styles.input}
                  value={split?.owedAmount?.toString() || ''}
                  onChangeText={(val) => updateSplitValue(userId, parseFloat(val) || 0)}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
              )}
              {type === 'percentage' && (
                <TextInput
                  style={styles.input}
                  value={split?.percentage?.toString() || ''}
                  onChangeText={(val) => updateSplitPercentage(userId, parseFloat(val) || 0)}
                  keyboardType="decimal-pad"
                  placeholder="0%"
                />
              )}
              {type === 'ratio' && (
                <TextInput
                  style={styles.input}
                  value={split?.ratio?.toString() || ''}
                  onChangeText={(val) => updateSplitRatio(userId, parseFloat(val) || 0)}
                  keyboardType="decimal-pad"
                  placeholder="1"
                />
              )}
              {type === 'equal' && (
                <ThemedText style={styles.equalAmount}>
                  ${split?.owedAmount?.toFixed(2) || '0.00'}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
  },
  typeSelected: {
    backgroundColor: Colors.light.primary,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.text,
  },
  typeTextSelected: {
    color: '#FFFFFF',
  },
  memberList: {
    gap: Spacing.two,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  memberName: {
    flex: 1,
    fontSize: 14,
  },
  input: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    padding: Spacing.one,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
    minWidth: 80,
    textAlign: 'right',
    color: Colors.light.text,
  },
  equalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
